# AGENTS.md — ReadyFund Hackathon Rules

You are building a **6-hour Solana hackathon MVP** called ReadyFund.

## Product in one sentence

Emergency money is funded before disaster; when a disaster is activated, a verified affected household can claim once, with settlement recorded on Solana.

## Priority order

1. Demo reliability
2. Correct Solana integration
3. Duplicate-claim enforcement
4. Clear UX
5. Visual polish
6. Everything else

## Source of truth

Read in this order:

1. `01_PRD.md`
2. `02_ARCHITECTURE.md`
3. `03_MVP_BUILD_PLAN.md`

Do not invent new product scope without explicit instruction.

## Hard scope boundaries

Do NOT add:

- NFTs
- a project token
- DAO governance
- DeFi/yield
- real KYC
- real Thai ID handling
- PromptPay
- mainnet
- AI chatbot
- social login
- complex database
- messaging
- multi-country support
- admin analytics beyond what the demo needs

## Solana rules

- Devnet only.
- Prefer current `@solana/kit` and `@solana/react` patterns.
- Use Anchor for the minimal custom on-chain program if the toolchain is working.
- Use PDAs for deterministic disaster / claim state.
- Never store PII on-chain.
- Never expose or commit a secret key.
- Never ask the user for a seed phrase.
- Show transaction signatures in the UI.

## Program goal

Implement the smallest on-chain program that proves:

- a disaster vault exists
- it can receive test funds
- an authorized eligible household can claim
- the same household cannot claim twice for the same disaster

## Anti-duplicate requirement

A claim receipt must be deterministically derived from:

```text
disaster_id + household_hash
```

A second attempt for the same pair must fail.

## Error messages

Translate blockchain errors into plain language.

Example:

Bad:
`AccountAlreadyInUse`

Good:
`This household has already received assistance for this disaster.`

## Working style

- Make small patches.
- Keep the app runnable after each patch.
- Run tests after program changes.
- Do not refactor working code during the final 2 hours unless required for the demo.
- If an API/package has changed, consult current Solana docs or the official Solana agent skill instead of guessing from legacy examples.

## Feature freeze

Once the complete donor → claim → duplicate rejection flow works, do not add functionality unless explicitly requested.
