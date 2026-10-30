function numberFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export const config = {
  /** Indicative demo conversion rates. Never presented as a live market quote. */
  solThb: numberFromEnv("RV_SOL_THB", 5200),
  usdcThb: numberFromEnv("RV_USDC_THB", 36.5),
  /** Local-only pepper for the demo national-ID duplicate hash. */
  idSalt: process.env.RV_ID_SALT ?? "reliefvue-local-demo-salt",
  demoMode: process.env.RV_DEMO !== "0",
  /** Bind address. Managed hosts require 0.0.0.0; local use stays on loopback. */
  host: process.env.RV_HOST ?? "127.0.0.1",
  /** RV_PORT wins locally; PORT is what hosting platforms inject. */
  port: numberFromEnv("RV_PORT", numberFromEnv("PORT", 8788)),
  databaseFile: process.env.RV_DB ?? "data/platform.db",
  sessionTtlDays: 7,
  otpTtlMinutes: 10,
  approvalThreshold: 2,
  grantThbDefault: 3000,
} as const;

export function thbFor(asset: "SOL" | "USDC" | "THB", amount: number): number {
  if (asset === "SOL") return Math.round(amount * config.solThb);
  if (asset === "USDC") return Math.round(amount * config.usdcThb);
  return Math.round(amount);
}

export function assetForThb(asset: "SOL" | "USDC", thb: number): number {
  const rate = asset === "SOL" ? config.solThb : config.usdcThb;
  return Math.round((thb / rate) * 1_000_000) / 1_000_000;
}
