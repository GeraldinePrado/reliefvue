# ReliefVue feature inventory and pitch preparation record

## Why this document exists

Geraldine requested this durable record on 2026-10-05 so that the future hackathon/ideathon pitch can draw on the product's full feature set, including the new incident map and reporting workflow. **Do not start or declare the deck ready yet.** Resume pitch creation when Geraldine and Codex agree that the web UI is sufficient to present. No competition submission requirements or current final deadline have been checked in this task.

Read this document first when asked to prepare the pitch; then recheck the running app, [product brief](brief.md), [submission scope](submission-scope.md), [incident verification v02](incident_reporting_v02.md) and actual competition rules. Preserve the original policy decisions in the brief. If screens and policy differ, document the difference rather than treating simplified sample copy as a policy change.

## Core story to preserve

ReliefVue aims to prepare a Thailand-wide SOL reserve before disasters, authorize a clearly bounded response using observed evidence and accountable human decisions, deliver one fixed grant per eligible household, and make fund movements inspectable while keeping household evidence private. Donors worldwide and households in Thailand are the first intended audiences; the interface supports English and Thai.

The four-step explanation is **Prepare → Verify → Support → Trace**. The differentiator to test is the complete sequence of readiness, evidence, household eligibility and public accounting—not merely accepting crypto donations. This is an early-stage concept and explanatory prototype, not an operating relief organization with proven adoption or impact.

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
| Event authorization | Watching → observed-impact review → reviewer recommendation → primary/backup approval | Scripted reviewer view. Watching cannot authorize payout. Future real-money authority and signatures must be enforced outside this browser simulation. |
| Calm donor checkout | SOL presets/custom amount → review → sample receipt | Presets 0.1 / 0.25 / 0.5 / 1 SOL, sample range 0.001–10 SOL. No wallet/payment connection in this default screen. |
| Optional platform support | Donor may separately support ReliefVue's development/operation | Default zero; 0.01 / 0.02 SOL or custom in demo. $1 / $2 / custom are intended for a future supported fiat route, not live dollar payments. Separate relief and operating destinations remain essential. |
| Clear contribution summary | Relief amount + optional support, then review/edit | Demo subtotal; network/provider fees explicitly not calculated. A real checkout needs fees and final total before consent. |
| Public fund overview | Reserve, event budget, paid grants and remaining allocation | Internally reconciling fictional values. Allocation is included in reserve, not additional money. |
| Transaction replay | Contributions enter; household grants leave | Two lanes show ten rows with five earlier examples available by scrolling. Pause/replay controls; varied Chiang Mai locations. Wallet fragments and references are fictional, not real signatures or a complete accounting journal. |
| Searchable incident map | Search by place/incident; select a list item or marker to inspect its report | Leaflet/OpenStreetMap base map with six fixed fictional reports; desktop sidebar, stacked mobile layout. Area centres, report times and statuses, not exact household locations or safe-route guidance. |
| Map status language | Red pulse = needs review; teal = resolved example | Pausable pulses and reduced-motion support. A red marker does not mean a verified disaster, approved budget or paid household. |
| Community reporting | Report incident type, area/public landmark, observed time and description | Local dialog validates example input and previews human review. It does not submit data, run AI, upload evidence or add a marker. |
| AI-assisted evidence assessment | Compare community leads with source-linked official information, observations and reporting | Planned. No connected government/news feeds, AI fact-checking pipeline or confidence-based verification is deployed. See source plan below. |
| Privacy-aware evidence | Keep identities, residence evidence and documents private; publish limited accounting | Intended architecture, with demonstration separation in UI. Wallets are pseudonymous, not anonymous; real chain activity can reveal full addresses. |
| Bilingual responsive interface | English/Thai, mobile forms, clear navigation, visible demo labels | Implemented interface. Map place search also accepts selected Thai location names. Browser QA is not a full accessibility certification. |
| Process timeline and impact motion | Explain Prepare → Verify → Support → Trace | Desktop alternates below/above the line; mobile follows a downward zigzag. Impact numbers remain steady with a pausable repeating highlight. |
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
