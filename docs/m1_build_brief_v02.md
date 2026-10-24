# ReliefVue M1 Devnet engineering brief v02

Date: 2026-10-24. Status: reconciled engineering requirements, not an executed sprint or approved implementation design.
Companion: [PRD v0.4](prd_v04.md). Source: supplied M1 brief, corrected for native SOL, proof boundaries and review findings.

## Goal and mandatory proof

Preserve the public simulated demo while proving an actual program-controlled Devnet flow: funding → independently authorized event → synthetic household entitlement → designated recipient-signed claim → confirmed test-SOL transfer. A simulation cannot substitute for this proof.

A synthetic jurisdiction/area and fixed test amount are sufficient. Neither Thailand launch selection nor a live grant price is required. PromptPay, USDC, real identity data, merchants and production custody are outside this milestone.

## Baseline and sequence

1. Review existing contract, tests, server transport/policy/store and technical UI against this brief. Record the architecture gap to future Model B without implementing it.
2. Verify the exact branch revision and preserve unrelated work. Run clean dependency installation and full application checks with command logs; previous local checks are not evidence for this branch.
3. Verify repository-pinned Rust/Anchor/Solana versions against official compatibility guidance. Record versions and verify the Devnet genesis hash before any remote transaction.
4. Compile the existing program and correct demonstrated errors without relaxing signer, cap, recipient or commitment checks.
5. Generate isolated development program/signing keys; synchronize program ID, Anchor cluster entries, IDL and client. Never expose key material in logs, commits or public evidence.
6. Run native helper and clean local-validator tests; extend negative coverage below.
7. Deploy only to Devnet after local tests pass. Record program ID, upgrade authority, deployment signature, exact source commit and binary/IDL hashes.
8. Initialize synthetic roles/reserve, fund with test SOL, authorize event, bind recipient and execute recipient-signed claim. Assert balances and account state from the chain.
9. Use the generated IDL for a bounded client adapter. Technical UI reads actual program state/receipts. Keep public simulation data separate and labelled.
10. Document restart/RPC recovery and reproducible smoke tests. Push reviewed commits/evidence to the development branch; do not merge main automatically.

## Existing contract invariants to preserve and verify

- Reserve is namespaced by reviewer; reviewer, primary and backup must be distinct and sign initialization. Use a separate synthetic verifier key even though current code only requires verifier nonzero; do not claim full role separation is enforced by that check.
- Event creation is activation. Reviewer plus primary OR backup sign the same transaction containing reserve, event ID, area commitment, grant, budget and review hold. The client must reject altered terms between signatures.
- No country registry, policy-version field or entitlement expiry exists in the current on-chain schema. Bind synthetic policy/fixture provenance in the evidence manifest; production on-chain extensions need separate design.
- Event grant and area are immutable. Both roles may add funded allocation; they cannot shrink commitments.
- At creation/increase, reserve outstanding grows by the authorized budget/increase. Entitlement binding consumes an event allocation slot but does not add that liability again. Claim reduces outstanding by exactly the grant. Rent and every other event's commitments remain covered.
- Regular allocations cannot consume the review hold. Reviewed allocations require the configured verifier; this is a trust boundary, not evidence of real human case review.
- Entitlement PDA binds event plus nonzero opaque household token. Recipient and grant are fixed. Only the bound recipient may consume it once.
- The verifier owns the fixture mapping of one household to one event token. Multiple tokens for one real household remain an off-chain verification risk.
- Area enforcement compares commitments; it does not geolocate a person or validate a disaster.
- No cancellation, expiry, closure, role rotation, emergency pause or unspent-budget release is implemented in this source. Preserve commitments; do not silently invent release paths. Production lifecycle/upgrade governance is a separate decision.

## Native-SOL assertions and negative tests

Use lamports, not token-mint tests. Identify fee payer and account-rent payer so recipient balance increases exactly by the grant when its fees are paid separately. Assert reserve delta, rent floor, event paid amount, consumed entitlement and aggregate outstanding.

Reject missing/wrong/collapsed approval roles, altered signed terms, unauthorized verifier, wrong area commitment, wrong reserve/event relationship, zero/duplicate token, substituted recipient and second claim. Test reused event IDs within one reserve and isolation across distinct reserves.

Test two events competing for the same uncommitted funds, regular/review allocation caps, underfunding, arithmetic limits and concurrent claims. Rejected transactions must leave program state unchanged, allowing for transaction fees charged outside the reserve.

## Transaction identity and recovery requirements

Persist intended operation identity and signed transaction signature before submission. Rebroadcasting identical signed bytes is distinct from constructing a replacement. On timeout, query that signature and relevant program accounts; do not infer failure from missing application response.

For reproducible M1 exit evidence require finalized successful transactions and finalized account assertions; intermediate confirmed status may be displayed explicitly as confirmed. Test timeout after a transaction actually lands, process restart, stale reads, dropped response and expired blockhash. Before replacement, reconcile consumed entitlement and original signature at the required commitment; ambiguous outcomes require manual review. Never issue a fresh household token as a retry strategy.

## Evidence and exit criteria

Provide redacted command logs, dependency/tool versions, code revision, binary/IDL hashes, cluster/program/reserve/role public addresses, transaction signatures, Explorer links and balance/state assertions. Record the development upgrade authority's ability to replace logic; do not claim immutable or audited custody.

Native build/tests, confirmed funding/activation/binding/claim, finalized assertions and negative tests must all pass. Public simulation remains functional. No production/user keys, mainnet funds, live identities or merchant funds are handled. Isolated Devnet development keys are necessary and remain private.

Independent review precedes merge. Full M1 design and task plan must be reviewed before implementation; this brief does not authorize changing product policies to make tests pass.
