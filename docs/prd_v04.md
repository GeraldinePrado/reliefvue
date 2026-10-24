# ReliefVue Network
## Product Requirements Document v0.4

**Date:** October 24, 2026  
**Status:** Consolidated development baseline; open policy/provider decisions remain unapproved  
**Platform:** Global humanitarian relief infrastructure  
**Blockchain:** Solana  
**Initial operating region:** Southeast Asia  
**Current development stage:** Hackathon prototype to functional MVP

---

## Document authority

This revision consolidates the two supplied v0.3 PRDs and the M1 engineering brief, with Geraldine’s requested PromptPay feasibility addition. The global product starts operational exploration in Southeast Asia, country by country; Thailand is not a selected launch country. Existing `prd.md` and the ideathon documentation are historical where they conflict. M1 is a technical proof, not the complete mobile/merchant MVP. See [delivery sequence](development_sequence_v01.md), [review resolutions](requirements_review_v01.md), [M1 brief](m1_build_brief_v02.md), and [PromptPay research](promptpay_research_v01.md).

The pasted v0.3 narrative is retained below with this authority section and an integration annex. Original sources remain preserved outside this repository; no historical PRD is overwritten. The annex supplies precise development boundaries without silently choosing unresolved operating policies.

## 1. Product Vision

ReliefVue is a global humanitarian preparedness, fundraising, verification, and emergency assistance network.

Its purpose is to reduce delays, misuse, and lack of transparency in humanitarian funding by preparing resources before disasters, verifying households, monitoring official emergency declarations, and distributing assistance through accountable financial infrastructure.

**Core principle: Prepare before disaster. Verify fairly. Deliver essential support. Trace the funding.**

ReliefVue will provide:

- A global donor and fundraising platform.
- Country-specific humanitarian reserves.
- A verified registry of households.
- AI-assisted official emergency monitoring.
- Human-supervised disaster activation.
- Fixed emergency assistance allocations.
- Restricted essentials and flexible emergency allowances.
- Transparent Solana-based financial records.
- Operational dashboards and APIs for verified NGOs.

The system will launch country by country. Initial pilot exploration will focus on Southeast Asia.

## 2. Current Development Status

ReliefVue won a Solana hackathon and has an existing interactive prototype.

**Currently implemented or partially implemented:**
- Public website and interactive demonstration.
- Simulated household verification workflows.
- Simulated donor and reviewer workflows.
- Local Solana Devnet test-transfer utilities.
- Anchor smart-contract source and authored tests.

**Not yet operational:**
- Deployed and verified reserve smart contract.
- Production backend and persistent user accounts.
- Actual KYC and household verification.
- Real NGO access and authority management.
- Real disaster-source integrations.
- Recipient mobile application.
- Restricted merchant payments.
- Real-money donations, payout settlement, and custody.

The prototype must not be presented as an already functioning humanitarian financial service.

## 3. Global Country Operating Model

ReliefVue is one global platform with separate country programs.

Each country must have:

- Approved local operating arrangements.
- Defined legal and compliance requirements.
- Country-specific identity and residency rules.
- Verified disaster declaration authorities.
- A designated relief reserve and accounting ledger.
- Locally validated grant amounts.
- Supported currency and payout partners.
- Approved NGO and merchant relationships.

Country availability statuses:

1. Planned
2. Partner onboarding
3. Sandbox pilot
4. Active
5. Paused or suspended

Users may browse global campaigns, but donations and distributions must be restricted to actually supported routes.

## 4. Fundraising and Campaigns

Anyone may propose a humanitarian fundraising campaign.

A proposed campaign does not become publicly fundable until ReliefVue verifies the organizer, the humanitarian need, the destination and the operating arrangements.

Supported initial causes include:

- Natural disasters.
- Emergency evacuation.
- Disaster displacement.
- Humanitarian response programs.
- Approved humanitarian preparation reserves.

Armed conflict and evacuation responses require additional protection, sanctions, impartiality and independent verification controls.

Funds designated for a specific country or approved purpose cannot be silently redirected.

ReliefVue must distinguish lifetime donations, held reserve assets, allocated commitments, confirmed distributions, refunded funds and operating support.

## 5. Official Emergency Monitoring

An AI-assisted monitoring system collects information from:

- Approved national government agencies.
- Authorized provincial and local authorities.
- Published emergency and evacuation orders.
- Recognized humanitarian information systems.
- UN and other relevant humanitarian agencies.
- News sources used for corroboration.

**AI must not independently authorize the release of funds.**

### Activation workflow

1. Monitoring: AI identifies a potential emergency.
2. Official-source detection: The system identifies an authentic declaration or authorized evacuation order.
3. Fact-checking: A human reviewer verifies the authority, original evidence, effective date and affected area.
4. Response planning: The system calculates eligible households and available reserve capacity.
5. Authorization: Independent authorized personnel approve event terms, grant amount, geography and budget.
6. Distribution: The system prepares entitlements for verified eligible households.
7. Reconciliation: Financial transactions and outstanding liabilities are independently recorded.

An official localized evacuation order may qualify even without a nationwide declaration, subject to approved country-specific rules.

## 6. Recipient Registration and KYC

Households may register:

- Before an emergency.
- During an active emergency.
- After an emergency, within the response's published enrollment and appeal period.

The same substantive eligibility standards apply to all three groups.

### Identity verification

The preferred identity verification experience uses:

1. Live camera capture of an original identity document.
2. Document authenticity and consistency checks.
3. Facial matching against the submitted document.
4. Liveness detection.
5. Existing-identity and suspicious-duplicate screening.
6. Human review when automated checks are inconclusive.

Selecting existing photographs from the device gallery is not the default KYC method.

A vetted identity provider should perform sensitive biometric checks. ReliefVue should store only the minimum protected identity references and verification evidence it genuinely requires.

Assisted identity verification must be available for lost documents, accessibility problems, connectivity limitations and other exceptional circumstances.

### Residence verification

Country-specific policies verify lawful residence and usual residential address.

Nationality alone does not determine eligibility.

In Thailand, both Thai citizens and lawfully residing foreign nationals can qualify under the same household and disaster-eligibility criteria.

An applicant's temporary evacuation location is not their usual home and must not automatically disqualify them.

## 7. Household Registry and Duplication Prevention

The primary assistance unit is the **household**, not the person, phone number or cryptocurrency wallet.

Each verified household must have:

- A private household identifier.
- One authorized primary representative.
- A secure representative-recovery procedure.
- Verified usual residence and residential-unit details.
- Minimum necessary household membership records.
- Identity verification references.
- Household status and verification history.
- Event-specific assistance and payment history.

One household normally receives only one fixed entitlement for the same ReliefVue disaster-response program.

Separate residential units sharing one building may qualify independently.

Duplicate-identity signals must not automatically become permanent rejection decisions. Human reviewers investigate suspected abuse and provide correction and appeal procedures.

Household identifiers and sensitive identity information must not be published on the blockchain.

## 8. Automatic Household Eligibility

Already verified households should not have to complete a new grant application every time a qualifying disaster occurs.

After response activation, the system will:

1. Identify verified households within the affected geographic boundary.
2. Determine the usual home at the relevant disaster date.
3. Check whether an entitlement already exists for the event.
4. Reevaluate incomplete, stale or conflicting records.
5. Create eligible household entitlements within the authorized budget.
6. Notify household representatives through the app.
7. Provide a human review and appeal pathway.

Applicants registering during or after the disaster may also qualify.

Preregistration improves readiness but must not automatically reserve aid or unfairly outrank newly affected and verified households.

## 9. Grant Calculation

Each response establishes a predetermined household grant using the locally researched cost of approximately three days of basic emergency necessities for a reference household of three to five people.

The amount is denominated in local purchasing-power terms, not determined solely by a floating cryptocurrency balance.

**Grant total = Essentials allowance + Flexible emergency allowance**

The ordinary household grant remains fixed for the approved response cohort.

The fund balance must not simply be divided among all applicants.

If the reserve cannot cover every qualifying household, ReliefVue must disclose capacity limits and follow a transparent, approved prioritization and funding-shortfall policy.

Exceptional needs can be funded through separately approved assistance programs, without secretly changing the ordinary fixed grant.

## 10. Hybrid Spending Model B

ReliefVue uses two separate allowance components.

### A. Restricted essentials allowance

This allowance supports qualifying emergency purchases.

**Ordinarily allowed:**
- Basic food and potable water.
- Baby formula, food, diapers and wipes.
- Sanitary pads and personal hygiene.
- First-aid and appropriate basic medical supplies.
- Essential clothing, blankets and emergency supplies.

**Normally prohibited:**
- Alcohol.
- Tobacco and vaping products.
- Gambling and lottery purchases.
- Gift cards and cash-equivalent purchases.
- Entertainment televisions, game consoles and luxury electronics.
- Nonessential luxury goods.
- Cryptocurrency purchases or unauthorized cash withdrawals.

**Conditional categories:**
- Basic replacement phones and chargers.
- Power banks and emergency communications.
- Temporary accommodation.
- Evacuation transportation.
- Essential fuel and cooking requirements.
- Disability-related and specialized medical needs.

Conditional purchases may require defined category limits or documented exceptions.

### B. Flexible emergency allowance

This separate allowance supports legitimate urgent needs not well served by ordinary grocery restrictions.

Examples include:

- Evacuation transportation.
- Temporary shelter.
- Essential communication.
- Urgent medical or accessibility expenses.
- Emergency needs where participating grocery shops are unavailable.

Initially, the flexible allowance should be controlled through approved service-provider categories, direct vendor payments or supervised exceptions.

It must have a separate balance, authorization rules, spending history and audit trail.

**Restriction limitation:** If ReliefVue distributes unrestricted cash or freely transferable cryptocurrency, it cannot guarantee that the recipient will not buy a prohibited item. Such payments would require a distinct, explicitly approved assistance policy.

### Illustrative sandbox split

For development testing only:

- Total example grant: THB 1,500.
- Restricted essentials: THB 1,200.
- Flexible assistance: THB 300.
- Split: 80% essentials, 20% flexible.

These are example values, not approved live grant amounts or mandatory allocation percentages.

## 11. Merchant QR Payments

For product-level restrictions, ReliefVue needs itemized transactions from participating merchants or connected POS systems.

An ordinary bank QR payment does not establish which products were purchased.

### Proposed merchant payment process

1. Merchant scans or enters the grocery items.
2. The checkout system identifies the merchant and validates product codes.
3. ReliefVue checks the household's available eligible allowance.
4. The policy engine permits or excludes individual basket items.
5. A single-use payment authorization is generated.
6. The payment provider authorizes the supported transaction.
7. Merchant settlement is recorded and reconciled.
8. The household's remaining allowance is updated.

Mixed baskets must allow eligible purchases to continue while excluded items are removed or paid for separately.

Merchant fraud detection must monitor false product descriptions, unusual prices, repeated purchases, manipulated refunds and attempts to exchange restricted assistance for cash.

The MVP must not claim nationwide merchant acceptance.

## 12. Solana Financial Infrastructure

ReliefVue will use Solana as its initial blockchain infrastructure.

The first functional milestone is an actual Devnet deployment using test SOL.

Required features:

- Country reserve accounts.
- Protected response budgets.
- Independent authorization.
- Verified household entitlement issuance.
- One-time grant enforcement.
- Safe transaction confirmation and retry behavior.
- Transparent transaction receipts.
- Program upgrade and authority controls.
- Private off-chain identity and eligibility records.

### Cryptocurrency donations

**Initial build:** Solana Devnet test SOL.

**Next asset:** Native USDC on Solana, requiring separate token-aware contract development.

**Future:** Supported cryptocurrencies from other networks through appropriately reviewed integration and conversion services.

Automatic conversion of every donation to SOL is not yet approved because SOL price volatility introduces reserve and grant-value risks.

Recipients should see locally denominated assistance, not be required to understand cryptocurrency trading.

## 13. Human-in-the-Loop Operations Dashboard

ReliefVue staff need a secure, role-based dashboard.

Core workspaces:

1. Emergency monitoring and source verification.
2. Government declaration review.
3. Affected-area and incident mapping.
4. Identity verification and document exceptions.
5. Household duplicate investigation.
6. Grant eligibility and authorization.
7. Financial reserve and settlement reconciliation.
8. Merchant fraud and restricted-purchase review.
9. Recipient support and appeals.
10. Security, permissions and audit reporting.

Distinct staff permissions must prevent any one person from unilaterally creating a fraudulent household, approving its grant and authorizing payment.

Every sensitive action requires an accountable user identity, timestamp, reason and supporting record.

## 14. Recipient Mobile Application

The intended mobile experience includes:

- Country and language selection.
- Account registration and recovery.
- Camera-first identity verification.
- Legal residency and home verification.
- Household representative and membership management.
- Household preparation status.
- Local official disaster alerts.
- Disaster eligibility and grant notification.
- Essentials and flexible allowance balances.
- Participating merchant discovery.
- Restricted QR payment experience.
- Flexible emergency assistance requests.
- Spending and transaction history.
- Human support, corrections and appeals.

The interface should use simple local-currency language. Recipients should not need blockchain knowledge to access aid.

The application must not display a grant as paid simply because an entitlement was created.

## 15. NGO Portal and Partner API

Verified NGOs can propose programs and operate approved relief workflows.

Supported capabilities will include:

- Organization verification and onboarding.
- Program and country assignment.
- Scoped case review.
- Authorized assistance distribution.
- Fund utilization reporting.
- Secure API access and signed event webhooks.

NGOs must not automatically receive access to all personal identities, biometric documents or country reserves.

Permissions, beneficiary-sharing rules and program budgets must be explicitly controlled.

## 16. Security, Privacy and Compliance

Real-money launch requires:

- A legally qualified country operating organization.
- Financial and payment regulatory review.
- Applicable donor and transaction screening.
- Approved KYC and data-processing arrangements.
- Encrypted private records and protected biometric handling.
- Treasury governance and independent contract security review.
- Staff MFA and least-privilege permissions.
- Merchant fraud monitoring.
- Payment reconciliation and incident recovery procedures.
- Beneficiary support and appeal mechanisms.

Founder immigration and work authorization requirements must be reviewed separately for the country of operation.

Solana deployment alone does not authorize collection, custody, conversion or settlement of real funds.

## 17. MVP Development Sequence

### Milestone 0: Finalize product rules

Approve the v0.3 PRD, initial pilot-country criteria, operating model, emergency authority policy, sample household rules and two-bucket grant specifications.

### Milestone 1: Working Solana Devnet reserve

Compile the current Anchor contract, execute tests, deploy on Devnet, and prove an authentic test donation, independently authorized event, one-time household entitlement and confirmed transfer.

### Milestone 2: Backend and staff operations alpha

Build PostgreSQL persistence, authentication, roles, event records, household cases, financial ledgers and auditable staff workflows.

### Milestone 3: KYC and recipient mobile alpha

Integrate an identity provider sandbox, private household verification, duplicate detection, recovery, appeals and mobile grant-status experience.

### Milestone 4: Hybrid payment sandbox

Implement essentials/flexible balances, product rules, merchant onboarding, QR authorization, payment partner simulation, blocked purchases and refund/reconciliation tests.

### Milestone 5: NGO integration and controlled pilot readiness

Implement scoped partner portal/API, independent security review, operational response drills, country-specific compliance assessment and pilot acceptance testing.

## 18. MVP Acceptance Criteria

The MVP must demonstrate that:

- AI cannot independently release funds.
- Unverified disaster reports do not activate a response.
- Eligible households can register before or during an active event.
- A qualified late registrant is not automatically rejected.
- Identity duplication does not create a second household grant.
- Separate genuine households at one building can remain eligible.
- No household receives an unauthorized duplicate entitlement.
- Fixed grants are not diluted when more people register.
- Reserved funds cannot be overspent.
- Barred essentials products are rejected at integrated checkout.
- Flexible assistance is governed separately.
- Transactions cannot be falsely reported as confirmed.
- Merchant refunds and payment failures are safely reconciled.
- Private identity information is not exposed publicly.
- NGO and staff access is limited to authorized records.

## 19. Open Product Decisions

Before a live pilot, ReliefVue still needs to approve:

1. The first pilot country and local partners.
2. The actual three-day survival basket and household grant value.
3. The final essentials/flexible percentage and exception rules.
4. The qualification rules for localized declarations and conflict evacuations.
5. The funding-shortfall and household prioritization policy.
6. The KYC provider and acceptable residency documents by country.
7. The licensed merchant and local-currency settlement model.
8. The protocol for unreachable shops, power outages and people without phones.
9. Supported production cryptocurrency assets and reserve risk policy.
10. NGO onboarding and revenue/operating-cost arrangements.

---

**Next engineering priority:** Make the existing Solana reserve functional on Devnet, without losing the current demo or introducing real user funds.

**Next product priority:** Establish the first country-specific operating, verification, grant and payment requirements while retaining the global platform architecture.

## 20. Integration requirements and milestone boundaries

### 20.1 Country operation and availability

Use the public labels Planned, Partner onboarding, Sandbox pilot, Active, and Paused/suspended as the proposed common lifecycle from the product narrative. Before M2, approve the transition permissions and capability matrix: browsing, fundraising, enrollment, issuance and spending must each have explicit availability flags. A status label alone never enables fund movement. Sandbox pilot uses only synthetic cases and test money. Do not activate a country merely because its currency or language exists in the app.

Country rules and amounts are configurable. Thai residence examples and THB 1,500 / 80:20 figures are illustrative only. M3 must test lawful domestic and foreign residents under the selected sandbox country's rules; it is not required to launch in Thailand.

### 20.2 Scope of the first proof

M1 must demonstrate an actual designated-recipient signed test-SOL claim and confirmed on-chain transfer. A controlled settlement simulation may supplement this but cannot replace it. M1 has no token mint, production QR, real KYC, live beneficiaries or merchant settlement.

The synthetic verifier assigns one opaque event token per fixture household. The program proves one entitlement/claim per event and token; it does not independently prove a real household or residence. Area enforcement compares the authorized area commitment, not live geography.

M1 development can proceed with a synthetic country, boundary and test amount. Selection of an operating country, live grant value and payment partner is a later operating gate, not a prerequisite for testing reserve mechanics.

### 20.3 Backend and payment invariants

Use transactional persistence, durable jobs, idempotency keys and reconciliation/outbox processing for the hosted core. Separate entitlement status, allowance balance/hold, payment status, refund status and event status. A partly spent entitlement may have both settled and pending purchases; a single shared status field is insufficient.

Record countries, source authorities, campaigns, organizations, residences with effective dates, household memberships, cases, eligibility, entitlements, grant buckets, merchant baskets, provider authorizations, settlements, refunds, chain receipts and audit events. Country/organization permissions apply at every API and worker boundary. NGO access never implies access to raw identity documents or unrestricted treasury authority.

For every event, calculate available capacity after committed liabilities, fees and conversion buffers. Do not double-count a contribution and its conversion, or a provider settlement and its corresponding chain release. Policy must decide exchange-rate locking and who bears fees/volatility before local-currency obligations become live.

Country-authority registry entries need source URL/document, publisher, jurisdiction, effective dates, original text/translation, provenance and approved boundary revision. AI can assist evidence review but cannot activate funds.

### 20.4 PromptPay / Thai QR feasibility requirement

Investigate PromptPay as an optional Thailand payment rail while keeping Southeast Asia-wide country configuration. This is a requested feasibility requirement, not a promise of live support or a provider selection.

Evaluate three distinct uses:
- Thai donor contributions: donor pays THB from a supported banking app; ReliefVue verifies the provider payment and accounts for earmarked fiat. This does not automatically deposit SOL or USDC into a blockchain reserve.
- Recipient essentials/flexible checkout: ReliefVue authorizes a participating merchant's itemized basket against the appropriate allowance. An approved partner would settle THB using supported rails. Ordinary PromptPay collection APIs do not establish that ReliefVue can spend a recipient allowance at arbitrary merchant QRs.
- Merchant settlement/recipient transfers: separately investigate outbound-payment capability, beneficiary verification, source of THB liquidity, account ownership, limits and reversals. Inbound QR acceptance is not evidence of outbound capability.

Keep basket authorization separate from the bank QR. A QR alone cannot prove eligible products. Bind each purchase to household entitlement, merchant, basket hash/version, allowed amount, currency, originating bucket and expiry. Reserve allowance atomically before sending payment; reconcile uncertain results before retry. Mixed baskets retain permitted items; unknown items require classification/review. Refunds restore the originating bucket only after verified reversal evidence. No unsupported refund promise.

Never count a screenshot, QR generation, app return or unverified webhook as payment confirmation. Verify provider authenticity and payment status, amount, currency, destination and reference; handle duplicate/out-of-order callbacks, expiration, late payment and failures. Distinguish payment receipt from merchant settlement.

Test same-device bank-app handoff and return, not only scanning with a second device. QR image import is a payment convenience and does not change the camera-first identity-verification requirement. No personal PromptPay identifiers or bank details go into public audit records.

M0/M2: research capability and define adapter/ledger boundaries. M4: sandbox implementation after provider selection. M1 remains test SOL only. Live operation requires confirmed provider support for ReliefVue's actual operating/fundraising model.

### 20.5 Decisions that must not be invented by implementation

Before automatic real issuance: approve funding-shortfall policy and fair treatment of late registrants; preverification cannot silently consume all capacity before later eligible households have an opportunity. Define event identity, amendments, overlapping responses, closure and reopening so renaming an event cannot bypass uniqueness.

Before operational registry: approve household split/merge and representative-change rules using event-time snapshots. Before M4: approve allowance expiry, unspent commitments, refunds, disputes and outage alternatives. Before mobile architecture: choose platform order, languages, accessibility targets, private notification content and assisted access when the person lacks a usable device.

Before a live response: choose the local basket, grant ratio, authority hierarchy, operators and supported payment arrangements. These remain deliberate product decisions. No change to aid restrictions is implied by a technical fallback.
