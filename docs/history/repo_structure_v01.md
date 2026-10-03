# Suggested Repository Structure

```text
readyfund/
├── AGENTS.md
├── 01_PRD.md
├── 02_ARCHITECTURE.md
├── 03_MVP_BUILD_PLAN.md
├── 04_CODEX_START_PROMPT.md
├── 05_DEMO_SCRIPT.md
├── 06_OPEN_QUESTIONS.md
├── .env.example
├── README.md
│
├── app/ or src/
│   ├── components/
│   ├── features/
│   │   ├── dashboard/
│   │   ├── donate/
│   │   ├── disaster/
│   │   ├── eligibility/
│   │   └── claim/
│   ├── lib/
│   │   ├── solana/
│   │   ├── demo-data/
│   │   └── formatting/
│   └── ...
│
├── programs/
│   └── readyfund/
│       └── src/
│           └── lib.rs
│
├── tests/
│   └── readyfund.ts
│
└── public/
```

## Keep modules obvious

`lib/solana/`
- client creation
- wallet / network helpers
- program client
- transaction explorer helper

`lib/demo-data/`
- fake disaster
- fake households
- fake verification states

Never mix real identity data into the demo fixtures.
