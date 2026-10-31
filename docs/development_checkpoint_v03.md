# ReliefVue development checkpoint v03

Recorded 31 October 2026. Shared client/colleague project. Development branch:
`codex/reliefvue-mvp`.

## Task: demo readiness and provider research

Status: **local demo ready; public hosted demo not ready.** Research recorded; no production
KYC, custody or real funds.

This checkpoint covers the 1 November demo preparation: a reliable local launcher, a pre-demo
smoke check and reset, an end-to-end verification pass, a public demo runbook, and a sanitised
KYC/KYB provider update.

## Steps performed and behaviour implemented

1. `scripts/dev-platform.mjs` now probes the requested API port by connecting to it and moves
   to the next free port when another process already listens there (including a listener on
   `0.0.0.0`). It passes the chosen port to Vite, so `/papi` keeps working. The previous
   behaviour could collide with another local service on 8788.
2. Added `npm run demo` as the one-command demo start, `npm run demo:check` as a pre-demo
   health and route check, and `npm run demo:reset` for a clean fictional seed.
3. Added [the demo runbook](demo_runbook_v01.md): pre-demo steps, the eight-minute path, reset,
   failure recovery and the claims the presenter must not make.
4. Added [the KYC/KYB provider update](kyc_kyb_provider_update_didit_v01.md): what Didit
   advertises for Thai DOPA data match and Thai KYB, what it does not prove, the Solana
   attestation gap, and the questions to ask before integrating. No pricing, contract or
   commercial terms are published in the repository.
5. Recorded the internal handover and vault research outside the repository, in
   `2-projects/12_reliefvue/internal/`, as required by the confidentiality rule.

## Verification

| Command / check | Result |
| --- | --- |
| `npm run typecheck` | Exit 0 |
| `npm test` | 24 tests, 24 passed |
| `npm run check` | Exit 0 (typecheck, tests, both builds) |
| `npm run demo` with 8788 occupied | Chose 8789, Vite proxied correctly |
| `npm run demo:check` | API healthy, app served, same-origin API reachable |
| `npm run demo:reset` against a running server | Reset and reseeded; health stayed up |
| Playwright end-to-end | 10 stages, 0 console or page errors: donation → recipient onboarding → request → reviewer approval → two signatures → recipient paid → partner MCP → reset |
| Single-process hosted mode | `/`, `/app.html`, `/brand-guide/`, `/api/health`, `/papi/meta` served from one process |
| Workspace compliance | Passed on every changed path |

QA captures and the e2e script are in
`3-sessions/2026-10-24_reliefvue_development/qa_demo_v01/` and are not committed.

## What is still not done

- No hosted deployment: no Render/Railway account or payment method exists. The Dockerfile and
  `render.yaml` are committed but unused.
- No public-exposure hardening: rate limits, session revocation, CSRF review, security
  headers, encrypted evidence and retention/deletion are not implemented. Do not invite
  strangers to enter real data.
- No Devnet payout: all money is simulated; the platform does not show a live Solana signature.
- No production authentication; demo accounts and one-click personas only.
- No custom domain, monitoring, backups or scheduled reset.
- `main` is still at `0944e06`; the work is on `codex/reliefvue-mvp`.

## Founder decisions

1. Confirm the demo format: in-person on this Mac, remote screen-share, or a public URL.
2. If a public URL is required, create the host account and add the deployment credential.
3. Decide whether `codex/reliefvue-mvp` merges to `main`.
4. Approve or reject Didit as the pilot identity vendor, and open a sandbox account.
5. Approve the vault structure and signers before any real donation; buy hardware wallets.
6. Complete the legal wrapper, PDPA position and PSP/NDID conversation.

## Next

1. Rehearse the runbook once and time it.
2. If a hosted demo is confirmed: add the public-exposure hardening, deploy, run a restart
   survival test and the end-to-end flow on the host.
3. If a real chain proof is confirmed: fund a separate Devnet keypair, wire an idempotent send
   and reconcile the signature into the ledger.
4. Keep the identity provider spike, legal wrapper and custody work off the demo critical path.

## Publication

The launcher, preflight and reset changes were pushed as `5b47954` to
`origin/codex/reliefvue-mvp`. The documentation and checkpoint changes are committed with this
checkpoint. No main merge, deployment, Drive sync, real funds or real household data were
involved.
