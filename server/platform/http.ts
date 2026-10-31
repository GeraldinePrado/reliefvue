import type { IncomingMessage, ServerResponse } from "node:http";

export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, message: string, code = "request_error") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function assert(condition: unknown, status: number, message: string, code = "invalid_request"): asserts condition {
  if (!condition) throw new HttpError(status, message, code);
}

export async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > 200_000) throw new HttpError(413, "Request body is too large.", "payload_too_large");
    chunks.push(buffer);
  }
  if (chunks.length === 0) return {};
  const text = Buffer.concat(chunks).toString("utf8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new HttpError(400, "Request body must be valid JSON.", "invalid_json");
  }
  assert(parsed !== null && typeof parsed === "object" && !Array.isArray(parsed), 400, "Request body must be a JSON object.");
  return parsed as Record<string, unknown>;
}

export function sendJson(res: ServerResponse, status: number, value: unknown): void {
  const body = JSON.stringify(value);
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(body);
}

export function sendEmpty(res: ServerResponse, status: number): void {
  res.statusCode = status;
  res.end();
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (name) cookies[name] = decodeURIComponent(value);
  }
  return cookies;
}

export function sessionCookie(token: string, maxAgeSeconds: number, secure: boolean): string {
  const parts = [
    `rv_platform_session=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function clearSessionCookie(): string {
  return "rv_platform_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
}

export function stringField(
  body: Record<string, unknown>,
  key: string,
  options: { min?: number; max?: number; optional?: boolean; fallback?: string } = {},
): string {
  const raw = body[key];
  if (raw === undefined || raw === null || raw === "") {
    if (options.optional) return options.fallback ?? "";
    throw new HttpError(400, `${key} is required.`, "missing_field");
  }
  assert(typeof raw === "string", 400, `${key} must be text.`, "invalid_field");
  const value = raw.trim();
  const min = options.min ?? 1;
  const max = options.max ?? 500;
  assert(value.length >= min && value.length <= max, 400, `${key} must be between ${min} and ${max} characters.`, "invalid_field");
  return value;
}

export function numberField(
  body: Record<string, unknown>,
  key: string,
  options: { min?: number; max?: number; integer?: boolean } = {},
): number {
  const raw = body[key];
  assert(typeof raw === "number" && Number.isFinite(raw), 400, `${key} must be a number.`, "invalid_field");
  const value = options.integer ? Math.round(raw) : raw;
  const min = options.min ?? Number.MIN_SAFE_INTEGER;
  const max = options.max ?? Number.MAX_SAFE_INTEGER;
  assert(value >= min && value <= max, 400, `${key} must be between ${min} and ${max}.`, "invalid_field");
  return value;
}

export function stringArray(body: Record<string, unknown>, key: string, max = 24): string[] {
  const raw = body[key];
  assert(Array.isArray(raw), 400, `${key} must be a list.`, "invalid_field");
  assert(raw.length > 0 && raw.length <= max, 400, `${key} must contain 1 to ${max} entries.`, "invalid_field");
  const values = raw.map((item) => {
    assert(typeof item === "string", 400, `${key} entries must be text.`, "invalid_field");
    const value = item.trim();
    assert(value.length > 0 && value.length <= 80, 400, `${key} entries must be 1 to 80 characters.`, "invalid_field");
    return value;
  });
  return [...new Set(values)];
}
