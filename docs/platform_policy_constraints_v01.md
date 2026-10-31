# ReliefVue pilot constraints — Thailand

Recorded 29 October 2026. This is product research, **not legal advice**. It separates what the prototype currently does from what a real pilot would need. Confirm every regulated point with Thai counsel and the chosen bank/PSP before accepting real money.

## 1. TM30 cannot be the primary address proof

The briefing note said “TM30 for address verification”. That is not sufficient, and it does not apply to Thai nationals at all.

- TM30 is a notification duty under section 38 of the Immigration Act B.E. 2522. The **house owner, head of household, landlord or hotel manager** must notify immigration within 24 hours of a foreigner staying at the address ([Thai Immigration TM30](https://tm30.immigration.go.th/Foreigner/en/HomeEN.html)).
- It covers foreign nationals only. A Thai recipient has no TM30.
- It proves that a notification was filed, not that the person currently lives there. Addresses go stale, one address can host many people, and a tenant does not have to be involved in filing.
- Therefore it is **corroboration for foreign residents**, never the sole eligibility proof.

What the prototype does now:

| Applicant | Required | Used as |
| --- | --- | --- |
| Thai national | 13-digit national ID (checksum) + address-evidence reference | Identity and residence |
| Foreign resident | Passport or alien ID + TM30 reference + address-evidence reference | Identity; TM30 corroborates, evidence supports residence |

Address evidence is labelled as a utility bill, lease or local-authority attestation. This is a **demo verification**: the checksum proves format, not that the person exists or lives there.

For a pilot, define an evidence hierarchy: national ID/DOPA match (Thai), passport plus visa/extension (foreign), then lease/utility/local-authority attestation. Keep private evidence off-chain.

## 2. Identity verification needs an authorised channel

Thailand has no stand-alone “e-KYC licence” to buy. Verification is an obligation under AML/CDD and Bank of Thailand rules for financial institutions and payment providers, not a product licence.

- For Thai nationals the anchor is the 13-digit national ID matched against the DOPA record, with liveness. Private organisations cannot query the national registry directly; they use an authorised channel such as **ThaID** ([DOPA](https://www.bora.dopa.go.th/)).
- **NDID** is a consent-based identity exchange among members. The Bank of Thailand records banks and TrueMoney in its sandbox ([BOT NDID](https://www.bot.or.th/en/financial-innovation/digital-finance/fintech-in-thailand/regulatory-sandbox/NDID.html)).
- Providers that package NDID/DOPA access include **Olympus by J Ventures** ([Olympus](https://www.jventures.co.th/blogs/olympus-ndid-dopa-integration-production-ready-thailand)) and **SCB TechX eKYC** ([SCB TechX](https://scbtechx.io/services-products/ekyc/)). International document-and-liveness vendors (Jumio, Onfido, Sumsub) do not provide a DOPA match by themselves.
- The PDPA B.E. 2562 governs identity copies, addresses and face templates; cross-border processing and consent need review ([PDPC](https://www.pdpc.or.th/)).

Prototype status: format validation, duplicate hashing and a visible “demo only” label. No DOPA, NDID, liveness or document authenticity check.

## 3. PromptPay payouts need a bank or licensed partner

PromptPay is a payment rail, not an API a charity can call directly.

- Programme payouts are possible through a bank or licensed provider. Krungsri, for example, exposes corporate API transfers to a PromptPay mobile number, national ID, tax ID or e-wallet ID with dual control ([Krungsri developer](https://developers.krungsri.com/usecases/financial-services/fund-transfer)).
- Under the Payment Systems Act B.E. 2560, accepting payment on behalf of others and electronic money transfer are designated payment services requiring a licence from the Minister of Finance through the BOT ([BOT payment systems](https://www.bot.or.th/en/our-roles/payment-systems/payment-act-oversight.html)).
- The BOT’s published self-assessment cites paid-up capital of **THB 10 million** for payment acceptance/fund transfer and **THB 100 million** for e-money, plus a Thai juristic person and a Thai-resident director ([BOT licence checklist](https://www.bot.or.th/content/dam/bot/documents/en/our-roles/payment-systems/payment-oversight/license-process/1_Payment%20License%20Application%20Checklist%20(Self-Assessment).pdf)).
- Holding donor balances and paying them out can push the model toward e-money rather than a simple donation page.

Product implication: use a bank/PSP/e-money partner that holds and pays the funds, or become licensed. Do not build a balance-holding wallet and call it a donation flow. The prototype’s PromptPay payout is simulated and labelled as such.

## 4. Crypto donations are not clearly exempt

- Operating a digital asset exchange, broker, dealer, custodian or ICO portal requires an SEC licence under the emergency decree on digital asset businesses ([decree text](https://regalert.today/document/emergency-decree-on-digital-asset-businesses-b-e-2561-2018-as-amended-8fc4fe30-8edb-4f2b-8103-cba7f319e853/text)). Reported minimum capital for an exchange is THB 50 million, with lower thresholds for brokers/dealers ([summary](https://silklegal.com/licenses-digital-assets-2/)).
- Accepting a crypto donation is not itself one of the listed licensed activities. But converting it to baht for the donor, holding crypto for others, or matching orders can become dealing, brokerage or custody.
- A practical model is: donor sends to a licensed Thai exchange or custodian; the exchange converts and remits THB to the charity’s bank account. That introduces a counterparty, KYC and fee.
- The BOT and SEC have discouraged using digital assets as payment for goods and services ([BOT digital assets](https://www.bot.or.th/en/financial-innovation/resilient-regulation/digital-asset.html)). Whether a donation falls inside that guidance is unsettled. No SEC rule specific to crypto donations was found.
- Foreign-donor-only messaging reduces solicitation exposure but does not remove the THB leg, Thai recipient app, exchange-control rules or travel rule. There is no volume de minimis; the trigger is activity.

Prototype status: donation records are simulated. No wallet, custody, swap or exchange integration exists. Get Thai counsel before accepting a single real donation.

Unverified: any SEC exemption for donations, Thai tax treatment and receipting, and whether a foreign-only donation campaign changes the analysis.

## 5. The reserve should not be held in SOL

SOL is volatile. The research measured roughly 63.6% annualised volatility and a −68% maximum drawdown over the trailing year from CoinGecko daily prices ([CoinGecko](https://www.coingecko.com/)). A three-month reserve held in SOL can lose half its baht value before a disaster.

USDC is the common humanitarian settlement asset; UNHCR has piloted blockchain-based cash assistance ([UNHCR](https://www.unhcr.org/ua/en/news/unhcr-launches-pilot-cash-based-intervention-using-blockchain-technology-humanitarian-payments)). But holding USDC is not the same as paying Thai recipients in USDC. Thailand has no dedicated stablecoin regime; a baht-backed token used as a medium of exchange may be e-money, and foreign-currency stablecoins are handled case by case. The SEC added USDC and USDT to permitted cryptocurrencies for certain regulated transactions in 2025 ([Fintech 2026 chapter](https://gpg-pdf.chambers.com/fintech-2026/874/)).

Recommended policy, implemented in the prototype:

1. Denominate the grant in THB.
2. Convert volatile crypto to USDC at donation time, through a licensed counterparty.
3. Keep baht donations in baht.
4. Pay THB by PromptPay through a bank/PSP partner by default; pay USDC to a wallet only for recipients who choose it.
5. Hold SOL only for network fees, not as the reserve.
6. Never auto-convert the reserve into SOL. That adds volatility and a second conversion without helping the household.

## 6. Multisig

For Solana, **Squads v4** is the practical default: 3 members with a 2-of-3 threshold, on-chain proposal history, time locks and spending limits ([Squads time locks](https://docs.squads.so/main/navigating-your-squad/settings/time-locks); [security](https://docs.squads.so/main/basics/security)). It has been audited and formally verified. Realms/SPL Governance is possible but adds governance overhead. Solana has no native m-of-n for arbitrary SOL transfers.

The prototype implements 2-of-3 at the application layer only, with distinct-user enforcement and an audit trail. Before real funds, map those signatures to a Squads vault and decide who holds the three keys, how a key is replaced, and what happens if an approver is unavailable.

## 7. MCP

The current MCP specification revision is **2026-07-28**. Remote transport is Streamable HTTP: one POST endpoint, per-request SSE; the old GET stream and protocol-level sessions were removed ([MCP transports](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http)). Authorization is optional; when used, the baseline is OAuth 2.1 with bearer tokens, protected-resource metadata and resource indicators ([MCP authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)).

The prototype exposes a stateless JSON-response MCP endpoint with a static bearer key and read-only tools. That is reasonable for a partner preview. It is not a production authorisation model: there are no scopes, OAuth metadata, rate limits or per-tool permissions.

## 8. Not verified

- Any SEC exemption or guidance specific to crypto donations.
- Thai tax treatment of crypto and fiat donations, and receipting obligations.
- The exact BOT e-KYC notification applicable to a charity/PSP partnership.
- TM30 penalty amounts and enforcement practice.
- Commercial terms, coverage and onboarding time for NDID/DOPA and PromptPay partners.
- Whether a foreign-donor-only campaign changes the licensing analysis.
