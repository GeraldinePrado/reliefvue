# ReliefVue feature inventory and pitch preparation record — v04

Revision: 2026-10-05 centered process timeline and two-line heading. Earlier numbered versions are preserved.

## Why this document exists

Geraldine requested this durable record on 2026-10-05 so that the future hackathon/ideathon pitch can draw on the product's full feature set, including the new incident map and reporting workflow. **Do not start or declare the deck ready yet.** Resume pitch creation when Geraldine and Codex agree that the web UI is sufficient to present. No competition submission requirements or current final deadline have been checked in this task.

Read this document first when asked to prepare the pitch; then recheck the running app, [product brief](brief.md), [submission scope](submission-scope.md), [incident verification v02](incident_reporting_v02.md) and actual competition rules. Preserve the original policy decisions in the brief. If screens and policy differ, document the difference rather than treating simplified sample copy as a policy change.

## Core story to preserve

ReliefVue aims to prepare a Thailand-wide SOL reserve before disasters, authorize a clearly bounded response using observed evidence and accountable human decisions, deliver one fixed grant per eligible household, and make fund movements inspectable while keeping household evidence private. Donors worldwide and households in Thailand are the first intended audiences; the interface supports English and Thai.

The four-step explanation is **Prepare → Verify → Support → Trace**. The differentiator to test is the complete sequence of readiness, evidence, household eligibility and public accounting—not merely accepting crypto donations. This is an early-stage concept and explanatory prototype, not an operating relief organization with proven adoption or impact.

## Current hero and opening pitch hook

Implemented for Geraldine’s request for a stronger opening (2026-10-05):

**When disaster strikes, the funds should be ready.**

Desktop supporting copy uses these three lines; mobile wraps naturally:

> ReliefVue connects donors and affected households around one mission:
> prepare funds before disaster, deliver grants directly to households,
> and make every fund movement transparent and traceable on Solana.

“Prepare funds” names the reserve mechanism explicitly. This is mission language, not evidence of a funded service or proven impact. Final deck wording remains subject to the joint readiness review.

## Feature inventory: what is visible and how it works

“Demo” below means an interactive simulation in the default public walkthrough. It does not mean a production integration exists.

| Feature | User journey / purpose | Current evidence and limits |
| --- | --- | --- |
| Disaster-ready reserve | Donors prepare funds before an approved response | Homepage reserve, allocation and grant figures are sample accounting. No real funded relief reserve is demonstrated in this walkthrough. |
| Household readiness | Register before a disaster, then see a household dashboard | Demo profile and pre-event/affected-area scenarios. No real account is created; details clear on reset/refresh. Pre-registration does not reserve priority in the intended policy. |
| Private verification | Identity → usual pre-disaster residence → household or rented room | Three simulated checks. Real identity, lawful residence, evidence review and secure document storage remain planned. Evacuating does not change the relevant pre-disaster home. |
| Inclusive household eligibility | Renters and lawful foreign residents can qualify; independent rooms may be separate households | Explained in the walkthrough and seeded reviewer cases. Shared building addresses alone are not duplicates. Missing formal paperwork routes to human review, not automatic denial. |
| One grant per household/event | Request a grant for an approved affected area | Demo request, confirmation and tracking. Household uniqueness is a proposed real-service requirement; current public UI is not a production fraud-control system. |
| Fixed event grant | One published benchmark, not the reserve divided by applicants | UI fixture is 0.8 SOL. Future policy uses a validated Thai essentials basket for one flat baht-value benchmark; actual amount, exchange rule and basket remain unresolved. |
| Recipient choice | Keep SOL or choose a future baht route | Preference selection is simulated. No real conversion, exchange quote, baht delivery or wallet recovery exists in the guided flow. |
| Flexible household use | Household chooses water, transport, repairs or another urgent need when safe | Product principle, not evidence of real purchases. Chain visibility cannot prove how a recipient spent funds. |
| Request tracking | Submitted → review/clarification → approval or rejection → sample payout | Interactive walkthrough with example reasons and clarification. No measured payout-time guarantee. |
| Human review queue | Review current request, separate-room example or potential duplicate | Approve, ask for more information or reject with a reason. Roles and evidence are simulated; no staff or production review service is connected. |
| Event authorization | Watching → observed-impact review → reviewer recommendation → primary/backup approval | Numbered reviewer stages explain the next action and why later actions are unavailable. Existing household requests lock the event terms. Primary and authorized-backup paths are alternatives. Watching cannot authorize payout. Future real-money authority and signatures must be enforced outside this browser simulation. |
| Calm donor checkout | SOL presets/custom amount → review → sample receipt | Presets 0.1 / 0.25 / 0.5 / 1 SOL, sample range 0.001–10 SOL. No wallet/payment connection in this default screen. |
| Optional platform support | Donor may separately support ReliefVue's development/operation | Default zero; 0.01 / 0.02 SOL or custom in demo. $1 / $2 / custom are intended for a future supported fiat route, not live dollar payments. Separate relief and operating destinations remain essential. |
| Clear contribution summary | Relief amount + optional support, then review/edit | Demo subtotal; network/provider fees explicitly not calculated. A real checkout needs fees and final total before consent. |
| Public fund overview | Reserve, event budget, paid grants and remaining allocation | Internally reconciling fictional values. Allocation is included in reserve, not additional money. |
| Transaction replay | Contributions enter; household grants leave | Two lanes show ten rows with five earlier examples available by scrolling. The homepage pause button is removed; scroll, hover or keyboard focus pauses list movement. Varied Chiang Mai locations. Wallet fragments and references are fictional, not real signatures or a complete accounting journal. |
| Searchable incident map | Search by place/incident; select a list item or marker to inspect its report | Leaflet/OpenStreetMap base map with six fixed fictional reports; desktop sidebar, stacked mobile layout. Area centres, report times and statuses, not exact household locations or safe-route guidance. |
| Map status language | Red pulse = needs review; teal = resolved example | Pausable pulses and reduced-motion support. A red marker does not mean a verified disaster, approved budget or paid household. |
| Community reporting | Report incident type, area/public landmark, observed time and description | Local dialog validates example input and previews human review. It does not submit data, run AI, upload evidence or add a marker. |
| AI-assisted evidence assessment | Compare community leads with source-linked official information, observations and reporting | Planned. No connected government/news feeds, AI fact-checking pipeline or confidence-based verification is deployed. See source plan below. |
| Privacy-aware evidence | Keep identities, residence evidence and documents private; publish limited accounting | Intended architecture, with demonstration separation in UI. Wallets are pseudonymous, not anonymous; real chain activity can reveal full addresses. |
| Bilingual responsive interface | English/Thai, mobile forms, clear navigation, visible demo labels | Implemented interface. Map place search also accepts selected Thai location names. Browser QA is not a full accessibility certification. |
| Process timeline and impact motion | Explain Prepare → Verify → Support → Trace | The centered heading reads “From prepared funds” / “to affected household help” on two lines. Desktop numbers and copy share each column’s centre, with steps alternating below/above the rail. On mobile all numbers sit on the central vertical spine, with centered text alternating left/right. Arrow navigation is removed. A short light traces the path. Aligned fund-flow arrows also carry a short light sequence. Impact numbers remain steady with a pausable repeating highlight. |
| Alert strip and imagery | Establish context and humane focus | Headlines/times are fictional. Existing household/hero scenes are labelled illustrative, not proof of actual impact; authentic consented photography remains required for documentary claims. |

The map includes Chang Phueak, Saraphi, Old Town, Mae Rim, Hang Dong and San Sai. These are Chiang Mai local areas/districts, not six provinces. The homepage now uses a broader Chiang Mai illustrative fund scenario; the household walkthrough still uses the specific Mae Rim fixture. Do not imply every listed incident has a grant allocation or that each ledger row corresponds to a map report.

## How incident verification should work

**Report or feed item → source checks and AI-assisted assessment → human review → scoped incident status → separate response authorization → private household eligibility → confirmed transfer.**

Official observed-incident/affected-area notices are the normal primary evidence. Candidate sources include DDPM and original local authority notices. TMD weather warnings are useful for Watching, and ThaiWater observations can provide time/location context. Original newsroom reporting can corroborate an occurrence; copied/syndicated articles do not become independent evidence merely because they appear on multiple websites.

AI should extract and compare what each source actually says, preserve URLs and separate observation, publication and retrieval times. It must flag uncertainty, conflicting reports, reused images, unclear locations and unsupported claims. Forecasts, rainfall totals, a social post or an AI score alone cannot establish local flooding. Humans approve public verified labels in the initial real release; event activation still requires the separate governance policy. There is no “two news articles automatically unlock funds” rule.

A pre-declaration response is a distinct planned path: independently corroborated observed impact, a separate reviewer, primary/formally appointed backup approval of the same bounded terms, and a limited first tranche. The detailed evidence threshold, affected boundary and cap formula remain open. Full source references, access limitations and a Saraphi explanation are recorded in [incident verification v02](incident_reporting_v02.md).

## Numbers and claims to label in the deck

| Item | Meaning |
| --- | --- |
| 55,920 SOL received | Fictional starting total, not fundraising traction |
| 7,680 SOL sent | Fictional household grants: 9,600 × 0.8 SOL |
| 48,240 SOL reserve | 55,920 − 7,680; about 86% of received funds |
| 12,000 SOL response budget | Fictional allocation; 64% illustrated as paid |
| 4,320 SOL still allocated | 12,000 − 7,680; already included within the 48,240 reserve |
| 9,600 households | Scenario arithmetic, not people actually helped |
| 0.8 SOL per household | Presentation fixture, not a validated emergency grant benchmark |
| 12–24 hours | Prior pilot planning idea to test, not measured performance or a guarantee |
| Possible US$250,000 award | Conditional opportunity reported by Geraldine, not secured funding; confirm event details before including |

No users, investors, donated public reserve, secured operating partners or hired review team are established by this demo. At least two reviewers and stronger engineering are conditional staffing intentions if funded, not existing capacity.

## Technical proof: keep separate from the guided UI

The optional Devnet view now shares the main app’s elephant identity, navigation, styles and event-review component. Technical subroutes use `#technical/overview`, `/donate`, `/request`, `/activity` and `/operator`, retaining their context on reload. Main-app links return to the guided experience. Its dataset is intentionally separate: syncing fictional totals into network balances would misrepresent technical evidence. The local technical UI shows connection failures and retry actions; it does not bypass transaction requirements.

Optional `#technical` tools and the local API explore Devnet donation verification, synthetic eligibility, duplicates, queues/holds and payment intents. Local technical fixtures use different test amounts (0.01 test SOL grant / 0.05 event cap). Do not combine those totals with the public 0.8 SOL story.

Anchor reserve source is uncompiled/undeployed according to the current repository notes. A server checking rules is not an on-chain restriction on its signing key. Only present a genuine Devnet receipt after inspecting its actual signature and network. See [technical operating notes](technical-demo-notes.md), [developer handoff](developer-handoff.md) and [reserve source notes](../chain/README.md). Existing tests are not an audit or proof of a live end-to-end service.

## Proposed demo sequence when presentation work is authorized

1. Homepage: explain prepared funding and label the sample numbers.
2. Scenario map: select Saraphi; show report provenance/status concept and reporting preview. Explain AI/source checks and human escalation as planned.
3. Reviewer: explain Watching versus observed-impact evidence and simulated event approval.
4. Household: registration/checks → affected area → one grant request → review/tracking → sample outcome.
5. Donor/public record: contribution amount, optional support at zero, separate accounting and sample transfer visibility.
6. Roadmap: source integrations, household verification, governance/custody, shared persistence, tested payout/provider route and a bounded pilot.

This is an inventory and reusable demonstration sequence, not an approved slide deck or requirement to finish production architecture before pitching.

## Resume and readiness checklist

When Geraldine calls for the deck, review together:

- Agree that the web UI and demo story are ready; do not infer approval from this documentation task.
- Confirm the actual ideathon/hackathon, judging criteria, time limit, deck format and required blockchain proof.
- Reconcile current screens with this feature inventory; classify every feature as demonstrated, planned or unresolved.
- Verify the deployed revision and paths used in the demo, including mobile, map availability and a fallback if online tiles fail.
- Select approved imagery; illustrative humans/scenes cannot stand in for documented relief impact.
- Confirm open grant benchmark, source thresholds and governance claims remain labelled as open.
- Capture screenshots/receipts only from the exact revision being presented; check any genuine Devnet evidence separately.
- Agree on the funding ask, use of funds and pilot hypotheses without inventing traction or guarantees.

Maintain this record through numbered revisions. The README links the current entry point so a future session can resume from files rather than relying on conversation memory.


## Historical map and motion refinement — 5 October 2026

The homepage defaults to five source-linked October 2024 Chiang Mai records. Mueang, Mae Rim and Saraphi have flood reporting; Hang Dong and San Pa Tong show warnings, not inferred confirmed inundation. Pins are approximate area centres, not household addresses or a mapped flood footprint. The linked UNOSAT map supplies the separate satellite-extent reference. Historical records do not establish an official emergency declaration or ReliefVue operations.

A separate Report workflow demo retains fictional reports, with large location pins and All / Needs review / Resolved example filters inside the map. Historical reporting never receives invented operational resolution statuses. The report form remains local-only; AI checks, official feeds, human escalation and publication controls remain planned features as described in incident_reporting_v02.md.

Source register:
- Thai PRD / Royal Irrigation Office, 7 October 2024: https://www.prd.go.th/th/content/category/detail/id/37/iid/330050
- The Nation, Mae Rim flooding, 3 October 2024: https://www.nationthailand.com/news/general/40042031
- The Nation, downstream warnings and Saraphi roads, 7 October 2024: https://www.nationthailand.com/news/general/40042131
- UNOSAT satellite map, 5–10 October 2024: https://unosat.org/static/unosat_filesystem/4017/UNOSAT_A3_Natural_Portait_FL20240912THA_CHIANGMAI_LAMPHUN_THAILAND_10OCT2024.pdf

The source-linked pin view is selected coverage, not evidence that most districts flooded. Recheck source availability before the pitch. No historical photos or flood polygons have been fabricated.

The latest user instruction supersedes the earlier steady-number highlight preference: fictional impact values count up repeatedly, holding at their target between cycles. Reduced-motion users see stable final values; animation stops offscreen and when the document is hidden. Visible Pause highlights and Pause map pulses links were removed as requested. Fund-flow arrow lights repeat while the section is visible. The replay copy describes an illustrative response in officially declared disaster areas; this is not a claim of a verified 2024 declaration or a change to the separately documented pre-declaration governance option.


## How it works explainer refinement
The dedicated How it works page now introduces donor and household roles before a five-step timeline: Prepare together, Review the disaster, Verify the household, Deliver the grant, Trace the funds. A continuous horizontal line connects centered number markers, with alternating explanations. Smaller viewports support swipe, native keyboard scrolling and Previous/Next navigation; smooth scrolling respects reduced motion. A visible prototype note explains that the walkthrough simulates records while live feeds, AI checks and real grants remain planned. The homepage timeline is unchanged.


## Reviewer operations dashboard
The dedicated reviewer workspace now demonstrates Fact checker, Admin approver and Household reviewer roles. Six sections cover overview, scripted AI attention, fictional incident decisions, household verification, response approval and session audit. Search, status filters, reasoned incident decisions, seeded household decision labels and role handoffs work in memory. No real staff access control, AI inference, live ingestion, persistent audit or payment execution is claimed. See [reviewer_dashboard_v01.md](reviewer_dashboard_v01.md) for the Horizon UI analysis, feature inventory, production boundaries and judge walkthrough. The reviewer dashboard is an English demo; public-site Thai support remains separate.


## Populated reviewer operations and executive allocation
See reviewer_dashboard_v02.md for the active fictional 12-household response, derived pipeline graphics, evidence file mockups, routine-review/supervisor division and role-specific landing queues. Executive leadership alone sets each response budget and fixed household grant according to assessed disaster needs and severity; reviewers and supervisors cannot edit amounts. This user-confirmed allocation authority supersedes any implication that ordinary staff set grants. Within a response, all eligible households receive the same grant. The user confirmed identity/residence/household declaration categories with alternative evidence; exact accepted documents remain a future policy decision. A planned camera-only alternative and simulated replay flag are visible in the reviewer mockup. No logistics/distribution service is represented.


## Confirmed camera replay check
Geraldine confirmed that the planned AI check should detect possible photos of another photo or screen and escalate uncertain evidence to a human. A flag is not proof of fraud and must not automatically reject the household. The current reviewer mockup shows the capture source and a scripted flag only; no camera capture or AI analysis runs. See reviewer_dashboard_v03.md.


## Submission focus and scaled demo
The latest operational fixture is 1,200 households and 240 incident inputs, described in reviewer_dashboard_v04.md. These replace earlier 12-case screenshots for the pitch but remain synthetic, not traction. See pitch_readiness_v01.md for the readiness assessment, 8–10-slide outline, demo sequence and suggested remaining-time allocation. The UI is sufficient to start deck work now; competition rules and exact submission requirements still need confirmation.


## Access and organization roadmap
Geraldine added Thailand-first affected-area eligibility including lawful foreign residents, wallet/assisted-wallet/planned-baht choices, cross-border donors, country-by-country expansion and possible NGO/community/company/government adoption. See expansion_roadmap_v01.md for confirmed intent, API versus optional MCP, fixed household grants, proposed multisig governance, TM30 limitations and open decisions. Include only a short roadmap in the three-minute pitch; keep architecture and governance details in Q&A. None of these future integrations or partnerships are claimed as built.


## Residence and overview refinement
Geraldine clarified in-country physical presence and continued eligibility after domestic evacuation; use “internally displaced household.” Usual home and temporary location should be distinct. Geraldine confirmed that a disaster connection remains required: precautionary evacuation can qualify after review, while unrelated relocation or unemployment alone does not; see expansion_roadmap_v02.md. Overview styling is now a compact analytics layout with neutral surfaces, grouped metrics, pipeline charts and a short action list. A screenshot of the requested ChatGPT reference has been requested; the implementation does not claim to reproduce an unseen screen.


## Reviewer analytics reference implemented
The supplied ChatGPT analytics reference now informs a separate Analytics view: large time charts, functional period controls, geographic household distribution and expandable records. It reports relief received/disbursed/remaining, approved commitments and separate platform-support income/expenses/balance. See reviewer_analytics_v01.md for exact fixture reconciliation and boundary with the public reserve example. All metrics remain fictional; no real treasury activity is asserted.
