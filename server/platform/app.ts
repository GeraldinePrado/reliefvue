import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { DatabaseSync } from "node:sqlite";
import { PROVINCES, type ReviewDecision, type StaffRole } from "../../shared/platform.ts";
import { config } from "./config.ts";
import { resetDatabase } from "./db.ts";
import {
  HttpError,
  assert,
  clearSessionCookie,
  parseCookies,
  readJson,
  sendEmpty,
  sendJson,
  sessionCookie,
} from "./http.ts";
import { handleMcp, MCP_TOOLS, MCP_PROTOCOL_VERSION, type JsonRpcRequest } from "./mcp.ts";
import {
  allDonations,
  applicationById,
  authenticateApiKey,
  closeActivation,
  coverageFor,
  createActivation,
  createApiKey,
  createApplication,
  createDonation,
  createSession,
  demoPersonas,
  destroySession,
  forceLogin,
  getHousehold,
  getOrg,
  getSessionUser,
  ledgerSummary,
  listActivations,
  listApiKeys,
  listApplications,
  listPayouts,
  overview,
  partnerActivations,
  partnerCoverage,
  partnerSnapshot,
  recipientHome,
  requestCashout,
  requestOtp,
  revokeApiKey,
  reviewApplication,
  saveHousehold,
  signPayout,
  staffByEmail,
  staffForRole,
  staffLogin,
  verifyOtp,
} from "./service.ts";

const COOKIE = "rv_platform_session";

interface Context {
  req: IncomingMessage;
  res: ServerResponse;
  url: URL;
  user: ReturnType<typeof getSessionUser>;
  token: string | undefined;
  body: Record<string, unknown>;
}

type Handler = (context: Context) => unknown | Promise<unknown>;

function methodIs(req: IncomingMessage, method: string): boolean {
  return (req.method ?? "GET").toUpperCase() === method;
}

export function createPlatformServer(db: DatabaseSync): Server {
  return createServer((req, res) => {
    void route(db, req, res).catch((error: unknown) => {
      if (res.headersSent) {
        res.end();
        return;
      }
      if (error instanceof HttpError) {
        sendJson(res, error.status, { error: error.message, code: error.code });
        return;
      }
      console.error("[platform] unhandled error", error);
      sendJson(res, 500, { error: "Something went wrong on the server.", code: "internal_error" });
    });
  });
}

async function route(db: DatabaseSync, req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? "/", "http://localhost");
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const method = (req.method ?? "GET").toUpperCase();

  res.setHeader("x-content-type-options", "nosniff");
  res.setHeader("referrer-policy", "same-origin");

  if (path.startsWith("/api/v1/")) {
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("access-control-allow-headers", "authorization, content-type, mcp-protocol-version, mcp-session-id");
    res.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
    res.setHeader("access-control-expose-headers", "mcp-session-id");
    if (method === "OPTIONS") {
      sendEmpty(res, 204);
      return;
    }
  }

  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[COOKIE];
  const user = getSessionUser(db, token);
  const body = method === "POST" || method === "PATCH" || method === "PUT" ? await readJson(req) : {};
  const context: Context = { req, res, url, user, token, body };

  const requirement = (): NonNullable<Context["user"]> => {
    assert(user, 401, "Sign in to continue.", "unauthorized");
    return user!;
  };
  const staff = (roles?: StaffRole[]): NonNullable<Context["user"]> => {
    const current = requirement();
    assert(current.role !== "recipient", 403, "This area is for staff accounts.", "forbidden");
    if (roles) assert(roles.includes(current.role as StaffRole), 403, "Your role cannot perform this action.", "forbidden");
    return current;
  };
  const partnerOrg = () => {
    const header = req.headers.authorization;
    const raw = header?.startsWith("Bearer ") ? header.slice(7).trim() : String(req.headers["x-api-key"] ?? "");
    assert(raw.length > 0, 401, "A partner API key is required.", "unauthorized");
    return authenticateApiKey(db, raw);
  };

  const setSession = (value: string): void => {
    const secure = req.headers["x-forwarded-proto"] === "https";
    res.setHeader("set-cookie", sessionCookie(value, config.sessionTtlDays * 86_400, secure));
  };

  /* ------------------------------------------------------------ meta */

  if (method === "GET" && path === "/api/health") {
    sendJson(res, 200, { ok: true, mode: config.demoMode ? "demo" : "live", at: new Date().toISOString() });
    return;
  }
  if (method === "GET" && path === "/api/meta") {
    sendJson(res, 200, {
      organisation: getOrg(db),
      provinces: PROVINCES,
      demoMode: config.demoMode,
      rates: { solThb: config.solThb, usdcThb: config.usdcThb, note: "Indicative demonstration rates." },
      approvalThreshold: getOrg(db).approvalThreshold,
      mcp: { protocolVersion: MCP_PROTOCOL_VERSION, endpoint: "/api/v1/mcp", tools: MCP_TOOLS.map((tool) => tool.name) },
    });
    return;
  }
  if (method === "GET" && path === "/api/me") {
    if (!user) {
      sendJson(res, 200, { user: null, org: getOrg(db), household: null, demoMode: config.demoMode });
      return;
    }
    sendJson(res, 200, {
      user,
      org: getOrg(db),
      household: user.role === "recipient" ? getHousehold(db, user) : null,
      demoMode: config.demoMode,
    });
    return;
  }

  /* ------------------------------------------------------------ auth */

  if (method === "GET" && path === "/api/auth/personas") {
    const recipients = db
      .prepare(
        `SELECT u.id, u.name, u.phone, h.kyc_status FROM users u JOIN households h ON h.user_id = u.id
         WHERE u.role = 'recipient' ORDER BY u.phone LIMIT 4`,
      )
      .all() as unknown as Array<{ id: string; name: string; phone: string; kyc_status: string }>;
    sendJson(res, 200, {
      demoMode: config.demoMode,
      passwordHint: config.demoMode ? "reliefvue-demo" : null,
      staff: demoPersonas(db),
      recipients,
    });
    return;
  }
  if (method === "POST" && path === "/api/auth/staff/login") {
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");
    assert(email.length > 0 && password.length > 0, 400, "Enter your email and password.", "missing_field");
    const signedIn = staffLogin(db, email, password);
    const value = createSession(db, signedIn.id);
    setSession(value);
    sendJson(res, 200, { user: signedIn });
    return;
  }
  if (method === "POST" && path === "/api/auth/otp/request") {
    sendJson(res, 200, requestOtp(db, String(body.phone ?? "")));
    return;
  }
  if (method === "POST" && path === "/api/auth/otp/verify") {
    const result = verifyOtp(db, String(body.phone ?? ""), String(body.code ?? ""));
    setSession(result.token);
    sendJson(res, 200, { user: result.user, household: result.user.role === "recipient" ? getHousehold(db, result.user) : null });
    return;
  }
  if (method === "POST" && path === "/api/auth/demo") {
    assert(config.demoMode, 404, "Demo sign in is disabled.", "not_found");
    const role = String(body.role ?? "");
    const userId = String(body.userId ?? "");
    let result: { user: NonNullable<Context["user"]>; token: string };
    if (userId) {
      result = forceLogin(db, userId);
    } else {
      assert(["admin", "reviewer", "approver", "recipient"].includes(role), 400, "Choose a demo role.", "invalid_field");
      if (role === "recipient") {
        const row = db.prepare("SELECT id FROM users WHERE role='recipient' ORDER BY phone LIMIT 1").get() as
          | { id: string }
          | undefined;
        assert(row, 404, "No demo recipient exists.", "not_found");
        result = forceLogin(db, row!.id);
      } else {
        const signedIn = staffForRole(db, role as StaffRole);
        result = { user: signedIn, token: createSession(db, signedIn.id) };
      }
    }
    setSession(result.token);
    sendJson(res, 200, {
      user: result.user,
      household: result.user.role === "recipient" ? getHousehold(db, result.user) : null,
    });
    return;
  }
  if (method === "POST" && path === "/api/auth/logout") {
    destroySession(db, token);
    res.setHeader("set-cookie", clearSessionCookie());
    sendJson(res, 200, { ok: true });
    return;
  }

  /* -------------------------------------------------------- recipient */

  if (method === "GET" && path === "/api/recipient/home") {
    const current = requirement();
    assert(current.role === "recipient", 403, "Recipient area.", "forbidden");
    sendJson(res, 200, recipientHome(db, current));
    return;
  }
  if (method === "POST" && path === "/api/recipient/profile") {
    const current = requirement();
    assert(current.role === "recipient", 403, "Recipient area.", "forbidden");
    const household = saveHousehold(db, current, body);
    sendJson(res, 200, { household, home: recipientHome(db, current) });
    return;
  }
  if (method === "POST" && path === "/api/recipient/applications") {
    const current = requirement();
    const application = createApplication(db, current, body);
    sendJson(res, 201, { application, home: recipientHome(db, current) });
    return;
  }
  const cashoutMatch = path.match(/^\/api\/recipient\/payouts\/([^/]+)\/cashout$/);
  if (method === "POST" && cashoutMatch) {
    const current = requirement();
    const payout = requestCashout(db, current, decodeURIComponent(cashoutMatch[1]), String(body.method ?? "") as "promptpay" | "wallet");
    sendJson(res, 200, { payout, home: recipientHome(db, current) });
    return;
  }

  /* ------------------------------------------------------------ staff */

  if (method === "GET" && path === "/api/staff/overview") {
    const current = staff();
    sendJson(res, 200, overview(db, current.orgId));
    return;
  }
  if (method === "GET" && path === "/api/staff/applications") {
    const current = staff();
    const status = url.searchParams.get("status") ?? undefined;
    sendJson(res, 200, { applications: listApplications(db, current.orgId, status), org: getOrg(db) });
    return;
  }
  const applicationMatch = path.match(/^\/api\/staff\/applications\/([^/]+)$/);
  if (method === "GET" && applicationMatch) {
    const current = staff();
    sendJson(res, 200, applicationById(db, current.orgId, decodeURIComponent(applicationMatch[1])));
    return;
  }
  const reviewMatch = path.match(/^\/api\/staff\/applications\/([^/]+)\/review$/);
  if (method === "POST" && reviewMatch) {
    const current = staff(["reviewer", "admin"]);
    const decision = String(body.decision ?? "") as ReviewDecision;
    assert(["approve", "reject", "needs_info"].includes(decision), 400, "Choose approve, reject or request information.", "invalid_field");
    const application = reviewApplication(db, current, decodeURIComponent(reviewMatch[1]), decision, String(body.reason ?? ""));
    sendJson(res, 200, { application });
    return;
  }
  if (method === "GET" && path === "/api/staff/activations") {
    const current = staff();
    sendJson(res, 200, { activations: listActivations(db, current.orgId) });
    return;
  }
  if (method === "POST" && path === "/api/staff/activations") {
    const current = staff(["admin"]);
    sendJson(res, 201, { activation: createActivation(db, current, body) });
    return;
  }
  const closeMatch = path.match(/^\/api\/staff\/activations\/([^/]+)\/close$/);
  if (method === "POST" && closeMatch) {
    const current = staff(["admin"]);
    sendJson(res, 200, { activation: closeActivation(db, current, decodeURIComponent(closeMatch[1])) });
    return;
  }
  const coverageMatch = path.match(/^\/api\/staff\/activations\/([^/]+)\/coverage$/);
  if (method === "GET" && coverageMatch) {
    const current = staff();
    sendJson(res, 200, { coverage: coverageFor(db, current.orgId, decodeURIComponent(coverageMatch[1])) });
    return;
  }
  if (method === "GET" && path === "/api/staff/payouts") {
    const current = staff();
    sendJson(res, 200, { payouts: listPayouts(db, current.orgId, url.searchParams.get("status") ?? undefined) });
    return;
  }
  const signMatch = path.match(/^\/api\/staff\/payouts\/([^/]+)\/sign$/);
  if (method === "POST" && signMatch) {
    const current = staff(["approver", "admin"]);
    sendJson(res, 200, { payout: signPayout(db, current, decodeURIComponent(signMatch[1])) });
    return;
  }
  if (method === "GET" && path === "/api/staff/donations") {
    const current = staff();
    sendJson(res, 200, { donations: allDonations(db, current.orgId), ledger: ledgerSummary(db, current.orgId) });
    return;
  }
  if (method === "GET" && path === "/api/staff/partners") {
    const current = staff();
    sendJson(res, 200, {
      snapshot: partnerSnapshot(db, current.orgId),
      keys: listApiKeys(db, current.orgId),
      tools: MCP_TOOLS,
      protocolVersion: MCP_PROTOCOL_VERSION,
      endpoints: [
        "GET /api/v1/partner/overview",
        "GET /api/v1/partner/activations",
        "GET /api/v1/partner/activations/:id/coverage",
        "GET /api/v1/partner/ledger",
        "POST /api/v1/mcp",
      ],
    });
    return;
  }
  if (method === "POST" && path === "/api/staff/api-keys") {
    const current = staff(["admin"]);
    const created = createApiKey(db, current, String(body.name ?? ""));
    sendJson(res, 201, created);
    return;
  }
  const revokeMatch = path.match(/^\/api\/staff\/api-keys\/([^/]+)\/revoke$/);
  if (method === "POST" && revokeMatch) {
    const current = staff(["admin"]);
    revokeApiKey(db, current, decodeURIComponent(revokeMatch[1]));
    sendJson(res, 200, { ok: true });
    return;
  }
  if (method === "POST" && path === "/api/staff/demo/reset") {
    const current = staff(["admin"]);
    void current;
    resetDatabase(db);
    res.setHeader("set-cookie", clearSessionCookie());
    sendJson(res, 200, { ok: true, reset: true });
    return;
  }

  /* ----------------------------------------------------------- public */

  if (method === "GET" && path === "/api/public/ledger") {
    sendJson(res, 200, ledgerSummary(db, getOrg(db).id));
    return;
  }
  if (method === "POST" && path === "/api/donations") {
    sendJson(res, 201, { receipt: createDonation(db, body) });
    return;
  }

  /* ---------------------------------------------------- partner API v1 */

  if (method === "GET" && path === "/api/v1") {
    sendJson(res, 200, {
      name: "ReliefVue partner API",
      version: "1.0",
      auth: "Bearer partner key",
      mcp: "/api/v1/mcp",
      endpoints: [
        "/api/v1/partner/overview",
        "/api/v1/partner/activations",
        "/api/v1/partner/activations/:id/coverage",
        "/api/v1/partner/ledger",
      ],
    });
    return;
  }
  if (method === "GET" && path === "/api/v1/mcp") {
    const org = partnerOrg();
    sendJson(res, 200, {
      protocolVersion: MCP_PROTOCOL_VERSION,
      transport: "streamable-http (stateless, JSON responses)",
      organisation: org.name,
      tools: MCP_TOOLS,
      note: "POST JSON-RPC 2.0 requests to this endpoint with the same bearer key.",
    });
    return;
  }
  if (method === "POST" && path === "/api/v1/mcp") {
    const org = partnerOrg();
    const raw = body as JsonRpcRequest;
    const result = handleMcp(db, org.id, raw);
    if (raw.id === undefined || raw.id === null) {
      sendEmpty(res, 202);
      return;
    }
    sendJson(res, 200, result);
    return;
  }
  if (method === "GET" && path === "/api/v1/partner/overview") {
    const org = partnerOrg();
    sendJson(res, 200, partnerSnapshot(db, org.id));
    return;
  }
  if (method === "GET" && path === "/api/v1/partner/activations") {
    const org = partnerOrg();
    sendJson(res, 200, { activations: partnerActivations(db, org.id) });
    return;
  }
  const partnerCoverageMatch = path.match(/^\/api\/v1\/partner\/activations\/([^/]+)\/coverage$/);
  if (method === "GET" && partnerCoverageMatch) {
    const org = partnerOrg();
    sendJson(res, 200, partnerCoverage(db, org.id, decodeURIComponent(partnerCoverageMatch[1])));
    return;
  }
  if (method === "GET" && path === "/api/v1/partner/ledger") {
    const org = partnerOrg();
    sendJson(res, 200, ledgerSummary(db, org.id));
    return;
  }

  /* ------------------------------------------------------------- 404 */

  if (path.startsWith("/api/")) {
    throw new HttpError(404, "API route not found.", "not_found");
  }
  throw new HttpError(404, "Not found.", "not_found");
}

export type { Handler };
export { methodIs, staffByEmail };
