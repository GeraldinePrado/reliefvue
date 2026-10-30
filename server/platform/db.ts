import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { ApplicationStatus, Asset, Role } from "../../shared/platform.ts";
import { config, assetForThb } from "./config.ts";
import {
  base58,
  hashNationalId,
  hashPassword,
  syntheticNationalId,
  walletAddress,
} from "./identity.ts";

export type SqlValue = string | number | null;

export function all<T>(db: DatabaseSync, sql: string, ...params: SqlValue[]): T[] {
  return db.prepare(sql).all(...params) as unknown as T[];
}

export function one<T>(db: DatabaseSync, sql: string, ...params: SqlValue[]): T | undefined {
  return db.prepare(sql).get(...params) as unknown as T | undefined;
}

export function run(db: DatabaseSync, sql: string, ...params: SqlValue[]): void {
  db.prepare(sql).run(...params);
}

export function transaction<T>(db: DatabaseSync, work: () => T): T {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = work();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS organisations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL,
  treasury_address TEXT NOT NULL,
  promptpay_id TEXT NOT NULL DEFAULT '',
  approval_threshold INTEGER NOT NULL DEFAULT 2,
  grant_thb_default INTEGER NOT NULL DEFAULT 3000,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organisations(id),
  role TEXT NOT NULL CHECK (role IN ('admin','reviewer','approver','recipient')),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  password_hash TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS otp_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  consumed INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS households (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  org_id TEXT NOT NULL REFERENCES organisations(id),
  full_name TEXT NOT NULL,
  identity_type TEXT NOT NULL DEFAULT 'thai' CHECK (identity_type IN ('thai','foreign')),
  national_id_hash TEXT NOT NULL UNIQUE,
  national_id_last4 TEXT NOT NULL,
  tm30_ref TEXT NOT NULL DEFAULT '',
  address_evidence_type TEXT NOT NULL DEFAULT 'utility_bill',
  address_evidence_ref TEXT NOT NULL DEFAULT '',
  province TEXT NOT NULL,
  district TEXT NOT NULL,
  subdistrict TEXT NOT NULL,
  address_line TEXT NOT NULL,
  members INTEGER NOT NULL,
  income_band TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  cashout_method TEXT NOT NULL DEFAULT 'wallet' CHECK (cashout_method IN ('wallet','promptpay')),
  promptpay_phone TEXT,
  kyc_status TEXT NOT NULL DEFAULT 'unverified',
  kyc_method TEXT NOT NULL DEFAULT 'demo',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS activations (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organisations(id),
  title TEXT NOT NULL,
  disaster_type TEXT NOT NULL,
  province TEXT NOT NULL,
  districts TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft','active','closed')),
  budget_thb INTEGER NOT NULL,
  grant_thb INTEGER NOT NULL,
  started_at TEXT NOT NULL,
  closed_at TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  activation_id TEXT NOT NULL REFERENCES activations(id),
  household_id TEXT NOT NULL REFERENCES households(id),
  status TEXT NOT NULL CHECK (status IN ('submitted','needs_info','approved','rejected','paid')),
  evidence_note TEXT NOT NULL DEFAULT '',
  evidence_ref TEXT NOT NULL DEFAULT '',
  duplicate_flag INTEGER NOT NULL DEFAULT 0,
  duplicate_reason TEXT,
  reviewer_id TEXT REFERENCES users(id),
  decision_reason TEXT,
  submitted_at TEXT NOT NULL,
  decided_at TEXT,
  UNIQUE (activation_id, household_id)
);
CREATE TABLE IF NOT EXISTS payouts (
  id TEXT PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  application_id TEXT NOT NULL UNIQUE REFERENCES applications(id),
  org_id TEXT NOT NULL REFERENCES organisations(id),
  amount_thb INTEGER NOT NULL,
  asset TEXT NOT NULL,
  amount_asset REAL NOT NULL,
  destination TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('awaiting_approvals','sent')),
  tx_ref TEXT,
  simulated INTEGER NOT NULL DEFAULT 1,
  cashout_method TEXT,
  cashout_status TEXT,
  created_at TEXT NOT NULL,
  sent_at TEXT
);
CREATE TABLE IF NOT EXISTS payout_approvals (
  id TEXT PRIMARY KEY,
  payout_id TEXT NOT NULL REFERENCES payouts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL,
  UNIQUE (payout_id, user_id)
);
CREATE TABLE IF NOT EXISTS donations (
  id TEXT PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  org_id TEXT NOT NULL REFERENCES organisations(id),
  donor_name TEXT NOT NULL,
  asset TEXT NOT NULL CHECK (asset IN ('SOL','USDC','THB')),
  amount REAL NOT NULL,
  amount_thb INTEGER NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('crypto','fiat')),
  province TEXT,
  converted INTEGER NOT NULL DEFAULT 0,
  settled_asset TEXT NOT NULL,
  settled_amount REAL NOT NULL,
  tx_ref TEXT NOT NULL,
  simulated INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organisations(id),
  actor_id TEXT,
  actor_label TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organisations(id),
  name TEXT NOT NULL,
  prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  last_used_at TEXT,
  revoked_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_applications_activation ON applications(activation_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_donations_created ON donations(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_events(created_at);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes(phone);
`;

const TABLES = [
  "payout_approvals",
  "payouts",
  "applications",
  "activations",
  "households",
  "donations",
  "audit_events",
  "api_keys",
  "sessions",
  "otp_codes",
  "users",
  "organisations",
];

export function openDatabase(file: string): DatabaseSync {
  if (file !== ":memory:") mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");
  migrate(db);
  seedIfEmpty(db);
  return db;
}

export function migrate(db: DatabaseSync): void {
  db.exec(SCHEMA);
}

export function resetDatabase(db: DatabaseSync): void {
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const table of TABLES) db.exec(`DROP TABLE IF EXISTS ${table}`);
    migrate(db);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  seedIfEmpty(db);
}

function seedIfEmpty(db: DatabaseSync): void {
  const count = one<{ total: number }>(db, "SELECT COUNT(*) AS total FROM organisations");
  if ((count?.total ?? 0) > 0) return;
  seed(db);
}

/** All demo fixtures are fictional. No real identity data is used. */
function seed(db: DatabaseSync): void {
  const now = Date.now();
  const at = (daysAgo = 0, hoursAgo = 0): string =>
    new Date(now - daysAgo * 86_400_000 - hoursAgo * 3_600_000).toISOString();
  const orgId = "org_reliefvue_th";
  const treasury = walletAddress();
  const password = hashPassword("reliefvue-demo");

  transaction(db, () => {
    run(
      db,
      `INSERT INTO organisations (id,name,slug,country,treasury_address,promptpay_id,approval_threshold,grant_thb_default,created_at)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      orgId,
      "ReliefVue Thailand",
      "reliefvue-thailand",
      "Thailand",
      treasury,
      "reliefvue@promptpay.demo",
      2,
      3000,
      at(30),
    );

    const staff: Array<[string, Role, string, string, string]> = [
      ["usr_admin", "admin", "Somchai P.", "admin@reliefvue.demo", "0810000101"],
      ["usr_reviewer", "reviewer", "Nok S.", "reviewer@reliefvue.demo", "0810000102"],
      ["usr_approver1", "approver", "Anan T.", "anan@reliefvue.demo", "0810000103"],
      ["usr_approver2", "approver", "Malee K.", "malee@reliefvue.demo", "0810000104"],
    ];
    for (const [id, role, name, email, phone] of staff) {
      run(
        db,
        `INSERT INTO users (id,org_id,role,name,email,phone,password_hash,created_at) VALUES (?,?,?,?,?,?,?,?)`,
        id,
        orgId,
        role,
        name,
        email,
        phone,
        password,
        at(30),
      );
    }

    const people: Array<{
      seed: number;
      id: string;
      name: string;
      phone: string;
      district: string;
      subdistrict: string;
      address: string;
      members: number;
      income: string;
      province?: string;
      cashout?: "promptpay" | "wallet";
      promptpay?: string;
      foreign?: boolean;
    }> = [
      {
        seed: 1,
        id: "usr_rcpt_1",
        name: "Tan Wei Ming",
        phone: "0810000001",
        district: "Mae Rim",
        subdistrict: "San Phi Suea",
        address: "House 12, Soi 4, San Phi Suea",
        members: 4,
        income: "Under ฿10,000 / month",
        cashout: "promptpay",
        promptpay: "0810000001",
        foreign: true,
      },
      {
        seed: 2,
        id: "usr_rcpt_2",
        name: "Lim Mei Ling",
        phone: "0810000002",
        district: "Saraphi",
        subdistrict: "Nong Phueng",
        address: "House 88, Nong Phueng",
        members: 3,
        income: "฿10,000 – ฿20,000 / month",
      },
      {
        seed: 3,
        id: "usr_rcpt_3",
        name: "Ng Jia Hui",
        phone: "0810000003",
        district: "Chang Phueak",
        subdistrict: "Chang Phueak",
        address: "Room 7, Chang Phueak Road",
        members: 5,
        income: "Under ฿10,000 / month",
        cashout: "promptpay",
        promptpay: "0810000003",
      },
      {
        seed: 4,
        id: "usr_rcpt_4",
        name: "Cheah Boon Keat",
        phone: "0810000004",
        district: "Hang Dong",
        subdistrict: "Nong Kaeo",
        address: "House 31, Nong Kaeo",
        members: 2,
        income: "฿10,000 – ฿20,000 / month",
      },
      {
        seed: 5,
        id: "usr_rcpt_5",
        name: "Ong Siew Lan",
        phone: "0810000005",
        district: "Mae Rim",
        subdistrict: "Rim Tai",
        address: "House 5, Rim Tai",
        members: 6,
        income: "Under ฿10,000 / month",
      },
      {
        seed: 6,
        id: "usr_rcpt_6",
        name: "Goh Chun Hong",
        phone: "0810000006",
        district: "Saraphi",
        subdistrict: "Tha Wang Tan",
        address: "House 19, Tha Wang Tan",
        members: 3,
        income: "฿10,000 – ฿20,000 / month",
        cashout: "promptpay",
        promptpay: "0810000006",
      },
      {
        seed: 7,
        id: "usr_rcpt_7",
        name: "Chan Wai Kit",
        phone: "0810000007",
        district: "Bang Kapi",
        subdistrict: "Hua Mak",
        address: "Condo 4, Hua Mak",
        members: 2,
        income: "Over ฿35,000 / month",
        province: "Bangkok",
        foreign: true,
      },
    ];

    const householdIds: Record<number, string> = {};
    const wallets: Record<number, string> = {};
    for (const person of people) {
      const id = `hh_${person.seed}`;
      const wallet = walletAddress();
      householdIds[person.seed] = id;
      wallets[person.seed] = wallet;
      const identityType = person.foreign ? "foreign" : "thai";
      const identityValue = person.foreign ? `P${String(1000000 + person.seed)}` : syntheticNationalId(person.seed);
      run(
        db,
        `INSERT INTO users (id,org_id,role,name,email,phone,password_hash,created_at) VALUES (?,?,?,?,?,?,?,?)`,
        person.id,
        orgId,
        "recipient",
        person.name,
        null,
        person.phone,
        null,
        at(12),
      );
      run(
        db,
        `INSERT INTO households
         (id,user_id,org_id,full_name,identity_type,national_id_hash,national_id_last4,tm30_ref,address_evidence_type,address_evidence_ref,province,district,subdistrict,address_line,members,income_band,wallet_address,cashout_method,promptpay_phone,kyc_status,kyc_method,created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        id,
        person.id,
        orgId,
        person.name,
        identityType,
        hashNationalId(`${identityType}:${identityValue}`, config.idSalt),
        identityValue.slice(-4),
        person.foreign ? `TM30-2026-${String(100000 + person.seed)}` : "",
        person.foreign ? "lease" : "utility_bill",
        person.foreign ? `LEASE-2026-${String(2000 + person.seed)}` : `MEA-2026-${String(3000 + person.seed)}`,
        person.province ?? "Chiang Mai",
        person.district,
        person.subdistrict,
        person.address,
        person.members,
        person.income,
        wallet,
        person.cashout ?? "wallet",
        person.promptpay ?? null,
        "verified",
        "demo",
        at(12),
      );
    }

    // Wallet-reuse fixture: a second household claims the same wallet.
    run(db, "UPDATE households SET wallet_address = ? WHERE id = ?", wallets[1], householdIds[4]);

    run(
      db,
      `INSERT INTO activations (id,org_id,title,disaster_type,province,districts,status,budget_thb,grant_thb,started_at,closed_at,created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      "act_cm_flood",
      orgId,
      "Chiang Mai river flood response",
      "Flood",
      "Chiang Mai",
      JSON.stringify(["Mae Rim", "Saraphi", "Chang Phueak", "Hang Dong"]),
      "active",
      300000,
      3000,
      at(4),
      null,
      at(5),
    );
    run(
      db,
      `INSERT INTO activations (id,org_id,title,disaster_type,province,districts,status,budget_thb,grant_thb,started_at,closed_at,created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      "act_mhs_landslide",
      orgId,
      "Mae Hong Son access-road landslide",
      "Landslide",
      "Mae Hong Son",
      JSON.stringify(["Mueang Mae Hong Son"]),
      "closed",
      120000,
      3000,
      at(38),
      at(21),
      at(40),
    );

    const apps: Array<{
      id: string;
      ref: string;
      person: number;
      status: ApplicationStatus;
      days: number;
      note: string;
      refDoc: string;
      duplicate?: [boolean, string];
      decision?: [string, string, number];
      reviewer?: string;
    }> = [
      {
        id: "app_1001",
        ref: "RV-G-1001",
        person: 1,
        status: "paid",
        days: 3,
        note: "Flood water reached the ground floor. Family moved upstairs for two nights.",
        refDoc: "photo-flood-01.jpg",
        decision: ["approve", "Residence and household verified against the declared district.", 2],
        reviewer: "usr_reviewer",
      },
      {
        id: "app_1002",
        ref: "RV-G-1002",
        person: 6,
        status: "paid",
        days: 3,
        note: "Kitchen and sleeping area damaged by mud after the river rose.",
        refDoc: "photo-flood-02.jpg",
        decision: ["approve", "Address and TM30 receipt match the affected subdistrict.", 2],
        reviewer: "usr_reviewer",
      },
      {
        id: "app_1003",
        ref: "RV-G-1003",
        person: 3,
        status: "approved",
        days: 1,
        note: "Ground-floor room flooded; mattress and cooking equipment lost.",
        refDoc: "photo-flood-03.jpg",
        decision: ["approve", "Verified household in an affected district; one grant per household.", 1],
        reviewer: "usr_reviewer",
      },
      {
        id: "app_1004",
        ref: "RV-G-1004",
        person: 2,
        status: "submitted",
        days: 0,
        note: "Water entered the house overnight. Need help replacing food and bedding.",
        refDoc: "photo-flood-04.jpg",
      },
      {
        id: "app_1005",
        ref: "RV-G-1005",
        person: 4,
        status: "submitted",
        days: 0,
        note: "Flood damage to the lower floor; requesting support for two people.",
        refDoc: "photo-flood-05.jpg",
        duplicate: [true, "Wallet address is already linked to another household in this activation."],
      },
      {
        id: "app_1006",
        ref: "RV-G-1006",
        person: 5,
        status: "needs_info",
        days: 2,
        note: "Roof damaged and belongings wet after heavy rain.",
        refDoc: "photo-flood-06.jpg",
        decision: ["needs_info", "TM30 receipt does not match the stated address. Please update it.", 1],
        reviewer: "usr_reviewer",
      },
    ];

    for (const app of apps) {
      run(
        db,
        `INSERT INTO applications
         (id,reference,activation_id,household_id,status,evidence_note,evidence_ref,duplicate_flag,duplicate_reason,reviewer_id,decision_reason,submitted_at,decided_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        app.id,
        app.ref,
        "act_cm_flood",
        householdIds[app.person],
        app.status,
        app.note,
        app.refDoc,
        app.duplicate?.[0] ? 1 : 0,
        app.duplicate?.[1] ?? null,
        app.reviewer ?? null,
        app.decision?.[1] ?? null,
        at(app.days, 2),
        app.decision ? at(app.decision[2], 1) : null,
      );
    }

    const payoutFor = (
      id: string,
      ref: string,
      appId: string,
      status: "awaiting_approvals" | "sent",
      createdDays: number,
      sentDays: number | null,
      asset: "THB" | "USDC",
      destination: string,
      cashoutStatus: "requested" | "paid" | null,
      approvalUsers: string[],
    ): void => {
      const amountAsset = asset === "THB" ? 3000 : assetForThb("USDC", 3000);
      run(
        db,
        `INSERT INTO payouts (id,reference,application_id,org_id,amount_thb,asset,amount_asset,destination,status,tx_ref,simulated,cashout_method,cashout_status,created_at,sent_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        id,
        ref,
        appId,
        orgId,
        3000,
        asset,
        amountAsset,
        destination,
        status,
        status === "sent" ? `SIM-${base58().slice(0, 44)}` : null,
        1,
        asset === "THB" || cashoutStatus ? "promptpay" : null,
        cashoutStatus,
        at(createdDays, 1),
        sentDays === null ? null : at(sentDays, 0),
      );
      for (const userId of approvalUsers) {
        run(
          db,
          `INSERT INTO payout_approvals (id,payout_id,user_id,created_at) VALUES (?,?,?,?)`,
          `apr_${id}_${userId}`,
          id,
          userId,
          at(createdDays, 1),
        );
      }
    };

    payoutFor("pay_3001", "RV-P-3001", "app_1001", "sent", 2, 2, "THB", "081•••0001", "paid", [
      "usr_approver1",
      "usr_approver2",
    ]);
    payoutFor("pay_3002", "RV-P-3002", "app_1002", "sent", 2, 1, "USDC", wallets[6], null, [
      "usr_approver1",
      "usr_approver2",
    ]);
    payoutFor("pay_3003", "RV-P-3003", "app_1003", "awaiting_approvals", 1, null, "THB", "081•••0003", null, [
      "usr_approver1",
    ]);

    const donations: Array<{
      ref: string;
      donor: string;
      asset: Asset;
      amount: number;
      province: string | null;
      days: number;
      channel?: "crypto" | "fiat";
    }> = [
      { ref: "RV-D-2001", donor: "Nicha L.", asset: "SOL", amount: 12, province: "Chiang Mai", days: 9 },
      { ref: "RV-D-2002", donor: "Anonymous", asset: "USDC", amount: 500, province: null, days: 8 },
      { ref: "RV-D-2003", donor: "Bangkok donors circle", asset: "THB", amount: 25000, province: "Chiang Mai", days: 8 },
      { ref: "RV-D-2004", donor: "Arun V.", asset: "SOL", amount: 5, province: null, days: 7 },
      { ref: "RV-D-2005", donor: "Mali D.", asset: "USDC", amount: 1200, province: "Chiang Mai", days: 6 },
      { ref: "RV-D-2006", donor: "Anonymous", asset: "SOL", amount: 40, province: "Chiang Mai", days: 5 },
      { ref: "RV-D-2007", donor: "Pimchanok T.", asset: "THB", amount: 5000, province: null, days: 4 },
      { ref: "RV-D-2008", donor: "Kiet S.", asset: "SOL", amount: 2.5, province: "Chiang Mai", days: 3 },
      { ref: "RV-D-2009", donor: "Anonymous", asset: "USDC", amount: 250, province: null, days: 2 },
      { ref: "RV-D-2010", donor: "Chiang Mai expat group", asset: "SOL", amount: 20, province: "Chiang Mai", days: 1 },
      { ref: "RV-D-2011", donor: "Napat R.", asset: "THB", amount: 15000, province: null, days: 1 },
      { ref: "RV-D-2012", donor: "Anonymous", asset: "SOL", amount: 8, province: "Chiang Mai", days: 0 },
    ];

    for (const donation of donations) {
      const thb =
        donation.asset === "SOL"
          ? Math.round(donation.amount * config.solThb)
          : donation.asset === "USDC"
            ? Math.round(donation.amount * config.usdcThb)
            : donation.amount;
      const converted = donation.asset === "SOL";
      const settledAsset: Asset =
        donation.asset === "SOL" ? "USDC" : donation.asset;
      const settledAmount =
        settledAsset === "USDC"
          ? Math.round((thb / config.usdcThb) * 1_000_000) / 1_000_000
          : donation.amount;
      run(
        db,
        `INSERT INTO donations (id,reference,org_id,donor_name,asset,amount,amount_thb,channel,province,converted,settled_asset,settled_amount,tx_ref,simulated,created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        `don_${donation.ref}`,
        donation.ref,
        orgId,
        donation.donor,
        donation.asset,
        donation.amount,
        thb,
        donation.channel ?? (donation.asset === "THB" ? "fiat" : "crypto"),
        donation.province,
        converted ? 1 : 0,
        settledAsset,
        settledAmount,
        donation.asset === "THB"
          ? `PP-${base58().slice(0, 18)}`
          : `SIM-${base58().slice(0, 44)}`,
        1,
        at(donation.days, 3),
      );
    }

    const audit: Array<[string, string, string, string, string, number]> = [
      ["Somchai P.", "activation.create", "activation", "act_cm_flood", "Activated Chiang Mai river flood response with ฿300,000 budget.", 5],
      ["Somchai P.", "activation.create", "activation", "act_mhs_landslide", "Recorded Mae Hong Son access-road landslide response.", 40],
      ["Nok S.", "application.approve", "application", "app_1001", "Approved RV-G-1001 after residence and household checks.", 2],
      ["Nok S.", "application.approve", "application", "app_1002", "Approved RV-G-1002 after residence and household checks.", 2],
      ["Nok S.", "application.approve", "application", "app_1003", "Approved RV-G-1003; payout awaiting executive signatures.", 1],
      ["Anan T.", "payout.sign", "payout", "pay_3001", "Signed payout RV-P-3001 (1 of 2).", 2],
      ["Malee K.", "payout.sign", "payout", "pay_3001", "Signed payout RV-P-3001 (2 of 2).", 2],
      ["Anan T.", "payout.sign", "payout", "pay_3002", "Signed payout RV-P-3002 (1 of 2).", 1],
      ["Malee K.", "payout.sign", "payout", "pay_3002", "Signed payout RV-P-3002 (2 of 2).", 1],
      ["Anan T.", "payout.sign", "payout", "pay_3003", "Signed payout RV-P-3003 (1 of 2).", 1],
      ["Nok S.", "application.needs_info", "application", "app_1006", "Requested a clearer TM30 receipt for RV-G-1006.", 1],
      ["System", "donation.receive", "donation", "don_RV-D-2012", "Recorded a simulated SOL donation.", 0],
    ];
    for (const [index, [actor, action, entity, id, detail, days]] of audit.entries()) {
      run(
        db,
        `INSERT INTO audit_events (id,org_id,actor_id,actor_label,action,entity_type,entity_id,detail,created_at)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        `aud_seed_${index}_${id}`,
        orgId,
        null,
        actor,
        action,
        entity,
        id,
        detail,
        at(days, 2),
      );
    }
  });
}
