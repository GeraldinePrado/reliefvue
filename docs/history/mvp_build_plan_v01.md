# ReadyFund — 6-Hour Build Plan

## Non-negotiable rule

**Stop adding features once the core demo works.**

The goal is not "finish a startup."  
The goal is "prove the product thesis live."

---

## Before the clock starts

If allowed:

- Install Node, Rust, Solana CLI, Anchor
- Install / configure VS Code + Codex
- Install the official Solana development skill
- Create/fund two Devnet wallets
- Make sure `solana config get` points to Devnet
- Verify a trivial Devnet transaction
- Prepare this build pack in the repo

---

## Hour 0:00–0:20 — Bootstrap

Codex tasks:

- Create app
- Create clean repo structure
- Add Tailwind
- Add Solana frontend libraries
- Add `programs/readyfund` Anchor workspace if using Anchor
- Create `.env.example`
- Ensure no secrets enter git

Deliverable:
- App loads
- Wallet-connect placeholder visible

---

## Hour 0:20–1:15 — Build UI with mock data first

Create screens:

1. Dashboard
2. Donate
3. Disaster detail
4. Eligibility
5. Claim
6. Claim rejected / duplicate state

Use fixtures.

Do **not** wait for blockchain integration before building the flow.

Deliverable:
- Entire demo clickable with fake data

---

## Hour 1:15–2:00 — Real wallet + donation

Implement:

- wallet connection
- Devnet RPC
- donor transaction
- pending/success/error state
- transaction signature
- Explorer link

Deliverable:
- Real Devnet donation succeeds reliably

If this does not work by Hour 2, ask a Solana mentor immediately.

---

## Hour 2:00–3:20 — Minimal Anchor program

Implement only:

- `initialize_disaster`
- `fund_disaster`
- `claim_relief`
- DisasterVault PDA
- ClaimReceipt PDA

Write tests for:

1. initializes disaster
2. funds vault
3. successful claim
4. duplicate claim fails

Do not add more instructions until these pass.

Deliverable:
- Program tests green

---

## Hour 3:20–4:00 — Connect UI to program

Wire:

- active disaster state
- claim
- success signature
- duplicate rejection

Deliverable:
- Full path works from browser

---

## Hour 4:00 — FEATURE FREEZE

At exactly this point:

**No new features.**

From now on:

- fix bugs
- simplify UX
- seed test wallets
- improve demo states
- improve pitch

---

## Hour 4:00–5:00 — Reliability

Test the exact demo sequence repeatedly.

Test:

- donor wallet not connected
- insufficient balance
- transaction rejected
- duplicate claim
- RPC delay
- page refresh
- wrong network

Add human-readable errors.

Prepare a fallback:
- short screen recording / screenshots of a successful transaction
- known transaction signature

Do not depend on the fallback unless live demo fails.

---

## Hour 5:00–5:30 — Visual polish

Only polish the screens judges see.

Prioritize:

- reserve balance
- active disaster banner
- "Donate"
- eligibility check
- successful relief payout
- duplicate rejection
- transaction link

Avoid decorative complexity.

---

## Hour 5:30–6:00 — Pitch practice

Run the demo at least 3 times.

Target product demo: **60–90 seconds.**

Pitch structure:

1. problem
2. insight
3. product
4. live demo
5. why Solana
6. future vision

---

# MVP cut line

If behind schedule, cut in this order:

1. close-disaster instruction
2. reserve rebalancing
3. admin UI
4. transaction history list
5. elaborate charts
6. animations

Never cut:

- wallet connection
- real transaction
- claim
- duplicate rejection
- clear pitch
