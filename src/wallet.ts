import { DEVNET_GENESIS } from "../shared/network.ts";
import {
  address,
  appendTransactionMessageInstruction,
  compileTransaction,
  createNoopSigner,
  createSolanaRpc,
  createTransactionMessage,
  getBase58Decoder,
  getTransactionEncoder,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";
import { getWallets } from "@wallet-standard/app";
import {
  StandardConnect,
  type StandardConnectFeature,
} from "@wallet-standard/features";
import {
  SolanaSignAndSendTransaction,
  type SolanaSignAndSendTransactionFeature,
} from "@solana/wallet-standard-features";
import type { Wallet, WalletAccount } from "@wallet-standard/base";
const rpc = createSolanaRpc("https://api.devnet.solana.com");
let selected: { wallet: Wallet; account: WalletAccount } | undefined;
export function availableWallets(): readonly Wallet[] {
  return getWallets()
    .get()
    .filter(
      (w) =>
        StandardConnect in w.features &&
        SolanaSignAndSendTransaction in w.features &&
        w.chains.includes("solana:devnet"),
    );
}
export async function connectWallet(name: string): Promise<string> {
  const wallet = availableWallets().find((w) => w.name === name);
  if (!wallet)
    throw new Error(
      "Choose an installed Wallet Standard wallet that supports Devnet.",
    );
  const connect = wallet.features[
    StandardConnect
  ] as StandardConnectFeature[typeof StandardConnect];
  const result = await connect.connect();
  const account = result.accounts.find(
    (a) =>
      a.chains.includes("solana:devnet") &&
      a.features.includes(SolanaSignAndSendTransaction),
  );
  if (!account)
    throw new Error(
      "The connected account does not support signing Devnet transactions.",
    );
  selected = { wallet, account };
  return account.address;
}
export async function donate(
  treasury: string,
  amountSol: number,
  beforeSubmission: () => void = () => {},
): Promise<string> {
  if (!selected) throw new Error("Connect a Devnet wallet first.");
  if (
    !selected.wallet.accounts.some(
      (a) =>
        a.address === selected!.account.address &&
        a.chains.includes("solana:devnet") &&
        a.features.includes(SolanaSignAndSendTransaction),
    )
  ) {
    selected = undefined;
    throw new Error(
      "Wallet account changed or disconnected. Reconnect before donating.",
    );
  }
  if (
    !Number.isFinite(amountSol) ||
    amountSol < 0.001 ||
    amountSol > 0.1 ||
    !Number.isSafeInteger(amountSol * 1e9)
  )
    throw new Error("Enter 0.001 to 0.1 test SOL, with at most nine decimals.");
  if (
    (await rpc
      .getGenesisHash()
      .send({ abortSignal: AbortSignal.timeout(10_000) })) !== DEVNET_GENESIS
  )
    throw new Error("RPC network is not Devnet.");
  const { value: lifetime } = await rpc
    .getLatestBlockhash({ commitment: "confirmed" })
    .send({ abortSignal: AbortSignal.timeout(10_000) });
  const source = address(selected.account.address);
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayer(source, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(lifetime, m),
    (m) =>
      appendTransactionMessageInstruction(
        getTransferSolInstruction({
          source: createNoopSigner(source),
          destination: address(treasury),
          amount: BigInt(amountSol * 1e9),
        }),
        m,
      ),
  );
  const feature = selected.wallet.features[
    SolanaSignAndSendTransaction
  ] as SolanaSignAndSendTransactionFeature[typeof SolanaSignAndSendTransaction];
  beforeSubmission();
  const [result] = await feature.signAndSendTransaction({
    account: selected.account,
    chain: "solana:devnet",
    transaction: new Uint8Array(
      getTransactionEncoder().encode(compileTransaction(message)),
    ),
    options: { commitment: "confirmed" },
  });
  if (!result) throw new Error("Wallet returned no signature.");
  return getBase58Decoder().decode(result.signature);
}
