# ReliefVue M1 technical design v02

Date: 2026-10-24. Ownership: shared client/colleague project. Status: execution authorized 2026-10-25; preflight clarifications incorporated for independent re-review. Local session artifact; no deployment or production-readiness claim.

## Authority and preservation

Geraldine approved proceeding with the recommended sequence: M1 design and plan, actual Devnet proof, website design direction, backend/website, recipient mobile, then controlled allowance payments and pilot readiness. Requirements authority is [PRD v0.4](prd_v04.md) and [M1 brief v02](m1_build_brief_v02.md). The Thailand-first candidate and ideathon optional-proof statement do not govern this phase.

Preserve the existing public simulation, approved elephant identity, fixed synthetic grant, recipient binding, independent activation signatures, review hold, reserve commitments and private evidence boundaries. Native SOL transferred directly to a synthetic recipient proves M1 settlement only: it does not enforce Model B essentials/flexible spending restrictions. No live country, grant value, custody vendor or merchant rail is selected.

## 1. Source reconciliation before implementation

Canonical project checkout: `../../2-projects/12_solana_hackaton/reliefvue/`, HEAD `0944e06`. Session checkout: `repo/`, branch `codex/reliefvue-mvp`, HEAD `1d440c4`. The earlier commit is an ancestor of the latter; the committed difference spans 14 files. This is local history evidence, not a fresh assertion about the remote tip.

Eight canonical working-tree files differ from or are absent in the session checkout: four `docs/brandbook_v05` documents, `docs/demo_video_plan_v01.md`, `docs/brandbook_v05/assets/pastel_wavescape_v02.png`, `docs/pitch_preparation_v17.md`, and `docs/public_pitch_video_v01.md`. Preserve their exact bytes. Session README.md changes and six untracked development documents also require preservation. No checkout can simply replace the other.

Before merging, save tracked diffs and untracked files in a verified session-contained preservation archive, with relative paths, SHA-256 hashes, commit IDs and branch identity. Check remote history read-only, then integrate only compatible changes into the canonical project checkout. Use a three-way comparison for README.md. Compare preserved hashes afterwards; stop on a conflict involving user edits rather than selecting a side automatically. Keep the session checkout as a frozen provenance snapshot once reconciliation is verified. Do not delete it in this milestone. No main merge or Drive sync follows from this design.

Requirements hashes at inspection:
- `prd_v04.md`: `c16a33b871c8c2f3c1f2895ac41d0289a3dad649766812c870da725e22e55f91`
- `m1_build_brief_v02.md`: `74d0c36f78045b9fb06fb05e7a071cd915383fe7be52713c3f3f687ec87765d6`
- `development_sequence_v01.md`: `bbe0030f71165d8ebdfc23ba15c62ec2cec8193017ae51c2511162bf51f8f634`

## 2. Architecture choice

| Option | Assessment |
| --- | --- |
| Extend existing contract, Kit client and technical UI | Selected. Smallest change that proves the required invariants and preserves the demo. |
| Rewrite contract and frontend together | Rejected for M1. Adds migration risk before proving existing semantics. |
| Build hosted database/authentication first | Deferred to M2. Needed for multi-user operations, not for a controlled single-process synthetic proof. |

Flow: technical UI → localhost M1 API → operation journal and generated program adapter → local validator or explicitly configured Devnet. Wallet signatures return to the API before broadcast. Public simulation remains isolated from program-backed state. Never fall back from program failure to the existing treasury-transfer implementation.

| Component | Responsibility |
| --- | --- |
| `chain/programs/relief_reserve/src/lib.rs` | Existing on-chain reserve, event and entitlement invariants; change only for demonstrated failures. |
| `shared/generated/relief_reserve/` | Reproducible client generated from compiled Anchor IDL; no handwritten instruction encodings. |
| `shared/m1_types.ts` | JSON-safe operation and status contracts; decimal strings for lamports, bigint internally. |
| `server/m1/program.ts` | Build allowed instructions, derive PDAs, decode/validate owned accounts, verify transaction effects. |
| `server/m1/journal.ts` | Durable intended operations, immutable attempts, exclusive ownership of local journal. |
| `server/m1/service.ts` | Prepare, validate signatures, persist, broadcast and reconcile; no synthetic production eligibility engine. |
| `server/m1/routes.ts` | Strict local HTTP boundary and public-safe projections. |
| `server/m1/index.ts` | Explicit runtime configuration and startup recovery. |
| `src/m1_api.ts`, `src/m1_panel.ts` | M1-specific technical interface and state display; leave public walkthrough intact. |
| `src/wallet.ts` | Separate sign-only capability for M1, account/network checks and cancellation. |
| `scripts/m1_smoke.ts` | Reproducible synthetic fixture execution and redacted evidence. |

Use a separate M1 entry point and route namespace `/api/m1`, retaining the existing simulation and local transfer demo as clearly labelled legacy modes. Reuse existing request validation patterns without exposing legacy payout routes in M1. Local API is not production staff authentication.

## 3. Toolchain and generation

Recorded pins: Node >=22.12.0, Kit 8.4.0, Anchor CLI/crate/test SDK 0.32.1, Solana 2.3.0, Rust manifest minimum 1.89. Native tools are absent from this shell. Do not label the pins verified merely because they are declared.

The [Anchor 0.32.1 release notes](https://www.anchor-lang.com/docs/updates/release-notes/0-32-1) recommend Solana 2.3.0. Retain this pair for initial reproducibility and record both host Rust and SBF toolchain versions. [0.32.2 release notes](https://www.anchor-lang.com/docs/updates/release-notes/0-32-2) describe newer transaction parsing and a package migration: assess that separately if the pinned test harness cannot parse live Devnet responses; do not mix version families or hide failures by upgrading indiscriminately.

Generate Kit-compatible bindings with Codama from the built Anchor IDL, as supported by [Solana's client-generation documentation](https://solana.com/docs/programs/codama/clients). Resolve and exact-pin generator dependencies against installed Kit 8.4.0; verify a regeneration produces no diff and an encoded instruction matches the Anchor test client's output. Compatibility is an implementation test, not an assumption. Keep the existing Anchor/web3.js test harness inside chain; do not bring it into the browser bundle.

Synchronize the generated isolated program public key across declare_id, Anchor localnet/devnet entries, IDL and client. Keep private keys and tool outputs in ignored session-contained runtime paths. Use explicit CLI arguments/environment configuration; do not replace the user's default Solana wallet or cluster. Block remote mutation unless genesis equals `EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG`. Local-validator mode requires a separate explicit loopback configuration and cannot be mistaken for Devnet evidence.

## 4. Signing and transaction ownership

| Action | Required authority and payer |
| --- | --- |
| Initialize | Reviewer, primary and backup signatures; reviewer pays reserve rent. |
| Fund | Donor signs a System Program transfer directly to the program reserve PDA; independent fee payer allowed. |
| Activate/increase | Reviewer plus primary OR backup sign identical compiled message bytes; reviewer pays event rent when created. |
| Bind | Configured verifier signs; verifier pays entitlement rent; fixed designated recipient. |
| Claim | Bound recipient signs the program claim; separate test fee payer pays network fees for exact grant-delta evidence. |

Synthetic staff roles are separate local key files. They demonstrate program signature enforcement, not organizational independence or production key custody. CLI proof uses a separate synthetic recipient key. Browser proof must use the connected recipient's wallet signature; the API must not silently sign for that browser recipient. Private keys never enter public status or logs.

M1 requires Wallet Standard signTransaction capability, rather than signAndSendTransaction. The wallet returns signed bytes to be checked and durably saved before server submission. Revalidate connected account, chain, compiled message, program/instruction, all accounts, amount, fee payer, blockhash and existing signatures. Reject a changed message, missing signature, arbitrary instruction or stale preparation. Unsupported wallets get an actionable message and no automatic sign-and-send fallback. Sign-only semantics are defined in the [Wallet Standard source](https://github.com/anza-xyz/wallet-standard/blob/master/packages/core/features/src/signTransaction.ts).

Collect both activation signatures against a single message hash. A refreshed blockhash requires a new attempt and all required signatures again. Never carry signatures across changed event terms. Funding receipt verification must check success, source, destination, amount and network against the saved intent, not merely accept a supplied signature.

## 5. Durable identity and recovery

Operation identity is a server-issued ID bound to cluster/program, operation kind and immutable intent hash. Deterministic exclusive keys: event PDA for activation; entitlement PDA for bind/claim; explicit donation intent ID for funding; explicit immutable increase intent for budget additions. HTTP replay with the same idempotency key returns the same operation; reuse with different terms is a conflict. A claim token never changes for a retry.

Each attempt retains compiled message hash, required signers, signed bytes, signature, blockhash, last-valid block height and timestamps. Persist the intended operation before signing and the fully signed attempt before broadcasting. An attempt is never overwritten; replacements reference the earlier attempt.

Use one local append-only journal with validated records, monotonic sequence, checksums and file synchronization before acknowledging a write. Startup replays records; only a torn trailing record can be quarantined under a preserved diagnostic artifact. Mid-file corruption, invalid schema or changed intent fails closed. Journal-write failure prevents submission. A process lock prevents a second writer; a stale lock needs verified operator recovery, not automatic deletion. Tests inject crash and disk-write failures. This design covers process restart under controlled local use, not hosted multi-instance operation; M2 replaces it with transactional persistence/outbox processing.

States: `prepared`, `signed`, `submitted`, `confirmed`, `finalized`, `failed`, `needs_review`. Wallet refusal before signing leaves a resumable prepared intent with no transfer. Timeout/RPC loss is uncertain, not failed. Confirmed may be shown as intermediate; M1 exit evidence requires finalized.

On restart or uncertainty, query the original signature with history and fetch relevant program accounts at finalized commitment. Match transaction effects and intent. Rebroadcast identical bytes only while valid. A consumed entitlement blocks another claim even if the original receipt is temporarily unavailable; absent attribution remains needs_review. Missing RPC status alone never proves failure. For donation/increase operations, account balances alone cannot attribute success. M1 therefore performs no automatic replacement after an uncertain submitted transaction; unresolved cases require review. A replacement may be prepared only after finalized failure, or an operator-reviewed expiry reconciliation establishing no effect. Preserve all attempts and gather fresh signatures. Do not interpret an unconsumed account read from a lagging RPC as permission to pay again.

## 6. Accounting and public views

Reserve spendable balance = on-chain lamports minus current account rent floor. Uncommitted = spendable minus reserve outstanding. Event remaining = budget minus paid; it is part of outstanding reserve liabilities, not extra money. Binding consumes regular/review allocation capacity without adding the budget liability again. Claim subtracts exactly its amount from reserve and outstanding and increases event paid once.

Use finalized account snapshots with a recorded slot/context. Recheck or mark stale if reads disagree. Never render missing data as zero. Confirmed donation totals include verified, uniquely attributed funding receipts; unsolicited/unclassified transfers remain a reconciliation difference. Seed funding, recipient fixture balances, rent and fees are identified separately. Operating support is disabled in M1 and never counted in relief funds.

Public status includes mode, cluster, program/reserve/event public addresses, slot, commitments, amounts, receipt states and Explorer links. Exclude fixture household mapping, session credentials, signed transaction bytes, private keys and any personal evidence. Existing illustrative global totals remain simulation-only.

## 7. Verification and acceptance

| Evidence | Required coverage |
| --- | --- |
| Baseline | Preserved source hashes; clean installs; typecheck; all tests; local/public builds including brandbook postbuild. |
| Native | Host helper tests, SBF build and fresh validator program tests; retain rent/cap/recipient/commitment checks. |
| Roles | Missing/wrong/collapsed roles; altered terms; both primary and backup paths; unauthorized verifier. |
| Identity | Zero/duplicate token; wrong area/reserve/event; substituted recipient; duplicate/concurrent claim; same event ID isolated across reserves. |
| Accounting | Two competing events; hold/regular caps; underfunding; checked overflow/underflow; exact recipient/reserve/outstanding/paid deltas; unchanged program state after rejection. |
| Recovery | Timeout after landing, dropped reply, restart before/after send, stale RPC, expired blockhash, journal failure, conflicting idempotency key and two writers. |
| Browser | Donor funding and recipient wallet signing; refusal; unsupported wallet; wrong account; refresh while pending; recovery; no public-demo regression. |
| Devnet | Genesis, code revision, tool versions, binary/IDL hashes, deployment signature, upgrade authority, finalized flow receipts and account assertions. |

Unit/mocked transport tests are not live settlement evidence. Local-validator rejection tests and Devnet proof must identify the same program source; deployment manifest binds binary and IDL hashes. Disclose that a development upgrade authority can replace program logic. If faucet/RPC/toolchain blocks a stage, retain partial evidence and leave that stage incomplete.

## 8. Website work after the design handoff

Next visual work is a landing-page design brief and reviewed concepts, preserving the selected elephant and approved identity. Start that work alongside implementation once this M1 design/task plan is reviewed. Content explains the problem, global direction, country readiness, donor journey, recipient app and transparency with clear simulation/Devnet/roadmap labels. It must not imply live restricted spending, real identity verification or an available app download. Website production implementation connects to M2/M3 contracts rather than creating a second accounting engine.

## Review result

Self-review: no selected production provider, no hidden country decision, no automatic payment retry on ambiguity, no weakening of reserve constraints, no claim that the direct-SOL proof implements Model B. Native compile, wallet interoperability and end-to-end execution remain unverified implementation work.


## Preflight clarifications — 2026-10-25

These clarify M1 mechanics without changing product policy or relaxing proof requirements. Earlier v01 remains preserved.

- Every request carries an immutable fixture ID. A server-owned synthetic fixture registry maps that ID to configured reserve/reviewer, event ID, area and (when applicable) household token/recipient. Operation-specific terms must match the fixture; no implicit first event or first entitlement selection. Intent hashes include the fixture ID and resolved addresses. Donor identity and amount remain explicit funding terms.
- Exclusive identities are `(kind, target PDA)` for initialize, activate, bind and claim. The kind prevents bind and claim from colliding. Terminal operations remain discoverable; failed operations cannot be silently recreated. Funding and increases use an explicit intent/idempotency key bound to fixture and terms. Replays preserve intent and attempts.
- Chain evidence reports commitment independently of success/failure. Only finalized failure permits replacement without expiry review. Confirmed failure remains pending reconciliation. Unknown, inconsistent, stale or unattributed outcomes never permit replacement.
- Signed attempts include creation time and previous-attempt number (null for the first). Partial collection validation verifies the unchanged message and every supplied signature while allowing absent required signatures; submission validation requires all signatures. Both paths reject unexpected signers and altered terms.
- A CLI-only replacement operation records operator review identity, reason and reconciliation evidence in the journal before creating a fresh unsigned attempt. It requires finalized failure or an explicit expired-with-no-effect review. No HTTP replacement endpoint or automatic replacement exists. A new blockhash requires every signature again; old attempts remain immutable.
- The local server binds only to 127.0.0.1 on an explicit port, accepts exact Host and configured loopback frontend Origin, and never enables wildcard CORS. Startup generates a random ephemeral bearer token, stored in a session-only permission-0600 file; the operator manually enters it into the local technical panel, which keeps it in memory only. Never put it in a URL, logs, browser storage, public status or repository. Restart rotates the token and invalidates prior sessions. Privileged preparation/signature/submit/reconcile routes require it.
- Status represents missing reserve/event as null with an explicit lifecycle state. Unknown balances remain null. Add event budget/remaining, regular/review allocation remaining, verified funding total and reconciliation difference, all from finalized evidence. Funding total includes only attributed receipts; difference explains unmatched deposits separately from rent and known payouts. No public household mapping is exposed.
- Tests must cover two fixtures sharing a recipient, confirmed failure versus finalized failure, initialize replay, bind followed by claim, partial signature collection across restart, stale session tokens, and status before initialization.
