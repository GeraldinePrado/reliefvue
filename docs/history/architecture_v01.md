# ReadyFund — MVP Architecture

## Principle

Use the **smallest real Solana surface** that proves the product.

The frontend and mock verification can be ordinary web software. Solana is responsible for the parts where shared, tamper-resistant state matters:

1. fund movement
2. disaster/vault state
3. one-claim-per-household enforcement
4. claim receipt

---

## Recommended hackathon stack

### Frontend
- React + TypeScript
- Next.js or Vite — choose whichever Codex can get running fastest
- Tailwind CSS
- `@solana/kit`
- `@solana/react`
- Wallet Standard-compatible wallet connection

### Solana
- Solana Devnet only
- Anchor program in Rust for the minimal custom claim logic
- PDA-based accounts

### Mock backend / data
Use the simplest option:
- local TypeScript fixtures, or
- Next.js route handlers, or
- a tiny JSON-backed mock service

Do not add Supabase unless the UI genuinely needs persistence.

---

## Why Anchor

For a first program, Anchor reduces boilerplate and provides account validation / IDL generation. The MVP needs only a tiny program.

---

## Proposed on-chain model

### 1. DisasterVault PDA

Seeds conceptually:

```text
["disaster", disaster_id]
```

Fields:

```text
authority
disaster_id
status
claim_amount_lamports
total_claimed
claim_count
bump
```

The account can hold lamports for demo distribution.

### 2. ClaimReceipt PDA

Seeds conceptually:

```text
["claim", disaster_id, household_hash]
```

Fields:

```text
disaster_id
household_hash
recipient_wallet
amount
claimed_at
bump
```

The important property:

**The PDA is deterministic.**

If the same household tries to claim again for the same disaster, initialization of the same ClaimReceipt PDA fails.

That gives us the demo's anti-duplicate mechanism.

---

## Minimal program instructions

### `initialize_disaster`

Inputs:
- disaster ID
- claim amount

Requires:
- authority signer

Creates:
- DisasterVault PDA

### `fund_disaster`

Input:
- amount

Requires:
- donor signer

Behavior:
- transfers Devnet SOL into the disaster vault

### `claim_relief`

Inputs:
- disaster ID
- household hash

Requires:
- recipient signer
- eligibility authorization strategy described below

Behavior:
1. Verify disaster is active.
2. Derive ClaimReceipt PDA.
3. Fail if already initialized.
4. Create ClaimReceipt.
5. Transfer configured claim amount to recipient.
6. Increment claim count / total claimed.

### Optional `close_disaster`

Only build if the core demo already works.

Behavior:
- marks disaster closed
- blocks new claims

The "return to reserve" behavior can be shown conceptually in the UI if time is short.

---

## Eligibility authorization for the MVP

A real system must not trust the browser to say "I passed KYC."

For the hackathon, use one of these approaches.

### Preferred if time permits

A demo verifier backend signs an eligibility message / transaction instruction for a predefined household hash.

### Simplest acceptable demo

Maintain a fixture of three eligible household hashes and have the program require an authorized demo verifier signer when the claim is created.

This proves:

- the recipient cannot self-declare eligibility
- the claim is still bound to a pseudonymous household identifier

Do not build real KYC.

---

## Household hash

For the hackathon, household IDs are synthetic:

```text
HH-CM-001
HH-CM-002
HH-CM-003
```

Hash them before sending to chain.

Production must use a carefully designed privacy-preserving nullifier / identity system. Do not claim the demo hash design is production-ready.

---

## Data flow

```text
                    READYFUND UI
                         |
       +-----------------+-----------------+
       |                                   |
    DONOR                              RECIPIENT
       |                                   |
connect wallet                        mock verification
       |                                   |
fund disaster                        receive household hash
       |                                   |
       +------------------+----------------+
                          |
                          v
                    SOLANA DEVNET
                          |
              +-----------+-----------+
              |                       |
       DisasterVault PDA       ClaimReceipt PDA
              |                       |
          holds funds          prevents duplicate
              |
              v
         recipient wallet
```

---

## UI data model

```ts
type Disaster = {
  id: string;
  name: string;
  region: string;
  status: "inactive" | "active" | "closed";
  claimAmountLamports: bigint;
  vaultAddress?: string;
};

type DemoHousehold = {
  id: string;
  pseudonym: string;
  region: string;
  eligible: boolean;
  verificationStatus: "unverified" | "verified" | "review";
};

type ClaimView = {
  disasterId: string;
  householdId: string;
  recipientWallet: string;
  status: "available" | "claimed" | "rejected";
  transactionSignature?: string;
};
```

---

## Security rules for Codex

- Never generate or expose production secret keys.
- Never commit a keypair.
- Never log seed phrases.
- Use Devnet only.
- Validate signer / authority accounts.
- Validate PDA seeds.
- Validate vault balance before claim.
- Reject claims when disaster is not active.
- Reject duplicate ClaimReceipt creation.
- No unchecked client-provided "eligible=true" as the sole authorization.
- All real identity data must remain outside the blockchain.

---

## Fallback plan if the Anchor program consumes too much time

If program deployment becomes the blocker:

1. Keep the real donor → treasury Devnet transfer.
2. Keep recipient payout as a real Devnet transfer.
3. Keep duplicate claim state in the demo backend.
4. Clearly label the duplicate prevention as a prototype layer.
5. Do **not** pretend it is enforced on-chain.

A working honest MVP is better than a broken "fully decentralized" demo.

The stretch goal is on-chain duplicate prevention, not a reason to miss the demo.
