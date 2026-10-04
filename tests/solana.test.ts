import assert from "node:assert/strict";
import { test } from "node:test";
import {
  verifiedDonationLamports,
  validateDevnetUrl,
} from "../server/solana.ts";

const treasury = "11111111111111111111111111111111";
const transfer = (destination: string, lamports: number) => ({
  programId: "11111111111111111111111111111111",
  program: "system",
  parsed: { type: "transfer", info: { destination, lamports } },
});
const receipt = (instructions: unknown[], err: unknown = null) => ({
  meta: { err },
  transaction: { message: { instructions } },
});

test("verified donation adds only genuine System Program transfers to the exact treasury", () => {
  assert.equal(
    verifiedDonationLamports(
      receipt([
        transfer(treasury, 100),
        transfer("other", 9),
        transfer(treasury, 20),
      ]),
      treasury,
    ),
    120,
  );
});
test("forged program name, failed receipt, missing receipt, unsafe amount cannot count", () => {
  assert.throws(() =>
    verifiedDonationLamports(
      receipt([{ ...transfer(treasury, 100), programId: "forged" }]),
      treasury,
    ),
  );
  assert.throws(() =>
    verifiedDonationLamports(
      receipt([transfer(treasury, 100)], { failure: true }),
      treasury,
    ),
  );
  assert.throws(() => verifiedDonationLamports(null, treasury));
  assert.throws(() =>
    verifiedDonationLamports(
      receipt([transfer(treasury, Number.MAX_SAFE_INTEGER + 1)]),
      treasury,
    ),
  );
});
test("Devnet URL validation rejects mainnet, credentials, and unrelated RPCs", () => {
  assert.equal(validateDevnetUrl(undefined), "https://api.devnet.solana.com");
  assert.throws(() => validateDevnetUrl("https://api.mainnet-beta.solana.com"));
  assert.throws(() =>
    validateDevnetUrl("https://user:password@api.devnet.solana.com"),
  );
  assert.throws(() => validateDevnetUrl("http://example.com"));
});
