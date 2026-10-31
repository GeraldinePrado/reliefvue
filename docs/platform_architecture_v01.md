# ReliefVue operating platform — architecture v01

Status: working local prototype, 29 October 2026. Money movement is simulated. No real recipient data or donated funds should be used with this build.

This document describes the platform added on top of the published concept site. The concept site at `/` is unchanged. The platform is a separate application entry at `/app.html`.

## What exists

| Surface | Route | Who it is for | What works |
| --- | --- | --- | --- |
| Public landing | `#/` | Donors and partners | Product explanation, live seed totals, district reach, links to each surface |
| Donor flow | `#/give` | Anyone | SOL, USDC or baht donation; optional auto-conversion to USDC; simulated receipt; public ledger update |
| Public ledger | `#/ledger` | Anyone | Totals, province allocation, district coverage, recent activity, reserve composition, guardrails |
| Recipient web app | `#/help` | Verified households in Thailand | Phone OTP, Thai or foreign-resident verification, household record, wallet/PromptPay preference, request, status, activity, profile |
| Staff workspace | `#/staff` | Admin, reviewer, approver | Overview, applications and duplicate checks, response activation and closure, treasury signatures, donations, partner keys, settings |
| Partner access | `#/staff/partners` | Admin, and external partners | Read-only REST keys and a read-only MCP server with a live tester |

## Run it

Requires Node.js 22.12 or later.

```sh
npm ci
npm run dev:platform
```

`npm run dev:platform` starts two processes:

- the platform API on `127.0.0.1:8788`;
- Vite on `127.0.0.1:5173`, proxying `/papi` to `/api` on the API.

Open `http://127.0.0.1:5173/app.html`.

Demo sign-in:

| Role | Credential | Purpose |
| --- | --- | --- |
| Admin | `admin@reliefvue.demo` / `reliefvue-demo` | Full workspace, response creation, partner keys, reset |
| Reviewer | `reviewer@reliefvue.demo` / `reliefvue-demo` | Decide applications |
| Approver | `anan@reliefvue.demo` or `malee@reliefvue.demo` / `reliefvue-demo` | Sign payouts, two required |
| Recipient | phone `0810000001` (Kanya) | OTP is shown on screen in demo mode |
| New recipient | any Thai mobile number | Creates a new household for testing |

The database is `data/platform.db` (SQLite, git-ignored). It is seeded with fictional households, donations, applications and payouts. Reset it from **Settings → Reset demo data**, or:

```sh
curl -c /tmp/rv.cookie -H 'content-type: application/json' \
  -d '{"email":"admin@reliefvue.demo","password":"reliefvue-demo"}' \
  http://127.0.0.1:8788/api/auth/staff/login
curl -b /tmp/rv.cookie -X POST -H 'content-type: application/json' -d '{}' \
  http://127.0.0.1:8788/api/staff/demo/reset
```

## Stack and layout

| Layer | Choice | Notes |
| --- | --- | --- |
| Interface | React 19 + Vite 7 + strict TypeScript | Separate entry `app.html`; the existing vanilla site remains at `index.html` |
| API | Node `http` server, TypeScript, `tsx` | No framework dependency |
| Persistence | `node:sqlite` (`DatabaseSync`) | Single-file database, WAL mode, prepared statements |
| Crypto | None in the platform rail | Existing `chain/` Anchor program and Devnet demo transport remain untouched |
| Styling | One product stylesheet using the approved brand tokens | Ivory, navy, purple, lavender/coral; Fraunces display, IBM Plex Sans UI, Alegreya wordmark |

```
product/               React application
  components/          Shell, public shell, UI primitives
  lib/                 API client, session, formatting
  pages/               Landing, Give, Ledger, staff pages, recipient app
  assets/              Optimised brand derivatives
server/platform/       Platform API
  app.ts               Routes and auth checks
  db.ts                Schema and fictional seed
  service.ts           Eligibility, review, payout, ledger, partner logic
  mcp.ts               Read-only MCP server
  identity.ts          ID checksum, hashing, wallets, base58
  index.ts             Server entry
shared/platform.ts     Types, 77 provinces, status labels
tests/platform.test.ts 10 integration tests
```

## Data model and invariants

| Table | Purpose | Key rule |
| --- | --- | --- |
| `organisations` | One operating entity and its reserve policy | Country, treasury address, PromptPay identity, 2-of-3 threshold |
| `users` | Staff and recipient accounts | Staff email/password; recipient phone |
| `households` | Private identity, residence and household record | Unique identity hash: one household account per person |
| `activations` | Province-scoped disaster response | One province, named districts, budget ceiling, fixed grant |
| `applications` | A household's request | Unique `(activation_id, household_id)`: one request per response |
| `payouts` | Queued release | One per application; `awaiting_approvals` then `sent` |
| `payout_approvals` | Executive signatures | Unique per payout and user; distinct users required |
| `donations` | Incoming funds | Original asset, THB value, settlement asset and amount |
| `audit_events` | Append-only activity | Every decision, signature, key and donation |
| `api_keys` | Partner credentials | SHA-256 hash; plaintext shown once |
| `sessions`, `otp_codes` | Local auth | HttpOnly cookie; OTP expiry and single use |

Enforced behaviours:

1. A household outside the activated province or listed district cannot submit.
2. A household cannot submit twice for the same response.
3. A national ID or passport hash cannot create a second household account.
4. A reused wallet, or the same address and household size, flags the application for review; it does not silently block it.
5. Approval checks the activation budget before creating a payout.
6. The reviewer cannot sign the payout for the application they approved.
7. Two different approvers must sign; the second signature marks the payout sent and the application paid.
8. District coverage is computed from applications and payouts and flags districts with requests but no payout.

## Money policy in this build

The product does **not** auto-convert to SOL. The implemented policy is:

- accept SOL, USDC, or THB;
- SOL can settle as USDC at donation time (default on);
- USDC stays USDC; baht stays baht;
- grants are denominated in THB;
- a recipient chooses PromptPay (THB) or wallet (USDC) at onboarding;
- at approval the THB grant is converted to the payout asset using the demo rate and the chosen rail;
- SOL is not the reserve asset.

Rates are indicative constants (`RV_SOL_THB`, default 5,200; `RV_USDC_THB`, default 36.5) and are labelled as demo values. A real system needs a licensed swap/on-ramp, a price source and slippage policy.

Every transfer is simulated and labelled: `SIM-…` for crypto, `PP-…` for fiat, and `simulated: true` in API responses. No key material, wallet or transaction is real.

## On-chain and off-chain boundary

| Data | Where it belongs | Current state |
| --- | --- | --- |
| Identity number, TM30, address, evidence | Off-chain, private | SQLite, local only |
| Staff decisions and reasons | Off-chain, auditable | `audit_events` |
| Donation receipt and payout transaction | On-chain reference, public | Simulated references now; real signatures later |
| Reserve balances and grant totals | Public, aggregated | Public ledger endpoint |
| Treasury signatures | Both: app-level approvals now, Squads later | App-level 2-of-3 |

The existing Anchor reserve program enforces claim uniqueness on Devnet. It is not wired into this platform. The platform currently enforces uniqueness in its own database. Before real funds, either the contract must become the authority or the two systems must reconcile deterministically.

## Partner API and MCP

Authentication: `Authorization: Bearer rv_live_…` (or `x-api-key`). Keys are per organisation, read-only, hashed at rest and revocable. Partner responses exclude names, phone numbers, identity numbers, TM30 references and addresses; an integration test asserts this.

REST:

| Method | Path | Returns |
| --- | --- | --- |
| GET | `/api/v1/partner/overview` | Organisation, activations, coverage, ledger totals |
| GET | `/api/v1/partner/activations` | Activation summaries |
| GET | `/api/v1/partner/activations/:id/coverage` | District coverage and unreached districts |
| GET | `/api/v1/partner/ledger` | Public-safe ledger summary |
| GET | `/api/v1` | Discovery |
| GET | `/api/v1/mcp` | MCP discovery document |

MCP is JSON-RPC 2.0 over HTTP POST at `/api/v1/mcp`. It is stateless and currently uses a static bearer key, not OAuth 2.1. Methods: `initialize`, `ping`, `tools/list`, `tools/call`. Advertised revision: `2026-07-28`; `2025-06-18` is also accepted.

| Tool | Use |
| --- | --- |
| `list_activations` | Activation budget, paid, remaining and pending |
| `get_activation_coverage` | District requests, approvals, paid and unreached |
| `list_unreached_districts` | Districts with no payout yet |
| `get_ledger_summary` | Donations, paid, held, reserve and households paid |

The MCP surface is deliberately read-only. It cannot move money, change a wallet or edit a household record. Organisation onboarding, scoped write access and OAuth are not implemented.

## Security limits of this prototype

- Sessions are HttpOnly, SameSite=Lax cookies; passwords use scrypt. There is **no CSRF token, login rate limit or device management**.
- Identity numbers, TM30 references and addresses are stored in plaintext in the local SQLite file. No encryption at rest, retention job or deletion workflow exists.
- API keys are hashed, but local staff can create unlimited keys and there is no scope or rate limit.
- Public ledger donor names are shown as entered. A real public ledger should anonymise by default.
- OTP codes are returned to the browser in demo mode and printed nowhere else. A production SMS provider is not connected.
- The API trusts the local network and has no TLS. Do not expose port 8788 to the internet.

Required before a real pilot: an identity provider, encryption/key management, CSRF and rate limiting, audit export, retention/deletion, a real payment partner, a production database with backups, and an independent security review.

## Deployment reality

`vercel.json` still builds the published concept site. `npm run build:web` also emits `dist/app.html`, so the platform shell can be served statically, but **there is no deployed API**: the platform needs a persistent Node host and database, and SQLite on serverless storage is not durable.

Options, in order of least work:

1. Local pilot only: run `npm run dev:platform` on a laptop; no public access.
2. Managed Node host with a persistent volume (Railway, Render, Fly.io) + the existing SQLite file.
3. Vercel static front end + managed Postgres (Neon/Supabase) + a Node API host; requires a repository abstraction and migration.
4. Vercel functions + serverless Postgres; also requires the database migration and connection pooling.

Do not point a public domain at the static `app.html` until the API is hosted; the staff workspace and donations will fail.

## Next engineering sequence

1. Thai and English localisation of the recipient app, then the staff workspace.
2. Private evidence upload with access control, not filename-only records.
3. Production auth: SMS OTP, staff MFA, session revocation, CSRF, rate limits.
4. Real Devnet rail adapter for treasury and donation receipts, with idempotent reconciliation.
5. Squads v4 2-of-3 vault to replace app-level signatures.
6. Organisation onboarding and scoped partner write access.
7. Postgres migration and API deployment.
8. Native app wrapper only after the PWA is stable and field-tested.
