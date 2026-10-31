> **Operations platform MVP — 29 October 2026:** A working local product now sits beside the concept site at [`app.html`](app.html). It includes a donor flow, a recipient mobile web app, a staff dashboard with application review and 2-of-3 payout signatures, a public ledger, a SQLite API and a read-only partner REST/MCP surface. Run it with `npm run demo` and open `http://127.0.0.1:5173/app.html` (see the [demo runbook](docs/demo_runbook_v01.md)). It is a **local prototype**: money is simulated, identity verification is demo-only, and the API is not deployed. Read the [platform architecture](docs/platform_architecture_v01.md), [Thai pilot constraints](docs/platform_policy_constraints_v01.md) and [open decisions](docs/platform_open_questions_v01.md).
>
> **Development direction — 24 October 2026:** ReliefVue is a global network with a recipient mobile app, starting operational exploration in Southeast Asia country by country. Thailand-first and unrestricted-payout descriptions below describe the earlier prototype. Start with the [consolidated PRD v0.5](docs/prd_v05.md) and [development sequence](docs/development_sequence_v01.md). PromptPay is a Thailand-specific feasibility requirement; no live payment integration is claimed. The existing demo and historical notes remain preserved below.

# ReliefVue

Development work follows the [checkpoint workflow](docs/checkpoint_workflow_v01.md): one task at a time, verified implementation, a clear completed/next update, and a push to the GitHub development branch.

Current development checkpoint: [Demo readiness and provider research](docs/development_checkpoint_v03.md) (31 October 2026). Earlier checkpoints: [Operations platform MVP](docs/development_checkpoint_v02.md) (29 October 2026) and [Task 2 local reserve proof](docs/development_checkpoint_v01.md).

## Prepare before disaster. Trace every relief payment.

ReliefVue is a Thailand-first concept for household emergency grants on Solana. It proposes keeping a donated reserve ready before disasters strike, reviewing requests when real impact is confirmed, and sending approved aid directly to verified household wallets. Public payment records would show how funds move; personal information would stay off-chain.

**Current stage: ideathon concept and hackathon prototype.** The public walkthrough uses fictional households and simulated verification, donations and payouts. There are no live aid recipients, donated reserve or operating partners.

[Explore the demo](https://reliefvue.vercel.app/) · [Read the product brief](docs/brief.md) · [Current brand guide](docs/brandbook_v07/index.html) · [Approved identity package](docs/approved-identity_v01/README.md)

## The problem we want to address

Disaster-affected households need flexible support, while donors need a clearer account of where their contributions go. ReliefVue brings preparedness, household review and visible fund movements into one proposed service. Its aim is to reduce delays, unnecessary intermediaries and misuse; those outcomes still need to be tested in a real pilot.

## How the proposed service works

1. **Prepare:** donors contribute SOL to a dedicated relief reserve, separate from optional operating support.
2. **Confirm impact:** official alerts and corroborated evidence inform disaster review. AI helps filter evidence; human reviewers and an authorized approver decide activation.
3. **Verify the household:** identity, residence in the affected area and duplicate household requests are checked. Separate rented units require careful review.
4. **Approve a fixed grant:** one allocation per eligible household, rather than dividing the remaining pot among applicants. The intended reference is three days of basic Thai necessities for a household of roughly three to five people; the amount is not yet validated.
5. **Send and trace:** approved support goes to a verified wallet. Public transaction records provide an accounting trail without publishing names, identity documents or household addresses.

Recipients would choose whether to keep SOL or convert through a suitable local provider. Baht conversion, recoverable wallets and production custody are future integrations, not current features. SOL prices fluctuate; holding SOL does not preserve its baht value.

## Why Solana?

Solana provides a common ledger for donations and payments, allowing fund movements to be inspected independently. Recording a payment does not prove that a disaster report or household claim is true: evidence assessment and accountable human decisions remain necessary. The reserve program and its authority restrictions must be implemented and reviewed before handling real funds.

## What you can try today

| Journey | Demonstrated flow |
| --- | --- |
| Receiver | Example profile → simulated identity/residence/household checks → fictional flood → grant request → status tracking |
| Reviewer | Sample queue → review reason → approve, request clarification or reject |
| Donor | SOL amount → separate optional support → confirmation → sample receipt |
| Public view | Sample recent activity and simulated fund movements |

The guided demo creates no real account or database record. Entered details stay in current-page memory and clear on reset or refresh. Use example information. Optional developer tools demonstrate separate **Solana Devnet** interactions using test SOL only; they do not make the public walkthrough a live payout service.

## Brand and design handoff

The selected identity combines the **B 3D elephant**, Alegreya Sans wordmark, a gentle ivory canvas, navy text, purple actions and lavender/coral logo accents. English and Thai typography directions are documented in the current guide.

Use [the approved identity package](docs/approved-identity_v01/README.md), [brandbook v07](docs/brandbook_v07/index.html) and [design brief](docs/design-brief.md) when redesigning the interface. The recipient mobile app has a build-ready specification in [mobile design handover v01](docs/mobile_design_handover_v01.md): eight screens, the locked palette, component states, the Malay-Chinese sample household and a paste-ready prompt for an AI designer. The guided app and optional Devnet workspace share the selected identity and navigation; their explanatory and technical datasets remain separate. The rejected flat elephant reconstruction is not an approved asset. Brandbook application examples are proposals; documentary photograph reuse permission remains pending.

## Run locally — Windows or Mac

Use Node.js 22.12 or later:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. The guided demo needs no API or wallet.

### Operations platform

```sh
npm run demo:reset      # clean fictional seed
npm run demo            # API + Vite; picks a free API port
npm run demo:check      # second terminal: health and route check
```

Open http://127.0.0.1:5173/app.html. `npm run demo` starts the platform API (8788 by default, or the next free port) and Vite on 5173; Vite follows the chosen API port. Staff demo: `admin@reliefvue.demo` / `reliefvue-demo`; reviewer and two approver personas are one-click on the sign-in screen. Recipient demo: phone `0810000001`, with the OTP shown on screen. Reset the database from Settings or with `npm run demo:reset`. All money is simulated; use fictional data only. Start with the [demo runbook](docs/demo_runbook_v01.md), then the [platform architecture](docs/platform_architecture_v01.md).

```sh
npm run check
```

The check command runs type checking, focused tests and both build modes. `npm run build:web` produces the static public preview selected by `vercel.json`; `npm run build` produces the frontend for the local API. Both write `dist/`, so the last build determines the mode.

For optional technical tools, start `npm run server` in another terminal and open `#technical`. The API binds localhost port 8787; simulated staff roles and its session token are not production authentication. See [technical operating notes](docs/technical-demo-notes.md) before funding any Devnet fixture.

## Pitch preparation memory

Start with [the feature inventory and pitch preparation record](docs/pitch_preparation_v16.md) when Geraldine asks to build the deck. It records the current demo, planned features, incident source strategy and unresolved claims. Deck creation is deferred until Geraldine and Codex agree the UI is ready; this is documentation, not presentation approval.

## Product direction — 7 October 2026

The planned mobile app is the recipient route for private household verification and grant requests; the website supports donors and public fund tracking. Start with Thailand, then expand country by country with separate reserves. Broader cryptocurrency donations and partner network capabilities are future stages. The current web household flow remains a prototype, and the mobile preview is Coming soon. See the [working PRD](docs/prd.md) for confirmed decisions and open questions.

## Project documents

- [Product brief](docs/brief.md), [submission scope](docs/submission-scope.md) and [design brief](docs/design-brief.md).
- [Incident reporting and AI-to-human verification plan](docs/incident_reporting_v03.md).
- [Receiver journey](docs/receiver-journey.md) and [donor journey](docs/donor-journey.md).
- [Developer handoff](docs/developer-handoff.md), [technical design](docs/spec.md) and [progress](docs/progress.md).
- [Identity, PromptPay and KYC data security](docs/identity_kyc_payout_and_data_security_v01.md): national ID checksum limits, KYC tiers, PromptPay payout models, and how household documents should be stored, encrypted and tamper-evidenced.
- [Identity on Solana](docs/solana_identity_and_attestation_v01.md): what `.sol` names, Solana attestations and KYC/KYB providers prove, and what they do not.
- [KYC/KYB provider update — Didit](docs/kyc_kyb_provider_update_didit_v01.md): the Thai DOPA data-match and Thai KYB it advertises, the Solana attestation gap, and the questions to ask before integrating.
- [Demo runbook](docs/demo_runbook_v01.md): pre-demo reset and smoke check, the eight-minute path, fallbacks and the claims not to make.
- [Brand platform](docs/brand_platform_v01.md): vision, mission, five values, the preferred tagline and the before/during/after anti-corruption standard.
- [42-second explainer](docs/reliefvue_explainer_42s_v01.html): the full visual journey — Protect aid, then Prepare, Review, Verify, Deliver, Trace, and a six-second closing manifesto with the five values and `@ReliefVue`. 0.8 SOL, wallet or fiat via a planned PromptPay route. No presenter, no paragraphs.
- [30-second cut](docs/reliefvue_explainer_30s_v04.html): the same visual language in a shorter loop, ending on the ledger instead of the manifesto.
- [Earlier brand film](docs/reliefvue_explainer_30s_v02.html): the first cut, kept for comparison.
- [Southeast Asia country readiness](docs/sea_country_readiness_v01.md): the four-part test for a new country and research starting points for identity and payout rails.
- [Mobile design handover](docs/mobile_design_handover_v01.md): eight recipient screens, locked brand palette and a prompt for an AI designer.
- [Reserve program handoff](chain/README.md): Anchor program compiled and tested on a local validator; Devnet deployment and application integration remain pending.
- [Brand guide v07](docs/brandbook_v07/index.html): current direction, including the mission, vision, values and anti-corruption platform; earlier guides are historical. The deployed website serves the guide at `/brand-guide/`.

The stack is Vite, strict TypeScript, Solana Kit and Wallet Standard, with a separate local policy/persistence/chain API. Production authentication, KYC, custody, fiat conversion and a public payout backend are outside this submission's scope.

Only reviewed project source, assets and documentation belong in this public repository. Do not publish real identities, secrets, generated keys, dependencies or private workspace records. A GitHub push alone does not establish that Vercel has deployed the same revision.

Reviewer operations: [dashboard design, role walkthrough and prototype boundaries](docs/reviewer_dashboard_v05.md).

Pitch next: [readiness, narrative and time plan](docs/pitch_readiness_v03.md).

Longer-term direction: [access, geography and organization roadmap](docs/expansion_roadmap_v03.md).

Reviewer financial analytics: [scenario accounting and controls](docs/reviewer_analytics_v02.md).

Current review: [application, brand and pitch-readiness findings](docs/review_report_v02.md).
