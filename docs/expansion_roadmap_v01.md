# ReliefVue access, geography and organization roadmap

Recorded from Geraldine's direction on 5 October 2026. This is product direction and exploration, not a claim of implemented capabilities or secured partnerships.

## Pitch inclusion

Include one short roadmap section in the under-three-minute pitch: Thailand pilot → accessible payout choices → organization partners → country-by-country expansion. Keep partner API/MCP architecture, signer thresholds and detailed document rules in an expandable Q&A section. The household problem and working prototype remain the central story.

Suggested closing vision: “Start with disaster-affected households in Thailand. Then give trusted local organizations the tools to deliver accountable cash relief, country by country.”

## User access and payment routes

- Crypto-experienced donors/recipients: connect an existing compatible Solana wallet.
- New users: a guided wallet setup/recovery experience is planned; key custody, recovery responsibility and support model need selection.
- Recipients preferring baht: a future qualified payout/conversion partner could deliver local currency without requiring the user to manage a crypto wallet. Provider integration, eligibility, fees and settlement timing are not validated.
- Fiat donations are also a future provider route, not available simply because baht payout is planned.

On-chain versus off-chain is an architecture distinction, not a division between knowledgeable and new users. The intended on-chain layer records transfers and enforces defined program rules; private identity, household evidence and sensitive case management stay off-chain. Fiat delivery still needs a reconciliation trail even where its final leg is outside Solana. Blockchain visibility ends where transaction evidence ends; do not present a bank payout as proven merely by an upstream SOL transfer.

Preserve explicit recipient choice. If a chosen provider route fails, communicate the delay and preserve eligibility; do not silently switch currency or pay another destination.

## Geography and household eligibility

User direction:
- Thailand-first responsive web/mobile experience; no native mobile app is claimed.
- Eligible Thai households and foreigners legally residing in Thailand may seek grants after residence and event eligibility checks. Eligible residents may also donate.
- Receipt eligibility is limited to the specifically approved affected area, which can be a province or a smaller defined boundary; a Thailand event does not make the whole country eligible.
- People outside the service country can donate, but do not qualify for that country's grants merely by donating, downloading the app or owning a wallet.
- Expand country by country using the same core structure, with local evidence policies, payout providers, qualified operators and locally assessed grant terms.

Open clarification: whether an affected household that evacuates outside the country retains eligibility. Existing brief ties eligibility to verified usual home and protects displaced households. Recommended: preserve that rule; do not use current GPS as an exclusion test. Geraldine has been asked to confirm; do not silently replace the existing rule.

TM30 is a candidate supporting address document for foreign residents, not sole proof of lawful status, usual residence at the relevant date, household uniqueness or disaster impact. Thailand's official description identifies it as a residence notification submitted by a housemaster/owner/possessor. Product inference: assess it alongside identity, relevant lawful-stay evidence and other residence evidence; allow documented alternatives rather than treating one document as universally sufficient.
Source: https://thailand.go.th/visit-thailand-detail/001_01_088

## Fair access and equal household grants

Useful term: **fixed grant per eligible household**, or **uniform household grant within a response**. Executive leadership sets the event budget and fixed grant based on assessed needs and severity; reviewers and supervisors cannot adjust an individual grant.

The aim is to reduce dependence on physically reaching a distribution point. Digital access alone does not solve exclusion: consider assisted registration, trusted field partners, low-bandwidth workflows, language access, account recovery and accessible appeals. Cash also depends on functioning markets, payment access and safe access to essentials; it is not a universal replacement for rescue or in-kind assistance.

## Organization platform hypothesis

Potential adopters: community organizations, employers/community funds, NGOs and public agencies. No adoption agreement or government integration exists.

Recommended sequence:
1. Organization workspace with scoped staff roles, separate program funds, response rules and audit views.
2. Authenticated API and webhooks for existing partner systems: submit/retrieve cases, exchange permitted evidence references, receive status notifications and reconcile payments.
3. Optional MCP interface for authorized AI assistants to query permitted records or prepare review work. MCP connects AI applications to external tools and data; it does not replace the partner API, staff permissions or treasury controls.

Official MCP reference: https://modelcontextprotocol.io/docs/getting-started/intro

“ReliefVue platform” is suitable now. “Shared relief infrastructure” is a future positioning hypothesis. Do not claim a decentralized network before independent operators, enforceable governance and privacy boundaries exist.

## Partner configuration and wallet changes

Partners could configure branding, staff assignments, response geography and authorized program settings within their mandate. Separate organization workspaces must prevent cross-organization access to household documents or funds.

Avoid a general-purpose edit-wallet field on approved grants. Destination changes require authenticated authorization, re-verification, a reason, audit history, and payment-state checks. A pending or ambiguous payment must be reconciled before any replacement; do not create duplicate transfers. Treasury address changes need stronger governance than display preferences. Reviewers must not redirect household grants.

## Shared treasury authority

The appropriate concept is **multisignature treasury governance** (threshold approval by separate authorized signers), not sharing one seed phrase. A possible 2-of-3 or 3-of-5 arrangement is illustrative only; no threshold is approved.

Solana multisig tooling can require multiple independent keys for authorized actions. Reference: https://docs.squads.so/main/basics/what-is-a-multisig

Multisig reduces single-key control but does not by itself enforce household eligibility, prevent collusion, or restrict all funds to relief purposes. Combine shared authorization with response budgets, a fixed-grant policy, separation of relief and operating funds, private verification, constrained payout rules, independent review, signer replacement/recovery and auditable changes. Program upgrades and emergency powers need governance too.

Preserve the existing ReliefVue direction: relief funds are not an executive's personal wallet or an unrestricted withdrawal right. Organization-adoption governance is a proposed future design; it does not silently weaken that rule.

## Fraud controls without excluding legitimate households

Identity verification is one layer. Also check usual residence, distinct household arrangement, one entitlement per event and prior payment state. Multiple wallets do not create multiple entitlements; the same building does not prove a duplicate. AI can identify similarities or suspected image replay, but humans resolve contested cases with reasons and an appeal path. Do not publish identity documents or household-to-wallet mappings as a shortcut to transparency.

## Additional roadmap priorities

- Assisted access for people without phones, connectivity, documents or crypto experience.
- Correctable decisions and appeals; track exclusion errors as well as duplicate prevention.
- Provider outage and payment-reconciliation procedures.
- Locally tested grant benchmark and clear fee/net-receipt disclosure.
- Pilot metrics: time to verified decision and confirmed payout, unresolved backlog, successful delivery, appeal reversals and recipient experience. Synthetic dashboard counts are not pilot outcomes.
- Partner onboarding and governance before cross-country expansion; avoid a universal KYC/document policy across jurisdictions.

## Decisions still needed

Evacuation eligibility, wallet custody/recovery approach, first partner/pilot location, final document policy, signer threshold and independent signer composition, API data-sharing permissions, fees/business model and funding ask. These do not require more UI work before pitching the concept.
