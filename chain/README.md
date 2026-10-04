# ReliefVue reserve program — uncompiled source

This is a separate Anchor workspace. The current ReliefVue app does **not** use this program. It remains in its labelled server-enforced or static rehearsal mode. No binary, generated IDL, deployment, or native passing test evidence exists for this source on 2026-10-04.

## Contract

All aid is native test SOL. Initialize a reserve PDA namespaced by the reviewer key; reviewer, primary and backup all sign initialization, and all three keys must differ. There is no role replacement, reserve reset, account close, general withdrawal, cancellation, or inactivity clawback instruction. Event creation requires reviewer plus primary **or** backup signatures in one transaction, making creation the activation boundary. Forecast/impact assessment happens outside the program.

The event stores an opaque ID, area commitment, immutable grant, budget and review allocation. Additive budget/hold increases require both approval roles. All unpaid event budgets are committed globally; creation and increases check the balance after rent and all previous commitments. Donation is a normal System Program transfer to the reserve PDA, with receipt validation performed separately.

A configured verifier binds an opaque random event household token, area commitment, recipient and fixed grant once. Bindings immediately consume a regular or reviewed allocation slot. Regular allocations cannot use the review hold. Reviewed bindings consume the hold after human review. This demo does not expire or release holds, cancel entitlements, replace recipients, or reclaim payments. Consequently an abandoned binding stays committed indefinitely. Claims require the bound recipient signature and atomically consume the entitlement, debit the grant and reduce global unpaid commitments. All PDA relationships and role identities are checked. No instruction can shrink immutable liabilities.

One public household token represents one verified household for this event. Never derive it directly from a name, address or other low-entropy identifier. The verifier must keep private deduplication and unit/residence evidence off chain. Different tokens can represent the same real household if the verifier cheats. A compromised verifier can invent eligibility or label a household reviewed; the program cannot verify residence, flooding, observation evidence, queue order, or human decisions. The off-chain verifier is an explicitly trusted oracle. Human review completion and complete-claim queue ordering are application responsibilities.

The program upgrade authority can replace all these rules. It is not decentralized or audited custody. Record its identity and check it with 'solana program show' before each demo. A separate reserve namespace can be created with other roles: the app must pin the intended reserve and program addresses and never select them by a public label alone. Rent and transaction/account-creation fees are separately funded.

## Native setup on Mac/Linux

Use a dedicated Devnet-only funded test wallet and synthetic keys. Do not put generated wallet files or target artifacts into source archives. Node >=22.12, Rust >=1.89, Anchor 0.32.1 and Agave/Solana 2.3.0 are the pinned baseline. Official sources:
- https://www.anchor-lang.com/docs/updates/release-notes/0-32-1
- https://www.anchor-lang.com/docs/updates/release-notes/0-32-0
- https://www.anchor-lang.com/docs/installation

Install the supported tools using official installation guidance. The version selection commands after Rust/AVM are installed are:

    rustup update stable
    avm install 0.32.1
    avm use 0.32.1
    sh -c "$(curl -sSfL https://release.anza.xyz/v2.3.0/install)"
    rustc --version
    anchor --version
    solana --version

Inside this chain directory:

    npm install
    solana-keygen new --outfile ~/.config/solana/reliefvue-devnet.json
    solana config set --url devnet --keypair ~/.config/solana/reliefvue-devnet.json
    solana genesis-hash --url devnet

Verify the known Devnet genesis hash EtWTRABZaYq6iMfeYKouRu166VU2xqa1 against official network documentation. Stop on another network. Set Anchor.toml provider.wallet to that full wallet path (the default id.json above is only a template). The source program address is a placeholder. Generate a real program keypair, synchronize all declare_id/Anchor.toml addresses, then build:

    anchor keys list
    anchor keys sync
    anchor build
    cargo test -p relief_reserve
    npm run typecheck
    anchor test

'anchor build' generates target/deploy/relief_reserve-keypair.json on a clean workspace; run 'anchor keys sync' and rebuild after the first build if no program keypair existed before the keys commands. Confirm the source and both cluster entries match the generated keypair address. 'anchor test' uses a fresh local validator and performs actual program instruction tests. It intentionally does not run against Devnet: synthetic signers are funded locally from the provider; creating and running these fixtures remotely incurs test-SOL usage. Preserve command output, versions, generated IDL hash and binary hash in the handoff. Generate and commit the npm/Cargo lockfiles after the first successful supported build; this Windows staging source has no fabricated lockfile.

## Devnet deployment and application integration

After local tests pass:

    solana airdrop 2 --url devnet
    anchor deploy --provider.cluster devnet
    solana program show <ACTUAL_PROGRAM_ID> --url devnet

Record the deploy transaction, program ID and upgrade authority. Initialize the intended reserve with three distinct controlled role keypairs and the approved verifier, then fund the reserve by a System Program transfer. The tests show exact instruction account bindings; use the generated target/idl/relief_reserve.json and target/types/relief_reserve.ts in a reviewed client adapter. Never copy signer private keys into the browser.

Before enabling program mode, run a reviewed Devnet smoke script using that IDL: initialize roles, donate, jointly activate the 10,000,000-lamport grant / 50,000,000 budget / 10,000,000 review-hold fixture, bind a synthetic recipient and confirm its signed claim. Capture its signature and recipient balance. Then attempt duplicate claim, recipient substitution and over-budget allocation against the **same program and reserve**, verify rejected transactions/account state, and link confirmed Explorer receipts with ?cluster=devnet. Wire the app's status to program account reads and confirmed signatures; an app button alone is no proof of chain enforcement. No ready Devnet smoke script or frontend integration is included in this workspace.

## Verification status

Windows checks found no cargo, rustc, solana or anchor commands; ~/.cargo/bin/cargo.exe was absent. wsl.exe exists but reports WSL is not installed; Docker was not found. No meaningful native/SBF compilation method was available, and no OS tools were installed. Rust helper tests and Mocha integration tests are authored contracts, **not executed tests**. Source macros, IDL generation, TypeScript client API and SBF compilation require supported native validation before this is represented as working.

Native suite covers collapsed/reinitialized roles, wrong/missing approval signature, backup activation, event replay, prior commitments, funded additive increases, verifier impersonation, wrong area, recipient substitution, duplicate household token, duplicate claim, regular/review caps and rent preservation. It uses the provider as fee payer so recipient balance assertions isolate the grant. More adversarial review and production governance/custody/privacy work remain mandatory before real funds.
