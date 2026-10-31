const baht = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 });

export function thb(value: number): string {
  return `฿${baht.format(Math.round(value))}`;
}

export function compactThb(value: number): string {
  if (value >= 1_000_000) return `฿${(value / 1_000_000).toFixed(2)}m`;
  if (value >= 10_000) return `฿${Math.round(value / 1000)}k`;
  return thb(value);
}

export function assetAmount(value: number, asset: string): string {
  if (asset === "THB") return thb(value);
  const digits = value < 1 ? 4 : 2;
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value)} ${asset}`;
}

export function number(value: number): string {
  return decimal.format(value);
}

export function dateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function dateFull(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function dateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ago(iso: string): string {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return dateShort(iso);
}

export function shortWallet(address: string): string {
  if (address.includes("•")) return address;
  if (address.length < 12) return address;
  return `${address.slice(0, 5)}…${address.slice(-4)}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function firstName(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}

export function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((part / total) * 100)));
}

export function titleCase(value: string): string {
  return value.replace(/(^|\s)\w/g, (match) => match.toUpperCase());
}
