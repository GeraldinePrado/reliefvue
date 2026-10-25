# ReliefVue reserve program — local native proof

This is a separate Anchor workspace. The current ReliefVue app does **not** use this program. It remains in its labelled server-enforced or static rehearsal mode. On 2026-10-25, the program compiled to SBF, generated its IDL and passed four Rust unit tests plus eleven instruction tests on a fresh local Agave 2.3.0 validator. It has not been deployed to Devnet or integrated into the application.

## Contract

All aid is native test SOL. Initialize a reserve PDA namespaced by the reviewer key; reviewer, primary and backup all sign initialization, and all three keys must differ. There is no role replacement, reserve reset, account close, general withdrawal, cancellation, or inactivity clawback instruction. Event creation requires reviewer plus primary **or** backup signatures in one transaction, making creation the activation boundary. Forecast/impact assessment happens outside the program.

The event stores an opaque ID, area commitment, immutable grant, budget and review allocation. Additive budget/hold increases require both approval roles. All unpaid event budgets are committed globally; creation and increases check the balance after rent and all previous commitments. Donation is a normal System Program transfer to the reserve PDA, with receipt validation performed separately.

A configured verifier binds an opaque random event household token, area commitment, recipient and fixed grant once. Bindings immediately consume a regular or reviewed allocation slot. Regular allocations cannot use the review hold. Reviewed bindings consume the hold after human review. This demo does not expire or release holds, cancel entitlements, replace recipients, or reclaim payments. Consequently an abandoned binding stays committed indefinitely. Claims require the bound recipient signature and atomically consume the entitlement, debit the grant and reduce global unpaid commitments. All PDA relationships and role identities are checked. No instruction can shrink immutable liabilities.

One public household token represents one verified household for this event. Never derive it directly from a name, address or other low-entropy identifier. The verifier must keep private deduplication and unit/residence evidence off chain. Different tokens can represent the same real household if the verifier cheats. A compromised verifier can invent eligibility or label a household reviewed; the program cannot verify residence, flooding, observation evidence, queue order, or human decisions. The off-chain verifier is an explicitly trusted oracle. Human review completion and complete-claim queue ordering are application responsibilities.

The program upgrade authority can replace all these rules. It is not decentralized or audited custody. Record its identity and check it with 'solana program show' before each demo. A separate reserve namespace can be created with other roles: the app must pin the intended reserve and program addresses and never select them by a public label alone. Rent and transaction/account-creation fees are separately funded.

## Native local setup

Node >=22.12, host Rust 1.89.0, Anchor CLI/crate/test SDK 0.32.1 and Agave/Solana 2.3.0 are the tested baseline. `Cargo.lock` and `package-lock.json` pin the resolved dependencies; Anchor's transitive macro crates resolve to 0.32.2 under its published dependency ranges. Do not update them silently.

Agave 2.3.0 bundles platform-tools v1.48 (Rust 1.84), which cannot build this Rust >=1.89 program and its locked edition-2024 dependencies. `Cargo.toml` therefore selects the official platform-tools v1.52 release (SBF Rust 1.89.0-dev). This is a compiler compatibility correction, with no change to the validator version or contract rules.

All local keys, toolchains, caches, logs, ledger and build outputs live in the active session's `m1_runtime/` verification checkout. The canonical repository remains the source. The current development public program address is `BUJsC4HatdecjXB5YnpHU55SL3wr74Wbh1mgzkZXG4pL`; it matches `declare_id!`, both Anchor cluster entries, the generated IDL and the isolated program keypair. Preserve existing keys. A fresh machine must either securely receive that development key or generate a separate development key and explicitly synchronize all public addresses. Private bytes never belong in Git or browser code.

For an isolated repeat, set `CARGO_HOME` to the runtime's `cargo/`, `RUSTUP_HOME` to its `rust/`, and put its `bin/`, `cargo/bin/` and `solana-release/bin/` before the normal PATH. Install host Rust 1.89.0 into that isolated home and extract the official Agave 2.3.0 and platform-tools v1.52 archives there. Keep the npm cache and generated Node cache inside the session as well.

Agave's SDK post-build `scripts/strip.sh` sources `env.sh`, which independently invokes `scripts/install.sh` even when cargo-build-sbf has `--skip-tools-install`. In the isolated SDK only, change that installer’s platform-tools version from v1.48 to v1.52 and its `cache_root` to the session cache. Extract v1.52 at `solana-release/bin/platform-tools-sdk/sbf/dependencies/platform-tools/` and create its `platform-tools-v1.52.md` installation marker. Install Criterion in that SDK's `dependencies/criterion/` with the matching `criterion-v2.3.2.md` marker on Intel macOS. These markers prevent redundant helper downloads after verified extraction.

The runtime `bin/cargo-build-sbf` wrapper executes the absolute Agave binary with its original arguments plus `--skip-tools-install`. Use this wrapper only for the isolated, manually installed SDK. Do not pass that flag through `anchor build -- ...`: Anchor also forwards it to the IDL's host `cargo test`, which rejects it.

Run from the runtime verification checkout root:

```sh
cargo test --manifest-path chain/Cargo.toml
npm run chain:build
npm --prefix chain run typecheck
npm run chain:test
```

`Anchor.toml` explicitly selects Localnet, 127.0.0.1:8899 and the session payer key. The final command starts a fresh local validator, loads the actual SBF binary and executes real instructions. It must never target Devnet. Provider transaction fees are excluded from exact program/recipient state assertions. Tests use only synthetic identifiers and native test SOL.

The detailed commands, failures, correction evidence, release archive hashes and separate binary/IDL hashes are recorded in `3-sessions/2026-10-24_reliefvue_development/task_02_report_v01.md` at workspace level. Official tool sources are the Anchor 0.32.1 release and anza-xyz Agave/platform-tools GitHub releases.

## Devnet deployment and application integration

After local tests pass:

    solana airdrop 2 --url devnet
    anchor deploy --provider.cluster devnet
    solana program show <ACTUAL_PROGRAM_ID> --url devnet

Record the deploy transaction, program ID and upgrade authority. Initialize the intended reserve with three distinct controlled role keypairs and the approved verifier, then fund the reserve by a System Program transfer. The tests show exact instruction account bindings; use the generated target/idl/relief_reserve.json and target/types/relief_reserve.ts in a reviewed client adapter. Never copy signer private keys into the browser.

Before enabling program mode, run a reviewed Devnet smoke script using that IDL: initialize roles, donate, jointly activate the 10,000,000-lamport grant / 50,000,000 budget / 10,000,000 review-hold fixture, bind a synthetic recipient and confirm its signed claim. Capture its signature and recipient balance. Then attempt duplicate claim, recipient substitution and over-budget allocation against the **same program and reserve**, verify rejected transactions/account state, and link confirmed Explorer receipts with ?cluster=devnet. Wire the app's status to program account reads and confirmed signatures; an app button alone is no proof of chain enforcement. No ready Devnet smoke script or frontend integration is included in this workspace.

## Verification status

Local native verification passed on 2026-10-25: four Rust unit tests, SBF build plus generated IDL, chain TypeScript check and eleven real local-validator integration tests. The original Windows inability to compile has been resolved for the tested Intel macOS environment; other host architectures still require their own native run.

The build emits Anchor macro cfg warnings and an Agave postprocessor warning listing syscall names as unknown. These warnings were retained. Real local instruction execution exercised PDA derivation, System Program account creation, rent reads and native payouts successfully. This evidence is limited to the tested binary, toolchain and Agave 2.3.0 validator; it does not establish compatibility with another deployment environment.

The suite covers collapsed/reinitialized roles, wrong/missing approval signatures, both approval paths, event replay, prior commitments, funded additive increases, verifier impersonation, wrong area, recipient substitution, zero/duplicate household tokens, duplicate/concurrent claims, cross-reserve/event isolation, altered signed terms, regular/review caps and rent/outstanding preservation. Rejected attempts assert exact account state rollback excluding external fee-payer charges. A concurrent race uses distinct transaction messages and proves exactly one payout while preserving the other event's commitment.

Devnet deployment, smoke evidence and application integration remain outstanding. This is direct native-SOL grant enforcement, not Model B spending enforcement. Production governance, custody and privacy work remain outside the proof.
