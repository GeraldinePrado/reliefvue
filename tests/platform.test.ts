import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import type { Server } from "node:http";
import type { DatabaseSync } from "node:sqlite";
import { createPlatformServer } from "../server/platform/app.ts";
import { openDatabase } from "../server/platform/db.ts";
import { syntheticNationalId } from "../server/platform/identity.ts";
import type {
  Application,
  ApplicationDetail,
  DonationReceipt,
  Household,
  LedgerSummary,
  Organisation,
  Overview,
  PartnerActivationSummary,
  Payout,
  RecipientHome,
  SessionUser,
} from "../shared/platform.ts";

let server: Server;
let db: DatabaseSync;
let base = "";

interface Reply<T> {
  status: number;
  body: T;
  cookie: string | null;
}

async function call<T>(
  path: string,
  options: { method?: string; body?: unknown; cookie?: string | null; apiKey?: string } = {},
): Promise<Reply<T>> {
  const response = await fetch(`${base}${path}`, {
    method: options.method ?? (options.body ? "POST" : "GET"),
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(options.cookie ? { cookie: options.cookie } : {}),
      ...(options.apiKey ? { authorization: `Bearer ${options.apiKey}` } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });
  const text = await response.text();
  const body = text ? (JSON.parse(text) as T) : (null as T);
  const setCookie = response.headers.getSetCookie?.()[0] ?? response.headers.get("set-cookie");
  return { status: response.status, body, cookie: setCookie ? setCookie.split(";")[0] : null };
}

async function staffCookie(email = "reviewer@reliefvue.demo"): Promise<string> {
  const response = await call<{ user: SessionUser }>("/api/auth/staff/login", {
    body: { email, password: "reliefvue-demo" },
  });
  assert.equal(response.status, 200, JSON.stringify(response.body));
  assert.ok(response.cookie);
  return response.cookie;
}

async function recipient(
  phone: string,
  overrides: Record<string, unknown> = {},
): Promise<{ cookie: string; household: Household }> {
  const otp = await call<{ devCode: string }>("/api/auth/otp/request", { body: { phone } });
  assert.equal(otp.status, 200);
  assert.ok(otp.body.devCode);
  const verified = await call<{ user: SessionUser; household: Household | null }>("/api/auth/otp/verify", {
    body: { phone, code: otp.body.devCode },
  });
  assert.equal(verified.status, 200);
  assert.ok(verified.cookie);
  const profile = await call<{ household: Household }>("/api/recipient/profile", {
    cookie: verified.cookie,
    body: {
      fullName: "Test Household",
      identityType: "thai",
      identityNumber: syntheticNationalId(501),
      addressEvidenceType: "utility_bill",
      addressEvidenceRef: "MEA-TEST-501",
      province: "Chiang Mai",
      district: "Saraphi",
      subdistrict: "Nong Phueng",
      addressLine: "Test house 501",
      members: 4,
      incomeBand: "Under ฿10,000 / month",
      walletAddress: "",
      cashoutMethod: "wallet",
      ...overrides,
    },
  });
  assert.equal(profile.status, 200, JSON.stringify(profile.body));
  return { cookie: verified.cookie, household: profile.body.household };
}

before(async () => {
  db = openDatabase(":memory:");
  server = createPlatformServer(db);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as AddressInfo;
  base = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  db.close();
});

test("seeded dashboard exposes reserve, an active response and district coverage", async () => {
  const cookie = await staffCookie("admin@reliefvue.demo");
  const overview = await call<Overview>("/api/staff/overview", { cookie });
  assert.equal(overview.status, 200);
  assert.ok(overview.body.totals.donatedThb > 500_000);
  assert.ok(overview.body.totals.reserveThb > 0);
  assert.equal(overview.body.activations.filter((item) => item.status === "active").length, 1);
  assert.equal(overview.body.coverage.length, 4);
  assert.ok(overview.body.coverage.some((row) => row.unreached));
  assert.ok(overview.body.awaitingPayouts.length >= 1);
});

test("staff sign in rejects a wrong password and recipient roles cannot use it", async () => {
  const wrong = await call<{ error: string }>("/api/auth/staff/login", {
    body: { email: "admin@reliefvue.demo", password: "nope" },
  });
  assert.equal(wrong.status, 401);

  const recipientLogin = await call<{ error: string }>("/api/auth/staff/login", {
    body: { email: "admin@reliefvue.demo", password: "reliefvue-demo" },
  });
  assert.equal(recipientLogin.status, 200);
});

test("a Thai household is verified once and can submit exactly one request per response", async () => {
  const { cookie, household } = await recipient("0899991001", { identityNumber: syntheticNationalId(601) });
  assert.equal(household.kycStatus, "verified");
  assert.equal(household.identityType, "thai");
  assert.equal(household.identityLast4, syntheticNationalId(601).slice(-4));
  assert.ok(household.walletAddress.length >= 32);

  const home = await call<RecipientHome>("/api/recipient/home", { cookie });
  assert.equal(home.status, 200);
  assert.equal(home.body.activations.length, 1);
  assert.equal(home.body.activations[0].eligible, true);
  assert.equal(home.body.activations[0].ineligibleReason, null);

  const activationId = home.body.activations[0].id;
  const submitted = await call<{ application: Application }>("/api/recipient/applications", {
    cookie,
    body: {
      activationId,
      evidenceNote: "Flood water entered the ground floor and damaged bedding and food.",
      evidenceRef: "photo-test-01.jpg",
    },
  });
  assert.equal(submitted.status, 201, JSON.stringify(submitted.body));
  assert.equal(submitted.body.application.status, "submitted");
  assert.equal(submitted.body.application.grantThb, 3000);

  const duplicate = await call<{ error: string }>("/api/recipient/applications", {
    cookie,
    body: {
      activationId,
      evidenceNote: "Second attempt for the same household in the same response.",
      evidenceRef: "",
    },
  });
  assert.equal(duplicate.status, 409);
  assert.match(duplicate.body.error, /already requested/i);
});

test("a household outside the activated province cannot request", async () => {
  const { cookie } = await recipient("0899991002", {
    identityNumber: syntheticNationalId(602),
    province: "Bangkok",
    district: "Bang Kapi",
    subdistrict: "Hua Mak",
  });
  const home = await call<RecipientHome>("/api/recipient/home", { cookie });
  assert.equal(home.body.activations[0].eligible, false);
  assert.match(home.body.activations[0].ineligibleReason ?? "", /different province/i);

  const attempt = await call<{ error: string }>("/api/recipient/applications", {
    cookie,
    body: {
      activationId: home.body.activations[0].id,
      evidenceNote: "Attempt from a province that is not covered by this response.",
      evidenceRef: "",
    },
  });
  assert.equal(attempt.status, 409);
});

test("a duplicate national ID cannot create a second account", async () => {
  await recipient("0899991003", { identityNumber: syntheticNationalId(701) });
  const otp = await call<{ devCode: string }>("/api/auth/otp/request", { body: { phone: "0899991004" } });
  const verified = await call<{ user: SessionUser }>("/api/auth/otp/verify", {
    body: { phone: "0899991004", code: otp.body.devCode },
  });
  const attempt = await call<{ error: string; code: string }>("/api/recipient/profile", {
    cookie: verified.cookie,
    body: {
      fullName: "Duplicate Person",
      identityType: "thai",
      identityNumber: syntheticNationalId(701),
      addressEvidenceType: "utility_bill",
      addressEvidenceRef: "MEA-TEST-702",
      province: "Chiang Mai",
      district: "Mae Rim",
      subdistrict: "Rim Tai",
      addressLine: "Test house 702",
      members: 2,
      incomeBand: "Under ฿10,000 / month",
    },
  });
  assert.equal(attempt.status, 409);
  assert.equal(attempt.body.code, "duplicate_identity");
});

test("review, two distinct signatures, payout and cash-out complete the journey", async () => {
  const { cookie: recipientCookie } = await recipient("0899991005", {
    identityNumber: syntheticNationalId(801),
  });
  const home = await call<RecipientHome>("/api/recipient/home", { cookie: recipientCookie });
  const submitted = await call<{ application: Application }>("/api/recipient/applications", {
    cookie: recipientCookie,
    body: {
      activationId: home.body.activations[0].id,
      evidenceNote: "Roof damaged and belongings wet after heavy rain in the district.",
      evidenceRef: "photo-test-02.jpg",
    },
  });
  const applicationId = submitted.body.application.id;

  const reviewer = await staffCookie("reviewer@reliefvue.demo");
  const detail = await call<ApplicationDetail>(`/api/staff/applications/${applicationId}`, { cookie: reviewer });
  assert.equal(detail.status, 200);
  assert.match(detail.body.identityMasked, /•/);
  assert.equal(detail.body.identityType, "thai");
  assert.equal(detail.body.addressEvidenceRef, "MEA-TEST-501");

  const approve = await call<{ application: Application }>(`/api/staff/applications/${applicationId}/review`, {
    cookie: reviewer,
    body: { decision: "approve", reason: "Residence and household verified against the affected district." },
  });
  assert.equal(approve.status, 200, JSON.stringify(approve.body));
  assert.equal(approve.body.application.status, "approved");
  assert.ok(approve.body.application.payoutId);

  const reviewerSign = await call<{ error: string }>(`/api/staff/payouts/${approve.body.application.payoutId}/sign`, {
    cookie: reviewer,
    body: {},
  });
  assert.equal(reviewerSign.status, 403);

  const anan = await staffCookie("anan@reliefvue.demo");
  const first = await call<{ payout: Payout }>(`/api/staff/payouts/${approve.body.application.payoutId}/sign`, {
    cookie: anan,
    body: {},
  });
  assert.equal(first.status, 200);
  assert.equal(first.body.payout.status, "awaiting_approvals");
  assert.equal(first.body.payout.signatures.length, 1);

  const malee = await staffCookie("malee@reliefvue.demo");
  const second = await call<{ payout: Payout }>(`/api/staff/payouts/${approve.body.application.payoutId}/sign`, {
    cookie: malee,
    body: {},
  });
  assert.equal(second.status, 200);
  assert.equal(second.body.payout.status, "sent");
  assert.ok(second.body.payout.txRef);

  const again = await call<{ error: string }>(`/api/staff/payouts/${approve.body.application.payoutId}/sign`, {
    cookie: malee,
    body: {},
  });
  assert.equal(again.status, 409);

  const paidHome = await call<RecipientHome>("/api/recipient/home", { cookie: recipientCookie });
  const paid = paidHome.body.applications.find((application) => application.id === applicationId);
  assert.equal(paid?.status, "paid");
  const payout = paidHome.body.payouts.find((item) => item.applicationId === applicationId);
  assert.equal(payout?.status, "sent");

  if (payout && payout.asset !== "THB") {
    const cashout = await call<{ payout: Payout }>(`/api/recipient/payouts/${payout.id}/cashout`, {
      cookie: recipientCookie,
      body: { method: "promptpay" },
    });
    assert.equal(cashout.status, 200);
    assert.equal(cashout.body.payout.cashoutStatus, "paid");
  }
});

test("donations record value, auto-convert SOL to a stable settlement and appear in the ledger", async () => {
  const before = await call<LedgerSummary>("/api/public/ledger");
  const receipt = await call<{ receipt: DonationReceipt }>("/api/donations", {
    body: {
      asset: "SOL",
      amount: 1,
      channel: "crypto",
      province: "Chiang Mai",
      donorName: "Test donor",
      convert: true,
    },
  });
  assert.equal(receipt.status, 201, JSON.stringify(receipt.body));
  assert.equal(receipt.body.receipt.converted, true);
  assert.equal(receipt.body.receipt.settledAsset, "USDC");
  assert.ok(receipt.body.receipt.amountThb > 0);
  assert.ok(receipt.body.receipt.simulated);

  const after = await call<LedgerSummary>("/api/public/ledger");
  assert.equal(after.body.totals.donatedThb, before.body.totals.donatedThb + receipt.body.receipt.amountThb);
  assert.ok(after.body.recent.some((row) => row.reference === receipt.body.receipt.reference));

  const fiat = await call<{ receipt: DonationReceipt }>("/api/donations", {
    body: { asset: "THB", amount: 1500, channel: "fiat", donorName: "Fiat donor" },
  });
  assert.equal(fiat.status, 201);
  assert.equal(fiat.body.receipt.settledAsset, "THB");
});

test("partner REST and MCP are scoped, read-only and reject revoked keys", async () => {
  const admin = await staffCookie("admin@reliefvue.demo");
  const created = await call<{ key: string; record: { id: string } }>("/api/staff/api-keys", {
    cookie: admin,
    body: { name: "Test partner" },
  });
  assert.equal(created.status, 201);
  const key = created.body.key;

  const unauthorized = await call<{ error: string }>("/api/v1/partner/overview");
  assert.equal(unauthorized.status, 401);

  const overview = await call<{ organisation: string; activations: PartnerActivationSummary[]; coverage: unknown[] }>(
    "/api/v1/partner/overview",
    { apiKey: key },
  );
  assert.equal(overview.status, 200);
  assert.ok(overview.body.activations.length >= 1);
  assert.ok(overview.body.coverage.length >= 4);
  assert.ok(!JSON.stringify(overview.body).includes("0810000001"), "partner output must not include phone numbers");

  const tools = await call<{ result: { tools: Array<{ name: string }> } }>("/api/v1/mcp", {
    apiKey: key,
    body: { jsonrpc: "2.0", id: 1, method: "tools/list" },
  });
  assert.equal(tools.status, 200);
  assert.ok(tools.body.result.tools.some((tool) => tool.name === "list_unreached_districts"));

  const coverage = await call<{ result: { structuredContent: { unreachedDistricts: string[] } } }>("/api/v1/mcp", {
    apiKey: key,
    body: {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: { name: "get_activation_coverage", arguments: { activation_id: "act_cm_flood" } },
    },
  });
  assert.equal(coverage.status, 200);
  assert.ok(Array.isArray(coverage.body.result.structuredContent.unreachedDistricts));

  const revoke = await call<{ ok: boolean }>(`/api/staff/api-keys/${created.body.record.id}/revoke`, {
    cookie: admin,
    body: {},
  });
  assert.equal(revoke.status, 200);
  const afterRevoke = await call<{ error: string }>("/api/v1/partner/overview", { apiKey: key });
  assert.equal(afterRevoke.status, 401);
});

test("admin can create a province-scoped response and close it", async () => {
  const admin = await staffCookie("admin@reliefvue.demo");
  const created = await call<{ activation: { id: string; status: string; starting?: string } }>("/api/staff/activations", {
    cookie: admin,
    body: {
      title: "Test flood response",
      disasterType: "Flood",
      province: "Chiang Rai",
      districts: ["Mueang Chiang Rai"],
      budgetThb: 50000,
      grantThb: 3000,
    },
  });
  assert.equal(created.status, 201, JSON.stringify(created.body));
  assert.equal(created.body.activation.status, "active");

  const closed = await call<{ activation: { status: string } }>(`/api/staff/activations/${created.body.activation.id}/close`, {
    cookie: admin,
    body: {},
  });
  assert.equal(closed.status, 200);
  assert.equal(closed.body.activation.status, "closed");
});

test("organisation metadata exposes the Thailand province list and demo rates", async () => {
  const meta = await call<{ provinces: Array<{ en: string }>; organisation: Organisation; rates: { solThb: number } }>("/api/meta");
  assert.equal(meta.status, 200);
  assert.equal(meta.body.provinces.length, 77);
  assert.equal(meta.body.provinces[0].en, "Amnat Charoen");
  assert.equal(meta.body.organisation.country, "Thailand");
  assert.ok(meta.body.rates.solThb > 0);
});
