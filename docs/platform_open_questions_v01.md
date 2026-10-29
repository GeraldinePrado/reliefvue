# Decisions needed — ReliefVue platform

Recorded 29 October 2026. These are the critical items held back from the build. Each one states what the prototype currently assumes, so you can approve the default or change it. Nothing here blocks local testing.

## Before any real money

### Q1. Which legal entity receives and pays the money?
**Why:** PromptPay disbursement requires a bank/PSP partner, or a payment licence and capital. Crypto conversion needs a licensed counterparty. The entity determines the licence path.
**Current assumption:** ReliefVue Thailand is the operating organisation in the demo; no funds move.
**Options:** (a) partner with a bank/PSP for payouts; (b) use a licensed e-money issuer; (c) obtain a licence (reported THB 10m paid-up capital); (d) run donations through an established foundation.
**Default to approve:** pursue (a)/(d) first; do not hold donor balances.

### Q2. Which identity provider and evidence standard?
**Why:** Real verification needs DOPA/NDID or an authorised channel. TM30 alone is not proof and applies only to foreign residents.
**Current assumption:** Thai national ID checksum + address evidence; foreign passport + TM30 + address evidence; labelled demo.
**Options:** NDID member bank, Olympus, SCB TechX, document-only vendor (weaker), manual NGO attestation for edge cases.
**Default to approve:** NDID/DOPA channel for Thai nationals; passport + liveness + lease/utility/local attestation for foreign residents; TM30 as corroboration only.

### Q3. Are crypto donations legally viable for us, and through whom?
**Why:** Accepting a donation may be unregulated, but conversion, custody and holding for others can trigger SEC licensing. Tax receipting is unclear.
**Current assumption:** simulated donations only.
**Options:** licensed Thai exchange/custodian; foreign foundation receiving crypto and granting to the Thai entity; crypto-native donor advised to donate fiat instead.
**Default to approve:** commission a short Thai legal opinion before enabling any real wallet.

### Q4. Who are the three treasury signers, and what is the recovery rule?
**Why:** 2-of-3 is implemented in the app only. Real custody needs a Squads vault, named key holders and a recovery process.
**Current assumption:** two approver accounts plus admin in the demo; reviewer cannot sign.
**Options:** founder + finance + independent board member; 2-of-3 with time lock; 3-of-5 for larger reserves.
**Default to approve:** 2-of-3 independent signers, 24-hour time lock above a threshold, documented key replacement.

### Q5. PDPA basis, retention and deletion
**Why:** identity numbers, TM30, address, income band and evidence are sensitive. The prototype stores them in plaintext.
**Current assumption:** local fictional data only.
**Options:** consent + legitimate-interest assessment; Thai data residency; 90-day retention after a response; deletion on request.
**Default to approve:** privacy notice, consent capture, encryption at rest, retention schedule and deletion workflow before onboarding a real household.

## Product decisions

### Q6. Auto-convert: is the recommended policy approved?
**Recommendation:** do **not** auto-convert to SOL. Accept SOL/USDC/THB; convert SOL to USDC at donation time; keep baht in baht; denominate grants in THB; pay PromptPay by default and USDC by wallet choice; use SOL only for fees.
**Why:** SOL’s volatility can halve a reserve before a disaster; the household needs a predictable baht amount.
**Question:** approve this policy, or do you want a SOL-denominated reserve for crypto-native branding? If SOL, we need a hedge/cap policy.

### Q7. Is the fixed ฿3,000 grant correct?
**Current assumption:** ฿3,000 per household per response, roughly three days of basics for 3–5 people.
**Questions:** is it uniform nationwide, or adjusted by province/household size? Does one household receive once per disaster, or is there an annual cap across disasters?

### Q8. Who counts as a household?
**Current assumption:** one verified identity document = one household; household size is self-declared; renters and shared units are flagged if the same address and size repeat.
**Questions:** how do we treat renters without a lease, undocumented people, migrants, and multiple families in one house? Do we require a local-authority or NGO attestation for the unreachable?

### Q9. Foreign residents: receive or donate only?
**Current assumption:** foreigners legally resident in Thailand can receive, with passport + TM30 + address evidence. Tourists cannot.
**Question:** confirm that this is the intended policy, and whether a work permit or long-stay visa is required.

### Q10. How do we reach households that cannot travel?
**Current assumption:** district coverage flags districts with requests but no payouts; staff follow up manually.
**Options:** local partner attestation, field worker app, community leader upload, SMS/phone check-in, satellite/administrative damage data.
**Question:** which field-verification model do we pilot, and who is accountable for it?

### Q11. Network model: does a partner bring its own treasury?
**Current assumption:** each organisation has its own reserve, wallet and staff; ReliefVue is the software.
**Options:** (a) self-custody partner wallet; (b) ReliefVue-hosted treasury with partner as approver; (c) hybrid.
**Question:** which one do we sell to NGOs/government? This decides custody, liability and onboarding.

### Q12. Partner API: read-only or write access?
**Current state:** read-only REST and MCP; a partner cannot create an activation or change a wallet through the API.
**Your note asked** whether partners could “edit the wallet address dashboard etc.”
**Options:** read-only (current), scoped write for activations, or full organisation admin.
**Default to approve:** keep read-only until authentication, scopes and audit are production-grade; add activation drafts later.

### Q13. Who onboards an organisation, and what proves it is legitimate?
**Current state:** one seeded organisation; no self-serve signup.
**Questions:** manual approval by ReliefVue? KYB check? Country restriction? Who owns the reserve if the partner disappears?

### Q14. Languages and access
**Current state:** English UI; Thai province names; no Thai translation of the recipient flow.
**Question:** is Thai-first required for the first field test? We recommend Thai-first for recipients and bilingual staff.

### Q15. Mobile distribution
**Current state:** responsive web app. No install prompt, push notification or offline mode.
**Question:** is a PWA enough for the pilot, or do you need a native app store build? PWA first is cheaper and testable now.

### Q16. Devnet and on-chain enforcement
**Current state:** all platform money is simulated. The separate Anchor program proves duplicate-claim rejection locally but is not wired in.
**Question:** do you want the next milestone to be a real Devnet payout (funded test treasury + recipient-controlled wallets), or first the production payment partner? Devnet proves the rail, not the legal model.

## Deployment

### Q17. Where does the API live?
**Current state:** local only. Vercel serves the static concept site; the new platform’s API is not deployed.
**Options:** managed Node host with persistent disk (fastest), Vercel + Postgres + separate API, or Vercel functions + Postgres.
**Question:** which host/account do we use, and who owns the database and backups?

### Q18. Domain and public launch
**Question:** which domain, and should the new platform replace the current Vercel landing page or sit at `/app` until the API is hosted?

## Defaults used in this build (change any of these)

- Thailand only; 77 provinces; one province and named districts per response.
- Donors anywhere; recipients must be in Thailand with a Thai mobile number and Thai address.
- One identity = one household; one request per household per response.
- Fixed ฿3,000 grant; ฿300,000 demo response budget.
- 2-of-3 signatures; reviewer cannot sign their own approval.
- SOL→USDC optional (default on); THB stays THB; no SOL reserve.
- Read-only partner API/MCP.
- Simulated money; no real Devnet transaction.
- English interface with Thai province names.
