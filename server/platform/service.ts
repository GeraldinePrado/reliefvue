import { randomBytes } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import {
  PROVINCES,
  type Activation,
  type ActivationStatus,
  type AddressEvidenceType,
  type ApiKeyRecord,
  type Application,
  type ApplicationDetail,
  type ApplicationStatus,
  type Asset,
  type AuditEntry,
  type CoverageRow,
  type Donation,
  type DonationChannel,
  type DonationReceipt,
  type Household,
  type LedgerSummary,
  type Organisation,
  type Overview,
  type PartnerActivationSummary,
  type Payout,
  type RecipientActivation,
  type RecipientHome,
  type ReviewDecision,
  type Role,
  type SessionUser,
  type StaffRole,
} from "../../shared/platform.ts";
import { assetForThb, config, thbFor } from "./config.ts";
import { all, one, run, transaction } from "./db.ts";
import {
  base58,
  hashNationalId,
  hashPassword,
  hashToken,
  isValidThaiNationalId,
  maskNationalId,
  maskedPhone,
  otpCode,
  verifyPassword,
  walletAddress,
} from "./identity.ts";
import { HttpError, assert } from "./http.ts";

/* ------------------------------------------------------------------ rows */

interface OrgRow {
  id: string;
  name: string;
  slug: string;
  country: string;
  treasury_address: string;
  promptpay_id: string;
  approval_threshold: number;
  grant_thb_default: number;
  created_at: string;
}

interface UserRow {
  id: string;
  org_id: string;
  role: Role;
  name: string;
  email: string | null;
  phone: string | null;
  password_hash: string | null;
  org_name: string;
}

interface HouseholdRow {
  id: string;
  user_id: string;
  org_id: string;
  full_name: string;
  identity_type: "thai" | "foreign";
  national_id_last4: string;
  tm30_ref: string;
  address_evidence_type: string;
  address_evidence_ref: string;
  province: string;
  district: string;
  subdistrict: string;
  address_line: string;
  members: number;
  income_band: string;
  wallet_address: string;
  cashout_method: "wallet" | "promptpay";
  promptpay_phone: string | null;
  kyc_status: string;
  kyc_method: string;
  created_at: string;
}

interface ActivationRow {
  id: string;
  org_id: string;
  title: string;
  disaster_type: string;
  province: string;
  districts: string;
  status: ActivationStatus;
  budget_thb: number;
  grant_thb: number;
  started_at: string;
  closed_at: string | null;
  created_at: string;
  applications: number;
  approved: number;
  paid: number;
}

interface ApplicationRow {
  id: string;
  reference: string;
  activation_id: string;
  household_id: string;
  status: ApplicationStatus;
  evidence_note: string;
  evidence_ref: string;
  duplicate_flag: number;
  duplicate_reason: string | null;
  reviewer_id: string | null;
  decision_reason: string | null;
  submitted_at: string;
  decided_at: string | null;
  applicant_name: string;
  applicant_phone: string;
  district: string;
  members: number;
  wallet_address: string;
  subdistrict: string;
  address_line: string;
  income_band: string;
  tm30_ref: string;
  national_id_last4: string;
  kyc_status: string;
  identity_type: "thai" | "foreign";
  address_evidence_type: string;
  address_evidence_ref: string;
  cashout_method: "wallet" | "promptpay";
  promptpay_phone: string | null;
  activation_title: string;
  activation_province: string;
  grant_thb: number;
  payout_id: string | null;
  payout_status: "awaiting_approvals" | "sent" | null;
  reviewer_name: string | null;
}

interface PayoutRow {
  id: string;
  reference: string;
  application_id: string;
  amount_thb: number;
  asset: Asset;
  amount_asset: number;
  destination: string;
  status: "awaiting_approvals" | "sent";
  tx_ref: string | null;
  simulated: number;
  cashout_method: "promptpay" | "wallet" | null;
  cashout_status: "requested" | "paid" | null;
  created_at: string;
  sent_at: string | null;
  applicant_name: string;
  district: string;
}

interface DonationRow {
  id: string;
  reference: string;
  donor_name: string;
  asset: Asset;
  amount: number;
  amount_thb: number;
  channel: DonationChannel;
  province: string | null;
  converted: number;
  settled_asset: Asset;
  settled_amount: number;
  tx_ref: string;
  simulated: number;
  created_at: string;
}

/* ------------------------------------------------------------- mapping */

function mapOrg(row: OrgRow): Organisation {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    country: row.country,
    treasuryAddress: row.treasury_address,
    promptpayId: row.promptpay_id,
    approvalThreshold: row.approval_threshold,
    grantThbDefault: row.grant_thb_default,
    createdAt: row.created_at,
  };
}

function mapUser(row: UserRow): SessionUser {
  const base = { id: row.id, name: row.name, orgId: row.org_id, orgName: row.org_name };
  if (row.role === "recipient") {
    return { ...base, role: "recipient", phone: row.phone ?? "" };
  }
  return { ...base, role: row.role as StaffRole, email: row.email ?? "" };
}

function mapHousehold(row: HouseholdRow): Household {
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    phone: "",
    identityType: row.identity_type,
    identityLast4: row.national_id_last4,
    tm30Ref: row.tm30_ref || null,
    addressEvidenceType: row.address_evidence_type as Household["addressEvidenceType"],
    addressEvidenceRef: row.address_evidence_ref,
    province: row.province,
    district: row.district,
    subdistrict: row.subdistrict,
    addressLine: row.address_line,
    members: row.members,
    incomeBand: row.income_band,
    walletAddress: row.wallet_address,
    cashoutMethod: row.cashout_method,
    promptpayPhone: row.promptpay_phone,
    kycStatus: row.kyc_status as Household["kycStatus"],
    kycMethod: row.kyc_method,
    createdAt: row.created_at,
  };
}

/* --------------------------------------------------------------- helpers */

export function nowIso(): string {
  return new Date().toISOString();
}

export function getOrg(db: DatabaseSync): Organisation {
  const row = one<OrgRow>(db, "SELECT * FROM organisations ORDER BY created_at LIMIT 1");
  if (!row) throw new HttpError(500, "No organisation is configured.", "no_org");
  return mapOrg(row);
}

export function orgById(db: DatabaseSync, id: string): Organisation {
  const row = one<OrgRow>(db, "SELECT * FROM organisations WHERE id = ?", id);
  if (!row) throw new HttpError(404, "Organisation not found.", "not_found");
  return mapOrg(row);
}

export function normalisePhone(input: string): string {
  let phone = input.replace(/[\s()-]/g, "");
  if (phone.startsWith("+66")) phone = `0${phone.slice(3)}`;
  else if (phone.startsWith("66")) phone = `0${phone.slice(2)}`;
  assert(/^0[6-9]\d{8}$/.test(phone), 400, "Enter a Thai mobile number, for example 081 234 5678.", "invalid_phone");
  return phone;
}

function audit(
  db: DatabaseSync,
  orgId: string,
  actor: SessionUser | null,
  action: string,
  entityType: string,
  entityId: string,
  detail: string,
): void {
  run(
    db,
    `INSERT INTO audit_events (id,org_id,actor_id,actor_label,action,entity_type,entity_id,detail,created_at)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    `aud_${base58(randomBytes(8))}`,
    orgId,
    actor?.id ?? null,
    actor?.name ?? "System",
    action,
    entityType,
    entityId,
    detail,
    nowIso(),
  );
}

function uniqueReference(db: DatabaseSync, prefix: string, table: string): string {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = `${prefix}${base58(randomBytes(3)).slice(0, 5).toUpperCase()}`;
    const exists = one<{ id: string }>(db, `SELECT id FROM ${table} WHERE reference = ?`, candidate);
    if (!exists) return candidate;
  }
  throw new HttpError(500, "Could not allocate a reference.", "reference_failure");
}

function auditEntries(db: DatabaseSync, orgId: string, limit = 10): AuditEntry[] {
  const rows = all<{
    id: string;
    actor_label: string;
    action: string;
    entity_type: string;
    entity_id: string;
    detail: string;
    created_at: string;
  }>(
    db,
    `SELECT id,actor_label,action,entity_type,entity_id,detail,created_at
     FROM audit_events WHERE org_id = ? ORDER BY created_at DESC LIMIT ?`,
    orgId,
    limit,
  );
  return rows.map((row) => ({
    id: row.id,
    actorLabel: row.actor_label,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    detail: row.detail,
    at: row.created_at,
  }));
}

/* ----------------------------------------------------------------- auth */

export function getSessionUser(db: DatabaseSync, token: string | undefined): SessionUser | null {
  if (!token) return null;
  const row = one<UserRow>(
    db,
    `SELECT u.id,u.org_id,u.role,u.name,u.email,u.phone,u.password_hash,o.name AS org_name
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     JOIN organisations o ON o.id = u.org_id
     WHERE s.token = ? AND s.expires_at > ?`,
    token,
    nowIso(),
  );
  return row ? mapUser(row) : null;
}

export function createSession(db: DatabaseSync, userId: string): string {
  const token = base58(randomBytes(24));
  const expires = new Date(Date.now() + config.sessionTtlDays * 86_400_000).toISOString();
  run(db, "INSERT INTO sessions (token,user_id,created_at,expires_at) VALUES (?,?,?,?)", token, userId, nowIso(), expires);
  return token;
}

export function destroySession(db: DatabaseSync, token: string | undefined): void {
  if (token) run(db, "DELETE FROM sessions WHERE token = ?", token);
}

export function staffLogin(db: DatabaseSync, email: string, password: string): SessionUser {
  const row = one<UserRow>(
    db,
    `SELECT u.id,u.org_id,u.role,u.name,u.email,u.phone,u.password_hash,o.name AS org_name
     FROM users u JOIN organisations o ON o.id = u.org_id
     WHERE lower(u.email) = lower(?)`,
    email.trim(),
  );
  if (!row || row.role === "recipient" || !row.password_hash || !verifyPassword(password, row.password_hash)) {
    throw new HttpError(401, "Email or password is incorrect.", "invalid_credentials");
  }
  return mapUser(row);
}

export function staffByEmail(db: DatabaseSync, email: string): SessionUser | null {
  const row = one<UserRow>(
    db,
    `SELECT u.id,u.org_id,u.role,u.name,u.email,u.phone,u.password_hash,o.name AS org_name
     FROM users u JOIN organisations o ON o.id = u.org_id WHERE lower(u.email)=lower(?)`,
    email,
  );
  return row ? mapUser(row) : null;
}

export function requestOtp(db: DatabaseSync, rawPhone: string): { phone: string; devCode: string | null; expiresInMinutes: number } {
  const phone = normalisePhone(rawPhone);
  const cutoff = new Date(Date.now() - config.otpTtlMinutes * 60_000).toISOString();
  const recent = one<{ total: number }>(
    db,
    "SELECT COUNT(*) AS total FROM otp_codes WHERE phone = ? AND created_at > ?",
    phone,
    cutoff,
  );
  assert((recent?.total ?? 0) < 8, 429, "Too many codes requested. Try again in a few minutes.", "rate_limited");
  const code = otpCode();
  run(
    db,
    "INSERT INTO otp_codes (phone,code,created_at,expires_at,consumed) VALUES (?,?,?,?,0)",
    phone,
    code,
    nowIso(),
    new Date(Date.now() + config.otpTtlMinutes * 60_000).toISOString(),
  );
  return { phone, devCode: config.demoMode ? code : null, expiresInMinutes: config.otpTtlMinutes };
}

export function verifyOtp(db: DatabaseSync, rawPhone: string, code: string): { user: SessionUser; token: string } {
  const phone = normalisePhone(rawPhone);
  const row = one<{ id: number }>(
    db,
    `SELECT id FROM otp_codes
     WHERE phone = ? AND code = ? AND consumed = 0 AND expires_at > ?
     ORDER BY id DESC LIMIT 1`,
    phone,
    code.trim(),
    nowIso(),
  );
  assert(row, 401, "That code is not valid or has expired.", "invalid_code");
  run(db, "UPDATE otp_codes SET consumed = 1 WHERE id = ?", row!.id);

  const existing = one<UserRow>(
    db,
    `SELECT u.id,u.org_id,u.role,u.name,u.email,u.phone,u.password_hash,o.name AS org_name
     FROM users u JOIN organisations o ON o.id = u.org_id WHERE u.phone = ?`,
    phone,
  );
  if (existing && existing.role !== "recipient") {
    throw new HttpError(403, "This number belongs to a staff account. Use staff sign in.", "staff_account");
  }

  let user: SessionUser;
  if (existing) {
    user = mapUser(existing);
  } else {
    const org = getOrg(db);
    const id = `usr_rcpt_${base58(randomBytes(8))}`;
    run(
      db,
      "INSERT INTO users (id,org_id,role,name,email,phone,password_hash,created_at) VALUES (?,?,?,?,?,?,?,?)",
      id,
      org.id,
      "recipient",
      "New neighbour",
      null,
      phone,
      null,
      nowIso(),
    );
    user = { id, role: "recipient", name: "New neighbour", phone, orgId: org.id, orgName: org.name };
  }
  return { user, token: createSession(db, user.id) };
}

export function staffForRole(db: DatabaseSync, role: StaffRole): SessionUser {
  const row = one<UserRow>(
    db,
    `SELECT u.id,u.org_id,u.role,u.name,u.email,u.phone,u.password_hash,o.name AS org_name
     FROM users u JOIN organisations o ON o.id = u.org_id WHERE u.role = ? ORDER BY u.id LIMIT 1`,
    role,
  );
  if (!row) throw new HttpError(404, `No ${role} demo account exists.`, "not_found");
  return mapUser(row);
}

export function seedPasswordHash(): string {
  return hashPassword("reliefvue-demo");
}

/* ------------------------------------------------------------- household */

function householdByUserId(db: DatabaseSync, userId: string): HouseholdRow | undefined {
  return one<HouseholdRow>(db, "SELECT * FROM households WHERE user_id = ?", userId);
}

export function getHousehold(db: DatabaseSync, user: SessionUser): Household | null {
  const row = householdByUserId(db, user.id);
  return row ? mapHouseholdWithPhone(db, row) : null;
}

function mapHouseholdWithPhone(db: DatabaseSync, row: HouseholdRow): Household {
  const phone = one<{ phone: string }>(db, "SELECT phone FROM users WHERE id = ?", row.user_id)?.phone ?? "";
  const household = mapHousehold(row);
  return { ...household, phone };
}

export function saveHousehold(
  db: DatabaseSync,
  user: SessionUser,
  body: Record<string, unknown>,
): Household {
  assert(user.role === "recipient", 403, "Only a recipient can complete this profile.", "forbidden");
  const fullName = String(body.fullName ?? "").trim();
  const identityType = body.identityType === "foreign" ? "foreign" : "thai";
  const identityValue = String(body.identityNumber ?? body.nationalId ?? "").replace(/[\s-]/g, "");
  const tm30Ref = String(body.tm30Ref ?? "").trim();
  const addressEvidenceType = ["utility_bill", "lease", "local_authority", "tm30"].includes(String(body.addressEvidenceType))
    ? (String(body.addressEvidenceType) as AddressEvidenceType)
    : "utility_bill";
  const addressEvidenceRef = String(body.addressEvidenceRef ?? "").trim();
  const province = String(body.province ?? "").trim();
  const district = String(body.district ?? "").trim();
  const subdistrict = String(body.subdistrict ?? "").trim();
  const addressLine = String(body.addressLine ?? "").trim();
  const incomeBand = String(body.incomeBand ?? "").trim();
  const members = Number(body.members);
  const cashoutMethod = body.cashoutMethod === "promptpay" ? "promptpay" : "wallet";
  const promptpayPhone = String(body.promptpayPhone ?? "").replace(/[\s-]/g, "");

  assert(fullName.length >= 2 && fullName.length <= 80, 400, "Enter the name on the household's documents.", "invalid_field");
  if (identityType === "thai") {
    assert(isValidThaiNationalId(identityValue), 400, "That Thai national ID number is not valid. Check all 13 digits.", "invalid_national_id");
  } else {
    assert(/^[A-Za-z0-9]{6,20}$/.test(identityValue), 400, "Enter the passport or alien ID number.", "invalid_passport");
    assert(tm30Ref.length >= 6 && tm30Ref.length <= 40, 400, "Enter the TM30 receipt reference for the foreign resident.", "invalid_field");
  }
  assert(addressEvidenceRef.length >= 4 && addressEvidenceRef.length <= 80, 400, "Add the address-evidence reference (utility bill, lease or local attestation).", "invalid_field");
  assert(PROVINCES.some((item) => item.en === province), 400, "Choose a province from the list.", "invalid_field");
  assert(district.length >= 2 && district.length <= 80, 400, "Enter the district.", "invalid_field");
  assert(subdistrict.length >= 2 && subdistrict.length <= 80, 400, "Enter the subdistrict.", "invalid_field");
  assert(addressLine.length >= 4 && addressLine.length <= 160, 400, "Enter the house or unit address.", "invalid_field");
  assert(Number.isInteger(members) && members >= 1 && members <= 20, 400, "Household size must be between 1 and 20.", "invalid_field");
  assert(incomeBand.length > 0, 400, "Choose an income band or prefer not to say.", "invalid_field");
  if (cashoutMethod === "promptpay") {
    assert(/^0[6-9]\d{8}$/.test(promptpayPhone), 400, "Enter the PromptPay mobile number.", "invalid_field");
  }

  let wallet = String(body.walletAddress ?? "").trim();
  if (!wallet) wallet = walletAddress();
  assert(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet), 400, "Enter a valid Solana wallet address, or leave it blank to create one.", "invalid_wallet");

  const idHash = hashNationalId(`${identityType}:${identityValue}`, config.idSalt);
  const existing = householdByUserId(db, user.id);
  const duplicate = one<{ id: string }>(
    db,
    "SELECT id FROM households WHERE national_id_hash = ? AND id <> ?",
    idHash,
    existing?.id ?? "",
  );
  assert(
    !duplicate,
    409,
    "This identity document is already linked to another ReliefVue account. One household can hold one account.",
    "duplicate_identity",
  );

  const now = nowIso();
  if (existing) {
    run(
      db,
      `UPDATE households SET full_name=?, identity_type=?, national_id_hash=?, national_id_last4=?, tm30_ref=?,
       address_evidence_type=?, address_evidence_ref=?, province=?, district=?, subdistrict=?, address_line=?, members=?,
       income_band=?, wallet_address=?, cashout_method=?, promptpay_phone=?, kyc_status='verified', kyc_method='demo' WHERE id=?`,
      fullName,
      identityType,
      idHash,
      identityValue.slice(-4),
      identityType === "foreign" ? tm30Ref : "",
      addressEvidenceType,
      addressEvidenceRef,
      province,
      district,
      subdistrict,
      addressLine,
      members,
      incomeBand,
      wallet,
      cashoutMethod,
      cashoutMethod === "promptpay" ? promptpayPhone : null,
      existing.id,
    );
  } else {
    run(
      db,
      `INSERT INTO households
       (id,user_id,org_id,full_name,identity_type,national_id_hash,national_id_last4,tm30_ref,address_evidence_type,address_evidence_ref,
        province,district,subdistrict,address_line,members,income_band,wallet_address,cashout_method,promptpay_phone,kyc_status,kyc_method,created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      `hh_${base58(randomBytes(8))}`,
      user.id,
      user.orgId,
      fullName,
      identityType,
      idHash,
      identityValue.slice(-4),
      identityType === "foreign" ? tm30Ref : "",
      addressEvidenceType,
      addressEvidenceRef,
      province,
      district,
      subdistrict,
      addressLine,
      members,
      incomeBand,
      wallet,
      cashoutMethod,
      cashoutMethod === "promptpay" ? promptpayPhone : null,
      "verified",
      "demo",
      now,
    );
  }
  run(db, "UPDATE users SET name = ?, phone = ? WHERE id = ?", fullName, user.phone || null, user.id);
  audit(db, user.orgId, user, "household.verify", "household", user.id, "Completed demo identity, residence and household verification.");
  const saved = householdByUserId(db, user.id);
  return mapHouseholdWithPhone(db, saved!);
}

/* -------------------------------------------------------------- activation */

function activationCounts(db: DatabaseSync, activationId: string): { applications: number; approved: number; paid: number } {
  const row = one<{ applications: number; approved: number; paid: number }>(
    db,
    `SELECT
       COUNT(*) AS applications,
       SUM(CASE WHEN status IN ('approved') THEN 1 ELSE 0 END) AS approved,
       SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid
     FROM applications WHERE activation_id = ?`,
    activationId,
  );
  return { applications: row?.applications ?? 0, approved: row?.approved ?? 0, paid: row?.paid ?? 0 };
}

function mapActivation(db: DatabaseSync, row: ActivationRow): Activation {
  const counts = activationCounts(db, row.id);
  const committedThb = counts.approved * row.grant_thb;
  const paidThb = counts.paid * row.grant_thb;
  return {
    id: row.id,
    title: row.title,
    disasterType: row.disaster_type,
    province: row.province,
    districts: safeDistricts(row.districts),
    status: row.status,
    budgetThb: row.budget_thb,
    grantThb: row.grant_thb,
    committedThb,
    paidThb,
    remainingThb: Math.max(0, row.budget_thb - committedThb - paidThb),
    applications: counts.applications,
    approved: counts.approved,
    paid: counts.paid,
    startedAt: row.started_at,
    closedAt: row.closed_at,
  };
}

function safeDistricts(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function listActivations(db: DatabaseSync, orgId: string): Activation[] {
  const rows = all<ActivationRow>(
    db,
    `SELECT * FROM activations WHERE org_id = ?
     ORDER BY CASE status WHEN 'active' THEN 0 WHEN 'draft' THEN 1 ELSE 2 END, started_at DESC`,
    orgId,
  );
  return rows.map((row) => mapActivation(db, row));
}

export function createActivation(db: DatabaseSync, actor: SessionUser, body: Record<string, unknown>): Activation {
  assert(actor.role === "admin", 403, "Only an organisation admin can create an activation.", "forbidden");
  const title = String(body.title ?? "").trim();
  const disasterType = String(body.disasterType ?? "").trim();
  const province = String(body.province ?? "").trim();
  const districts = Array.isArray(body.districts)
    ? [...new Set(body.districts.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean))]
    : [];
  const budgetThb = Math.round(Number(body.budgetThb));
  const grantThb = Math.round(Number(body.grantThb));

  assert(title.length >= 4 && title.length <= 120, 400, "Give the response a title of 4 to 120 characters.", "invalid_field");
  assert(disasterType.length >= 2 && disasterType.length <= 40, 400, "Choose a disaster type.", "invalid_field");
  assert(PROVINCES.some((item) => item.en === province), 400, "Choose a province from the list.", "invalid_field");
  assert(districts.length >= 1 && districts.length <= 30, 400, "Add at least one affected district.", "invalid_field");
  assert(Number.isFinite(budgetThb) && budgetThb >= 1000 && budgetThb <= 100_000_000, 400, "Budget must be between ฿1,000 and ฿100,000,000.", "invalid_field");
  assert(Number.isFinite(grantThb) && grantThb >= 100 && grantThb <= 100_000, 400, "Grant must be between ฿100 and ฿100,000.", "invalid_field");
  assert(grantThb <= budgetThb, 400, "The grant cannot be larger than the whole budget.", "invalid_field");

  const id = `act_${base58(randomBytes(8))}`;
  run(
    db,
    `INSERT INTO activations (id,org_id,title,disaster_type,province,districts,status,budget_thb,grant_thb,started_at,closed_at,created_at)
     VALUES (?,?,?,?,?,?,'active',?,?,?,?,?)`,
    id,
    actor.orgId,
    title,
    disasterType,
    province,
    JSON.stringify(districts),
    budgetThb,
    grantThb,
    nowIso(),
    null,
    nowIso(),
  );
  audit(db, actor.orgId, actor, "activation.create", "activation", id, `Activated ${title} with a ฿${budgetThb.toLocaleString("en-US")} budget.`);
  return mapActivation(db, one<ActivationRow>(db, "SELECT * FROM activations WHERE id = ?", id)!);
}

export function closeActivation(db: DatabaseSync, actor: SessionUser, id: string): Activation {
  assert(actor.role === "admin", 403, "Only an organisation admin can close an activation.", "forbidden");
  const row = one<ActivationRow>(db, "SELECT * FROM activations WHERE id = ? AND org_id = ?", id, actor.orgId);
  assert(row, 404, "Activation not found.", "not_found");
  assert(row!.status === "active", 409, "Only an active response can be closed.", "invalid_state");
  run(db, "UPDATE activations SET status='closed', closed_at=? WHERE id=?", nowIso(), id);
  audit(db, actor.orgId, actor, "activation.close", "activation", id, `Closed ${row!.title}.`);
  return mapActivation(db, one<ActivationRow>(db, "SELECT * FROM activations WHERE id = ?", id)!);
}

export function coverageFor(db: DatabaseSync, orgId: string, activationId: string): CoverageRow[] {
  const activation = one<ActivationRow>(db, "SELECT * FROM activations WHERE id = ? AND org_id = ?", activationId, orgId);
  assert(activation, 404, "Activation not found.", "not_found");
  return coverageRows(db, activation!);
}

function coverageRows(db: DatabaseSync, activation: ActivationRow): CoverageRow[] {
  const districts = safeDistricts(activation.districts);
  const rows = all<{ district: string; applications: number; approved: number; paid: number }>(
    db,
    `SELECT h.district AS district, COUNT(*) AS applications,
       SUM(CASE WHEN a.status = 'approved' THEN 1 ELSE 0 END) AS approved,
       SUM(CASE WHEN a.status = 'paid' THEN 1 ELSE 0 END) AS paid
     FROM applications a JOIN households h ON h.id = a.household_id
     WHERE a.activation_id = ? GROUP BY h.district`,
    activation.id,
  );
  const byDistrict = new Map(rows.map((row) => [row.district, row]));
  const result: CoverageRow[] = [];
  for (const district of districts) {
    const row = byDistrict.get(district);
    const paid = row?.paid ?? 0;
    result.push({
      activationId: activation.id,
      activationTitle: activation.title,
      province: activation.province,
      district,
      applications: row?.applications ?? 0,
      approved: row?.approved ?? 0,
      paid,
      unreached: paid === 0,
      grantThb: activation.grant_thb,
    });
  }
  for (const [district, row] of byDistrict) {
    if (districts.includes(district)) continue;
    result.push({
      activationId: activation.id,
      activationTitle: activation.title,
      province: activation.province,
      district,
      applications: row.applications,
      approved: row.approved,
      paid: row.paid,
      unreached: row.paid === 0,
      grantThb: activation.grant_thb,
    });
  }
  return result.sort((a, b) => a.paid - b.paid || b.applications - a.applications || a.district.localeCompare(b.district));
}

/* ------------------------------------------------------------ applications */

const APPLICATION_SELECT = `
  SELECT a.*, h.full_name AS applicant_name, (SELECT phone FROM users WHERE id = h.user_id) AS applicant_phone, h.district, h.members,
    h.wallet_address, h.subdistrict, h.address_line, h.income_band, h.tm30_ref, h.national_id_last4, h.kyc_status,
    h.identity_type, h.address_evidence_type, h.address_evidence_ref, h.cashout_method, h.promptpay_phone,
    act.title AS activation_title, act.province AS activation_province, act.grant_thb,
    p.id AS payout_id, p.status AS payout_status, u.name AS reviewer_name
  FROM applications a
  JOIN households h ON h.id = a.household_id
  JOIN activations act ON act.id = a.activation_id
  LEFT JOIN payouts p ON p.application_id = a.id
  LEFT JOIN users u ON u.id = a.reviewer_id
`;

function mapApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    reference: row.reference,
    activationId: row.activation_id,
    activationTitle: row.activation_title,
    activationProvince: row.activation_province,
    householdId: row.household_id,
    applicantName: row.applicant_name,
    applicantPhone: row.applicant_phone,
    district: row.district,
    members: row.members,
    status: row.status,
    evidenceNote: row.evidence_note,
    evidenceRef: row.evidence_ref,
    duplicateFlag: row.duplicate_flag === 1,
    duplicateReason: row.duplicate_reason,
    decisionReason: row.decision_reason,
    reviewerName: row.reviewer_name,
    submittedAt: row.submitted_at,
    decidedAt: row.decided_at,
    grantThb: row.grant_thb,
    payoutId: row.payout_id,
    payoutStatus: row.payout_status,
  };
}

export function listApplications(db: DatabaseSync, orgId: string, status?: string): Application[] {
  const rows = all<ApplicationRow>(
    db,
    `${APPLICATION_SELECT} WHERE act.org_id = ? ${status ? "AND a.status = ?" : ""}
     ORDER BY CASE a.status WHEN 'submitted' THEN 0 WHEN 'needs_info' THEN 1 WHEN 'approved' THEN 2 WHEN 'paid' THEN 3 ELSE 4 END,
     a.submitted_at DESC`,
    ...(status ? [orgId, status] : [orgId]),
  );
  return rows.map(mapApplication);
}

export function applicationById(db: DatabaseSync, orgId: string, id: string): ApplicationDetail {
  const row = one<ApplicationRow>(
    db,
    `${APPLICATION_SELECT} WHERE act.org_id = ? AND a.id = ?`,
    orgId,
    id,
  );
  assert(row, 404, "Application not found.", "not_found");
  const app = mapApplication(row!);
  const walletReuse = one<{ total: number }>(
    db,
    "SELECT COUNT(*) AS total FROM households WHERE wallet_address = ? AND id <> ?",
    row!.wallet_address,
    row!.household_id,
  );
  const prior = one<{ total: number }>(
    db,
    "SELECT COUNT(*) AS total FROM applications WHERE household_id = ? AND id <> ?",
    row!.household_id,
    id,
  );
  return {
    ...app,
    identityMasked: maskNationalId(row!.national_id_last4),
    identityType: row!.identity_type,
    tm30Ref: row!.tm30_ref || null,
    addressEvidenceType: row!.address_evidence_type as ApplicationDetail["addressEvidenceType"],
    addressEvidenceRef: row!.address_evidence_ref,
    subdistrict: row!.subdistrict,
    addressLine: row!.address_line,
    incomeBand: row!.income_band,
    walletAddress: row!.wallet_address,
    kycStatus: row!.kyc_status as ApplicationDetail["kycStatus"],
    walletReuseCount: walletReuse?.total ?? 0,
    priorApplicationCount: prior?.total ?? 0,
  };
}

export function listHouseholdApplications(db: DatabaseSync, householdId: string): Application[] {
  const rows = all<ApplicationRow>(db, `${APPLICATION_SELECT} WHERE a.household_id = ? ORDER BY a.submitted_at DESC`, householdId);
  return rows.map(mapApplication);
}

function assertEligible(db: DatabaseSync, activation: ActivationRow, household: HouseholdRow): void {
  assert(activation.status === "active", 409, "This response is no longer accepting requests.", "activation_closed");
  assert(activation.province === household.province, 409, "This response is for a different province.", "ineligible_area");
  const districts = safeDistricts(activation.districts);
  assert(districts.includes(household.district), 409, "Your district is not listed as affected by this response. Staff can correct the area list.", "ineligible_area");
  assert(household.kyc_status === "verified", 409, "Complete identity and residence verification first.", "kyc_required");
  const existing = one<{ id: string }>(
    db,
    "SELECT id FROM applications WHERE activation_id = ? AND household_id = ?",
    activation.id,
    household.id,
  );
  assert(!existing, 409, "This household has already requested support for this response.", "duplicate_claim");
}

export function createApplication(
  db: DatabaseSync,
  actor: SessionUser,
  body: Record<string, unknown>,
): Application {
  assert(actor.role === "recipient", 403, "Only a recipient can request support.", "forbidden");
  const household = householdByUserId(db, actor.id);
  assert(household, 409, "Complete your household profile before requesting support.", "profile_required");
  const activation = one<ActivationRow>(
    db,
    "SELECT * FROM activations WHERE id = ? AND org_id = ?",
    String(body.activationId ?? ""),
    actor.orgId,
  );
  assert(activation, 404, "That disaster response was not found.", "not_found");
  assertEligible(db, activation!, household!);

  const evidenceNote = String(body.evidenceNote ?? "").trim();
  const evidenceRef = String(body.evidenceRef ?? "").trim();
  assert(evidenceNote.length >= 10 && evidenceNote.length <= 800, 400, "Describe the damage in 10 to 800 characters.", "invalid_field");

  const walletReuse = one<{ total: number }>(
    db,
    "SELECT COUNT(*) AS total FROM households WHERE wallet_address = ? AND id <> ? AND org_id = ?",
    household!.wallet_address,
    household!.id,
    actor.orgId,
  );
  const addressReuse = one<{ total: number }>(
    db,
    `SELECT COUNT(*) AS total FROM households WHERE province = ? AND district = ? AND address_line = ? AND members = ? AND id <> ?`,
    household!.province,
    household!.district,
    household!.address_line,
    household!.members,
    household!.id,
  );
  const duplicateReasons: string[] = [];
  if ((walletReuse?.total ?? 0) > 0) duplicateReasons.push("Wallet address is already linked to another household.");
  if ((addressReuse?.total ?? 0) > 0) duplicateReasons.push("The same address and household size is already registered.");
  const duplicate = duplicateReasons.length > 0;
  const reference = uniqueReference(db, "RV-G-", "applications");
  const id = `app_${base58(randomBytes(8))}`;
  run(
    db,
    `INSERT INTO applications
     (id,reference,activation_id,household_id,status,evidence_note,evidence_ref,duplicate_flag,duplicate_reason,submitted_at)
     VALUES (?,?,?,?, 'submitted', ?,?,?,?,?)`,
    id,
    reference,
    activation!.id,
    household!.id,
    evidenceNote,
    evidenceRef,
    duplicate ? 1 : 0,
    duplicate ? duplicateReasons.join(" ") : null,
    nowIso(),
  );
  audit(db, actor.orgId, actor, "application.submit", "application", id, `Submitted ${reference} for ${activation!.title}.${duplicate ? " Flagged as a possible duplicate." : ""}`);
  const saved = one<ApplicationRow>(db, `${APPLICATION_SELECT} WHERE a.id = ?`, id);
  return mapApplication(saved!);
}

export function reviewApplication(
  db: DatabaseSync,
  actor: SessionUser,
  applicationId: string,
  decision: ReviewDecision,
  reason: string,
): Application {
  assert(actor.role === "reviewer" || actor.role === "admin", 403, "Only a reviewer or admin can decide an application.", "forbidden");
  const row = one<ApplicationRow>(db, `${APPLICATION_SELECT} WHERE act.org_id = ? AND a.id = ?`, actor.orgId, applicationId);
  assert(row, 404, "Application not found.", "not_found");
  assert(["submitted", "needs_info"].includes(row!.status), 409, "This application has already been decided.", "invalid_state");
  assert(reason.trim().length >= 5 && reason.trim().length <= 400, 400, "Record a decision reason of 5 to 400 characters.", "invalid_field");

  const activation = one<ActivationRow>(db, "SELECT * FROM activations WHERE id = ?", row!.activation_id)!;
  const counts = activationCounts(db, activation.id);
  if (decision === "approve") {
    const committed = (counts.approved + counts.paid + 1) * activation.grant_thb;
    assert(committed <= activation.budget_thb, 409, "The approved total would exceed this response's budget. Increase the budget or close intake.", "budget_exceeded");
  }

  const now = nowIso();
  if (decision === "needs_info") {
    run(
      db,
      "UPDATE applications SET status='needs_info', reviewer_id=?, decision_reason=?, decided_at=? WHERE id=?",
      actor.id,
      reason.trim(),
      now,
      applicationId,
    );
  } else if (decision === "reject") {
    run(
      db,
      "UPDATE applications SET status='rejected', reviewer_id=?, decision_reason=?, decided_at=? WHERE id=?",
      actor.id,
      reason.trim(),
      now,
      applicationId,
    );
  } else {
    const org = getOrg(db);
    const payoutId = `pay_${base58(randomBytes(8))}`;
    const fiat = row!.cashout_method === "promptpay" && Boolean(row!.promptpay_phone);
    const payoutAsset: Asset = fiat ? "THB" : "USDC";
    const amountAsset = fiat ? activation.grant_thb : assetForThb("USDC", activation.grant_thb);
    const destination = fiat ? maskedPhone(row!.promptpay_phone ?? "") : row!.wallet_address;
    transaction(db, () => {
      run(
        db,
        "UPDATE applications SET status='approved', reviewer_id=?, decision_reason=?, decided_at=? WHERE id=?",
        actor.id,
        reason.trim(),
        now,
        applicationId,
      );
      run(
        db,
        `INSERT INTO payouts
         (id,reference,application_id,org_id,amount_thb,asset,amount_asset,destination,status,tx_ref,simulated,cashout_method,cashout_status,created_at,sent_at)
         VALUES (?,?,?,?,?,?,?,?,'awaiting_approvals',NULL,1,NULL,NULL,?,NULL)`,
        payoutId,
        uniqueReference(db, "RV-P-", "payouts"),
        applicationId,
        actor.orgId,
        activation.grant_thb,
        payoutAsset,
        amountAsset,
        destination,
        now,
      );
    });
    audit(db, actor.orgId, actor, "application.approve", "application", applicationId, `Approved ${row!.reference}; payout awaits ${org.approvalThreshold} executive signatures.`);
  }

  if (decision !== "approve") {
    audit(
      db,
      actor.orgId,
      actor,
      decision === "reject" ? "application.reject" : "application.needs_info",
      "application",
      applicationId,
      `${decision === "reject" ? "Rejected" : "Requested information for"} ${row!.reference}. ${reason.trim()}`,
    );
  }
  return mapApplication(one<ApplicationRow>(db, `${APPLICATION_SELECT} WHERE a.id = ?`, applicationId)!);
}

export function reviewQueue(db: DatabaseSync, orgId: string): Application[] {
  return listApplications(db, orgId, "submitted").concat(listApplications(db, orgId, "needs_info"));
}

/* ---------------------------------------------------------------- payouts */

function payoutSignatures(db: DatabaseSync, payoutId: string): Payout["signatures"] {
  const rows = all<{ user_id: string; name: string; created_at: string }>(
    db,
    `SELECT pa.user_id, u.name, pa.created_at FROM payout_approvals pa JOIN users u ON u.id = pa.user_id
     WHERE pa.payout_id = ? ORDER BY pa.created_at`,
    payoutId,
  );
  return rows.map((row) => ({ userId: row.user_id, name: row.name, at: row.created_at }));
}

function mapPayout(db: DatabaseSync, row: PayoutRow): Payout {
  const org = getOrg(db);
  return {
    id: row.id,
    reference: row.reference,
    applicationId: row.application_id,
    applicantName: row.applicant_name,
    district: row.district,
    amountThb: row.amount_thb,
    asset: row.asset,
    amountAsset: row.amount_asset,
    destination: row.destination,
    status: row.status,
    signatures: payoutSignatures(db, row.id),
    requiredSignatures: org.approvalThreshold,
    txRef: row.tx_ref,
    simulated: row.simulated === 1,
    createdAt: row.created_at,
    sentAt: row.sent_at,
    cashoutMethod: row.cashout_method,
    cashoutStatus: row.cashout_status,
  };
}

const PAYOUT_SELECT = `
  SELECT p.*, a.applicant_name, a.district FROM payouts p
  JOIN (
    SELECT ap.id AS id, h.full_name AS applicant_name, h.district AS district
    FROM applications ap JOIN households h ON h.id = ap.household_id
  ) a ON a.id = p.application_id
`;

export function listPayouts(db: DatabaseSync, orgId: string, status?: string): Payout[] {
  const rows = all<PayoutRow>(
    db,
    `${PAYOUT_SELECT} WHERE p.org_id = ? ${status ? "AND p.status = ?" : ""} ORDER BY p.created_at DESC`,
    ...(status ? [orgId, status] : [orgId]),
  );
  return rows.map((row) => mapPayout(db, row));
}

export function signPayout(db: DatabaseSync, actor: SessionUser, payoutId: string): Payout {
  assert(actor.role === "approver" || actor.role === "admin", 403, "Only an approver can sign a payout.", "forbidden");
  const row = one<PayoutRow>(db, `${PAYOUT_SELECT} WHERE p.org_id = ? AND p.id = ?`, actor.orgId, payoutId);
  assert(row, 404, "Payout not found.", "not_found");
  assert(row!.status === "awaiting_approvals", 409, "This payout has already been sent.", "invalid_state");
  const reviewedByActor = one<{ id: string }>(
    db,
    "SELECT id FROM applications WHERE id = ? AND reviewer_id = ?",
    row!.application_id,
    actor.id,
  );
  assert(!reviewedByActor, 409, "A reviewer cannot also sign the payout for the same application.", "segregation");
  const already = one<{ id: string }>(db, "SELECT id FROM payout_approvals WHERE payout_id = ? AND user_id = ?", payoutId, actor.id);
  assert(!already, 409, "You have already signed this payout.", "already_signed");
  run(
    db,
    "INSERT INTO payout_approvals (id,payout_id,user_id,created_at) VALUES (?,?,?,?)",
    `apr_${base58(randomBytes(8))}`,
    payoutId,
    actor.id,
    nowIso(),
  );
  const signatures = payoutSignatures(db, payoutId);
  const org = getOrg(db);
  let sent = false;
  if (signatures.length >= org.approvalThreshold) {
    const txRef = `SIM-${base58(randomBytes(32))}`;
    const sentAt = nowIso();
    transaction(db, () => {
      run(db, "UPDATE payouts SET status='sent', tx_ref=?, sent_at=? WHERE id=?", txRef, sentAt, payoutId);
      run(db, "UPDATE applications SET status='paid' WHERE id=?", row!.application_id);
    });
    sent = true;
    audit(
      db,
      actor.orgId,
      actor,
      "payout.send",
      "payout",
      payoutId,
      `Payout ${row!.reference} reached ${signatures.length} of ${org.approvalThreshold} signatures and was sent (simulated).`,
    );
  }
  audit(
    db,
    actor.orgId,
    actor,
    "payout.sign",
    "payout",
    payoutId,
    `Signed ${row!.reference} (${signatures.length} of ${org.approvalThreshold}).${sent ? " This signature released the simulated transfer." : ""}`,
  );
  return mapPayout(db, one<PayoutRow>(db, `${PAYOUT_SELECT} WHERE p.id = ?`, payoutId)!);
}

export function requestCashout(
  db: DatabaseSync,
  actor: SessionUser,
  payoutId: string,
  method: "promptpay" | "wallet",
): Payout {
  assert(actor.role === "recipient", 403, "Only the recipient can choose a cash-out method.", "forbidden");
  const row = one<PayoutRow>(
    db,
    `${PAYOUT_SELECT} WHERE p.org_id = ? AND p.id = ?`,
    actor.orgId,
    payoutId,
  );
  assert(row, 404, "Payout not found.", "not_found");
  const owned = one<{ id: string }>(
    db,
    `SELECT p.id FROM payouts p JOIN applications a ON a.id = p.application_id
     JOIN households h ON h.id = a.household_id WHERE p.id = ? AND h.user_id = ?`,
    payoutId,
    actor.id,
  );
  assert(owned, 404, "Payout not found.", "not_found");
  assert(row!.status === "sent", 409, "The payout has not been sent yet.", "invalid_state");
  assert(row!.asset !== "THB", 409, "This grant was already settled to PromptPay.", "invalid_state");
  assert(method === "promptpay" || method === "wallet", 400, "Choose PromptPay or wallet.", "invalid_field");
  const household = one<HouseholdRow>(
    db,
    "SELECT * FROM households WHERE user_id = ?",
    actor.id,
  );
  const destination =
    method === "promptpay"
      ? maskedPhone(household?.promptpay_phone ?? actor.phone ?? "")
      : household?.wallet_address ?? row!.destination;
  run(
    db,
    "UPDATE payouts SET cashout_method=?, cashout_status='paid', destination=? WHERE id=?",
    method,
    destination,
    payoutId,
  );
  audit(
    db,
    actor.orgId,
    actor,
    "payout.cashout",
    "payout",
    payoutId,
    `Recipient chose ${method === "promptpay" ? "PromptPay" : "wallet"} cash-out (simulated).`,
  );
  return mapPayout(db, one<PayoutRow>(db, `${PAYOUT_SELECT} WHERE p.id = ?`, payoutId)!);
}

/* -------------------------------------------------------------- recipient */

export function recipientHome(db: DatabaseSync, user: SessionUser): RecipientHome {
  const household = getHousehold(db, user);
  if (!household) return { household: null, activations: [], applications: [], payouts: [] };
  const activations = listActivations(db, user.orgId).filter((activation) => activation.status === "active");
  const applications = listHouseholdApplications(db, household.id);
  const payouts = all<PayoutRow>(
    db,
    `${PAYOUT_SELECT} WHERE p.org_id = ? AND p.application_id IN (SELECT id FROM applications WHERE household_id = ?) ORDER BY p.created_at DESC`,
    user.orgId,
    household.id,
  ).map((row) => mapPayout(db, row));

  const mapped: RecipientActivation[] = activations.map((activation) => {
    const existing = applications.find((application) => application.activationId === activation.id);
    let reason: string | null = null;
    if (household.kycStatus !== "verified") reason = "Complete verification first.";
    else if (activation.province !== household.province) reason = "This response is for a different province.";
    else if (!activation.districts.includes(household.district)) reason = "Your district is not in the affected area list.";
    else if (existing) reason = "Your household already has a request for this response.";
    return {
      ...activation,
      eligible: reason === null,
      ineligibleReason: reason,
      existingApplication: existing
        ? { id: existing.id, reference: existing.reference, status: existing.status, submittedAt: existing.submittedAt }
        : null,
    };
  });
  return { household, activations: mapped, applications, payouts };
}

/* -------------------------------------------------------------- donations */

export function createDonation(db: DatabaseSync, body: Record<string, unknown>): DonationReceipt {
  const org = getOrg(db);
  const asset = String(body.asset ?? "") as Asset;
  assert(["SOL", "USDC", "THB"].includes(asset), 400, "Choose SOL, USDC or THB.", "invalid_asset");
  const amount = Number(body.amount);
  assert(Number.isFinite(amount) && amount > 0, 400, "Enter an amount greater than zero.", "invalid_amount");
  const channel: DonationChannel = asset === "THB" ? "fiat" : "crypto";
  const declaredChannel = body.channel === "fiat" ? "fiat" : body.channel === "crypto" ? "crypto" : channel;
  assert(declaredChannel === channel, 400, "That payment channel does not match the asset.", "invalid_channel");
  if (asset === "SOL") assert(amount >= 0.001 && amount <= 10_000, 400, "SOL donations must be between 0.001 and 10,000.", "invalid_amount");
  if (asset === "USDC") assert(amount >= 1 && amount <= 1_000_000, 400, "USDC donations must be between 1 and 1,000,000.", "invalid_amount");
  if (asset === "THB") assert(amount >= 100 && amount <= 1_000_000, 400, "Fiat donations must be between ฿100 and ฿1,000,000.", "invalid_amount");

  const provinceRaw = body.province === null || body.province === undefined || body.province === "" ? null : String(body.province);
  assert(!provinceRaw || PROVINCES.some((item) => item.en === provinceRaw), 400, "Choose a valid province or leave it blank.", "invalid_field");
  const donorName = String(body.donorName ?? "").trim().slice(0, 60) || "Anonymous";
  const convert = asset === "SOL" ? body.convert !== false : false;

  const amountThb = thbFor(asset, amount);
  let settledAsset: Asset = asset;
  let settledAmount = amount;
  let converted = false;
  if (asset === "SOL" && convert) {
    settledAsset = "USDC";
    settledAmount = Math.round((amountThb / config.usdcThb) * 1_000_000) / 1_000_000;
    converted = true;
  }
  const reference = uniqueReference(db, "RV-D-", "donations");
  const id = `don_${base58(randomBytes(8))}`;
  const txRef = asset === "THB" ? `PP-${base58(randomBytes(12))}` : `SIM-${base58(randomBytes(32))}`;
  run(
    db,
    `INSERT INTO donations
     (id,reference,org_id,donor_name,asset,amount,amount_thb,channel,province,converted,settled_asset,settled_amount,tx_ref,simulated,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1,?)`,
    id,
    reference,
    org.id,
    donorName,
    asset,
    amount,
    amountThb,
    channel,
    provinceRaw,
    converted ? 1 : 0,
    settledAsset,
    settledAmount,
    txRef,
    nowIso(),
  );
  audit(
    db,
    org.id,
    null,
    "donation.receive",
    "donation",
    id,
    `Received a ${asset === "THB" ? "fiat" : "crypto"} donation of ฿${amountThb.toLocaleString("en-US")}${converted ? " and converted it to USDC" : ""}.`,
  );
  return {
    reference,
    amountThb,
    asset,
    amount,
    converted,
    settledAsset,
    settledAmount,
    txRef,
    simulated: true,
    at: nowIso(),
  };
}

/* ----------------------------------------------------------------- ledger */

function totalsFor(db: DatabaseSync, orgId: string): LedgerSummary["totals"] {
  const donated = one<{ total: number; donors: number }>(
    db,
    "SELECT COALESCE(SUM(amount_thb),0) AS total, COUNT(DISTINCT donor_name) AS donors FROM donations WHERE org_id = ?",
    orgId,
  );
  const paid = one<{ total: number }>(
    db,
    "SELECT COALESCE(SUM(amount_thb),0) AS total FROM payouts WHERE org_id = ? AND status = 'sent'",
    orgId,
  );
  const awaiting = one<{ total: number }>(
    db,
    "SELECT COALESCE(SUM(amount_thb),0) AS total FROM payouts WHERE org_id = ? AND status = 'awaiting_approvals'",
    orgId,
  );
  const households = one<{ total: number }>(
    db,
    `SELECT COUNT(DISTINCT a.household_id) AS total FROM payouts p JOIN applications a ON a.id = p.application_id
     WHERE p.org_id = ? AND p.status = 'sent'`,
    orgId,
  );
  const actives = one<{ total: number }>(db, "SELECT COUNT(*) AS total FROM activations WHERE org_id = ? AND status='active'", orgId);
  const pending = one<{ total: number }>(
    db,
    "SELECT COUNT(*) AS total FROM applications a JOIN activations act ON act.id=a.activation_id WHERE act.org_id=? AND a.status='submitted'",
    orgId,
  );
  const donatedThb = donated?.total ?? 0;
  const paidThb = paid?.total ?? 0;
  return {
    donatedThb,
    paidThb,
    awaitingThb: awaiting?.total ?? 0,
    reserveThb: Math.max(0, donatedThb - paidThb),
    donors: donated?.donors ?? 0,
    householdsPaid: households?.total ?? 0,
    activeActivations: actives?.total ?? 0,
    pendingReviews: pending?.total ?? 0,
  };
}

export function ledgerSummary(db: DatabaseSync, orgId: string): LedgerSummary {
  const totals = totalsFor(db, orgId);
  const settledRows = all<{ asset: Asset; amount: number }>(
    db,
    "SELECT settled_asset AS asset, COALESCE(SUM(settled_amount),0) AS amount FROM donations WHERE org_id = ? GROUP BY settled_asset",
    orgId,
  );
  const sentRows = all<{ asset: Asset; amount: number }>(
    db,
    "SELECT asset, COALESCE(SUM(amount_asset),0) AS amount FROM payouts WHERE org_id = ? AND status = 'sent' GROUP BY asset",
    orgId,
  );
  const sentByAsset = new Map(sentRows.map((row) => [row.asset, row.amount]));
  const assetRows = settledRows
    .map((row) => {
      const remaining = Math.max(0, row.amount - (sentByAsset.get(row.asset) ?? 0));
      const rate = row.asset === "SOL" ? config.solThb : row.asset === "USDC" ? config.usdcThb : 1;
      return { asset: row.asset, amount: Math.round(remaining * 1_000_000) / 1_000_000, amountThb: Math.round(remaining * rate) };
    })
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amountThb - a.amountThb);
  const donatedByProvince = new Map<string, number>();
  for (const row of all<{ province: string | null; total: number }>(
    db,
    "SELECT province, COALESCE(SUM(amount_thb),0) AS total FROM donations WHERE org_id = ? GROUP BY province",
    orgId,
  )) {
    donatedByProvince.set(row.province ?? "", row.total);
  }
  const paidByProvince = new Map<string, { paid: number; households: number }>();
  for (const row of all<{ province: string; total: number; households: number }>(
    db,
    `SELECT h.province AS province, COALESCE(SUM(p.amount_thb),0) AS total, COUNT(DISTINCT a.household_id) AS households
     FROM payouts p JOIN applications a ON a.id=p.application_id JOIN households h ON h.id=a.household_id
     WHERE p.org_id=? AND p.status='sent' GROUP BY h.province`,
    orgId,
  )) {
    paidByProvince.set(row.province, { paid: row.total, households: row.households });
  }
  const provinceNames = new Set([...donatedByProvince.keys(), ...paidByProvince.keys()]);
  const byProvince = [...provinceNames]
    .map((province) => ({
      province: province || "Where needed most",
      donatedThb: donatedByProvince.get(province) ?? 0,
      paidThb: paidByProvince.get(province)?.paid ?? 0,
      householdsPaid: paidByProvince.get(province)?.households ?? 0,
    }))
    .sort((a, b) => b.donatedThb + b.paidThb - (a.donatedThb + a.paidThb));

  const recentDonations = all<DonationRow>(
    db,
    "SELECT * FROM donations WHERE org_id = ? ORDER BY created_at DESC LIMIT 8",
    orgId,
  ).map((row) => ({
    id: row.id,
    kind: "donation" as const,
    label: row.province ? `Donation to ${row.province}` : "Donation to where needed most",
    amountThb: row.amount_thb,
    asset: row.asset,
    amount: row.amount,
    at: row.created_at,
    reference: row.reference,
    simulated: row.simulated === 1,
  }));
  const recentPayouts = all<PayoutRow>(
    db,
    `${PAYOUT_SELECT} WHERE p.org_id = ? AND p.status='sent' ORDER BY p.sent_at DESC LIMIT 8`,
    orgId,
  ).map((row) => ({
    id: row.id,
    kind: "payout" as const,
    label: `Household grant · ${row.district}`,
    amountThb: row.amount_thb,
    asset: row.asset,
    amount: row.amount_asset,
    at: row.sent_at ?? row.created_at,
    reference: row.reference,
    simulated: row.simulated === 1,
  }));
  const recent = [...recentDonations, ...recentPayouts].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 12);

  const activeRows = all<ActivationRow>(db, "SELECT * FROM activations WHERE org_id = ? AND status = 'active'", orgId);
  const coverage = activeRows.flatMap((activation) => coverageRows(db, activation));
  return {
    totals,
    assets: assetRows,
    byProvince,
    coverage,
    recent,
    demoRates: {
      solThb: config.solThb,
      usdcThb: config.usdcThb,
      note: "Indicative demonstration rates, not a live market quote.",
    },
  };
}

export function overview(db: DatabaseSync, orgId: string): Overview {
  const activations = listActivations(db, orgId);
  const coverage = activations.filter((activation) => activation.status === "active").flatMap((activation) => {
    const row = one<ActivationRow>(db, "SELECT * FROM activations WHERE id = ?", activation.id);
    return row ? coverageRows(db, row) : [];
  });
  return {
    totals: totalsFor(db, orgId),
    activations,
    coverage,
    awaitingPayouts: listPayouts(db, orgId, "awaiting_approvals"),
    pendingApplications: listApplications(db, orgId, "submitted"),
    audit: auditEntries(db, orgId, 12),
  };
}

export function allDonations(db: DatabaseSync, orgId: string): Donation[] {
  return all<DonationRow>(db, "SELECT * FROM donations WHERE org_id = ? ORDER BY created_at DESC LIMIT 100", orgId).map((row) => ({
    id: row.id,
    reference: row.reference,
    donorName: row.donor_name,
    asset: row.asset,
    amount: row.amount,
    amountThb: row.amount_thb,
    channel: row.channel,
    province: row.province,
    converted: row.converted === 1,
    settledAsset: row.settled_asset,
    settledAmount: row.settled_amount,
    txRef: row.tx_ref,
    simulated: row.simulated === 1,
    createdAt: row.created_at,
  }));
}

/* -------------------------------------------------------------- partners */

export function partnerActivations(db: DatabaseSync, orgId: string): PartnerActivationSummary[] {
  return listActivations(db, orgId)
    .filter((activation) => activation.status !== "draft")
    .map((activation) => ({
      id: activation.id,
      title: activation.title,
      province: activation.province,
      status: activation.status,
      budgetThb: activation.budgetThb,
      grantThb: activation.grantThb,
      paidThb: activation.paidThb,
      remainingThb: activation.remainingThb,
      householdsPaid: activation.paid,
      pendingApplications: activation.applications - activation.approved - activation.paid,
    }));
}

export function partnerCoverage(db: DatabaseSync, orgId: string, activationId: string): {
  activation: PartnerActivationSummary;
  coverage: CoverageRow[];
  unreachedDistricts: string[];
} {
  const activation = listActivations(db, orgId).find((item) => item.id === activationId);
  assert(activation, 404, "Activation not found.", "not_found");
  const coverage = coverageFor(db, orgId, activationId);
  return {
    activation: {
      id: activation!.id,
      title: activation!.title,
      province: activation!.province,
      status: activation!.status,
      budgetThb: activation!.budgetThb,
      grantThb: activation!.grantThb,
      paidThb: activation!.paidThb,
      remainingThb: activation!.remainingThb,
      householdsPaid: activation!.paid,
      pendingApplications: activation!.applications - activation!.approved - activation!.paid,
    },
    coverage,
    unreachedDistricts: coverage.filter((row) => row.unreached).map((row) => row.district),
  };
}

export function createApiKey(db: DatabaseSync, actor: SessionUser, name: string): { key: string; record: ApiKeyRecord } {
  assert(actor.role === "admin", 403, "Only an organisation admin can create API keys.", "forbidden");
  assert(name.trim().length >= 2 && name.trim().length <= 60, 400, "Name the key with 2 to 60 characters.", "invalid_field");
  const key = `rv_live_${base58(randomBytes(24))}`;
  const id = `key_${base58(randomBytes(8))}`;
  run(
    db,
    "INSERT INTO api_keys (id,org_id,name,prefix,key_hash,created_at) VALUES (?,?,?,?,?,?)",
    id,
    actor.orgId,
    name.trim(),
    key.slice(0, 14),
    hashToken(key),
    nowIso(),
  );
  audit(db, actor.orgId, actor, "partner.key_create", "api_key", id, `Created partner key ${name.trim()}.`);
  return {
    key,
    record: { id, name: name.trim(), prefix: key.slice(0, 14), createdAt: nowIso(), lastUsedAt: null, revokedAt: null },
  };
}

export function listApiKeys(db: DatabaseSync, orgId: string): ApiKeyRecord[] {
  return all<{
    id: string;
    name: string;
    prefix: string;
    created_at: string;
    last_used_at: string | null;
    revoked_at: string | null;
  }>(db, "SELECT id,name,prefix,created_at,last_used_at,revoked_at FROM api_keys WHERE org_id = ? ORDER BY created_at DESC", orgId).map(
    (row) => ({
      id: row.id,
      name: row.name,
      prefix: row.prefix,
      createdAt: row.created_at,
      lastUsedAt: row.last_used_at,
      revokedAt: row.revoked_at,
    }),
  );
}

export function revokeApiKey(db: DatabaseSync, actor: SessionUser, id: string): void {
  assert(actor.role === "admin", 403, "Only an organisation admin can revoke API keys.", "forbidden");
  const row = one<{ name: string }>(db, "SELECT name FROM api_keys WHERE id = ? AND org_id = ?", id, actor.orgId);
  assert(row, 404, "API key not found.", "not_found");
  run(db, "UPDATE api_keys SET revoked_at = ? WHERE id = ?", nowIso(), id);
  audit(db, actor.orgId, actor, "partner.key_revoke", "api_key", id, `Revoked partner key ${row!.name}.`);
}

export function authenticateApiKey(db: DatabaseSync, token: string): Organisation {
  const hash = hashToken(token);
  const row = one<{ id: string; org_id: string; revoked_at: string | null }>(
    db,
    "SELECT id,org_id,revoked_at FROM api_keys WHERE key_hash = ?",
    hash,
  );
  assert(row && !row.revoked_at, 401, "That partner key is not valid.", "unauthorized");
  run(db, "UPDATE api_keys SET last_used_at = ? WHERE id = ?", nowIso(), row!.id);
  return orgById(db, row!.org_id);
}

export function partnerSnapshot(db: DatabaseSync, orgId: string): {
  organisation: string;
  country: string;
  activations: PartnerActivationSummary[];
  coverage: CoverageRow[];
  ledger: LedgerSummary["totals"];
} {
  const org = orgById(db, orgId);
  const activations = partnerActivations(db, orgId);
  const coverage = activations
    .filter((activation) => activation.status === "active")
    .flatMap((activation) => coverageFor(db, orgId, activation.id));
  return {
    organisation: org.name,
    country: org.country,
    activations,
    coverage,
    ledger: totalsFor(db, orgId),
  };
}

/* ---------------------------------------------------------- demo login */

export function demoPersonas(db: DatabaseSync): Array<{ role: StaffRole | "recipient"; name: string; email: string | null; phone: string | null; userId: string }> {
  const rows = all<UserRow>(
    db,
    `SELECT u.id,u.org_id,u.role,u.name,u.email,u.phone,u.password_hash,o.name AS org_name
     FROM users u JOIN organisations o ON o.id = u.org_id
     WHERE u.role IN ('admin','reviewer','approver') ORDER BY CASE u.role WHEN 'admin' THEN 0 WHEN 'reviewer' THEN 1 ELSE 2 END, u.id`,
  );
  return rows.map((row) => ({
    role: row.role as StaffRole,
    name: row.name,
    email: row.email,
    phone: row.phone,
    userId: row.id,
  }));
}

export function forceLogin(db: DatabaseSync, userId: string): { user: SessionUser; token: string } {
  const row = one<UserRow>(
    db,
    `SELECT u.id,u.org_id,u.role,u.name,u.email,u.phone,u.password_hash,o.name AS org_name
     FROM users u JOIN organisations o ON o.id = u.org_id WHERE u.id = ?`,
    userId,
  );
  assert(row, 404, "Demo account not found.", "not_found");
  return { user: mapUser(row!), token: createSession(db, row!.id) };
}

export function maskPhone(phone: string): string {
  return maskedPhone(phone);
}
