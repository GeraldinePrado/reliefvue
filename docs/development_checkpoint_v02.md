# ReliefVue development checkpoint v02

Recorded 29 October 2026. Shared client/colleague project. Development branch: `codex/reliefvue-mvp`.

## Task: operations platform MVP

Status: complete as a **local working prototype**. Not deployed, and no real money or real household data is involved.

Implementation commit: `118a71c` (`Build ReliefVue operations platform MVP`), on top of `6536c92`.

This checkpoint records the new platform requested on 29 October: a working staff dashboard with a backend, a recipient mobile web app, a donor flow, a public ledger and a partner API/MCP surface. It is separate from the earlier concept site at `/` and from the Task 1–2 reserve work.

## Steps performed and behaviour implemented

1. Added a second Vite entry, `app.html`, for the product application. The published concept site and its guided demo remain at `/`.
2. Built a Node/SQLite platform API with durable local state, seeded fictional responses, households, donations, payouts and an audit trail.
3. Implemented recipient onboarding for Thai nationals and foreign residents. Thai IDs use the official 13-digit checksum; foreign residents provide passport/alien ID, TM30 and address evidence. Address evidence is a separate requirement for both groups because TM30 is host-filed and applies only to foreigners.
4. Implemented province-and-district eligibility, one request per household per response, duplicate identity detection, wallet-reuse and address/size flags, and a budget ceiling.
5. Implemented the review decision, payout creation, separation of duties and a 2-of-3 signature release. The reviewer cannot sign the payout they approved.
6. Implemented two payout rails: PromptPay in THB for recipients who choose it, and a USDC wallet payout for crypto-native recipients. The grant is denominated in THB.
7. Implemented donations in SOL, USDC and baht, with optional SOL→USDC settlement. SOL is not used as the reserve asset. Every transfer is labelled simulated.
8. Built the staff workspace: overview, applications with evidence/duplicate drawer, responses and coverage, treasury queue and signature progress, donations with CSV export, partner keys, settings and demo reset.
9. Built the public ledger: totals, province allocation, district coverage, recent movements, net reserve composition and guardrails.
10. Built the partner surface: hashed read-only REST keys, a discovery endpoint, and a stateless MCP JSON-RPC server with four read-only tools. Partner output excludes names, phones, identity numbers, TM30 references and addresses; an integration test asserts this.
11. Added `npm run dev:platform` to start the API and Vite together; added `npm run platform` for the API alone.
12. Documented architecture, Thai legal/payment constraints, and the decision list for Geraldine.

## Verification

Fresh commands run from the canonical repository:

| Command | Result |
| --- | --- |
| `npm run typecheck` | Exit 0 |
| `npm test` | 24 tests, 24 passed, 0 failed (10 new platform tests + 14 existing) |
| `npm run build` | Exit 0; both entries built |
| `npm run build:web` | Exit 0; `dist/app.html` and the concept site built, brand guide copied |
| `npm run check` | Exit 0 (typecheck + tests + both builds) |
| Playwright end-to-end | 10 stages completed, 0 console or page errors |

End-to-end browser flow exercised in one run:

1. Donated 25 USDC through the donor form and received a simulated receipt.
2. Signed in a new recipient by OTP, completed Thai identity and address evidence, household details and PromptPay preference.
3. Submitted a request from the recipient app.
4. Signed in as the reviewer, opened the application, read the masked identity and duplicate checks, approved with a reason.
5. Signed the payout as Anan, then as Malee; the second signature released it.
6. Reloaded the recipient app and saw the paid status and PromptPay destination.
7. Created a partner key and called `list_activations` through MCP; structured JSON returned.
8. Reset the demo data to the clean seed.

Visual evidence: 18 captures plus a second-pass recapture at 390, 768 and 1440 CSS pixels, including mobile staff navigation, the recipient app, donor receipt, ledger, treasury and partner MCP tester. A 16-route overflow audit at 390 px reported no horizontal overflow. Captures and the Playwright scripts are in `3-sessions/2026-10-24_reliefvue_development/qa_platform_v01/` and are intentionally not committed.

Workspace compliance: `sh 4-ai/scripts/check_workspace.sh` passed across the changed paths after removing empty Finder `Icon` metadata.

## Remaining defects and limitations

- All money is simulated. No Devnet, mainnet, custody, swap or bank/PSP integration exists in the platform.
- Identity verification is a checksum plus self-declared evidence; no DOPA, NDID, liveness or document authenticity check.
- PII is stored in plaintext in local SQLite; no encryption at rest, retention job, deletion workflow or privacy notice.
- No CSRF token, login rate limiting, MFA, session revocation or partner rate limiting.
- Partner access is read-only. It cannot create responses, change wallets or edit an organisation.
- Organisation onboarding is manual/seed-only; the schema supports multiple organisations but the UI is single-organisation.
- The recipient app is English with Thai province names; no full Thai translation.
- Evidence upload is a filename/note only; no private file store.
- The Vite proxy and SQLite API are for local use. `dist/app.html` builds, but a public static deployment has no API. No Vercel deployment was made; the published concept site is unchanged.
- The historical `2-projects/12_reliefvue/AGENTS.md` hackathon scope excludes KYC, PromptPay, multi-country and analytics. It is preserved for the old demo; Geraldine’s 29 October direct instruction supersedes it for this platform. This conflict is recorded rather than silently ignored.

## Publication

Implementation commit `118a71c` is on `codex/reliefvue-mvp`. The checkpoint and session updates are committed after it and pushed to the same branch. Remote verification is recorded in the active session ledger.

## Next

1. Geraldine answers the decision list in [platform_open_questions_v01.md](platform_open_questions_v01.md), especially payment partner, KYC partner, crypto legal path, treasury signers and reserve policy.
2. Production authentication and PII protection.
3. Real Devnet rail adapter and a funded test treasury, or the payment partner integration first.
4. Squads v4 vault to replace app-level signatures.
5. Thai localisation and private evidence upload.
6. Choose the API host and persistent database before exposing the platform on the domain.
