import { createServer, type IncomingMessage } from "node:http";
import { randomBytes, timingSafeEqual } from "node:crypto";
import type { PublicStatus, Transport, EventAction } from "../shared/types.ts";
import type { Store } from "./store.ts";
import {
  eventAction,
  reviewClaim,
  prepareClaim,
  recordSubmitted,
  recordConfirmed,
  outstanding,
  explorer,
} from "./policy.ts";
const actions = [
  "watch",
  "review",
  "approve-reviewer",
  "approve-primary",
  "approve-backup",
];
function trusted(req: IncomingMessage) {
  const host = req.headers.host;
  if (!host || !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return false;
  const origin = req.headers.origin;
  return !origin || origin === "http://" + host;
}
async function body(req: IncomingMessage): Promise<Record<string, unknown>> {
  let raw = "";
  for await (const chunk of req) {
    raw += String(chunk);
    if (Buffer.byteLength(raw) > 32768) throw Error("Request too large");
  }
  const value: unknown = JSON.parse(raw || "{}");
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw Error("Object body required");
  return value as Record<string, unknown>;
}
function shape(b: Record<string, unknown>, keys: string[]) {
  if (
    Object.keys(b).length !== keys.length ||
    Object.keys(b).some((k) => !keys.includes(k))
  )
    throw Error("Invalid request shape");
}
function str(b: Record<string, unknown>, key: string) {
  const value = b[key];
  if (typeof value !== "string" || !value || value.length > 200)
    throw Error("Invalid " + key);
  return value;
}
export function createApp({
  store,
  transport,
}: {
  store: Store;
  transport: Transport;
}) {
  const token = randomBytes(32).toString("hex");
  return createServer(async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    const reply = (status: number, value: unknown) => {
      res.statusCode = status;
      res.end(JSON.stringify(value));
    };
    try {
      if (!trusted(req))
        return reply(403, { error: "Untrusted Host or Origin" });
      const supplied = req.headers["x-reliefvue-session"];
      const authorized =
        typeof supplied === "string" &&
        supplied.length === token.length &&
        timingSafeEqual(Buffer.from(supplied), Buffer.from(token));
      const path = req.url?.split("?")[0];
      if (req.method === "GET" && path === "/api/session")
        return reply(200, { token });
      if (req.method === "GET" && path === "/api/status") {
        let balanceSol: number | null = null,
          rpcError: string | undefined;
        try {
          balanceSol =
            (await transport.balance(transport.treasuryAddress)) / 1e9;
        } catch {
          rpcError = "Devnet RPC unavailable";
        }
        const s = store.state,
          e = s.event;
        const result: PublicStatus = {
          event: {
            id: e.id,
            name: e.name,
            area: e.area,
            status: e.status,
            active: e.status === "active",
            amountSol: 0.01,
            budgetSol: e.budgetLamports / 1e9,
            reviewHoldSol: e.reviewHoldLamports / 1e9,
            paidSol: e.paidLamports / 1e9,
            readyRemainingSol:
              Math.max(
                0,
                e.budgetLamports -
                  e.paidLamports -
                  outstanding(s) -
                  e.reviewHoldLamports -
                  s.households.filter(
                    (h) =>
                      h.reviewAllocation &&
                      !s.payments[e.id + ":" + h.householdId],
                  ).length *
                    10_000_000,
              ) / 1e9,
            approvals: {
              reviewer: e.reviewerRevision === e.revision,
              approver: e.approverRevision === e.revision ? e.approver : null,
            },
          },
          treasury: transport.treasuryAddress,
          balanceSol,
          claims: authorized
            ? Object.fromEntries(
                Object.values(s.payments).map((p) => [
                  p.profileId,
                  {
                    status: p.state,
                    ...(p.signature ? { signature: p.signature } : {}),
                  },
                ]),
              )
            : {},
          activity: s.activity,
          backendMode: "local-server",
          aiAvailable: false,
          ...(rpcError ? { rpcError } : {}),
        };
        return reply(200, result);
      }
      if (!authorized) return reply(401, { error: "Local session required" });
      if (req.method === "GET" && path === "/api/profiles")
        return reply(200, {
          profiles: store.state.households.map(
            ({ id, label, home, recipientAddress, reviewStatus }) => ({
              id,
              label,
              home,
              recipientAddress,
              reviewStatus,
            }),
          ),
        });
      if (req.method !== "POST")
        return reply(404, { error: "Unknown endpoint" });
      const b = await body(req);
      const result = await store.exclusive(async () => {
        const s = store.state;
        if (path === "/api/event") {
          shape(b, ["action"]);
          const action = str(b, "action");
          if (!actions.includes(action)) throw Error("Invalid action");
          eventAction(
            s,
            action as EventAction,
            action === "watch" || action === "review"
              ? 0
              : await transport.balance(transport.treasuryAddress),
          );
          await store.save();
          return { ok: true };
        }
        if (path === "/api/review-claim") {
          shape(b, ["profileId", "approved"]);
          if (typeof b.approved !== "boolean") throw Error("Invalid approval");
          reviewClaim(s, str(b, "profileId"), b.approved);
          await store.save();
          return { ok: true };
        }
        if (path === "/api/claim") {
          shape(b, ["profileId"]);
          const id = str(b, "profileId");
          const balance = await transport.balance(transport.treasuryAddress);
          if (balance < 10_000_000) throw Error("Insufficient treasury funds");
          const p = prepareClaim(s, id);
          await store.save();
          let prepared: Awaited<ReturnType<Transport["prepareTransfer"]>>;
          try {
            prepared = await transport.prepareTransfer(
              "treasury",
              p.destination,
              p.amountLamports,
            );
          } catch (e) {
            delete s.payments[p.key];
            await store.save();
            throw e;
          }
          recordSubmitted(s, p.key, prepared.signature);
          await store.save();
          try {
            await prepared.send();
            await prepared.confirm();
            recordConfirmed(s, p.key);
            await store.save();
          } catch {
            p.state = "needs_review";
            await store.save();
            throw Error(
              "Payment confirmation uncertain; investigation required",
            );
          }
          return {
            signature: prepared.signature,
            explorer: explorer(prepared.signature),
          };
        }
        if (path === "/api/donation") {
          shape(b, ["signature"]);
          const signature = str(b, "signature");
          const existing = s.activity.find((a) => a.signature === signature);
          if (existing) {
            if (existing.type !== "donation")
              throw Error("Not a donation receipt");
            return { signature, explorer: explorer(signature) };
          }
          const amount = await transport.verifyDonation(signature);
          if (!Number.isSafeInteger(amount) || amount <= 0)
            throw Error("Invalid donation");
          if (s.donationIntents[signature])
            s.donationIntents[signature]!.state = "confirmed";
          s.activity.push({
            type: "donation",
            signature,
            amountSol: amount / 1e9,
            at: new Date().toISOString(),
            explorer: explorer(signature),
          });
          await store.save();
          return { signature, explorer: explorer(signature) };
        }
        if (path === "/api/demo-fund") {
          shape(b, ["amountSol"]);
          const amount = b.amountSol;
          if (
            Object.values(s.donationIntents).some(
              (x) => x.state !== "confirmed",
            )
          )
            throw Error("Previous donation requires investigation");
          if (
            typeof amount !== "number" ||
            !Number.isFinite(amount) ||
            amount < 0.001 ||
            amount > 0.1 ||
            !Number.isSafeInteger(amount * 1e9)
          )
            throw Error("Invalid amount");
          const p = await transport.prepareTransfer(
            "donor",
            transport.treasuryAddress,
            amount * 1e9,
          );
          s.donationIntents[p.signature] = {
            signature: p.signature,
            amountSol: amount,
            state: "submitted",
          };
          await store.save();
          try {
            await p.send();
            await p.confirm();
            s.donationIntents[p.signature]!.state = "confirmed";
            s.activity.push({
              type: "donation",
              signature: p.signature,
              amountSol: amount,
              at: new Date().toISOString(),
              explorer: explorer(p.signature),
            });
            await store.save();
          } catch {
            throw Error(
              "Donation confirmation uncertain; investigation required",
            );
          }
          return { signature: p.signature, explorer: explorer(p.signature) };
        }
        throw Error("Unknown endpoint");
      });
      reply(200, result);
    } catch (error) {
      reply(400, {
        error: error instanceof Error ? error.message : "Request failed",
      });
    }
  });
}
