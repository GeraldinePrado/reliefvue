# KYC/KYB provider update — Didit

Recorded 31 October 2026. Research note, not an integration or a vendor decision. Confirm every
regulated point with Thai counsel and the chosen provider before processing real identity data.

This note corrects one assumption in the earlier
[identity, PromptPay and data-security note](identity_kyc_payout_and_data_security_v01.md): that
a private organisation cannot obtain a Thai DOPA registry match without NDID/ThaID through a
bank. Didit's public documentation now advertises that lookup directly. ReliefVue has **not**
tested it, signed a contract for it, or verified its legal basis.

## What Didit is

A self-serve identity and fraud platform covering KYC, KYB, AML screening, transaction
monitoring, wallet screening and Travel Rule. It publishes per-check pricing, offers a sandbox,
and provides REST APIs, webhooks, SDKs and a hosted MCP server. It reports SOC 2 Type 2,
ISO/IEC 27001 (with 27017 and 27018), GDPR processor status and iBeta Level 1 PAD, with EU
processing by default and in-country residency available on enterprise terms.

## What it adds for Thailand

| Layer | Didit capability | What it proves | What it does not prove |
| --- | --- | --- | --- |
| Document KYC | ID document + passive liveness + face match | A document was presented and a live face matched it | Residence, household uniqueness, disaster impact |
| **Thai data match** | Non-document lookup against **DOPA civil registration** (name, date of birth, 13-digit national ID) | The supplied details match a record the source holds; result is data-only | Liveness, that the person is alive, that the ID is not used by someone else, current residence |
| **Thai KYB** | Company registry lookup at Lite, Shareholders and UBO tiers; company and officer AML | The company exists and who the registry records as owners/officers | Charity registration, foreign-funding eligibility, tax status, fitness to run a reserve |
| Wallet screening | Risk score for a Solana address | Sanctions/scam/hack signals on the address | That the person controls it |
| Wallet ownership | Message signing (Solana supported) or a small on-chain test deposit | Control of the wallet at that moment | Legal identity, uniqueness |

The Thai lookup returns an address and a record status from the register. That address is
**not** proof the person currently lives there, and it is sensitive personal data. The lookup
requires explicit consent. Didit acts as processor; ReliefVue remains the controller and must
provide its own notice, lawful basis, retention and deletion process.

## The Solana gap

Didit supports Solana for **wallet screening** and **wallet-ownership proof**, but no public
evidence was found that it issues **Solana Attestation Service (SAS)** credentials or
attestations. Its reusable KYC is an off-chain Didit-network record. A third-party integration
that uses Didit for portable KYC states that non-EVM chains, including Solana, are outside its
on-chain credential path.

Therefore, if the payout program must gate on identity, ReliefVue still has to:

1. receive a signed verification result from the provider;
2. derive a minimal claim (for example “this wallet passed level L2 on this date, expires
   then”) with no name, ID number, address or documents;
3. issue it either as a minimal SAS attestation from a dedicated, secured signer, or as an
   off-chain signed credential with an on-chain commitment/nullifier;
4. enforce expiry, revocation and re-verification in ReliefVue policy.

Do not put personal data on-chain. A `.sol` name is a naming layer, not a KYC result.

## Recommended evaluation sequence

1. Decide the assurance level per journey: donor (wallet screening; KYC only above a threshold
   or when a payment provider requires it), recipient (registry match plus liveness where
   possible before payout), partner organisation (KYB with UBOs and AML).
2. Run a sandbox spike with synthetic data only: one successful Thai data match, one failed
   match, one Thai company at Lite and UBO, one Solana wallet-ownership proof, one webhook and
   one deletion. Never use real documents.
3. In parallel, brief an NDID/bank partner: a payment provider may require its own CDD, and a
   provider lookup does not replace that.
4. Compare Didit with Sumsub (which has demonstrated Solana SAS attestations and stronger
   enterprise positioning) and with the local NDID route. Choose on Thai coverage, lawful
   access, portability, data residency and total cost — not on the headline per-check price.
5. Do not wire a provider into the public demo until the safe-exposure work is complete.

## Questions to put to the provider

1. Is the Thailand DOPA lookup available on our contract, under what legal basis and consent
   wording?
2. Which source/endpoint is queried, and what are the accuracy, refresh and SLA terms?
3. Can Thai data be processed in Thailand or the region, and on which plan?
4. What name-matching tolerance applies to Thai names and transliteration?
5. Can we restrict the returned fields to the minimum we need?
6. Is there a roadmap for Solana SAS attestations or a verifiable signed credential?
7. How complete is UBO coverage for Thai foundations and associations, not only companies?
8. What are the DPA, subprocessor list, default retention, deletion SLA and breach terms?

## Status

Research only. No provider account, contract, API key or real identity data exists in this
repository. The demo's verification remains a checksum and self-declared evidence, labelled
demo-only.

## Sources

- [Didit non-document ID lookup](https://docs.didit.me/core-technology/id-verification/non-doc-lookup)
- [Didit business verification (KYB)](https://docs.didit.me/business-verification/overview)
- [Didit KYB supported countries](https://docs.didit.me/business-verification/supported-countries)
- [Didit wallet ownership widget](https://docs.didit.me/transaction-monitoring/wallet-ownership-widget)
- [Didit data protection](https://help.didit.me/data-privacy/how-didit-protects-data)
- [Didit MCP server](https://docs.didit.me/integration/mcp/overview)
- [Onchain Bridges: non-EVM chains outside the portable credential path](https://onchainbridges.com/blog-portable-kyc-across-evm-chains.html)
