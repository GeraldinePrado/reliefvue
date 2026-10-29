import { createHash, randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/** Encode random bytes as a base58 string. Used for demo wallet addresses and references. */
export function base58(bytes: Uint8Array = randomBytes(32)): string {
  if (bytes.length === 0) return "";
  let value = 0n;
  for (const byte of bytes) value = (value << 8n) | BigInt(byte);
  let output = "";
  while (value > 0n) {
    output = BASE58[Number(value % 58n)] + output;
    value /= 58n;
  }
  for (const byte of bytes) {
    if (byte !== 0) break;
    output = "1" + output;
  }
  return output;
}

/** A Solana address is 32 bytes encoded in base58, normally 43-44 characters. */
export function walletAddress(): string {
  return base58(randomBytes(32));
}

export function newId(prefix: string): string {
  return `${prefix}_${base58(randomBytes(9))}`;
}

/** Thai national identification number checksum (13 digits). */
export function isValidThaiNationalId(value: string): boolean {
  const digits = value.replace(/[\s-]/g, "");
  if (!/^\d{13}$/.test(digits)) return false;
  const nums = [...digits].map(Number);
  let sum = 0;
  for (let index = 0; index < 12; index += 1) sum += nums[index] * (13 - index);
  const check = (11 - (sum % 11)) % 10;
  return check === nums[12];
}

/** Build a checksum-valid synthetic ID for demo fixtures. Not a real person's number. */
export function syntheticNationalId(seed: number): string {
  const body = `1101700${String(seed).padStart(5, "0")}`.slice(0, 12);
  const digits = [...body].map(Number);
  let sum = 0;
  for (let index = 0; index < 12; index += 1) sum += digits[index] * (13 - index);
  const check = (11 - (sum % 11)) % 10;
  return `${body}${check}`;
}

export function maskNationalId(last4: string): string {
  return `•••••••••${last4}`;
}

export function hashNationalId(value: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${value.replace(/[\s-]/g, "")}`).digest("hex");
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const actual = scryptSync(password, salt, 32);
  const target = Buffer.from(expected, "hex");
  return actual.length === target.length && timingSafeEqual(actual, target);
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function otpCode(): string {
  return String(randomInt(100000, 1000000));
}

export function maskedPhone(phone: string): string {
  if (phone.length < 4) return "••••";
  return `${phone.slice(0, 3)}•••${phone.slice(-3)}`;
}

export function maskWallet(address: string): string {
  if (address.length < 8) return address;
  return `${address.slice(0, 5)}…${address.slice(-4)}`;
}
