# ReliefVue M1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use mri-code-implement to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove real program-controlled synthetic Devnet funding, dual authorization and recipient-signed claims, preserving the public simulation.

**Architecture:** Extend the existing Anchor reserve with generated Kit bindings and a separate local M1 API. Persist signed attempts before broadcast; reconcile uncertain outcomes against finalized chain evidence.

**Tech Stack:** Existing Vite/TypeScript/Node, Solana Kit and Anchor; generated client; single-process durable local journal.

Status: execution authorized by Geraldine on 2026-10-25; v02 incorporates independent preflight findings. This is not test evidence. Ownership: shared client/colleague. Design: [M1 technical design v02](m1_technical_design_v02.md). All repository paths below are relative to the reconciled canonical `2-projects/12_solana_hackaton/reliefvue/`.

## Global Constraints

- Node >=22.12.0; existing Kit 8.4.0; baseline Anchor CLI/crate/test SDK 0.32.1 and Solana 2.3.0; Rust manifest minimum 1.89. Verify host/SBF compatibility before deployment; document any narrowly required correction.
- Local validator and Devnet only; Devnet genesis `EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG`.
- Synthetic cases and native test SOL only. No live country selection, real identity data, mainnet, merchant payments or production custody.
- Preserve signer, recipient, cap, rent, review hold, commitment and duplicate-prevention invariants.
- Signed attempts must be durable before broadcast. No automatic replacement of an uncertain submitted transaction.
- Preserve approved identity and existing public simulation. M1 failures cannot fall back to treasury transfers.
- No direct-SOL claim is represented as Model B spending enforcement.
- Preserve both working trees and history before reconciliation. No overwrite of user conflicts or deletion of snapshots.
- Runtime keys, caches, build outputs, logs and browser evidence belong in the active session and are excluded from Git.
- Before each workspace mutation inspect governing rules; afterwards run `sh 4-ai/scripts/check_workspace.sh` with every changed path.
- Each implementation task ends with focused tests, review and an explicit-path commit on the development branch. Never stage unrelated user files. No main merge or Drive sync.

## Shared contracts

Create `shared/m1_types.ts` in Task 3. These are the stable cross-task interfaces; generated instruction types remain inside the adapter. Validate all strings at the API boundary. Lamports are canonical unsigned decimal strings in JSON, with u64 range checked before conversion to bigint. Transaction and account decoders must reject unknown or incompatible data.

```ts
export type OperationKind = 'initialize' | 'fund' | 'activate' | 'increase' | 'bind' | 'claim';
export type OperationState = 'prepared' | 'signed' | 'submitted' | 'confirmed' | 'finalized' | 'failed' | 'needs_review';
export interface Intent {
  id: string;
  idempotencyKey: string;
  fixtureId: string;
  kind: OperationKind;
  clusterGenesis: string;
  program: string;
  reserve: string;
  event?: string;
  entitlement?: string;
  terms: Readonly<Record<string, string | boolean>>;
  intentHash: string;
}
export interface SignedAttempt {
  operationId: string;
  attempt: number;
  previousAttempt: number | null;
  createdAt: string;
  messageHash: string;
  requiredSigners: readonly string[];
  wireBase64: string;
  signature: string;
  blockhash: string;
  lastValidBlockHeight: string;
}
export interface Operation {
  intent: Intent;
  state: OperationState;
  attempts: readonly SignedAttempt[];
  revision: number;
  reason?: string;
}
export interface ChainEvidence {
  signature: string;
  outcome: 'not_found' | 'confirmed' | 'finalized' | 'failed' | 'inconsistent';
  commitment: 'confirmed' | 'finalized' | null;
  slot?: string;
  effect: 'matched' | 'absent' | 'unknown';
  entitlementConsumed?: boolean;
  reason?: string;
}
export interface OperationJournal {
  get(id: string): Promise<Operation | undefined>;
  listPending(): Promise<readonly Operation[]>;
  create(intent: Intent): Promise<Operation>;
  saveSigned(attempt: SignedAttempt): Promise<Operation>;
  transition(id: string, expectedRevision: number, state: OperationState, reason?: string): Promise<Operation>;
  close(): Promise<void>;
}
export interface ProgramGateway {
  validateSigned(intent: Intent, attempt: SignedAttempt): Promise<void>;
  broadcast(attempt: SignedAttempt): Promise<string>;
  inspect(intent: Intent, attempt: SignedAttempt): Promise<ChainEvidence>;
}
export interface OperationRequest {
  fixtureId: string;
  kind: OperationKind;
  idempotencyKey: string;
  terms: Readonly<Record<string, string | boolean>>;
}
export interface PreparedOperation {
  operationId: string;
  messageBase64: string;
  messageHash: string;
  requiredSigners: readonly string[];
  blockhash: string;
  lastValidBlockHeight: string;
}
export interface SigningCoordinator {
  prepare(request: OperationRequest): Promise<PreparedOperation>;
  collect(operationId: string, wireBase64: string): Promise<{complete: boolean}>;
  getSigned(operationId: string): Promise<SignedAttempt>;
}
export interface PublicM1Status {
  mode: 'program-localnet' | 'program-devnet';
  genesis: string;
  program: string;
  lifecycle: 'uninitialized' | 'reserve_ready' | 'event_ready';
  reserve: string | null;
  event: string | null;
  slot: string | null;
  stale: boolean;
  spendableLamports: string | null;
  outstandingLamports: string | null;
  uncommittedLamports: string | null;
  eventPaidLamports: string | null;
  eventBudgetLamports: string | null;
  eventRemainingLamports: string | null;
  regularSlotsRemaining: string | null;
  reviewSlotsRemaining: string | null;
  verifiedFundingLamports: string | null;
  reconciliationDifferenceLamports: string | null;
  receipts: readonly {operationId: string; state: OperationState; signature?: string}[];
}
export interface M1Service {
  submit(attempt: SignedAttempt): Promise<Operation>;
  reconcile(operationId: string): Promise<Operation>;
  recoverPending(): Promise<void>;
}
```

Intent terms use exact allowlisted schemas per operation: initialize reviewer/primary/backup/verifier; fund donor/amount; activate eventId/area/grant/budget/hold; increase additional/additionalHold; bind token/area/reviewed/recipient; claim recipient. PDAs are derived server-side and compared with supplied references. Signer public keys and fee payer are committed by the prepared message, not chosen by a submit request.

## Preflight contract clarifications

The v02 design's Preflight clarifications section is binding for Tasks 3–6. Task 1 source reconciliation remains unchanged.

`fixtureId` selects a server-owned immutable synthetic fixture record; validate terms against it and include its identity and resolved addresses in the intent hash. Never infer an event/entitlement from recipient alone. Exclusive keys are kind plus target PDA for initialize/activate/bind/claim. Funding/increase keys include explicit immutable intent identity. Failed operations are retained for deliberate replacement rather than recreated.

ChainEvidence commitment is independent of outcome; a confirmed failure cannot authorize replacement. Implement `validatePartial` in the signing coordinator's adapter boundary separately from fully signed ProgramGateway validation. Durable attempt metadata includes creation time and previous-attempt linkage.

Add a CLI-only operator replacement helper in Task 4, with tests for finalized failure, reviewed expiry/no effect and rejected ambiguous/confirmed-only evidence. Record operator identity, reason and evidence before preparing a fresh unsigned attempt; retain old bytes and collect all signatures again. No HTTP replacement endpoint.

Task 5 must bind to 127.0.0.1, enforce exact Host/Origin, use a startup-generated random bearer token in a private session file, accept manual panel entry into memory only, and rotate on restart. No URL/browser storage/log token. Test missing/old credentials and nonloopback configuration rejection.

Status tests cover absent accounts as null and explicit lifecycle states; accounting fields use finalized state and attributable receipts. Test two fixtures with the same recipient, initialize replay, bind then claim, and partial collection after restart.

## Task 1: Preserve and reconcile sources; establish baseline

**Files:** Inspect both checkouts; create session `source_preservation_v01.zip`, `source_manifest_v01.json`, `baseline_checks_v01.txt`; integrate the seven existing session working-tree paths only after comparison; preserve eight canonical working-tree changes. Never modify historical archives.

**Interfaces:** Produces canonical source commit, manifest of preserved relative paths/hashes, coherent requirements links and redacted baseline logs. No runtime API.

- [ ] Enumerate tracked/untracked changes and current branches; archive exact bytes plus tracked patches and provenance. Verify archive entries/hashes before any checkout mutation.
- [ ] Compare incoming committed paths with local edits and compare README in three versions. Integrate compatible changes only. Recheck every preserved file hash; any unexplained difference fails the task.
- [ ] Resolve the session checkout as a frozen provenance snapshot after successful canonical reconciliation; do not delete or relink it.
- [ ] Run `npm ci` and the complete `npm run check` in a session-contained validation checkout with TMPDIR/cache paths in the session. Capture exit codes and postbuild output. Do not use the old 14-test result as evidence for this revision.
- [ ] Record exact native tool versions or their absence. Check official guidance and installed tool behavior; keep tool installation/cache/config isolated from user defaults. Produce a lockfile for the chain test package if it has none, then verify a clean `npm ci --prefix chain`.
- [ ] Review and commit only reconciled requirements/source changes on the development branch. Preserve original user edits outside the commit unless they are an explicitly reviewed part of reconciliation.

Acceptance: both sets of unique work survive; one canonical working source; complete fresh baseline result; a native-tool failure is recorded, not masked. Preservation and documentation tasks use hash checks rather than artificial unit tests.

## Task 2: Compile and prove the reserve invariants locally

**Files:** `chain/Anchor.toml`, `chain/Cargo.toml`, `chain/programs/relief_reserve/Cargo.toml`, `chain/programs/relief_reserve/src/lib.rs`, `chain/tests/reserve.ts`, new `chain/tests/reserve_negative.ts`, `chain/package.json`, `chain/package-lock.json`; runtime outputs under session `m1_runtime/`.

**Interfaces:** Existing program instructions initialize, create_event, increase_event, bind_entitlement, claim. Produces compiled binary, IDL, synchronized program public address and native test report.

- [ ] Run existing native tests/build first. For each demonstrated defect, isolate a failing test before changing source. Never change caps/roles to make a test pass.
- [ ] Generate isolated development program/signing keys without printing private bytes; synchronize public ID and use explicit local-validator configuration.
- [ ] Add fixture-independent negative cases for zero token, wrong reserve/event, cross-reserve event-ID isolation, concurrent claims, altered signed terms, both approval paths and rent/outstanding preservation.
- [ ] Assert exact state before/after rejected transactions, excluding external fee-payer charges. Preserve existing cap/underfunding/overflow coverage.
- [ ] Run `cargo test --manifest-path chain/Cargo.toml`, `npm run chain:build`, and `npm run chain:test` against a clean validator. Expected: all successful with separately recorded binary/IDL hashes. Build outputs remain session-contained through the isolated validation checkout.
- [ ] Review and commit targeted contract/test/config changes.

Required behavioral assertion (inside a fixture test, using local fixture values):

```ts
const results = await Promise.allSettled([claim(token), claim(token)]);
assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
assert.equal(await provider.connection.getBalance(recipient.publicKey), beforeRecipient + grant);
const after = await program.account.entitlement.fetch(entitlement(token));
assert.equal(after.consumed, true);
```

Also assert reserve delta `-grant`, event paid delta `+grant`, outstanding delta `-grant`, and untouched second-event commitment. Test helper signatures follow existing reserve.ts and are defined locally in each fixture; do not share mutable event state across unrelated negative tests.

## Task 3: Generate client and validate signed program transactions

**Files:** Create `shared/m1_types.ts`, `shared/generated/relief_reserve/`, `server/m1/program.ts`, `scripts/generate_m1_client.mjs`, `tests/m1_program.test.ts`; update exact-pinned generation dependencies in package/lock files.

**Interfaces:** Consumes Task 2 IDL; produces `ProgramGateway`, plus `createProgramGateway(config: {rpcUrl: string; genesis: string; program: string}): Promise<ProgramGateway>`. Preparation helpers remain adapter-local until used by Task 5. Export `validateIntent(intent: Intent): void` for strict schemas.

- [ ] Add failing tests rejecting wrong program, genesis, instruction, destination, amount, signer, fee payer and changed compiled message; reject malformed decimal lamports and over-u64 values.
- [ ] Generate the Kit client and validate regenerated output is byte-identical. Compare PDA derivation, decoded accounts and instruction bytes with the Anchor harness for all five program instructions.
- [ ] Implement validation, explicit network guard, allowlisted instructions and finalized effect inspection. Unknown transaction versions or undecodable accounts return errors/unknown evidence, never success.
- [ ] Run `node --import tsx --test tests/m1_program.test.ts` and `npm run typecheck`. Expected: all validation cases pass; generation is repeatable.
- [ ] Review and commit generated artifacts and their exact generator inputs/versions.

Required contract test using signed fixtures created by the test harness:

```ts
await assert.rejects(gateway.validateSigned(intent, changedRecipientAttempt));
await assert.rejects(gateway.validateSigned(intent, missingRecipientSignatureAttempt));
await assert.doesNotReject(() => gateway.validateSigned(intent, validAttempt));
```

## Task 4: Durable operations and recovery

**Files:** Create `server/m1/journal.ts`, `server/m1/service.ts`, `tests/m1_journal.test.ts`, `tests/m1_recovery.test.ts`.

**Interfaces:** Consumes shared contracts and ProgramGateway. Produces `openJournal(directory: string): Promise<OperationJournal>` and `createM1Service(journal: OperationJournal, gateway: ProgramGateway): M1Service`.

- [ ] Add failing tests for same-key/different-terms conflict, replay returning existing operation, write failure before submission, second writer, crash with trailing partial record and corruption inside a journal.
- [ ] Add recovery tests for landed transaction with dropped reply, restart after signed persistence/before send, timeout, finalized failure, stale account reads and consumed entitlement without attributable signature.
- [ ] Implement durable append/replay and revision-checked transitions; validate state transitions and immutable attempt identity. Preserve/quarantine incomplete final records; never reset a corrupt journal to empty.
- [ ] Implement save-before-send, deterministic signature matching and reconciliation. Broadcast a given attempt only after its durable acknowledgement. Return needs_review on ambiguous outcomes; no automatic new attempt or household token.
- [ ] Run `node --import tsx --test tests/m1_journal.test.ts tests/m1_recovery.test.ts`; expected all pass including child-process restart/failure injection. Run typecheck.
- [ ] Review and commit.

Required recovery assertion using a fake gateway with a lost response and finalized matched evidence:

```ts
await service.submit(attempt);
await journal.close();
const reopened = await openJournal(directory);
await createM1Service(reopened, gateway).recoverPending();
assert.equal((await reopened.get(attempt.operationId))?.state, 'finalized');
assert.equal(sentSignatures.size, 1);
assert.equal((await reopened.get(attempt.operationId))?.attempts.length, 1);
```

Required storage-failure assertion:

```ts
await assert.rejects(serviceWithFailingJournal.submit(attempt));
assert.equal(broadcastCalls, 0);
```

Test harness owns `directory`, signed fixtures and gateway counters. Each uses a fresh synthetic session-contained directory; fake evidence is explicitly not Devnet evidence.

## Task 5: Local API and technical wallet journey

**Files:** Create `server/m1/routes.ts`, `server/m1/signing.ts`, `server/m1/status.ts`, `server/m1/index.ts`, `src/m1_api.ts`, `src/m1_panel.ts`, `tests/m1_api.test.ts`, `tests/m1_wallet.test.ts`; modify `src/wallet.ts`, `src/technical.ts` and package scripts narrowly.

**Interfaces:** Consumes the shared contracts above. Produces:

```ts
export interface M1HttpDependencies {
  service: M1Service;
  journal: OperationJournal;
  signing: SigningCoordinator;
  readStatus(): Promise<PublicM1Status>;
}
export function createM1App(deps: M1HttpDependencies): import('node:http').Server;
```

`server/m1/signing.ts` implements SigningCoordinator using the generated instruction builders and fixed runtime role configuration. It stores prepared message metadata and partial signatures in session-contained durable records keyed by operation/message hash, before acknowledging collection. Validate the existing operation intent through the journal on every load. Partial collections are never broadcast; expiry discards their usability, preserves their record and requires fresh signatures. `getSigned` rejects incomplete, expired or changed messages. The submit route obtains the attempt from `getSigned`, then calls service.submit. `server/m1/status.ts` projects finalized owned-account data plus sanitized journal receipts as PublicM1Status. The entry point constructs these dependencies explicitly; no route reconstructs an arbitrary transaction from unchecked caller bytes.

HTTP contract:
- GET `/api/m1/status`: network/mode, public addresses, slot, decimal-string balances and receipt states only.
- POST `/api/m1/operations`: allowlisted typed intent plus idempotency key → operation ID and immutable prepared message, required signers, blockhash lifetime. Creation is serialized per exclusive operation key.
- POST `/api/m1/operations/:id/signatures`: signed bytes → validated signature collection; reject mismatched message or missing authority. Never broadcast from this endpoint.
- POST `/api/m1/operations/:id/submit`: fully collected signed attempt → persisted operation state and signature.
- GET `/api/m1/operations/:id`: sanitized state; never return signed bytes or private fixture mappings.
- POST `/api/m1/operations/:id/reconcile`: operation state after signature/account inspection.

Browser export: `signM1Transaction(message: Uint8Array, expectedAccount: string): Promise<Uint8Array>`. It requires a selected signTransaction-capable Devnet wallet and rejects account/network changes. Legacy donate remains separate.

- [ ] Add failing API tests for untrusted Host/Origin, missing session token, extra fields, oversized payload, invalid operation terms, conflicting idempotency key and arbitrary signed transaction injection.
- [ ] Add wallet tests for sign-only, refusal, account switch, unsupported feature and changed returned message. Spy on network sends to prove signing alone does not submit.
- [ ] Implement the M1 routes and explicit entry point, startup recovery and live-state technical panel. Require all monetary routes to use the M1 service; do not reuse legacy payout shortcuts.
- [ ] Run `node --import tsx --test tests/m1_api.test.ts tests/m1_wallet.test.ts`, typecheck and both full builds; inspect bundle/public output for private state and regressions.
- [ ] Drive a local browser journey: prepare, sign, submit, refresh, reconcile, reject a second claim. Keep real-wallet verification separate from a browser wallet mock.
- [ ] Review and commit.

Required wallet check:

```ts
const signed = await signM1Transaction(message, recipientAddress);
assert.deepEqual(decodedMessage(signed), message);
assert.equal(signAndSendCalls, 0);
```

Task 5 tests must restart the signing coordinator between partial signatures and reject altered intent/message hashes. No production auth behavior may be inferred from the localhost token.

## Task 6: Devnet proof and release evidence

**Files:** Create `scripts/m1_smoke.ts`, `tests/m1_smoke.test.ts`; session outputs `m1_evidence_v01.md`, `m1_receipts_v01.json` and redacted command/browser logs. Promote reviewed evidence as a numbered document only after approval.

**Interfaces:** Consumes compiled binary/IDL, generated client, durable service, synthetic fixture manifest and explicit Devnet configuration. Produces a reproducible evidence manifest containing source commit, hashes, toolchain, public addresses, upgrade authority, deployment and operation signatures, finalized slots and state assertions. No secrets or signed wire payloads in shareable evidence.

- [ ] Add a failing smoke-manifest test rejecting missing signatures, confirmed-only evidence, inconsistent program/hash/network, missing negative-test results or private-key fields.
- [ ] Verify all prior tasks and local-validator tests; review exact deployment configuration and source revision. Never use an unreviewed build or default user signer.
- [ ] Deploy to Devnet only; record genesis and upgrade authority. If funding/RPC is unavailable, retain failure evidence and leave this task incomplete.
- [ ] Execute reserve initialization, donor funding, dual-role activation, fixture binding and recipient-signed claim; finalize each and assert exact amounts/state.
- [ ] Exercise Devnet duplicate rejection and wrong-recipient rejection against that same reserve/program. Reuse the local full negative matrix; distinguish where each case ran.
- [ ] Demonstrate actual browser donor and recipient wallet flow, plus refresh/recovery; record unsupported or unavailable real-wallet evidence honestly.
- [ ] Run complete application checks and native suites against the intended release source; have an independent review before any merge. Review and commit only redacted approved evidence/source to the development branch.

Manifest acceptance test:

```ts
assert.throws(() => validateEvidence({...validEvidence, commitment: 'confirmed'}));
assert.throws(() => validateEvidence({...validEvidence, genesis: 'wrong-network'}));
assert.doesNotThrow(() => validateEvidence(validEvidence));
```

`validateEvidence(value: unknown): void` belongs to scripts/m1_smoke.ts and is exported for tests; the file must not execute remote transactions when imported.

## Sequencing and design work

Order: Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6. Source preservation precedes all code edits. Task 2 toolchain work may reveal a bounded compatibility correction; document it before changing version families.

After design/task review, landing-page briefing and concepts can begin alongside M1 execution. Use the existing approved identity, clearly labelled country readiness and honest prototype status. Do not publish a redesign or connect it to invented balances. M2 brings persistent hosted backend and staff/donor interfaces; M3 brings native mobile; M4 brings allowance/payment-provider enforcement. Those milestones receive separate designs.

## Self-review and execution status

At v02 preparation Task 1 is in progress; Tasks 2–6 remain pending. No native tests, generation, wallet signing or Devnet transactions were executed while writing this plan. The technical specification is complete as a design proposal. Self-review checked requirement coverage, named shared interfaces, source preservation, recovery ambiguity, privacy and the Model B boundary. Technical dependency compatibility and toolchain execution remain explicit Task 1–3 validations. No implementation skill has been launched.
