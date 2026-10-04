# ReliefVue ideathon prototype

Thailand-first household emergency relief using Solana Devnet. Fictional flood evidence and synthetic households only. No real aid service, identity checks, custody or baht conversion.

## Stack

Node >=22.12, Vite 7, strict TypeScript, Solana Kit and Wallet Standard. The localhost API separates policy, persistence and chain transport. `chain/` contains an Anchor reserve design and test source; **it is uncompiled and undeployed**.

## Run on Windows or Mac

```sh
npm ci
npm run server
```

In a second terminal in this repository:

```sh
npm run dev
```

Open http://127.0.0.1:5173. The API binds localhost port 8787. Keep it local: staff buttons simulate roles and the session token is not production authentication.

```sh
npm run check
npm audit
```

`check` runs typecheck, eight focused tests and both builds. `build:web` is cross-platform and produces the static public preview selected by `vercel.json`. `build` produces the frontend for use with the local API. Both write `dist/`, so the last build determines its mode.

## Demonstration

1. Watching blocks payouts; review the fictional observed-impact fixture.
2. Simulate reviewer and primary or backup authorization. Activation requires enough reserve for the event budget.
3. Fund the displayed **Devnet** reserve and donor using test SOL only. A compatible Wallet Standard wallet can donate; the local demo donor needs its own test SOL plus fees. No airdrop is automatic.
4. Submit the earliest complete eligible household claim. A second applicant for that household is blocked; a separate rented unit may qualify. Pending cases need simulated human review and use a protected allocation.
5. Inspect confirmed Devnet receipts. Timeout/ambiguous payment intents remain blocked across restart; never reset state to retry them.

The fixture grant is 0.01 test SOL, event cap 0.05 and review hold 0.01. These are test values, not a Thai grant estimate. Real event approval and staff authorization are **not** enforced by the deployed reserve program because none is deployed yet.

## Data and recovery boundaries

Ignored `data/v2/` stores generated demonstration keys and atomic local claim state. Older `data/` is preserved but not imported into v2. Never publish keys or reset state against funded wallets. These keys belong to fictional demo recipients and do not establish a recoverable production wallet. A lost self-custody key cannot be recovered through a login reset.

Wallet submission is marked uncertain before broadcasting. If a wallet may have broadcast without returning a signature, check its history before another donation; the app blocks resending in that session. For a recorded signature, retry verification instead of sending again. Staff investigations of uncertain payouts are a manual developer task in this MVP; no unsafe reset button is provided.

## Public build and deployment

The static preview reads a Devnet reserve and verifies donations, but its receipt list is browser-local. Its event approvals and recipient outcomes are illustrative; no public payout API is deployed. The public preview reserve differs from the new local v2 reserve. A Git push does not prove Vercel deployed this revision; inspect the deployment before presenting it.

## Documents

- [Current brief](docs/brief.md), [technical design](docs/spec.md), [implementation plan](docs/plan.md), [progress](docs/progress.md).
- [Senior developer handoff](docs/developer-handoff.md), [reserve program handoff](chain/README.md).
- [Brandbook v02](docs/brandbook_v02/index.html) remains a review candidate, not the implemented identity.
- Earlier recovery briefs and `docs/history/` are historical context; the current brief governs when they differ.

Only reviewed source, configuration and project documents belong in this public repository. Keep dependencies, build output, real identities, secrets, keys and private workspace records out of Git and shared source archives. Optional operating support remains a future separate payment route.
