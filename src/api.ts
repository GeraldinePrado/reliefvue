import type { PublicStatus } from "../shared/types";
import { publicRequest } from "./public-preview";
export const publicDemo = import.meta.env.VITE_PUBLIC_DEMO === "1";
export interface Profile {
  id: string;
  label: string;
  home: string;
  recipientAddress: string;
  reviewStatus: string;
}
let session: string | undefined;
export async function api<T>(route: string, body?: object): Promise<T> {
  if (publicDemo) return (await publicRequest(route, body)) as T;
  if (!session) {
    const response = await fetch("/api/session");
    if (!response.ok) throw new Error("Local session unavailable.");
    const value: unknown = await response.json();
    if (
      typeof value !== "object" ||
      value === null ||
      !("token" in value) ||
      typeof value.token !== "string"
    )
      throw new Error("Invalid local session.");
    session = value.token;
  }
  const response = await fetch(`/api/${route}`, {
    method: body ? "POST" : "GET",
    headers: {
      "x-reliefvue-session": session!,
      ...(body ? { "content-type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result: unknown = await response.json();
  if (!response.ok)
    throw new Error(
      typeof result === "object" && result !== null && "error" in result
        ? String(result.error)
        : "Request failed.",
    );
  return result as T;
}
export const getStatus = () => api<PublicStatus>("status");
