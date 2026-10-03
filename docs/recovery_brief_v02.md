# ReliefVue recovery brief

Date: 2026-10-02
Ownership: shared client/colleague project, confirmed by Geraldine.
Status: corrected requirements record and proposed implementation sequence. The existing HTML was rejected by Geraldine; this document does not approve a replacement design.

## Source and purpose

The original project AGENTS.md, PRD, architecture and build plan remain authoritative except where Geraldine explicitly changed the name, timing or product direction. The assistant's reliefvue_brief_v01.md incorrectly removed real Solana functionality. Preserve that file as history, not as the build authority.

Geraldine reports roughly two hours remaining, less than three, and wants to submit as soon as possible. Submission is through an online form; there is no live front-of-room presentation. Form questions will arrive later. The app and evidence must therefore explain themselves.

## Product to preserve

ReliefVue keeps an emergency reserve funded before disaster. Donors contribute and follow fund movements. Affected households have private profiles, establish eligibility for an activated area, and request direct assistance. An authorized reviewer checks the official declaration before opening claims. One verified household can receive one allocation per disaster.

Both donating and receiving are primary journeys. Thailand is the initial context. Use one fictional Bangkok event and synthetic Bangkok/Chiang Mai households for the prototype, explicitly identified as demonstration data. Verified home area matters; current GPS alone must not exclude an evacuated resident.

Blockchain records transfers and enforces the rules implemented in its program. It does not establish that a person, address, photograph or official notice is genuine. Live photos are optional supporting evidence, not conclusive eligibility proof. No real identity documents are needed for the demo.

## Requirements and boundaries

| Requirement | Basis | Implementation boundary |
|---|---|---|
| Pre-funded reserve and public accounting | Original handover | Distinguish unallocated reserve, event allocation and paid amount; do not double count allocations |
| Donate with wallet and receipt | Original handover | Real Solana Devnet transfer, pending/failed/confirmed states and Explorer link |
| Profile and affected-area eligibility | User discussion | Synthetic profile with clear residence and event checks; no production identity verification claim |
| Direct claim and duplicate rejection | Original handover | Real Devnet payout; persistent duplicate protection, with its actual enforcement layer disclosed |
| Payout choice | User accepted discussion | Wallet path; baht path visibly unavailable or an explicitly simulated preview, never a claimed real conversion |
| Public transaction trail, private identity | Original handover and user discussion | Genuine signatures for real transfers; no names, addresses or documents on-chain |
| AI contribution | Geraldine confirmed on 2026-10-02 | Review supplied notice text; suggest affected area and missing/unclear details for human approval. A fixed example is labeled illustrative; live AI requires a configured service key |
| Official declaration activation | User discussion | Fictional notice in demo; production authority/source verification still unresolved |
| Independent online evaluation | Latest user clarification | Clear start state and navigation; no presenter required to explain a sequence of hidden controls |

## Proposed screen structure

1. Overview: active event, reserve totals, Donate and Request Relief, and visible link to Fund Activity. Keep the product explanation to a short sentence.
2. Donate: connect wallet, amount, confirm, transaction status, receipt.
3. Request Relief: synthetic profile, affected-area check, eligibility result and explanation, payout choice, claim, receipt. Show outside-area, needs-review and already-received outcomes in context.
4. Fund Activity: funding and payouts with confirmed signatures and accounting totals. Clearly distinguish demo fixtures from chain observations.
5. Operator view: source notice, proposed AI extraction/review, explicit activation. It is separate from the public donor/recipient flow. Hiding a button is not authorization.

Use one restrained, consistent application layout. Reduce decorative hero space and repeated explanatory cards. The first viewport must show the event and the two primary actions. Visual styling is still proposed, not approved.

## Implementation sequence for the remaining time

- First 10 minutes: reconcile requirements, inspect available wallet/RPC/toolchain and choose the shortest working Devnet path. Missing Anchor is not a reason to abandon client transactions.
- Next 25 minutes: build the separate journeys and their empty, blocked, pending and receipt states using synthetic profile data.
- Next 45 minutes: connect donation and payout to Devnet, implement persistent duplicate protection and reconcile confirmed balances. Use the handover's documented backend fallback if a custom program cannot be completed; disclose that duplicate protection is then off-chain. Never label it smart-contract enforcement.
- Next 15 minutes: add the bounded AI feature if a usable service is available. Otherwise record it as unimplemented; do not fabricate model execution.
- Next 15 minutes: verify the complete path, reload and duplicate handling, wallet rejection, insufficient funds, mobile layout, privacy and receipt links.
- Final 10 minutes: prepare submission-ready factual answers and evidence, map to the actual form when supplied, and report remaining gaps. Submission/deployment details are not yet known.

These are time budgets, not a guarantee that chain integration or external services will succeed. Report a concrete blocker immediately; do not silently replace a required feature with simulation. Cut charts, animation, secondary admin features and decorative content before the core transaction journey.

## Acceptance checklist

- [ ] A first-time visitor can find Donate, Request Relief and Fund Activity without explanation.
- [ ] A donor connects a wallet and completes a Devnet donation with a verifiable signature.
- [ ] The recipient sees why their synthetic household is eligible or blocked before claiming.
- [ ] Eligible claim produces a real Devnet transfer and receipt.
- [ ] A repeat claim for the same household/event fails, including after reload; enforcement layer is documented.
- [ ] A Chiang Mai household cannot claim the Bangkok allocation.
- [ ] Fiat availability is accurate; no false conversion success is shown.
- [ ] AI is either demonstrated with actual input/output or explicitly listed as unimplemented.
- [ ] Displayed accounting agrees with the underlying confirmed transactions.
- [ ] No real PII or signing secret appears in the public UI, source bundle or chain.
- [ ] Essential journeys work on desktop and mobile; errors explain recovery.
- [ ] Submission claims match verified implementation and the form's actual requirements.

## Open assumptions

Production household verification, declaration authority integration, supported off-ramp partner, emergency connectivity and AI provider are unresolved. The AI task is decided, but no live AI key is available in this environment. These gaps do not justify inventing production readiness. The online form may introduce additional required evidence; incorporate it when received.
