# ReliefVue — Product Requirements Document

Version: 0.1 · 7 October 2026 · Owner: Geraldine Prado
Status: working PRD for discussion. Confirmed decisions and unresolved questions are identified below. This document specifies the intended product; it does not claim that planned features are live.

## 1. Product direction

ReliefVue prepares country-specific disaster relief reserves before emergencies. Donors choose a country through the website. Eligible households use the planned mobile app to verify their identity, home and household, request one fixed grant when an affected area is activated, and follow payment progress. Public fund records show contributions, allocations and payments while personal evidence stays private.

Start with Thailand and Solana. Expand country by country after validating the first service. The later ReliefVue Network direction is shared relief infrastructure: country reserves, transparent grant tracking, qualified local operators, and eventually partner integrations and donations from other cryptocurrencies. It is not yet a deployed decentralized network or a verified disaster oracle.

## 2. Authority and scope

This PRD consolidates the brief, receiver/donor journeys and expansion roadmap. For the decisions recorded here on 7 October, it supersedes conflicting earlier statements about web/mobile access and geography. Earlier documents remain useful for detailed policies and historical context. Product approval does not establish technical validation.

Confirmed on 7 October:
- Thailand is the first recipient country; other countries are expansion stages.
- The intended production recipient route requires downloading the mobile app. The current web household journey remains an accessible prototype.
- Eligibility follows the household's verified usual home in the activated affected area; evacuation does not itself remove eligibility. Nationality alone does not determine eligibility. Lawful foreign residents can qualify.
- The website serves donors and public fund tracking. Donors select a country; funds go to that country's reserve.
- Household identity/residence/uniqueness verification applies to grant recipients. Donors do not undergo ReliefVue's recipient verification flow.
- Multi-cryptocurrency donations and a broader network are future requirements.
- The intended public overview shows lifetime donations globally and by country, separately from current reserves, commitments and payouts. Asset conversion/valuation remains open.
- Households may register and verify before a disaster, and new applicants can still register during a response. Claims open only for activated affected areas.
- Donors may contribute as guests; a ReliefVue account is optional for history and receipts.
- A household temporarily evacuated across a border can remain eligible after human review of its verified event-time home and disaster connection.
- The mobile download section presently says Coming soon and shows a proposed login screen. There is no published app or store listing.

Pending discussion:
- Multi-cryptocurrency conversion versus separately held assets in country reserves.
- Exact evidence for temporary absence that is unrelated to disaster remains to be defined; do not turn GPS absence into automatic rejection.

## 3. Problem and intended outcomes

Households need flexible help after disruption. Donors need to understand which reserve received their contribution, what was allocated and what was actually paid. Operators need a review process that can reject duplicates without excluding lawful residents, renters or people who have evacuated.

The product aims to prepare funding earlier, make household requests understandable, and provide a traceable payment record. Reduced delays, misuse and operating cost are hypotheses to measure in a pilot, not established outcomes.

## 4. People and product surfaces

| Person | Main surface | Main task |
|---|---|---|
| Household representative | Planned mobile app | Register, verify, request a grant, choose a receiving method, track progress and seek help |
| Donor | Public website; optional future app access | Choose a country, contribute, receive a receipt and follow reserve activity |
| Reviewer | Restricted web workspace | Check evidence and exceptions, resolve duplicates, record reasons and recommend decisions |
| Founder/authorized backup | Restricted approval workspace | Approve a documented affected area, fixed household amount and capped response budget |
| Public observer | Website | Inspect country reserve accounting and confirmed fund movements |
| Future partner organization | Scoped organization workspace/API | Operate an authorized program within defined geography and fund/privacy permissions |

A donor does not become eligible by donating. Download location, citizenship, wallet ownership and app installation do not by themselves prove lawful residence or disaster eligibility.

## 5. Delivery stages

| Stage | Included | Exit evidence |
|---|---|---|
| Current web prototype | Fictional household/donor/reviewer journeys, public scenario accounting, app preview | Clear labels; working navigation; no real personal documents; simulation distinguished from confirmed Devnet transfers |
| Funded Thailand mobile pilot | Real account/security, private recipient verification, scoped staff access, enforceable reserve controls, tested SOL payout, recovery/support procedures | Security/privacy/governance review, operational readiness and small validated pilot |
| Country expansion | Country selection, isolated reserves, local eligibility/evidence policies, languages and payout operations | Named accountable operators and tested country readiness; no unsupported country shown as open for grants |
| ReliefVue Network | Partner workspaces, authorized API/webhooks, broader donation assets and reconciliation | Proven first-country service, partner needs and tested isolation/integration controls |

Native Android/iOS technology, store release order and delivery dates remain open. A responsive website or phone illustration is not a native app release.

## 6. Recipient journey and requirements

### Entry and preparation

R-01: The public site explains household support and leads to the future app. While the app is unavailable it offers Coming soon status and the existing web demo, without fake store links.

R-02: The app offers create account, sign in and account recovery. Verification is separate from account creation; users can see the dashboard and their incomplete tasks before approval.

R-03: Registration is available before and during a disaster. Preregistration does not reserve funds or outrank a complete, eligible new claim.

R-04: Private verification covers identity, lawful residence where applicable, usual home at the relevant event date, and household uniqueness. KYC by itself does not establish an affected household.

R-05: Preserve address history, event-time home and temporary evacuation location separately. Remind users to confirm/update details; never silently change their address from GPS. Changes and uncertain timing can require human review.

### Eligibility and claims

R-06: One entitlement per verified household per activated response, not per person or wallet. Independent rented units may share a building address. A rent receipt with date/unit details is supporting evidence, not automatic proof. Group suspected duplicates for human review; same address alone is insufficient rejection.

R-07: A household's verified usual home must be inside the specifically approved affected boundary and connected to the event. Lawful foreign residents are treated under the same household rules. Domestic evacuation does not cancel eligibility. Temporary cross-border evacuation may also qualify after human review of the event-time home and disaster connection; physical absence alone is not rejection.

R-08: The dashboard shows verification status, applicable response, published fixed grant, claim status and what action is needed. With no active response it explains preparation; Watching is not permission to claim or pay.

R-09: Requests require a complete claim and available response allocation. The fixed household amount does not become a division of the remaining pot. Queue/hold handling, review exceptions and expiry are visible and auditable.

R-10: Evidence collection may use in-app live camera capture rather than gallery upload for disaster reports, consistent with prior direction. Camera-only input cannot establish authenticity. Privacy, safety, permission denial, poor connectivity and accessibility need tested alternatives; never require users to enter danger to obtain evidence.

### Payment, recovery and appeals

R-11: The initial settlement direction is SOL. Receiving choices may later include an existing compatible wallet, a qualified recoverable in-app wallet, or a qualified local-currency payout partner. Providers and custody are unselected; neither recovery nor baht delivery is currently promised.

R-12: Explain amount, currency, recipient destination, fees and net receipt before confirmation. Conversion requires explicit consent and a suitable provider. A saved preference can simplify later claims; it cannot reverse or silently redirect an existing payment.

R-13: Preserve eligibility if a provider fails. Do not silently change the payout route. Submitted/uncertain payments must be reconciled before retrying or replacing them.

R-14: Offer recovery first via verified registered channels, then documented human assistance. Replacing an inaccessible account requires re-verification and entitlement/payment history preservation. Account replacement cannot retrieve funds from a self-custody wallet without its keys.

R-15: Recipients control how to spend their paid grant. An unused balance is not proof of fraud; no inactivity clawback of completed aid is approved. Closed shops alone do not pause an otherwise eligible payout.

R-16: Give clear reasons, correction requests and a private appeal route. AI may flag a duplicate or suspicious report; humans decide contested outcomes and penalties.

## 7. Donor journey and country reserves

D-01: Show a country selector with clear availability. Thailand is the only initial active service. Future countries have Coming soon status rather than usable but unfunded/unoperated donation routes.

D-02: Before payment show the selected country, supported network/asset, exact reserve destination, amount, network/provider fees and separate optional operating support. Operating support is off by default and must not reduce a stated household allocation without disclosure.

D-03: Donors are not required to provide household identity, address evidence or disaster eligibility documents. This does not promise that payment providers or future regulated routes will never require their own checks. Donor account and payment requirements must be distinct from recipient KYC.

D-04: Guest donation is allowed; account creation is optional for receipts/history. Do not require an account merely to browse a reserve.

D-05: A confirmed receipt identifies country reserve, contribution, operating support if selected, fees, asset/network, time and transaction evidence. Pending, failed and confirmed states remain distinct. No confirmation claim from an unverified signature.

D-06: Contributions are earmarked to the chosen country's reserve. Country balances, commitments and payouts must be isolated. No silent cross-country transfers or use of relief funds for salaries. Exceptional transfers/refunds require a policy and governance decision before implementation.

D-07: Country reserves may support multiple activated areas. First-country scope remains a Thailand-wide reserve with event allocations, not separate province donation campaigns by default.

D-08: Multi-crypto donations are a later capability. Before implementation choose whether assets convert into SOL or remain separate. Record source-network confirmation, any conversion quote/fees, destination confirmation and attribution. An incoming transfer on another chain is not itself a confirmed Solana reserve deposit.

D-09: Wrong-network, unsupported-token and uncredited-payment support policies need design before enabling a new route. Never make users infer compatible chains from a ticker alone.

## 8. Disaster review, staff and treasury controls

A-01: Track Watching, evidence review, approved/active, paused and closed responses. Forecasts and newsroom leads start investigation. Activation requires documented observed impact, defensible geography and human authorization.

A-02: AI extracts/compares evidence and identifies uncertainty. It does not independently authorize disaster activation, household rejection or reserve release. An on-chain disaster status proves publication, not real-world truth.

A-03: Independent reviewer and primary/formally appointed backup approve the same response revision, area, grant and budget. Record evidence sources, decision reasons, roles and time. Staff reviewers cannot withdraw reserve funds or redirect recipients.

A-04: Founder event authority does not include an unrestricted relief withdrawal right. Production reserve controls must constrain payment purpose, eligibility attestation, household uniqueness, amount and response cap. Ordinary wallet ownership or a backend policy alone does not prove those restrictions.

A-05: Protect existing commitments. A severe event may allocate the full uncommitted reserve with fresh documented approval; do not overwrite already promised grants.

A-06: Track complete claims, review backlog, exception reasons, pending transactions and confirmed payouts. Actual confirmations alone change paid totals. Two initial reviewers are a staffing direction, not proof of throughput.

A-07: Define backup appointment, role changes, key recovery, program upgrades, emergency pause and independent accountability before real-money launch.

## 9. Amount and accounting rules

The working grant basis is a contribution toward three days of locally priced emergency essentials for a reference household of roughly 3–5 people. Every approved household in a response receives the published fixed amount. Do not vary the grant by personal salary or divide the remaining reserve by claimants. The exact basket and value require local validation.

Current illustrative figures are 55,920 SOL received, 48,240 SOL in reserve, 7,680 SOL sent to 9,600 example households, a 12,000 SOL response allocation, and 4,320 SOL still allocated. The 0.8 SOL grant is a scenario value, not a validated Thai benefit or permanent production price. SOL volatility means no fixed baht purchasing-power guarantee.

### Global and country accounting

The public overview must distinguish **lifetime confirmed donations** (cumulative money received) from **current reserve holdings** (money still held), **uncommitted funds** (money not already allocated), and **confirmed aid paid**. A lifetime total is not spendable cash. Show the global overview and each country's contribution, reserve, allocation and payout history. The global view aggregates country ledgers; it does not require a shared wallet or authorize moving earmarked funds.

When all reserves use SOL, global SOL totals sum the country SOL totals, excluding separate operating support. If several assets are held, show totals per asset and network. Do not add unlike token units or count a source donation and its conversion as two donations. Any common-currency estimate requires a documented valuation rule, source and timestamp, and is distinct from actual asset balances; that policy remains unresolved.

For every country, distinguish received relief funds, available reserve, outstanding commitments, response allocations, confirmed payouts and separate operating support. Remaining event allocation is part of the reserve, not additional funds. Record accounting assumptions and reconciliation exceptions explicitly.

## 10. Public record and privacy

P-01: Public country/event views show balances, allocations, confirmed transfers, purposes, timestamps, amounts and network/Explorer evidence where available. The demo labels fictional figures and wallet fragments as such.

P-02: Keep names, IDs, household addresses, contact details, documents and private case links off-chain and out of public APIs, analytics and logs. Publicly hashable private identifiers are not an acceptable shortcut to household uniqueness.

P-03: Wallet transactions can be traced on-chain; do not promise anonymity. Do not publish a household-to-wallet identity mapping. Location precision and small-group reports need privacy review.

P-04: Private casework requires scoped staff access, audit trails, secure storage/transit, retention/deletion policy, authenticated recovery and a breach response procedure before a real pilot.

## 11. Network expansion requirements

N-01: Add each country through an explicit readiness process: operators, verification policy, affected-area sources, grant benchmark, local languages, custody/payment routes, support and governance.

N-02: Partner workspaces isolate organizations, identities and funds. Authorized APIs/webhooks expose only permitted case/payment information. Optional MCP tooling uses the same permissions; it is not treasury authority.

N-03: A reusable disaster-data service requires evidence standards, correction/revocation, accountable publishers and a named external use case. Automated insurance payouts, sensor networks and satellite verification are outside the first pilot.

N-04: Use network language for the roadmap while identifying actual operators and trust assumptions. No claim that Solana alone removes human control, prevents corruption or validates disasters.

## 12. Quality and pilot acceptance

- Household can register, see incomplete verification tasks and receive actionable decisions without understanding blockchain jargon.
- Verified event-time home inside an active boundary can qualify after domestic evacuation; nationality alone and same-building address alone do not reject a claim.
- Repeated accounts/wallets cannot create a second paid entitlement; retries of uncertain payments cannot double-pay.
- Donor country selection persists through confirmation and receipt; a country contribution cannot silently fund another reserve.
- Receipt and public accounting reconcile to confirmed evidence; operating support remains separate.
- Mobile English/Thai layouts support readable type, keyboard/screen-reader use, errors, low bandwidth and reduced motion. Required camera/provider failures have clear next actions.
- No production readiness claim from a build or simulation. Security/privacy controls, payout integration and staff readiness require separate validation.

Pilot measures: complete-claim-to-confirmed-payment time, delivery success, review backlog, appeal reversals, exclusion errors, duplicate prevention, cost per payout and donor comprehension. A 12–24-hour window is a planning hypothesis, not a promise; no measured service level exists.

## 13. Decisions to resolve before implementation

1. First mobile platform/order and shared/native technology.
2. Wallet custody/recovery provider and local-currency payment provider.
3. Multi-crypto reserve conversion model and supported assets/networks.
4. Evidence standards for cross-border evacuation, unrelated absence and lawful-residence alternatives.
5. Country-earmarked refunds/exceptional transfer rules and donor consent.
6. Verified disaster boundary/evidence thresholds, appeals and emergency caps.
7. Validated Thai grant benchmark, quote timing and SOL exposure policy.
8. Treasury signer/upgrade/recovery governance and accountable legal operator.
9. Private data retention, support coverage, verification cost and sustainable operating budget.

## 14. Immediate deliverables and traceability

This revision creates the PRD and a bilingual homepage mobile-app preview. It does not implement native registration, KYC, app downloads, new country reserves or multi-crypto payment processing.

Related documents: [brief](brief.md), [receiver journey](receiver-journey.md), [donor journey](donor-journey.md), [expansion roadmap](expansion_roadmap_v03.md), [technical design](spec.md), [implementation handoff](developer-handoff.md), [brandbook v06](brandbook_v06/index.html). The historical ReadyFund requirements in `history/product_requirements_v01.md` are not the current PRD.
