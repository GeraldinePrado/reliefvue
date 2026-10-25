# ReliefVue checkpoint workflow

Geraldine's standing project instruction, recorded 25 October 2026.

Whenever Geraldine asks about ReliefVue, inspect the latest development checkpoint and working-tree state before answering. Report what was actually implemented, what was verified, what remains incomplete, and the next task in sequence. Distinguish earlier recorded work from actions performed in the current turn.

Execute the approved implementation plan one task at a time. Verify and independently review each task before marking it complete. Preserve existing user changes and the approved public simulation and identity.

After each task, commit scoped source changes and a numbered checkpoint, then push to `origin/codex/reliefvue-mvp`. Confirm the remote branch contains the commit before reporting a successful push. If implementation, verification, review or push fails, record the exact incomplete stage and next action; do not claim completion. Do not force-push or merge into main under this instruction.

Each checkpoint records:

1. Task and status.
2. Steps performed and behavior implemented.
3. Fresh verification commands and results, with evidence locations.
4. Remaining defects, blockers and relevant limitations.
5. Source commit and branch publication status.
6. The next task and its acceptance evidence.

Keep numbered checkpoints in `docs/development_checkpoint_vNN.md`, preserving previous versions. Update the repository README to point to the newest checkpoint and append the execution result to the active session ledger. Session logs, keys and intermediate test artifacts remain in `3-sessions/2026-10-24_reliefvue_development/`; never publish keys or private transaction payloads.

Current sequence: source reconciliation (complete), local reserve proof (Task 2), generated client (Task 3), durable operations/recovery (Task 4), API/wallet journey (Task 5), Devnet proof/evidence (Task 6). See [implementation plan](m1_implementation_plan_v02.md).

Ownership remains shared client/colleague. GitHub development-branch updates are authorized; Drive sync and production deployment are not included.
