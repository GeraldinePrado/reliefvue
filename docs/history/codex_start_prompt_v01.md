# First prompt to give Codex

You are my senior hackathon engineer.

We are building **ReadyFund**, a Solana Devnet MVP for a 6-hour ideathon.

Before coding, read:

- `AGENTS.md`
- `01_PRD.md`
- `02_ARCHITECTURE.md`
- `03_MVP_BUILD_PLAN.md`

Then do the following:

1. Inspect the local toolchain and report what is already installed: Node, package manager, Rust, Solana CLI, Anchor.
2. Do not modify global system dependencies unless necessary.
3. Propose the shortest build path that can reliably demonstrate:
   - wallet connection
   - real Devnet donation
   - one active mock disaster
   - mock household eligibility
   - successful relief claim
   - duplicate claim rejection
4. Use current Solana patterns, preferring `@solana/kit` / `@solana/react`.
5. If the Anchor toolchain is available and healthy, create the minimal program described in `02_ARCHITECTURE.md`.
6. If Anchor setup becomes a time sink, preserve the fallback architecture rather than blocking the frontend.
7. Start by creating the full UI flow with fixtures so we have a presentable app early.
8. Keep the interface polished but simple.
9. Use Devnet only.
10. Never store real personal data or secret keys.

Work incrementally. After each milestone:
- run the app/tests
- tell me exactly what works
- identify the next single highest-priority task

Do not add features outside the PRD.
