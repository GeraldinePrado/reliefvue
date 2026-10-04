import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSolanaTransport } from "./solana.ts";
import { createStore } from "./store.ts";
import { createApp } from "./app.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const directory = path.join(root, "data", "v2");
const transport = await createSolanaTransport(directory);
const store = await createStore(
  path.join(directory, "state.json"),
  transport.recipientAddresses,
);
const server = createApp({ store, transport });
server.listen(8787, "127.0.0.1", () => {
  console.log("ReliefVue local Devnet demo: http://127.0.0.1:8787");
  console.log(`Demo reserve: ${transport.treasuryAddress}`);
  console.log(`Demo donor: ${transport.donorAddress}`);
  console.log(
    "Synthetic roles and server-enforced payments; no deployed reserve program.",
  );
});
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
