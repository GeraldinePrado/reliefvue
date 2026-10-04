# ReliefVue implementation status and next steps - 2026-10-04

Current team: Geraldine and Codex are building the hackathon prototype. No senior developer has been hired. Hiring remains conditional on future funding. The next engineering work is ours to continue.

## Delivered

Vite retained; browser and localhost API migrated to strict TypeScript. Solana Kit replaces the root legacy SDK. Wallet Standard supports Devnet donations. Cross-platform commands replace Unix-only build syntax. Shared types, policy, atomic persistence, API and RPC transport are separated. Anchor reserve source and native tests are in `chain/`.

Local demo: Watching -> observed-impact fixture -> simulated reviewer plus primary/backup approval -> fixed household claim -> signed intent persisted before submission -> confirmed receipt. Duplicate or uncertain payment remains blocked across restart. Public receipts omit private claim links without the local token. Same-building distinct household fixtures are separate from duplicate applicants. Review holds and complete-claim order are tested.

The localhost token prevents casual cross-origin mutation; it is not staff identity or authorization. Any local session can simulate all roles. The local key holder can bypass app rules. This is not an enforceable locked public reserve yet.

## Verification evidence

- `npm run check`: typecheck, eight tests, local build and public build passed on Windows, Node 22.14.
- `npm audit --audit-level=low`: zero vulnerabilities in the root dependency tree. The separate native chain test dependencies have not been installed/audited.
- Live official Devnet genesis/read-only balance verified. The initial shortened genesis constant was corrected to the full live value.
- Browser: profiles load, observed fixture review and reviewer approval succeed; primary activation rejects an empty reserve. Claims stay unavailable. Mobile 390px and desktop 906px views checked for horizontal overflow.
- No funded live wallet donation or payout was executed in this upgrade. Adapters have mocked tests; real donation/payout receipts are required only if we present a transfer as actually executed. Their necessity for the submission depends on the event requirements.
- No Rust, Cargo, Solana CLI, Anchor, Docker or installed WSL on this machine. **No reserve compilation, IDL generation, native integration tests or deployment evidence.** JavaScript checks do not validate Rust. The program ID is a placeholder.
- No configured `prek` gate found. Repository-native checks were used.
- Vercel deployment has not been verified for this revision.

## Current next step

Prepare the pitch outline and demo storyboard under [submission-scope.md](submission-scope.md). Do not treat the technical list below as the current task queue.

## Optional hackathon technical proof and future funded engineering

1. On suitable Mac/Linux tools, follow `chain/README.md`, compile, resolve Rust/IDL issues and run the native suite. Replace the placeholder program ID, deploy to Devnet and record address, authorities and transaction evidence.
2. Wire program instructions into typed adapters after validation. Test signer failures, recipient binding, consumed entitlements, caps and existing commitments on the validator.
3. Resolve upgrade authority and signer replacement. Source has no general withdrawal or paid-grant inactivity clawback, but uncontrolled upgrades could replace those rules. Abandoned entitlements remain committed until a cancellation policy is designed.
4. Add verified-signature reconciliation for uncertain payouts, with explicit failed/expired/successful resolution. Do not delete unresolved intents to retry. Demo donations with a known signature can be verified through `/api/donation` to resolve their intent.
5. Replace JSON and simulated sessions with durable production persistence, audit records and separate staff identities before funded public operations. Add stored-schema validation/migration, key custody, recovery and coverage.
6. Validate Thai ready-to-eat essentials prices and the baht benchmark. Decide quote timing, fees and a licensed conversion provider separately. Test real eligibility/appeals privately after funding.

## Cross-computer work

Resume from the reviewed Git revision. Run `npm ci` on each machine. Do not sync dependencies, generated keys or live `.git` state through source archives. Drive contains documents/source handoffs; cloud readback cannot prove Mac offline availability. Confirm the intended revision on the Mac before editing. ReliefVue and La Corda remain separate repositories and folders.
