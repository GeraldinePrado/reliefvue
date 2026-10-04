export type EventAction =
  | "watch"
  | "review"
  | "approve-reviewer"
  | "approve-primary"
  | "approve-backup";
export interface PublicStatus {
  event: {
    id: string;
    name: string;
    area: string;
    status: "watching" | "review" | "active";
    active: boolean;
    amountSol: number;
    budgetSol: number;
    reviewHoldSol: number;
    paidSol: number;
    readyRemainingSol: number;
    approvals: { reviewer: boolean; approver: "primary" | "backup" | null };
  };
  treasury: string;
  balanceSol: number | null;
  rpcError?: string;
  claims: Record<string, { status: string; signature?: string }>;
  activity: Array<{
    type: "donation" | "payout";
    signature: string;
    amountSol: number;
    at: string;
    explorer: string;
  }>;
  backendMode: "local-server" | "public-preview";
  aiAvailable: false;
}
export interface Profile {
  id: string;
  label: string;
  home: string;
  recipientAddress: string;
  reviewStatus: string;
}
export interface Household extends Profile {
  personId: string;
  householdId: string;
  areaId: string;
  completedAt: string;
  reviewAllocation: boolean;
}
export interface PaymentIntent {
  key: string;
  profileId: string;
  householdId: string;
  amountLamports: number;
  destination: string;
  state: "reserved" | "submitted" | "confirmed" | "needs_review";
  signature?: string;
  createdAt: string;
  updatedAt: string;
}
export interface State {
  event: {
    id: string;
    name: string;
    area: string;
    status: "watching" | "review" | "active";
    revision: number;
    reviewerRevision: number | null;
    approverRevision: number | null;
    approver: "primary" | "backup" | null;
    budgetLamports: number;
    reviewHoldLamports: number;
    paidLamports: number;
    observedEvidence: boolean;
    evidence: Array<{
      label: string;
      observedAt: string;
      areaId: string;
      impact: string;
      synthetic: true;
    }>;
  };
  households: Household[];
  payments: Record<string, PaymentIntent>;
  donationIntents: Record<
    string,
    { signature: string; amountSol: number; state: string }
  >;
  activity: PublicStatus["activity"];
}
export interface Transport {
  treasuryAddress: string;
  donorAddress: string;
  balance(address: string): Promise<number>;
  prepareTransfer(
    fromRole: "treasury" | "donor",
    recipient: string,
    lamports: number,
  ): Promise<{
    signature: string;
    send(): Promise<void>;
    confirm(): Promise<void>;
  }>;
  verifyDonation(signature: string): Promise<number>;
}
