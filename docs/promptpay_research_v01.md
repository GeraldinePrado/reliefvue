# PromptPay feasibility for ReliefVue

Research date: 2026-10-24. Status: feasibility evidence, no provider selected or contacted. This requirement does not select Thailand as the first operating country.

## What current documentation establishes

Stripe documents customer-initiated THB QR payments using participating Thai banking apps, generally for Thailand-based Stripe accounts. It lists full/partial refunds and no manual capture; mobile component support varies. These are collection capabilities, not proof of an approved humanitarian disbursement integration. [Stripe PromptPay documentation](https://docs.stripe.com/payments/promptpay)

Omise documents creation of a PromptPay source/charge, QR presentation, bank-app completion, completion webhooks and server retrieval to verify charge status. It documents same-phone QR-image import and requires enablement/terms. Its page says PromptPay charges cannot be voided or refunded through Omise. [Omise PromptPay documentation](https://docs.omise.co/promptpay/thailand)

Xendit's page describes THB QR collection, expiration and settlement timing. Its feature table and detailed refund section are inconsistent: the table marks refunds unavailable while the later section describes issuer-limited refund support. Refund capability must therefore be confirmed for the specific account/API and tested before selecting it. [Xendit PromptPay documentation](https://docs.xendit.co/docs/qr-promptpay)

## Implications for ReliefVue — analysis, not provider promises

| Use | Feasibility position | Required next evidence |
| --- | --- | --- |
| Thai donor pays THB | Documented collection APIs make this technically plausible | Provider accepts the actual organization/campaign model; verified sandbox payment and reconciliation |
| Recipient spends an aid allowance | Not established by collection documentation | Contracted merchant/POS integration, allowance authorization and partner-funded settlement capability |
| ReliefVue pays a merchant or beneficiary | Separate outbound capability | Permitted payer/custodian, destination verification, liquidity, payout API and reconciliation |
| SOL/USDC reserve becomes THB | Not supplied by QR generation | Separate supported conversion, liquidity and settlement arrangement |

A normal bank-app payment debits the bank payer's funds. It must not be presented as spending ReliefVue's grant unless the actual funding and settlement arrangement makes that true. Do not ask a disaster recipient to front personal money under a misleading grant-payment UI.

## Proposed integration boundary

ReliefVue validates the basket and reserves the correct allowance; a payment adapter requests the supported partner operation; verified payment and settlement events update the ledger; a reconciliation worker resolves missing or conflicting events. No atomicity between a Solana transaction and an external bank payment is assumed. Record each side independently and route discrepancies to review.

An allowance hold is an application-ledger operation, not a claim that the provider supports card-like authorization/capture. If partner payment cannot be cancelled, define late-success handling and compensating ledger entries rather than simply releasing the hold and retrying.

Use opaque purchase references. Keep phone numbers, PromptPay identifiers, bank accounts and item-level recipient histories out of public blockchain records. Payment QR import is distinct from ID-image capture policy.

## Sandbox acceptance

- Confirm payee, amount, currency, basket/version, bucket and transaction reference before authorization.
- Test same-phone payment completion, cancellation, expired QR and late success.
- Verify webhook authenticity using the provider's supported mechanism and retrieve authoritative status; reject forged callbacks and wrong amount/destination.
- Duplicate and out-of-order callbacks never double-credit donations or double-debit allowances.
- Unknown payment state remains pending reconciliation, never automatically paid or blindly retried.
- Refund capability is tested for the selected route. Restore allowance only after confirmed reversal; unsupported refunds use a documented reviewed recovery process.
- Collection, conversion, reserve credit and merchant settlement reconcile without counting the same value twice.
- Arbitrary merchant QR scanning does not bypass item-level policy or imply universal acceptance.

## Sequence

Research and adapter requirements now; provider/country feasibility alongside M1; persistent accounting in M2; optional donor-payment sandbox and Model B merchant/payment sandbox after provider confirmation, principally M4. No PromptPay execution, live money or provider onboarding is included in M1.
