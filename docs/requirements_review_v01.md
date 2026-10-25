# Requirements review and resolutions v01

Date: 2026-10-24. Method: mri-code-adversarial-review in an independent review context, followed by source inspection. This is a document review, not a security audit.

## Source provenance and preservation

- Supplied Network PRD v0.3: SHA-256 09460a0a7b77f47499a17a52b8a1abfbafbf48adcfa36fd7d02a4c49fde04e16.
- Supplied pasted PRD v0.3: SHA-256 810eec3961cbc6128463051eeaa27d9d0a53420cf0e20db3c4376c9e45724dac.
- Supplied M1 build brief: SHA-256 44fa1e7d43e71ca10783f9ebe3e2a548b1861255dcbffb17168c8f501139b1f7.

The original attachments are preserved. PRD v0.4 retains the pasted narrative, changes its version/status, adds authority and an integration annex, and incorporates controls from the detailed PRD. Historical repository documents remain intact. Personal operating/legal questions remain in the supplied source and the private decision process; public development docs do not select an operator or make legal determinations.

The earlier assistant-created Thailand-first candidate is rejected as a baseline. User correction establishes Southeast Asia country-by-country operation and Model B allowances. User additionally requested PromptPay feasibility and ongoing branch commits.

## Findings and disposition

| Finding | Resolution or next decision |
| --- | --- |
| M1 allowed a simulated settlement instead of actual claim | Brief v02 mandates recipient-signed test-SOL claim; simulation is supplementary |
| Two authorizers' signed terms unspecified | Brief names current transaction fields; future policy/expiry fields explicitly absent |
| Token uniqueness overstated as household verification | Synthetic issuer mapping and trust limit explicit |
| Wrong-area test lacked enforcement meaning | Commitment comparison distinguished from real residence verification |
| Aggregate reserve liabilities unclear | Budget reservation, allocation consumption and claim discharge stated; cross-event test required |
| Native SOL brief referred to mint tests | Replaced with lamport, rent and fee assertions |
| Transaction retry rules ambiguous | Persist identity, reconcile original signature/accounts, test timeout-after-success, finalize exit evidence |
| Private-key prohibition contradicted dev signing | Isolated development keys allowed privately; production/user keys prohibited |
| Upgrade/authority lifecycle incomplete | Existing authority limits recorded; production governance and unsupported rotation deferred |
| M0 operating decisions blocked synthetic M1 | Synthetic proof may proceed; live country/price/partner remain later gates |
| Thailand assumptions persisted in target tests | Country-configurable tests; Thailand/THB illustrative only |
| Country lifecycle labels differ | Pasted narrative labels proposed consistently; capability matrix remains M2 design decision |
| PromptPay purpose undefined | Collection, allowance spending and outbound settlement separated; feasibility only |
| Automatic issuance could unfairly exhaust funds | Funding-shortfall/late-enrollment policy required before real automated issuance |
| One status mixed entitlements and payments | Separate state machines required before backend/payment design |
| Local-fiat grants lack valuation/fee boundary | Rate lock, buffers, net capacity and risk owner remain pre-live-payment decisions |
| Reopened/overlapping events could bypass uniqueness | Event identity/amendment policy is explicit prerequisite for operational issuance |
| Household splits/merges omitted | Event-time snapshots and change policy required before operational registry |
| Mobile screen list lacked quality criteria | Platform, language, privacy-safe notification, accessibility and assisted access decisions scheduled before M3 |

## Additional source inspection

Current source permits verifier identity to coincide with another role; distinct verifier fixtures must not be mistaken for enforced role separation. Reserve source lacks pause, rotation, expiry and cancellation. M1 can demonstrate current bounded semantics while documenting those limits; it is not production-governance evidence.

PromptPay provider documentation differs on refunds and does not establish outbound allowance-spending capability. The research note records these limitations. No integration promise or provider selection is implied.

## Remaining review gates

Technical design must settle the exact adapter/signing/recovery mechanism and executable tests. Product review must settle the listed policy decisions at their milestone gates. No review finding is treated as proof that corresponding code is implemented.
