/**
 * Shared contracts for the ReliefVue operating platform.
 *
 * The platform is a separate application from the public concept site: it is a
 * working local prototype with durable state, staff roles, recipient onboarding,
 * treasury approvals and a read-only partner API. Money movements are simulated
 * unless an operator explicitly enables the Devnet rail.
 */

export type Role = "admin" | "reviewer" | "approver" | "recipient";
export type StaffRole = Exclude<Role, "recipient">;
export type Asset = "SOL" | "USDC" | "THB";
export type DonationChannel = "crypto" | "fiat";
export type ActivationStatus = "draft" | "active" | "closed";
export type ApplicationStatus =
  | "submitted"
  | "needs_info"
  | "approved"
  | "rejected"
  | "paid";
export type PayoutStatus = "awaiting_approvals" | "sent";
export type KycStatus = "unverified" | "pending" | "verified" | "rejected";
export type ReviewDecision = "approve" | "reject" | "needs_info";

export interface Province {
  readonly en: string;
  readonly th: string;
  readonly region: "North" | "Northeast" | "Central" | "East" | "West" | "South";
}

export const PROVINCES: readonly Province[] = [
  { en: "Amnat Charoen", th: "อำนาจเจริญ", region: "Northeast" },
  { en: "Ang Thong", th: "อ่างทอง", region: "Central" },
  { en: "Ayutthaya", th: "พระนครศรีอยุธยา", region: "Central" },
  { en: "Bangkok", th: "กรุงเทพมหานคร", region: "Central" },
  { en: "Bueng Kan", th: "บึงกาฬ", region: "Northeast" },
  { en: "Buriram", th: "บุรีรัมย์", region: "Northeast" },
  { en: "Chachoengsao", th: "ฉะเชิงเทรา", region: "East" },
  { en: "Chai Nat", th: "ชัยนาท", region: "Central" },
  { en: "Chaiyaphum", th: "ชัยภูมิ", region: "Northeast" },
  { en: "Chanthaburi", th: "จันทบุรี", region: "East" },
  { en: "Chiang Mai", th: "เชียงใหม่", region: "North" },
  { en: "Chiang Rai", th: "เชียงราย", region: "North" },
  { en: "Chonburi", th: "ชลบุรี", region: "East" },
  { en: "Chumphon", th: "ชุมพร", region: "South" },
  { en: "Kalasin", th: "กาฬสินธุ์", region: "Northeast" },
  { en: "Kamphaeng Phet", th: "กำแพงเพชร", region: "Central" },
  { en: "Kanchanaburi", th: "กาญจนบุรี", region: "West" },
  { en: "Khon Kaen", th: "ขอนแก่น", region: "Northeast" },
  { en: "Krabi", th: "กระบี่", region: "South" },
  { en: "Lampang", th: "ลำปาง", region: "North" },
  { en: "Lamphun", th: "ลำพูน", region: "North" },
  { en: "Loei", th: "เลย", region: "Northeast" },
  { en: "Lopburi", th: "ลพบุรี", region: "Central" },
  { en: "Mae Hong Son", th: "แม่ฮ่องสอน", region: "North" },
  { en: "Maha Sarakham", th: "มหาสารคาม", region: "Northeast" },
  { en: "Mukdahan", th: "มุกดาหาร", region: "Northeast" },
  { en: "Nakhon Nayok", th: "นครนายก", region: "Central" },
  { en: "Nakhon Pathom", th: "นครปฐม", region: "Central" },
  { en: "Nakhon Phanom", th: "นครพนม", region: "Northeast" },
  { en: "Nakhon Ratchasima", th: "นครราชสีมา", region: "Northeast" },
  { en: "Nakhon Sawan", th: "นครสวรรค์", region: "Central" },
  { en: "Nakhon Si Thammarat", th: "นครศรีธรรมราช", region: "South" },
  { en: "Nan", th: "น่าน", region: "North" },
  { en: "Narathiwat", th: "นราธิวาส", region: "South" },
  { en: "Nong Bua Lamphu", th: "หนองบัวลำภู", region: "Northeast" },
  { en: "Nong Khai", th: "หนองคาย", region: "Northeast" },
  { en: "Nonthaburi", th: "นนทบุรี", region: "Central" },
  { en: "Pathum Thani", th: "ปทุมธานี", region: "Central" },
  { en: "Pattani", th: "ปัตตานี", region: "South" },
  { en: "Phang Nga", th: "พังงา", region: "South" },
  { en: "Phatthalung", th: "พัทลุง", region: "South" },
  { en: "Phayao", th: "พะเยา", region: "North" },
  { en: "Phetchabun", th: "เพชรบูรณ์", region: "Central" },
  { en: "Phetchaburi", th: "เพชรบุรี", region: "West" },
  { en: "Phichit", th: "พิจิตร", region: "Central" },
  { en: "Phitsanulok", th: "พิษณุโลก", region: "Central" },
  { en: "Phrae", th: "แพร่", region: "North" },
  { en: "Phuket", th: "ภูเก็ต", region: "South" },
  { en: "Prachinburi", th: "ปราจีนบุรี", region: "East" },
  { en: "Prachuap Khiri Khan", th: "ประจวบคีรีขันธ์", region: "West" },
  { en: "Ranong", th: "ระนอง", region: "South" },
  { en: "Ratchaburi", th: "ราชบุรี", region: "West" },
  { en: "Rayong", th: "ระยอง", region: "East" },
  { en: "Roi Et", th: "ร้อยเอ็ด", region: "Northeast" },
  { en: "Sa Kaeo", th: "สระแก้ว", region: "East" },
  { en: "Sakon Nakhon", th: "สกลนคร", region: "Northeast" },
  { en: "Samut Prakan", th: "สมุทรปราการ", region: "Central" },
  { en: "Samut Sakhon", th: "สมุทรสาคร", region: "Central" },
  { en: "Samut Songkhram", th: "สมุทรสงคราม", region: "Central" },
  { en: "Saraburi", th: "สระบุรี", region: "Central" },
  { en: "Satun", th: "สตูล", region: "South" },
  { en: "Si Sa Ket", th: "ศรีสะเกษ", region: "Northeast" },
  { en: "Sing Buri", th: "สิงห์บุรี", region: "Central" },
  { en: "Songkhla", th: "สงขลา", region: "South" },
  { en: "Sukhothai", th: "สุโขทัย", region: "Central" },
  { en: "Suphan Buri", th: "สุพรรณบุรี", region: "Central" },
  { en: "Surat Thani", th: "สุราษฎร์ธานี", region: "South" },
  { en: "Surin", th: "สุรินทร์", region: "Northeast" },
  { en: "Tak", th: "ตาก", region: "West" },
  { en: "Trang", th: "ตรัง", region: "South" },
  { en: "Trat", th: "ตราด", region: "East" },
  { en: "Ubon Ratchathani", th: "อุบลราชธานี", region: "Northeast" },
  { en: "Udon Thani", th: "อุดรธานี", region: "Northeast" },
  { en: "Uthai Thani", th: "อุทัยธานี", region: "Central" },
  { en: "Uttaradit", th: "อุตรดิตถ์", region: "North" },
  { en: "Yala", th: "ยะลา", region: "South" },
  { en: "Yasothon", th: "ยโสธร", region: "Northeast" },
] as const;

export const PROVINCE_NAMES = PROVINCES.map((p) => p.en);
export type ProvinceName = (typeof PROVINCES)[number]["en"];

export interface Organisation {
  id: string;
  name: string;
  slug: string;
  country: string;
  treasuryAddress: string;
  promptpayId: string;
  approvalThreshold: number;
  grantThbDefault: number;
  createdAt: string;
}

export interface StaffUser {
  id: string;
  role: StaffRole;
  name: string;
  email: string;
  orgId: string;
  orgName: string;
}

export interface RecipientUser {
  id: string;
  role: "recipient";
  name: string;
  phone: string;
  orgId: string;
  orgName: string;
}

export type SessionUser = StaffUser | RecipientUser;

export type IdentityType = "thai" | "foreign";
export type AddressEvidenceType = "utility_bill" | "lease" | "local_authority" | "tm30";

export interface Household {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  identityType: IdentityType;
  identityLast4: string;
  tm30Ref: string | null;
  addressEvidenceType: AddressEvidenceType;
  addressEvidenceRef: string;
  province: string;
  district: string;
  subdistrict: string;
  addressLine: string;
  members: number;
  incomeBand: string;
  walletAddress: string;
  cashoutMethod: "promptpay" | "wallet";
  promptpayPhone: string | null;
  kycStatus: KycStatus;
  kycMethod: string;
  createdAt: string;
}

export interface Application {
  id: string;
  reference: string;
  activationId: string;
  activationTitle: string;
  activationProvince: string;
  householdId: string;
  applicantName: string;
  applicantPhone: string;
  district: string;
  members: number;
  status: ApplicationStatus;
  evidenceNote: string;
  evidenceRef: string;
  duplicateFlag: boolean;
  duplicateReason: string | null;
  decisionReason: string | null;
  reviewerName: string | null;
  submittedAt: string;
  decidedAt: string | null;
  grantThb: number;
  payoutId: string | null;
  payoutStatus: PayoutStatus | null;
}

export interface Activation {
  id: string;
  title: string;
  disasterType: string;
  province: string;
  districts: string[];
  status: ActivationStatus;
  budgetThb: number;
  grantThb: number;
  committedThb: number;
  paidThb: number;
  remainingThb: number;
  applications: number;
  approved: number;
  paid: number;
  startedAt: string;
  closedAt: string | null;
}

export interface Payout {
  id: string;
  reference: string;
  applicationId: string;
  applicantName: string;
  district: string;
  amountThb: number;
  asset: Asset;
  amountAsset: number;
  destination: string;
  status: PayoutStatus;
  signatures: Array<{ userId: string; name: string; at: string }>;
  requiredSignatures: number;
  txRef: string | null;
  simulated: boolean;
  createdAt: string;
  sentAt: string | null;
  cashoutMethod: "promptpay" | "wallet" | null;
  cashoutStatus: "requested" | "paid" | null;
}

export interface Donation {
  id: string;
  reference: string;
  donorName: string;
  asset: Asset;
  amount: number;
  amountThb: number;
  channel: DonationChannel;
  province: string | null;
  converted: boolean;
  settledAsset: Asset;
  settledAmount: number;
  txRef: string;
  simulated: boolean;
  createdAt: string;
}

export interface CoverageRow {
  activationId: string;
  activationTitle: string;
  province: string;
  district: string;
  applications: number;
  approved: number;
  paid: number;
  unreached: boolean;
  grantThb: number;
}

export interface LedgerSummary {
  totals: {
    donatedThb: number;
    paidThb: number;
    awaitingThb: number;
    reserveThb: number;
    donors: number;
    householdsPaid: number;
    activeActivations: number;
    pendingReviews: number;
  };
  assets: Array<{ asset: Asset; amount: number; amountThb: number }>;
  byProvince: Array<{
    province: string;
    donatedThb: number;
    paidThb: number;
    householdsPaid: number;
  }>;
  coverage: CoverageRow[];
  recent: Array<{
    id: string;
    kind: "donation" | "payout";
    label: string;
    amountThb: number;
    asset: Asset;
    amount: number;
    at: string;
    reference: string;
    simulated: boolean;
  }>;
  demoRates: { solThb: number; usdcThb: number; note: string };
}

export interface PartnerOverview {
  organisation: string;
  country: string;
  activations: Activation[];
  coverage: CoverageRow[];
  ledger: LedgerSummary["totals"];
}

export interface ApiKeyRecord {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

export interface DonationReceipt {
  reference: string;
  amountThb: number;
  asset: Asset;
  amount: number;
  converted: boolean;
  settledAsset: Asset;
  settledAmount: number;
  txRef: string;
  simulated: boolean;
  at: string;
}

export const ASSET_LABEL: Record<Asset, string> = {
  SOL: "SOL",
  USDC: "USDC",
  THB: "THB",
};

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  submitted: "Under review",
  needs_info: "Needs information",
  approved: "Approved, awaiting signatures",
  rejected: "Not approved",
  paid: "Paid",
};

export const INCOME_BANDS = [
  "Under ฿10,000 / month",
  "฿10,000 – ฿20,000 / month",
  "฿20,000 – ฿35,000 / month",
  "Over ฿35,000 / month",
  "Prefer not to say",
] as const;

export interface ApplicationDetail extends Application {
  identityType: IdentityType;
  identityMasked: string;
  tm30Ref: string | null;
  addressEvidenceType: AddressEvidenceType;
  addressEvidenceRef: string;
  subdistrict: string;
  addressLine: string;
  incomeBand: string;
  walletAddress: string;
  kycStatus: KycStatus;
  walletReuseCount: number;
  priorApplicationCount: number;
}

export interface RecipientActivation extends Activation {
  eligible: boolean;
  ineligibleReason: string | null;
  existingApplication: {
    id: string;
    reference: string;
    status: ApplicationStatus;
    submittedAt: string;
  } | null;
}

export interface RecipientHome {
  household: Household | null;
  activations: RecipientActivation[];
  applications: Application[];
  payouts: Payout[];
}

export interface AuditEntry {
  id: string;
  actorLabel: string;
  action: string;
  entityType: string;
  entityId: string;
  detail: string;
  at: string;
}

export interface Overview {
  totals: LedgerSummary["totals"];
  activations: Activation[];
  coverage: CoverageRow[];
  awaitingPayouts: Payout[];
  pendingApplications: Application[];
  audit: AuditEntry[];
}

export interface PartnerActivationSummary {
  id: string;
  title: string;
  province: string;
  status: ActivationStatus;
  budgetThb: number;
  grantThb: number;
  paidThb: number;
  remainingThb: number;
  householdsPaid: number;
  pendingApplications: number;
}

export interface PartnerCoverageReport {
  activation: PartnerActivationSummary;
  coverage: CoverageRow[];
  unreachedDistricts: string[];
}
