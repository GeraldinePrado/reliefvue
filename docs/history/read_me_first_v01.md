# ReadyFund — Codex Build Pack

**Working title:** ReadyFund  
**Hackathon goal:** Build a convincing Solana Devnet MVP in ~6 hours.  
**One-line product:** **Emergency money ready before disaster — released directly to verified affected households when an official disaster zone is activated.**

## What we are actually building

We are **not** building a national disaster system in six hours.

We are building one clear proof:

1. A pre-funded emergency reserve exists.
2. A mock official disaster is activated for Chiang Mai.
3. A mock household passes private eligibility verification.
4. A donor can add Devnet SOL to the reserve/vault.
5. An eligible household can claim once.
6. A second claim for the same household + disaster is rejected on-chain.
7. The dashboard shows reserve, allocated, distributed, and remaining funds.

## What stays mocked in the MVP

- Government disaster API
- Real KYC / Thai ID verification
- Real residency verification
- Real bank / PromptPay payout
- Real USDC / fiat conversion
- Real fraud scoring
- Legal / regulatory onboarding
- Household appeals
- Corporate matching

These are shown in the product flow but **must not block the demo**.

## What must be real

- Solana Devnet
- Wallet connection
- At least one real Devnet transfer
- The duplicate-claim rule
- Transaction signature / Explorer link
- On-chain disaster / claim state if the program is completed

## Recommended order

1. Read `01_PRD.md`
2. Read `02_ARCHITECTURE.md`
3. Read `03_MVP_BUILD_PLAN.md`
4. Put `AGENTS.md` in the repository root
5. Give `04_CODEX_START_PROMPT.md` to Codex
6. Use `05_DEMO_SCRIPT.md` during testing and the pitch
7. Use `06_OPEN_QUESTIONS.md` only after the MVP works

## Solana agent tooling

The Solana Foundation maintains an official coding-agent skill. Before the event, optionally install it in the development environment:

```bash
npx skills add https://github.com/solana-foundation/solana-dev-skill
```

Use current Solana documentation as the source of truth when package APIs differ from older examples.
