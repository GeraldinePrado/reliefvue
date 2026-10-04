import { fixtureProfiles } from "../shared/fixtures.ts";
import type { State, EventAction, PaymentIntent } from "../shared/types.ts";
export const GRANT = 10_000_000;
export function initialState(addresses: Record<string, string> = {}): State {
  return {
    event: {
      id: "bangkok-flood-demo-v2",
      name: "Fictional flood demonstration",
      area: "Fictional Bangkok flood zone",
      status: "watching",
      revision: 0,
      reviewerRevision: null,
      approverRevision: null,
      approver: null,
      budgetLamports: 50_000_000,
      reviewHoldLamports: 10_000_000,
      paidLamports: 0,
      observedEvidence: false,
      evidence: [],
    },
    households: fixtureProfiles.map((p) => ({
      ...p,
      recipientAddress: addresses[p.id] ?? "",
    })),
    payments: {},
    donationIntents: {},
    activity: [],
  };
}
export function outstanding(s: State) {
  return Object.values(s.payments)
    .filter((p) => p.state !== "confirmed")
    .reduce((a, p) => a + p.amountLamports, 0);
}
export function eventAction(s: State, action: EventAction, balance: number) {
  const e = s.event;
  if (action === "watch" || action === "review") {
    if (Object.keys(s.payments).length)
      throw Error("Existing commitments preserve event terms");
    e.revision++;
    e.reviewerRevision = null;
    e.approverRevision = null;
    e.approver = null;
    e.observedEvidence = action === "review";
    e.evidence =
      action === "review"
        ? [
            {
              label: "Fictional field observation fixture",
              observedAt: "2026-10-04T00:00:00.000Z",
              areaId: "bangkok-demo-zone",
              impact:
                "Homes inundated and essential access cut in synthetic fixture",
              synthetic: true,
            },
          ]
        : [];
    e.status = action === "review" ? "review" : "watching";
    return;
  }
  if (!e.observedEvidence) throw Error("Observed impact evidence required");
  const reviewerRevision =
    action === "approve-reviewer" ? e.revision : e.reviewerRevision;
  const approverRevision =
    action === "approve-reviewer" ? e.approverRevision : e.revision;
  if (
    reviewerRevision === e.revision &&
    approverRevision === e.revision &&
    balance < e.budgetLamports - e.paidLamports
  ) {
    throw Error("Insufficient uncommitted reserve");
  }
  e.reviewerRevision = reviewerRevision;
  e.approverRevision = approverRevision;
  if (action !== "approve-reviewer")
    e.approver = action === "approve-primary" ? "primary" : "backup";
  if (reviewerRevision === e.revision && approverRevision === e.revision)
    e.status = "active";
}
export function reviewClaim(s: State, id: string, approved: boolean) {
  const h = s.households.find((p) => p.id === id);
  if (!h) throw Error("Unknown profile");
  if (h.reviewStatus !== "pending") throw Error("Review already resolved");
  if (approved) {
    if (s.event.reviewHoldLamports < GRANT)
      throw Error("Review allocation exhausted");
    h.reviewStatus = "verified";
    h.reviewAllocation = true;
    s.event.reviewHoldLamports -= GRANT;
  } else h.reviewStatus = "rejected";
}
export function prepareClaim(s: State, id: string): PaymentIntent {
  if (s.event.status !== "active") throw Error("Event not active");
  const h = s.households.find((p) => p.id === id);
  if (!h) throw Error("Unknown profile");
  if (h.areaId !== "bangkok-demo-zone") throw Error("Outside event area");
  if (h.reviewStatus !== "verified") throw Error("Human review required");
  const key = s.event.id + ":" + h.householdId;
  if (s.payments[key])
    throw Error("Household payment already reserved or paid");
  const earmarks =
    s.households.filter(
      (x) =>
        x.reviewAllocation && !s.payments[s.event.id + ":" + x.householdId],
    ).length * GRANT;
  const remaining =
    s.event.budgetLamports -
    s.event.paidLamports -
    outstanding(s) -
    s.event.reviewHoldLamports -
    (h.reviewAllocation ? earmarks - GRANT : earmarks);
  if (remaining < GRANT) throw Error("Budget or review hold exhausted");
  const earlier = s.households.filter(
    (x) =>
      x.areaId === "bangkok-demo-zone" &&
      x.reviewStatus === "verified" &&
      x.householdId !== h.householdId &&
      !s.payments[s.event.id + ":" + x.householdId] &&
      x.completedAt < h.completedAt,
  );
  if (earlier.length)
    throw Error("Earlier complete household is ahead in queue");
  const now = new Date().toISOString();
  const p: PaymentIntent = {
    key,
    profileId: id,
    householdId: h.householdId,
    amountLamports: GRANT,
    destination: h.recipientAddress,
    state: "reserved",
    createdAt: now,
    updatedAt: now,
  };
  s.payments[key] = p;
  return p;
}
export function recordSubmitted(s: State, key: string, signature: string) {
  const p = s.payments[key];
  if (!p || p.state !== "reserved") throw Error("Invalid payment intent");
  p.signature = signature;
  p.state = "submitted";
  p.updatedAt = new Date().toISOString();
}
export function recordConfirmed(s: State, key: string) {
  const p = s.payments[key];
  if (!p || !p.signature) throw Error("Missing signed payment");
  if (p.state === "confirmed") return;
  p.state = "confirmed";
  s.event.paidLamports += p.amountLamports;
  s.activity.push({
    type: "payout",
    signature: p.signature,
    amountSol: p.amountLamports / 1e9,
    at: new Date().toISOString(),
    explorer: explorer(p.signature),
  });
}
export function explorer(signature: string) {
  return (
    "https://explorer.solana.com/tx/" +
    encodeURIComponent(signature) +
    "?cluster=devnet"
  );
}
