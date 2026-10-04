import { DEVNET_GENESIS } from "../shared/network.ts";
import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import {
  address,
  appendTransactionMessageInstruction,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createTransactionMessage,
  generateKeyPairSigner,
  getBase64EncodedWireTransaction,
  getSignatureFromTransaction,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  signature,
  writeKeyPairSigner,
  type KeyPairSigner,
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";

const SYSTEM_PROGRAM = "11111111111111111111111111111111";

export function validateDevnetUrl(value?: string): string {
  const url = new URL(value || "https://api.devnet.solana.com");
  if (
    url.protocol !== "https:" ||
    url.hostname !== "api.devnet.solana.com" ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "This demonstration permits only the official Devnet RPC URL.",
    );
  }
  return url.origin;
}

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
function safeLamports(value: unknown): number {
  const amount = typeof value === "bigint" ? Number(value) : value;
  if (
    typeof amount !== "number" ||
    !Number.isSafeInteger(amount) ||
    amount <= 0
  )
    throw new Error("Invalid transfer amount.");
  return amount;
}

/** Accept only a confirmed successful parsed receipt fetched from the RPC, never caller JSON. */
export function verifiedDonationLamports(
  value: unknown,
  treasury: string,
): number {
  const receipt = record(value);
  if (!receipt.meta || record(receipt.meta).err !== null)
    throw new Error("The transaction is missing or failed on Devnet.");
  const message = record(record(receipt.transaction).message);
  if (!Array.isArray(message.instructions))
    throw new Error("The transaction has no parsed instructions.");
  let total = 0;
  for (const raw of message.instructions) {
    const instruction = record(raw);
    const parsed = record(instruction.parsed);
    const info = record(parsed.info);
    if (
      instruction.programId === SYSTEM_PROGRAM &&
      parsed.type === "transfer" &&
      info.destination === treasury
    ) {
      total += safeLamports(info.lamports);
      if (!Number.isSafeInteger(total))
        throw new Error("Transfer sum exceeds safe bounds.");
    }
  }
  if (total <= 0)
    throw new Error("The receipt did not fund this demo reserve.");
  return total;
}

async function loadSigner(file: string): Promise<KeyPairSigner> {
  try {
    await stat(file);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const signer = await generateKeyPairSigner(true);
    await writeKeyPairSigner(signer, file);
    return signer;
  }
  const bytes: unknown = JSON.parse(await readFile(file, "utf8"));
  if (
    !Array.isArray(bytes) ||
    bytes.length !== 64 ||
    bytes.some((v) => !Number.isInteger(v) || v < 0 || v > 255)
  ) {
    throw new Error(
      "Invalid local Devnet key file. Do not overwrite it; restore its backup.",
    );
  }
  return createKeyPairSignerFromBytes(Uint8Array.from(bytes));
}

export async function createSolanaTransport(dataDirectory: string) {
  const keys = path.join(dataDirectory, "keys");
  await mkdir(keys, { recursive: true, mode: 0o700 });
  const treasury = await loadSigner(path.join(keys, "treasury.json"));
  const donor = await loadSigner(path.join(keys, "donor.json"));
  const recipientAddresses: Record<string, string> = {};
  for (const [profileId, walletName] of Object.entries({
    "unit-a": "room-a",
    "duplicate-a": "room-a",
    "room-b": "room-b",
    "outside-area": "outside-area",
    "pending-room": "pending-room",
  })) {
    recipientAddresses[profileId] = (
      await loadSigner(path.join(keys, `${walletName}.json`))
    ).address;
  }
  const rpc = createSolanaRpc(validateDevnetUrl(process.env.RELIEFVUE_RPC_URL));
  let checkedAt = 0;
  async function assertDevnet() {
    if (Date.now() - checkedAt < 30_000) return;
    const genesis = await rpc
      .getGenesisHash()
      .send({ abortSignal: AbortSignal.timeout(10_000) });
    if (genesis !== DEVNET_GENESIS)
      throw new Error("RPC is not Solana Devnet; payment blocked.");
    checkedAt = Date.now();
  }

  return {
    treasuryAddress: treasury.address,
    donorAddress: donor.address,
    recipientAddresses,
    async balance(wallet: string): Promise<number> {
      await assertDevnet();
      const result = await rpc
        .getBalance(address(wallet), { commitment: "confirmed" })
        .send({ abortSignal: AbortSignal.timeout(10_000) });
      const amount = Number(result.value);
      if (!Number.isSafeInteger(amount))
        throw new Error("Balance exceeds supported demo bounds.");
      return amount;
    },
    async prepareTransfer(
      fromRole: "treasury" | "donor",
      recipient: string,
      amount: number,
    ) {
      const lamports = safeLamports(amount);
      if (lamports > 100_000_000)
        throw new Error("Demo transfer exceeds 0.1 test SOL.");
      await assertDevnet();
      const signer = fromRole === "treasury" ? treasury : donor;
      const currentBalance = await rpc
        .getBalance(signer.address, { commitment: "confirmed" })
        .send({ abortSignal: AbortSignal.timeout(10_000) });
      if (currentBalance.value < BigInt(lamports + 10_000))
        throw new Error("Insufficient test SOL including network fees.");
      const { value: lifetime } = await rpc
        .getLatestBlockhash({ commitment: "confirmed" })
        .send({ abortSignal: AbortSignal.timeout(10_000) });
      const message = pipe(
        createTransactionMessage({ version: 0 }),
        (tx) => setTransactionMessageFeePayerSigner(signer, tx),
        (tx) => setTransactionMessageLifetimeUsingBlockhash(lifetime, tx),
        (tx) =>
          appendTransactionMessageInstruction(
            getTransferSolInstruction({
              source: signer,
              destination: address(recipient),
              amount: BigInt(lamports),
            }),
            tx,
          ),
      );
      const transaction = await signTransactionMessageWithSigners(message);
      const transactionSignature = getSignatureFromTransaction(transaction);
      const wire = getBase64EncodedWireTransaction(transaction);
      return {
        signature: transactionSignature,
        async send() {
          await assertDevnet();
          const returned = await rpc
            .sendTransaction(wire, {
              encoding: "base64",
              preflightCommitment: "confirmed",
              maxRetries: 2n,
            })
            .send({ abortSignal: AbortSignal.timeout(15_000) });
          if (returned !== transactionSignature)
            throw new Error(
              "RPC returned an unexpected signature; human review required.",
            );
        },
        async confirm() {
          for (let attempt = 0; attempt < 20; attempt++) {
            const { value } = await rpc
              .getSignatureStatuses([transactionSignature], {
                searchTransactionHistory: true,
              })
              .send({ abortSignal: AbortSignal.timeout(10_000) });
            const status = value[0];
            if (status?.err)
              throw new Error(
                "Submitted transaction failed; human review required.",
              );
            if (
              status?.confirmationStatus === "confirmed" ||
              status?.confirmationStatus === "finalized"
            )
              return;
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
          throw new Error(
            "Confirmation is uncertain; do not submit another payout. Check the recorded signature.",
          );
        },
      };
    },
    async verifyDonation(transactionSignature: string): Promise<number> {
      await assertDevnet();
      const receipt = await rpc
        .getTransaction(signature(transactionSignature), {
          encoding: "jsonParsed",
          commitment: "confirmed",
          maxSupportedTransactionVersion: 0,
        })
        .send({ abortSignal: AbortSignal.timeout(10_000) });
      return verifiedDonationLamports(receipt, treasury.address);
    },
  };
}
