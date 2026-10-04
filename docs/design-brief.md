# Design brief - read first for the hackathon UI

Updated 2026-10-04 from Geraldine's approvals. This is the entry point for GIE design direction, interface building and review. It consolidates current user decisions; it does not approve a palette, final name or claim deployment.

## Stage, audience and delivery

An ideathon idea plus an interactive explanatory prototype seeking possible funding. Current team: Geraldine and Codex. No users, donated reserve, investors, hired staff or operating partners. The full service is future work.

Primary viewers are judges watching a 2-3 minute video; secondary viewers explore the prototype themselves. Intended receiver audience is households lawfully resident in an affected Thailand area, regardless of nationality. Donors may be worldwide. Thailand-first; English/Thai is the intended product direction. Demo translations and any new fonts must be checked rather than assumed complete.

Submission: October 6, 2026 at 17:30 Asia/Bangkok. User prefers recording Monday October 5 at night, Tuesday morning latest. Work calmly in bounded steps. Avoid adding production systems just to fill a demo screen.

## Governing product story

A prepared SOL reserve -> documented observed flood evidence -> human event approval -> one fixed grant per privately verified household -> public accounting without recipient identities. Separate operating support from relief funds. A reusable disaster-data network, insurance and logistics are not the current product.

One flat grant is intended to be benchmarked to Thai prices for three days of essentials requiring no cooking/refrigeration for a reference household of 3-5. The baht value is unvalidated. Never divide the pot by claimants. A demo grant of 0.01 test SOL is a fixture, not a purchasing-power estimate.

## Approved public homepage requirements

The first visit explains what the app is, who can get help, how it works and what transparency means, before any registration.

1. Clear header with provisional product name, How it works, Fund activity, language control if supported and entry actions.
2. Plain-language hero: proposed Thailand-first emergency household relief. Equal understandable entries: Get help and Donate. Visible hackathon demo label, without developer setup instructions dominating the product story.
3. Who/how section: recipients verify identity, usual residence and household uniqueness; event evidence needs human approval; eligible requests receive the fixed allocation when available. Watching/forecasts do not authorize payouts.
4. Response summary with prepared/no event, Watching and approved fictional flood states. Make state labels understandable. Do not use a fake real disaster or imply real household impact.
5. Reserve summary in SOL: sample reserve, allocated, distributed and remaining values reconcile. Clearly distinguish illustrative totals from live Devnet balance if both appear.
6. Recent relief activity inspired by the supplied mempool screenshot: compact table/list, clear hierarchy, readable amounts/statuses and shortened identifiers. Suggested columns: activity type, fictional response, amount SOL, destination, status, time. Keep source/details accessible. On mobile use an equivalent readable layout.
7. Explain what funding would enable and how to try the demo. Do not invent partners, adoption, response-time guarantees or audited custody.

## Agreed receiver journey

Homepage -> Get help -> sign in/create demo account -> household dashboard -> guided identity/residence/household verification -> choose Before a disaster or Affected by fictional flood -> review/edit/confirm details -> payout preference -> request review/submit -> tracking -> illustrative outcome.

Registration works before and during a disaster; pre-registration gives no reserved grant priority. Use sample evidence and example fields; never request real ID numbers/documents. A display name can personalize the private walkthrough. Entries stay in current-page memory only, not server/database/browser storage/URLs/analytics, and disappear on refresh/reset. Verify this before publishing the notice: 'Demo only. Use made-up details. No account is created, and your entries are not saved.'

Identity, residence and household uniqueness are distinct. Address changes after an event go to human review. Separate rented rooms may be separate households; same building/name alone does not prove a duplicate. Paid grants are not reclaimed for inactivity.

Payout choice: Keep SOL to a sample Solana wallet, or Convert to Thai baht labelled 'Planned option - simulated in this demo.' No real conversion, bank form, production in-app wallet or recovery promise. Track Submitted -> Under review -> Approved -> Demo payout complete. Show a helpful next step for More information needed. Outcome says 'Demo payout complete - no funds transferred.'

## Agreed donor journey

No ReliefVue account required. Homepage -> Donate -> SOL or proposed local-currency route -> amount -> optional operating support, off by default -> review distinct destinations/amounts/total -> demo confirmation -> sample receipt -> public activity.

Local currency is a proposed provider conversion to SOL, not automatic or implemented. Any exchange illustration says sample, not a live quote. No real card/bank details. Optional support is distinct from relief and cannot reduce/change the relief contribution when declined. Public accounting remains SOL. Technology/provider research comes later and must not be presented as a partnership.

## Proposed reviewer interface - pending detailed map

Separate reviewer demo entry; show a fictional request queue, private request details, evidence/duplicate flags, and approve/request-information/reject actions with a reason. Separately show disaster evidence review/recommendation and primary or appointed backup event approval. Reviewing a household is not an unrestricted reserve withdrawal. These are simulated roles; do not build production staff authentication or a real KYC database for this walkthrough.

Only fictional seeded records may populate the reviewer interface. Whether a visitor's temporary entries appear in that simulated queue must be confirmed before implementation; never persist or publish them accidentally.

## Public privacy and transaction truth

Never show names, room numbers, personal addresses, documents, emails or claimant account-to-wallet mapping publicly. Public rows say Household grant, not the requester name. Wallet shortening is display treatment, not anonymity. Only coarse fictional response location is shown.

Separate sample activity from confirmed Devnet activity. No invented signatures, Explorer links, live timestamps, fees, or 'confirmed on-chain' labels for simulated rows. A real receipt requires genuine successful chain verification. Registration/verification/status simulation cannot imply an actual payout.

## Visual authority

- Current name ReliefVue is provisional; name alternatives are requested, none chosen.
- Existing green UI is the old prototype and is not the requested redesign.
- Brandbook v02 is a review candidate. Its navy/purple/coral/off-white direction has historical user input, but exact identity/type/logo selection is not approved. Read current user choices before committing it.
- The mempool screenshot is a reference for recent-activity presentation and potentially color mood, not a request to copy Bitcoin mechanics, fee columns, identity or the entire interface.
- No approved project impact photos are supplied. Do not generate/borrow disaster victims or imply fictional photos prove actual ReliefVue delivery.

## Design acceptance checklist

- Visitors understand purpose and can choose receiver/donor without technical knowledge.
- Receiver and donor complete a realistic guided demo rather than selecting internal test cases.
- Reviewer task is a separate view with understandable evidence/reasons.
- Temporary form privacy promise matches implementation.
- Simulations, future integrations and actual chain receipts are visibly distinguished.
- Public activity hides identities; totals reconcile; desktop/mobile and keyboard use are checked.
- Product name, first-view composition, palette/type and key screens are visually reviewed before full implementation.
- Inspect the exact Vercel URL/revision before claiming the redesign is deployed. URL still needs confirmation.

## Read order and status

1. This design brief and [submission-scope.md](submission-scope.md) for current priorities.
2. [receiver-journey.md](receiver-journey.md) and [donor-journey.md](donor-journey.md) for decisions; later approved sections supersede earlier discussion prompts.
3. [brief.md](brief.md) for product safeguards and conditional roadmap.
4. Brandbook v02 and supplied screenshot as provisional visual material.
5. [spec.md](spec.md) and [developer-handoff.md](developer-handoff.md) for existing technical groundwork and limitations, not the current production task list.

Current local UI source does not implement these revised guided journeys. Documentation aligned; design, implementation and deployment still pending. screen_state_map_v01.md is historical and must not override this brief.
