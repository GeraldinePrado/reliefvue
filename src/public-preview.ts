import { DEVNET_GENESIS } from "../shared/network.ts";
import { address, createSolanaRpc, signature } from "@solana/kit";
import type { PublicStatus } from "../shared/types";
const rpc = createSolanaRpc("https://api.devnet.solana.com");
export const publicTreasury = "8x5Vb5taNo74fprnBTUBd7Dr5XWZc1nRNGtub77QndEx";
const key = "reliefvue-illustrative-v2";
interface Store {
  status: "watching" | "review" | "active";
  reviewer: boolean;
  approver: "primary" | "backup" | null;
  activity: PublicStatus["activity"];
}
function read(): Store {
  try {
    const s: unknown = JSON.parse(localStorage.getItem(key) || "null");
    if (
      typeof s === "object" &&
      s !== null &&
      "status" in s &&
      ["watching", "review", "active"].includes(String(s.status)) &&
      "activity" in s &&
      Array.isArray(s.activity)
    )
      return s as Store;
  } catch {
    /* Discard corrupt browser demo state. */
  }
  return { status: "watching", reviewer: false, approver: null, activity: [] };
}
export async function publicRequest(
  route: string,
  body?: object,
): Promise<unknown> {
  const state = read();
  if (route === "status") {
    let balanceSol: number | null = null;
    let rpcError: string | undefined;
    try {
      balanceSol =
        Number(
          (
            await rpc
              .getBalance(address(publicTreasury), { commitment: "confirmed" })
              .send({ abortSignal: AbortSignal.timeout(10_000) })
          ).value,
        ) / 1e9;
    } catch (error) {
      rpcError = error instanceof Error ? error.message : "Devnet unavailable";
    }
    const result: PublicStatus = {
      event: {
        id: "fictional-khlong-sai-flood",
        name: "Fictional Khlong Sai flood",
        area: "Khlong Sai · fictional Bangkok subdistrict",
        status: state.status,
        active: state.status === "active",
        amountSol: 0.01,
        budgetSol: 0.05,
        reviewHoldSol: 0.01,
        paidSol: 0,
        readyRemainingSol: 0.04,
        approvals: { reviewer: state.reviewer, approver: state.approver },
      },
      treasury: publicTreasury,
      balanceSol,
      claims: {},
      activity: state.activity,
      backendMode: "public-preview",
      aiAvailable: false,
      ...(rpcError ? { rpcError } : {}),
    };
    return result;
  }
  if (route === "event" && body && "action" in body) {
    const action = body.action;
    if (action === "watch") {
      state.status = "watching";
      state.reviewer = false;
      state.approver = null;
    } else if (action === "review") {
      state.status = "review";
      state.reviewer = false;
      state.approver = null;
    } else {
      if (state.status === "watching")
        throw new Error("Review observed flooding evidence first.");
      if (action === "approve-reviewer") state.reviewer = true;
      else if (action === "approve-primary") state.approver = "primary";
      else if (action === "approve-backup") state.approver = "backup";
      else throw new Error("Unknown preview action.");
      if (state.reviewer && state.approver) state.status = "active";
    }
    localStorage.setItem(key, JSON.stringify(state));
    return { illustrative: true };
  }
  if (
    route === "donation" &&
    body &&
    "signature" in body &&
    typeof body.signature === "string"
  ) {
    if (
      (await rpc
        .getGenesisHash()
        .send({ abortSignal: AbortSignal.timeout(10_000) })) !== DEVNET_GENESIS
    )
      throw new Error("RPC network is not Devnet.");
    const tx = await rpc
      .getTransaction(signature(body.signature), {
        commitment: "confirmed",
        encoding: "jsonParsed",
        maxSupportedTransactionVersion: 0,
      })
      .send({ abortSignal: AbortSignal.timeout(10_000) });
    if (!tx || !tx.meta || tx.meta.err)
      throw new Error(
        "Donation has not been confirmed. Retry verification with this signature; do not resend.",
      );
    let lamports = 0;
    for (const ix of tx.transaction.message.instructions) {
      if (
        "parsed" in ix &&
        ix.programId === "11111111111111111111111111111111"
      ) {
        const parsed: unknown = ix.parsed;
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          "type" in parsed &&
          parsed.type === "transfer" &&
          "info" in parsed
        ) {
          const info: unknown = parsed.info;
          if (
            typeof info === "object" &&
            info !== null &&
            "destination" in info &&
            info.destination === publicTreasury &&
            "lamports" in info
          ) {
            const amount = Number(info.lamports);
            if (Number.isSafeInteger(amount) && amount > 0) lamports += amount;
          }
        }
      }
    }
    if (!Number.isSafeInteger(lamports) || lamports <= 0)
      throw new Error(
        "No confirmed system transfer to the demo treasury found.",
      );
    const explorer = `https://explorer.solana.com/tx/${encodeURIComponent(body.signature)}?cluster=devnet`;
    if (!state.activity.some((a) => a.signature === body.signature)) {
      state.activity.unshift({
        type: "donation",
        signature: body.signature,
        amountSol: lamports / 1e9,
        at: new Date().toISOString(),
        explorer,
      });
      localStorage.setItem(key, JSON.stringify(state));
    }
    return { signature: body.signature, explorer };
  }
  throw new Error(
    "This public preview has no live payouts, private profiles, or staff service.",
  );
}
