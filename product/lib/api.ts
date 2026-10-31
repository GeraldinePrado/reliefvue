import type {
  Activation,
  Application,
  ApplicationDetail,
  ApiKeyRecord,
  CoverageRow,
  Donation,
  DonationReceipt,
  Household,
  LedgerSummary,
  Organisation,
  Overview,
  PartnerActivationSummary,
  Payout,
  RecipientHome,
  ReviewDecision,
  SessionUser,
} from "../../shared/platform";

const BASE = (import.meta.env.VITE_PLATFORM_API as string | undefined) ?? "/papi";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, message: string, code = "request_error") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, options: { method?: string; body?: unknown; headers?: Record<string, string> } = {}): Promise<T> {
  const { method = "GET", body, headers } = options;
  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      credentials: "same-origin",
      headers: { ...(body ? { "content-type": "application/json" } : {}), ...headers },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new ApiError(0, "The local API is not reachable. Start it with npm run dev:platform.", "network_error");
  }
  const text = await response.text();
  let payload: unknown = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }
  if (!response.ok) {
    const error = payload as { error?: string; code?: string } | null;
    throw new ApiError(response.status, error?.error ?? "The request failed.", error?.code ?? "request_error");
  }
  return payload as T;
}

export interface MeResponse {
  user: SessionUser | null;
  org: Organisation;
  household: Household | null;
  demoMode: boolean;
}

export interface MetaResponse {
  organisation: Organisation;
  provinces: Array<{ en: string; th: string; region: string }>;
  demoMode: boolean;
  rates: { solThb: number; usdcThb: number; note: string };
  approvalThreshold: number;
  mcp: { protocolVersion: string; endpoint: string; tools: string[] };
}

export interface PersonasResponse {
  demoMode: boolean;
  passwordHint: string | null;
  staff: Array<{ role: string; name: string; email: string | null; phone: string | null; userId: string }>;
  recipients: Array<{ id: string; name: string; phone: string; kyc_status: string }>;
}

export interface PartnersResponse {
  snapshot: {
    organisation: string;
    country: string;
    activations: PartnerActivationSummary[];
    coverage: CoverageRow[];
    ledger: LedgerSummary["totals"];
  };
  keys: ApiKeyRecord[];
  tools: Array<{ name: string; description: string; inputSchema: Record<string, unknown> }>;
  protocolVersion: string;
  endpoints: string[];
}

export const api = {
  me: () => request<MeResponse>("/me"),
  meta: () => request<MetaResponse>("/meta"),
  personas: () => request<PersonasResponse>("/auth/personas"),
  staffLogin: (email: string, password: string) =>
    request<{ user: SessionUser }>("/auth/staff/login", { method: "POST", body: { email, password } }),
  requestOtp: (phone: string) =>
    request<{ phone: string; devCode: string | null; expiresInMinutes: number }>("/auth/otp/request", {
      method: "POST",
      body: { phone },
    }),
  verifyOtp: (phone: string, code: string) =>
    request<{ user: SessionUser; household: Household | null }>("/auth/otp/verify", {
      method: "POST",
      body: { phone, code },
    }),
  demoLogin: (payload: { role?: string; userId?: string }) =>
    request<{ user: SessionUser; household: Household | null }>("/auth/demo", { method: "POST", body: payload }),
  logout: () => request<{ ok: boolean }>("/auth/logout", { method: "POST", body: {} }),

  recipientHome: () => request<RecipientHome>("/recipient/home"),
  saveProfile: (body: Record<string, unknown>) =>
    request<{ household: Household; home: RecipientHome }>("/recipient/profile", { method: "POST", body }),
  submitApplication: (body: { activationId: string; evidenceNote: string; evidenceRef: string }) =>
    request<{ application: Application; home: RecipientHome }>("/recipient/applications", { method: "POST", body }),
  cashout: (payoutId: string, method: "promptpay" | "wallet") =>
    request<{ payout: Payout; home: RecipientHome }>(`/recipient/payouts/${payoutId}/cashout`, {
      method: "POST",
      body: { method },
    }),

  overview: () => request<Overview>("/staff/overview"),
  applications: (status?: string) =>
    request<{ applications: Application[]; org: Organisation }>(`/staff/applications${status ? `?status=${status}` : ""}`),
  application: (id: string) => request<ApplicationDetail>(`/staff/applications/${id}`),
  review: (id: string, decision: ReviewDecision, reason: string) =>
    request<{ application: Application }>(`/staff/applications/${id}/review`, {
      method: "POST",
      body: { decision, reason },
    }),
  activations: () => request<{ activations: Activation[] }>("/staff/activations"),
  createActivation: (body: Record<string, unknown>) =>
    request<{ activation: Activation }>("/staff/activations", { method: "POST", body }),
  closeActivation: (id: string) =>
    request<{ activation: Activation }>(`/staff/activations/${id}/close`, { method: "POST", body: {} }),
  coverage: (id: string) => request<{ coverage: CoverageRow[] }>(`/staff/activations/${id}/coverage`),
  payouts: (status?: string) => request<{ payouts: Payout[] }>(`/staff/payouts${status ? `?status=${status}` : ""}`),
  signPayout: (id: string) => request<{ payout: Payout }>(`/staff/payouts/${id}/sign`, { method: "POST", body: {} }),
  donations: () => request<{ donations: Donation[]; ledger: LedgerSummary }>("/staff/donations"),
  partners: () => request<PartnersResponse>("/staff/partners"),
  createApiKey: (name: string) =>
    request<{ key: string; record: ApiKeyRecord }>("/staff/api-keys", { method: "POST", body: { name } }),
  revokeApiKey: (id: string) => request<{ ok: boolean }>(`/staff/api-keys/${id}/revoke`, { method: "POST", body: {} }),
  resetDemo: () => request<{ ok: boolean; reset: boolean }>("/staff/demo/reset", { method: "POST", body: {} }),

  ledger: () => request<LedgerSummary>("/public/ledger"),
  donate: (body: Record<string, unknown>) => request<{ receipt: DonationReceipt }>("/donations", { method: "POST", body }),
};

export async function callMcp(key: string, body: unknown): Promise<unknown> {
  const response = await fetch(`${BASE}/v1/mcp`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
      "mcp-protocol-version": "2025-06-18",
    },
    body: JSON.stringify(body),
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = payload as { error?: string } | null;
    throw new ApiError(response.status, error?.error ?? "MCP request failed.");
  }
  return payload;
}
