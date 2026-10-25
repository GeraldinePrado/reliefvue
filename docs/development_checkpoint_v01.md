# ReliefVue development checkpoint v01

Recorded 25 October 2026. Shared client/colleague project. Development branch: `codex/reliefvue-mvp`.

## Task 2: native local reserve proof

Implementation and independent review complete in source commit `8e768cb` (base `e233d7c`). This checkpoint accompanies the development-branch update. The local session ledger records the confirmed remote commit after push; no main merge or Devnet deployment is included.

## Steps performed and implemented

1. Resumed the existing contract work and isolated toolchain without repeating source reconciliation.
2. Corrected the chain rejection-helper TypeScript overload and synchronized the development program public ID.
3. Locked native dependencies and configured the compatible SBF compiler. Documented the separate Agave post-build installer correction and isolated build wrapper.
4. Added independent negative fixtures for zero tokens, wrong reserve/event, cross-reserve event IDs, primary/backup approvals, immutable signed terms and concurrent claims.
5. Verified rejected transactions preserve program state and balances. Verified concurrent claims pay exactly once, consume the entitlement, update reserve/event/outstanding amounts exactly and preserve the other event's commitment.
6. Built the actual program and interface, ran a fresh local validator, and obtained independent review approval with no Critical or Important findings.
7. Recorded the standing checkpoint workflow and corrected the README's outdated uncompiled status. All eight pre-existing brandbook/pitch working-file hashes remain unchanged and outside these commits.

## Verification

Commands ran in the active session's isolated runtime against chain inputs matching canonical source.

| Command | Result |
| --- | --- |
| `cargo test --manifest-path chain/Cargo.toml` | Exit 0; 4 tests passed |
| `npm run chain:build` | Exit 0; SBF binary and generated IDL produced |
| `npm --prefix chain run typecheck` | Exit 0 |
| `npm run chain:test` | Exit 0; 11 integration tests passed on a fresh Agave 2.3.0 validator |
| Independent task review | APPROVED; no blocking findings |

No prek configuration exists; no prek verdict is claimed. Public application checks were not rerun for this chain-only change; Task 1 previously recorded 14 application tests and both builds passing.

Binary SHA-256: `f4dfad52465fa4f86165444772699ee281c62dfaa301c266a00ebcdc29229a7c`.

IDL SHA-256: `e10d7b73db230029511d6e9e0f26ae42a4c120a874dfa4eeeefa72f0c7d51df6`.

Local evidence: `3-sessions/2026-10-24_reliefvue_development/task_02_report_v01.md`, `task_02_review_result_v01.md` and `m1_runtime/logs/`. Compiler/build archives, keys and private runtime data are not GitHub deliverables. Reproduction instructions are in [chain README](../chain/README.md).

## Remaining limitations

- Anchor macro cfg warnings and Agave's unknown-syscall diagnostic remain visible. The tested local paths passed; investigate or document the diagnostic before claiming another deployment environment is compatible.
- Earlier dependency security advisories remain tracked for disposition before deployment.
- Devnet deployment, generated application client, durable transaction recovery and browser wallet flow are not implemented by this task.
- The public app remains a simulation. No real funds or identity data were used, and direct SOL payouts do not enforce the planned allowance-spending rules.

## Next: Task 3

Generate the application client from the verified IDL; validate program/network, accounts, amounts, signers, fee payer and complete signed messages. Prove generated output is repeatable and matches the Anchor harness for instruction encoding, account decoding and PDA derivation.

Then continue in order: Task 4 durable operations/recovery, Task 5 API/wallet journey, Task 6 Devnet proof. Follow the [implementation plan](m1_implementation_plan_v02.md) and [checkpoint workflow](checkpoint_workflow_v01.md).
