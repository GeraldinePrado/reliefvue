# ReliefVue

## Prepare before disaster. Trace every relief payment.

ReliefVue is a Thailand-first concept for household emergency grants on Solana. It proposes keeping a donated reserve ready before disasters strike, reviewing requests when real impact is confirmed, and sending approved aid directly to verified household wallets. Public payment records would show how funds move; personal information would stay off-chain.

**Current stage: ideathon concept and hackathon prototype.** The public walkthrough uses fictional households and simulated verification, donations and payouts. There are no live aid recipients, donated reserve or operating partners.

[Explore the demo](https://reliefvue.vercel.app/) · [Read the product brief](docs/brief.md) · [Current brandbook](docs/brandbook_v03/index.html) · [Approved identity package](docs/approved-identity_v01/README.md)

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

Use [the approved identity package](docs/approved-identity_v01/README.md) and [design brief](docs/design-brief.md) when redesigning the interface. The guided app and optional Devnet workspace share the selected identity and navigation; their explanatory and technical datasets remain separate. The rejected flat elephant reconstruction is not an approved asset. Brandbook application examples are proposals; documentary photograph reuse permission remains pending.

## Run locally — Windows or Mac

Use Node.js 22.12 or later:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. The guided demo needs no API or wallet.

```sh
npm run check
```

The check command runs type checking, focused tests and both build modes. `npm run build:web` produces the static public preview selected by `vercel.json`; `npm run build` produces the frontend for the local API. Both write `dist/`, so the last build determines the mode.

For optional technical tools, start `npm run server` in another terminal and open `#technical`. The API binds localhost port 8787; simulated staff roles and its session token are not production authentication. See [technical operating notes](docs/technical-demo-notes.md) before funding any Devnet fixture.

## Pitch preparation memory

Start with [the feature inventory and pitch preparation record](docs/pitch_preparation_v04.md) when Geraldine asks to build the deck. It records the current demo, planned features, incident source strategy and unresolved claims. Deck creation is deferred until Geraldine and Codex agree the UI is ready; this is documentation, not presentation approval.

## Project documents

- [Product brief](docs/brief.md), [submission scope](docs/submission-scope.md) and [design brief](docs/design-brief.md).
- [Incident reporting and AI-to-human verification plan](docs/incident_reporting_v02.md).
- [Receiver journey](docs/receiver-journey.md) and [donor journey](docs/donor-journey.md).
- [Developer handoff](docs/developer-handoff.md), [technical design](docs/spec.md) and [progress](docs/progress.md).
- [Reserve program handoff](chain/README.md): Anchor source is currently uncompiled and undeployed.
- [Brandbook v03](docs/brandbook_v03/index.html): current direction; earlier guides are historical.

The stack is Vite, strict TypeScript, Solana Kit and Wallet Standard, with a separate local policy/persistence/chain API. Production authentication, KYC, custody, fiat conversion and a public payout backend are outside this submission's scope.

Only reviewed project source, assets and documentation belong in this public repository. Do not publish real identities, secrets, generated keys, dependencies or private workspace records. A GitHub push alone does not establish that Vercel has deployed the same revision.
