# Southeast Asia country readiness

Recorded 30 October 2026. Research starting points, not a claim that any country is
operational and not legal advice.

ReliefVue is a Southeast Asian network that operates country by country. Thailand is the only
country with a working prototype, and even there the money and identity checks are simulated.
A translation is not a country launch. This note records what a new country actually needs and
where the research starts.

## The four-part test

A country becomes operational only when all four exist together:

1. **Identity** — a lawful way to verify a household at the assurance level the payout needs.
2. **Payout rail** — a way to move local currency or a wallet payout with status, name match
   and reconciliation.
3. **Operating organisation** — a local partner or entity accountable for field verification,
   safeguarding and complaints.
4. **Legal basis** — charity and fundraising registration, data protection, foreign funding,
   sanctions and tax.

## Country matrix

Every row is a research starting point. Confidence is about the starting point, not about
readiness. Each country needs local counsel and a partner before it can be called operational.

| Country | Identity starting point | Payout starting point | Confidence | First question |
| --- | --- | --- | --- | --- |
| Thailand | NDID / ThaID / DOPA; passport, TM30 and residence evidence for foreign residents | PromptPay; USDC wallet | High | Which NDID relying party or bank bundles L2 KYC with payouts? |
| Vietnam | VNeID and chip-based CCCD; licensed eKYC providers | NAPAS 247, VietQR and bank transfer; e-wallets | Medium | Can a foreign-founded organisation access eKYC, and under what entity? |
| Indonesia | Dukcapil e-KTP / IKD; licensed eKYC | QRIS, BI-FAST and bank transfer; e-wallets | Medium | Which licence does the payout partner hold, and can it name-match? |
| Philippines | PhilSys / eVerify | InstaPay, PESONet; GCash and Maya | Medium | Is PhilSys eVerify open to private relief organisations? |
| Malaysia | MyKad; MyDigital ID; eKYC | DuitNow and online banking | Medium | Which entity can receive foreign donations and pay households? |
| Singapore | Singpass / Myinfo | PayNow and FAST | High | Is Singapore a donor and operations hub rather than a relief country? |
| Cambodia | National ID / Khmer ID; eKYC | Bakong / KHQR; bank and mobile money | Low | What is the charity registration and foreign-funding path? |
| Laos | Lao national ID; eKYC | Bank transfer, QR and mobile money | Low | Which rail has an API and reconciliation? |
| Myanmar | NRC / e-ID | KBZPay, Wave Money and bank transfer | Low | Do sanctions, access and duty of care rule it out for now? |
| Brunei | BruID / e-Darussalam | Bank transfer and QR | Low | Is there a relief use case and a local partner? |
| Timor-Leste | Bilhete de Identidade (BI) | Bank transfer and mobile money | Low | Which identity document is usable in practice? |

Thailand's prototype is the only row with implemented checks. The other rows are places to
start research, not integrations.

## What cannot be copied from Thailand

- The Thai 13-digit checksum and the DOPA/NDID consent flow.
- PromptPay and the Bank of Thailand / payment provider licensing path.
- PDPA and Thai retention expectations.
- TM30 for foreign residents.
- Thai province and district boundaries and the 77-province model.
- Thai fonts and the Thai-language review.

Each country needs its own identity scheme, payout rail, data-protection analysis, charity law
and language review. The shared layer is the product model: a fixed grant per verified
household, private evidence off-chain, human approval, a public ledger and separate operating
support.

## Cross-border questions

- **Data residency.** Where may identity documents and household evidence be stored?
- **Charity registration.** Can a foreign-founded organisation raise and grant funds locally?
- **Foreign funding.** Are there reporting, approval or currency-control rules?
- **Sanctions and AML.** Which lists apply to donors, partners and payout wallets?
- **Tax.** Are grants taxable to the recipient? Are donations tax-deductible?
- **Currency and FX.** Is the grant denominated in local currency, USD or a stablecoin?
- **Payout reach.** Do rural households have bank accounts, e-wallets or only cash?
- **Identity reach.** Can people without a smartphone or a standard document be verified?
- **Language and literacy.** Which language, script and reading level does the recipient use?
- **Duplicate households.** Can the same household claim in two countries or two responses?
- **Operating partner.** Who is accountable on the ground, and who handles complaints?
- **Exit.** What happens to the reserve and the data if the partner or ReliefVue leaves?

## How country #2 will be chosen

By partner and rail, not by language or market size:

1. A credible local partner already working in disaster response.
2. A payout rail with an API, name match and reconciliation.
3. An identity route ReliefVue can lawfully access.
4. A legal basis for foreign donations and household grants.
5. A language and font plan with a native reviewer.

Language is the cheapest part and the last part. A translated app with no identity route and
no payout rail is a demo, not a service.

## Next steps

- [ ] Shortlist three countries by partner, not by translation.
- [ ] Confirm identity access for each: public eKYC, licensed relying party, or partner-mediated.
- [ ] Confirm payout rail: API, name match, status webhook, fees, settlement and reversal.
- [ ] Confirm charity registration and foreign-funding rules with local counsel.
- [ ] Confirm data-protection and residency requirements.
- [ ] Confirm sanctions and AML expectations for crypto donations.
- [ ] Confirm language and font support, and name a native reviewer.
- [ ] Write a one-page country readiness brief for each shortlisted country.

## Sources

- [NDID platform, Thailand](https://ndid.co.th/en/platform-en-2/)
- [Bank of Thailand payment systems](https://www.bot.or.th/en/our-roles/payment-systems/payment-act-oversight.html)
- [NAPAS, Vietnam](https://napas.com.vn/)
- [QRIS, Indonesia](https://qris.id/)
- [Bank Indonesia](https://www.bi.go.id/)
- [PhilSys, Philippines](https://psa.gov.ph/philsys)
- [Bangko Sentral ng Pilipinas](https://www.bsp.gov.ph/)
- [DuitNow, Malaysia](https://www.duitnow.my/)
- [Singpass, Singapore](https://www.singpass.gov.sg/)
- [PayNow, Singapore](https://www.abs.org.sg/consumer-banking/pay-now)
- [Bakong, Cambodia](https://bakong.nbc.gov.kh/)
