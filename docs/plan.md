# ReliefVue stack and Devnet safeguards implementation plan

> For agentic workers: use mri-code-implement for independent tasks and mri-code-tdd for behavior changes. Geraldine authorized this implementation and stack assessment on 2026-10-04.

**Goal:** Correct the Windows/Mac stack, implement a typed and tested local relief flow, and prepare the reserve program for native validation.

**Architecture:** Retain Vite and CSS. Split TypeScript browser, policy, persistence, and Solana adapters; add an Anchor reserve with separate verification evidence.

**Tech stack:** Node >=22.12, Vite 7, TypeScript 5.9, tsx, Solana Kit, Wallet Standard, Rust/Anchor.

## Status and scope

This is the record of the stack upgrade already performed, not an instruction to build the full platform next. Native program validation is deferred as an optional hackathon proof; production tasks belong to a funded phase. [submission-scope.md](submission-scope.md) is the current task order. Completed checkboxes describe prototype work only.

## Global Constraints

- Devnet test SOL, fictional evidence, synthetic households only.
- A paid grant is never reclaimed for inactivity.
- Fixed demo grant 10,000,000 lamports; demo event budget 50,000,000; review hold 10,000,000.
- No real baht estimate, KYC, custody, or staff-recovery promise.
- No private keys, personal data, node_modules, build artifacts, or captures in Git or shared source archives.
- Report program source, compiled program, deployed program, and confirmed receipts separately.

## Tasks

### 1. Policy and payment-intent contract

Files: shared types/fixtures, server policy/store, policy tests.

Interfaces: Event, Household, PaymentIntent, PublicStatus; policy uses integer lamports and complete-claim timestamps. `prepareClaim` validates and reserves; `recordSubmitted` binds signature; `recordConfirmed` adds paid total; unresolved submissions stay blocked.

- [x] Write failing tests for Watching, two approvals, duplicate household, distinct units, waiting review, hold accounting, and concurrent/restarted intent.
- [x] Run `npm test` and observe required failures.
- [x] Implement deterministic policy and ignored atomic state storage.
- [x] Run tests; no fresh payment can be issued for an unresolved intent.

Contract example:
```ts
assert.throws(() => prepareClaim(watchingState, 'unit-a'), /not active/i);
assert.equal(prepareClaim(activeState, 'unit-a').amountLamports, 10_000_000);
assert.throws(() => prepareClaim(activeState, 'duplicate-a'), /household/i);
```

### 2. Typed stack, RPC and local API

Files: package.json/lock, tsconfig, vite config, shared RPC adapter, server entry/store/API tests.

- [x] Replace legacy SDK with Solana Kit and System Program client; move Vite/TypeScript to devDependencies.
- [x] Add cross-platform build:web, typecheck, test, and check scripts.
- [x] Reject wrong RPC network, unsafe mutations, oversized or invalid requests.
- [x] Persist recipient demo recovery material server-side if created; never represent it as production custody.
- [x] Record signed transaction intent before network submission/confirmation; serialize reservations.
- [x] Verify typecheck, tests, and dependency audit.

### 3. Browser migration

Files: src browser modules, index.html, existing CSS, browser SDK adapter.

- [x] Preserve donor/recipient/activity flow and migrate to strict TypeScript.
- [x] Use Wallet Standard bytes and Devnet chain instead of obsolete injected wallet assumptions.
- [x] Add Watching, review, primary/backup approval, and human-review queue controls for synthetic fixtures.
- [x] Clearly label local server enforcement and static public simulation.
- [x] Confirm builds and desktop/mobile UI operation.

### 4. Reserve program

Files: Anchor workspace/program, native tests, program handoff.

- [x] Implement two independent approvals, no general withdrawal, budget commitments, review hold, opaque household entitlements, and recipient-bound once-only claim.
- [x] Add tests for failed signers, repeat claim, changed recipient, caps, and previous commitments.
- [ ] Deferred optional proof: build/test with supported native toolchain when available; otherwise record exact absent toolchain and preserve source as unverified.
- [x] Do not enable program mode without a compiled/deployed IDL and observed successful integration tests.

### 5. Verification and handoff

- [x] Reconcile latest product locks in brief/progress and update README/run commands.
- [x] Run typecheck/tests/both builds, inspect public bundle and staged files for secrets.
- [x] Review complete change, record tests and remaining chain verification in developer handoff.
- [x] Commit only reviewed project files; push under Geraldine's existing backup authorization.
- [x] Update Drive source/docs and verify readback; Mac local download remains unverified until checked.
