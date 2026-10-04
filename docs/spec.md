# ReliefVue ideathon MVP technical design

Approved direction: Geraldine approved the program-plus-app design on 2026-10-04 and authorized implementation and stack corrections. This specification is for Devnet, fictional flood evidence, and synthetic households. Production policy and custody are separate work.

## Scope correction

This document records proposed technical architecture and prototype groundwork. It is not the current submission checklist or a requirement to finish a public app. Follow [submission-scope.md](submission-scope.md): pitch and demo story first; native reserve proof is optional until actual event requirements are checked, and production work is deferred.

## Objective

Demonstrate Watching -> evidence review -> two-role event authorization -> fixed household grant -> confirmed SOL receipt, with caps, private household matching, and waiting claims. A public preview must identify simulated outcomes. A real payment is shown only with confirmed chain evidence.

## Stack

- Node.js >=22.12 on Windows and Mac; npm lockfile and `npm ci`.
- Vite 7 and strict TypeScript for the existing browser interface; retain the current CSS and avoid a framework rewrite.
- Solana Kit and the generated System Program client for RPC, transaction creation, and signed test payments.
- TypeScript Node API bound to localhost. Persist synthetic state in an ignored directory with atomic replacement; serialize monetary operations.
- Anchor/Rust for the Devnet reserve program. Build/deploy requires the Solana/Rust/Anchor toolchain on Mac/Linux or installed WSL. Source is not evidence of successful compilation or deployment.
- Node's built-in test runner through tsx; TypeScript checks and both local/public Vite builds.

## Boundaries

The browser renders donor, recipient, reviewer, and activity views. A typed API client carries public DTOs, never secrets. The policy module owns Watching/Review/Active transitions, household matching, fixed-grant allocation, and queue eligibility. The transaction adapter prepares and submits test-SOL transfers, returning a known signature before confirmation. The state store keeps private synthetic records and payment intent. The program independently controls its vault, approval roles, event budgets, and event/household claim records.

Keep a server-enforced Devnet demonstration available while the program is not deployed; label it accordingly. The static Vercel preview has no private signing key, browser approval is only illustrative, and its receipt list is not a global ledger. Enabling the program mode requires its deployed address, generated client, and verified integration; do not silently present server transfers as program enforcement.

## Product rules carried into the design

- Heavy rain, forecasts, and early reports remain Watching. Consider activation only after documented observed flooding inundates homes, causes evacuation, or cuts essential access. Localized severe impact may qualify; province-wide impact is unnecessary.
- An independent reviewer plus primary or appointed backup approver authorize the same event terms. Neither approval alone activates. Backup appointment and replacement need a separately governed production procedure.
- Normally authorize a limited tranche; exceptionally catastrophic observed impact may justify the full uncommitted reserve. No automatic percentage rule. Existing event commitments remain protected.
- One flat grant per verified household/event. A Thai priced, three-day, no-cooking/no-refrigeration basket for a reference household of 3-5 informs the future baht benchmark. Never divide the pot by applicants or vary the grant by household size. Support calculations stay in an evidence document; pitch shows an estimate only after it is researched.
- Reserve an explicitly approved part of the event budget for pending human reviews; complete-claim timestamps determine queue order. Waiting reviews cannot receive funds before verification. A hold expiry needs notice and human exception review. Do not invent a production reserve percentage or duration.
- Separate rented rooms may represent separate households; names, accounts, and street addresses alone do not establish uniqueness. AI groups suspicions; humans resolve them.
- Paid grants are not reclaimed for inactivity. Account recovery preserves identity and claim history. Recoverable custodial wallets and baht conversion are funded-phase investigations, not available capabilities.

## Demo constants and records

One fictional Bangkok flood using a named fictional subdistrict, not all Bangkok. Grant: 10,000,000 lamports (0.01 test SOL), explicitly unrelated to real Thai purchasing power. Demo budget: 50,000,000 lamports, with 10,000,000 held for pending review. These are deterministic fixtures, not production amounts.

Event: id, areaId, evidence list (source URL/label, observation time, area, impact, synthetic flag), status, budgetLamports, reviewHoldLamports, paidLamports, reviewer approval, approver approval.

Private household: opaque ID, person ID, areaId, buildingId, unitId, review state, claim-complete timestamp, assigned destination. Include eligible unit A, duplicate applicant for A, independent unit B at the same building, an outside-area household, and an ambiguous pending-review household. Public DTOs omit person/unit/address mappings. On-chain household IDs are random opaque event identifiers; never hash low-entropy names/addresses directly into public IDs.

Payment intent: unique event/household key, amount, destination, state (reserved/submitted/confirmed/needs_review), signature, timestamps. Store the signature before waiting for confirmation. An ambiguous submission remains blocked for investigation; no automatic fresh transfer after timeout.

## Reserve program contract

Initialization fixes reviewer, primary approver, and distinct backup approver keys. The reviewer must differ from either approver. Event creation and increases require reviewer plus primary/backup signatures together. Parameters include an area commitment, fixed test-grant amount, total budget, and review hold. Budget increases cannot exceed uncommitted funds or shrink below existing liabilities. No general withdraw or inactivity-clawback instruction.

An authorized verifier binds one event household token to a recipient and grant. A claim requires the bound recipient's signature and checks event activation, grant equality, unused entitlement, remaining budget, and hold limits. It atomically marks the entitlement consumed and transfers SOL. A reviewer cannot directly withdraw or redirect an existing entitlement. Claims admitted after resolving review use the approved review allocation. A compromised verifier can fabricate eligibility: Solana cannot verify real residence. This is a disclosed oracle risk.

Upgrade authority can bypass program rules and must be disclosed in the demo; no production decentralization or audited-custody claim. Program accounts retain rent-exempt funds. Fee/rent funding is separate from the stated aid balance.

## API and security

GET status exposes public event, balance, and confirmed activity only. Local mutations require a randomly generated session token delivered only to the same localhost-origin frontend; reject absent credentials and unexpected Origin/Host. Demo reviewer and approver buttons simulate roles, not multi-user production authentication. Keys remain server-side in ignored storage. Strict request shape, body size, lamport bounds, and enum checks apply. Public preview cannot call mutation endpoints.

All RPC endpoints are pinned to Devnet; reject mainnet configuration and verify genesis when initiating payments. Browser Wallet Standard must select a Devnet-capable account, sign the exact transaction, and expose failure/cancellation. No seed phrase requested. No real KYC documents or personal data collected.

## Acceptance tests

1. Watching and single-role approval cannot pay. Forecast-only evidence cannot advance to active.
2. Duplicate same-household claim cannot pay twice, including concurrent requests and after server restart.
3. Two verified units in one building qualify separately; outside-area and unresolved households cannot pay.
4. Ready claims cannot spend the human-review hold; successful review can use its allocation. Queue uses complete-claim time.
5. Fixed grant remains constant when funds run out; no overspend, fractional grant, or division by claim count.
6. Submitted-but-unconfirmed payment cannot be freshly sent again. Failed confirmed transaction returns to documented review, not a fabricated receipt.
7. Wrong network, malformed amount, unauthorized mutation, untrusted origin, and forged donation receipt are rejected.
8. Public response/bundle has no secrets or private household mapping. Public preview outcomes are labelled simulated.
9. Chain tests cover independent signers, backup authorization, duplicate entitlement, recipient substitution, cap and hold accounting, and preservation of previous commitments.
10. Typecheck, unit tests, local/public builds pass. Native program build/test and Devnet proof are reported separately with actual evidence.

## Future technical proof and funded implementation

Implement and verify chain compilation, IDL/client generation, program initialization, and frontend integration on a supported toolchain. Confirm one donation and payout in Explorer, then demonstrate rejected duplicate and over-budget instructions against that same deployed program. Preserve the current simulator as explicitly labelled rehearsal mode. Validate real Thai basket prices, source thresholds, custody/provider arrangements, identity policy, signer governance, review capacity, and privacy before real funds.
