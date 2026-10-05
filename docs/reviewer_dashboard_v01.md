# ReliefVue reviewer operations demo

## Approved direction

Geraldine approved a demo role switcher for Fact checker, Household reviewer and Admin approver. The dashboard is an English-language presentation workspace at `#reviewer` (also `#operator`). The public English/Thai site remains separate. Production staff authentication and authorization are not implemented by this redesign.

## Reference analysis

Reviewed Horizon UI's repository, admin layout, routes and default dashboard:
- https://github.com/horizon-ui/horizon-ui-chakra
- https://github.com/horizon-ui/horizon-ui-chakra/blob/main/src/layouts/admin/index.js
- https://github.com/horizon-ui/horizon-ui-chakra/blob/main/src/views/admin/default/index.jsx
- https://github.com/horizon-ui/horizon-ui-chakra/blob/main/src/routes.js

Useful patterns: persistent navigation, clear active section, modular statistics, responsive grid, searchable task tables and dedicated admin content. ReliefVue uses these patterns in its existing Vite/TypeScript DOM implementation. No Horizon UI source was copied and React/Chakra were not introduced. Its earnings, sales, traffic and NFT content does not fit reviewer decisions and was not adopted.

Identity follows the current user-approved interface rather than the older green brandbook: elephant logo, Deep Navy sidebar, off-white workspace, white evidence surfaces, purple navigation, coral attention flags, IBM Plex Sans controls and restrained Fraunces overview heading.

## Information architecture

| Section | Reviewer purpose | Working demo behavior |
| --- | --- | --- |
| Overview | Understand queue and role handoffs | Counts derive from fictional incident state, current walkthrough claim, event approval and session audit |
| AI attention | Find uncertain reports | Scripted flags for location gaps, image-date uncertainty and possible duplicates; search and open cases |
| Incident reports | Examine and decide | Source/time/location/corroboration checklist, status filtering, required reason, request evidence/resolve/reject/reopen |
| Household verification | Check eligibility privately | Existing anonymized walkthrough request plus seeded room/duplicate cases; reasoned decisions and seeded status updates |
| Response approval | Separate evidence review from authorization | Existing watching → evidence → recommendation → primary or appointed backup approval sequence |
| Audit trail | Explain who did what | Session time, simulated role, action and reason; user-entered reasons escaped before display |

## Roles and judge walkthrough

1. Open Overview as Fact checker. Note the three fictional reports awaiting review.
2. Open AI attention and select INC-104. Explain that the flag is scripted and does not establish truth.
3. Request more evidence with a fictional reason. The queue count updates; Audit trail records the action.
4. Open Response approval: start Watching, inspect evidence and record the recommendation. Forecast alone is insufficient.
5. Switch to Admin approver and authorize as primary or formally appointed backup. Household approval and payout remain separate.
6. Switch to Household reviewer and open Household verification. Inspect R-002, the seeded rented-room example; record a reasoned decision. A shared building alone does not prove duplication.
7. Return to Audit trail to show each handoff. Optionally create an anonymized walkthrough request from the public household journey and review it here.

Disabled controls indicate role or sequence constraints. This is a UI simulation: anyone can switch roles. It does not enforce real segregation of duties, authenticate staff, sign program transactions or pay a grant.

## Evidence and AI plan

All incident case records and AI flags in this dashboard are fictional fixtures. The separate October 2024 source library links to dated reporting; those sources are context, not corroboration of the invented cases. No confidence score or AI verdict is fabricated.

A future service should collect official agency bulletins, original news reporting and community submissions with provenance and observed/reported timestamps. AI could extract location/time, detect likely duplicates and surface contradictions. Missing, conflicting or uncorroborated evidence escalates to human review. A reviewer must distinguish several articles repeating one source from independent corroboration. Incident verification, event authorization and household eligibility remain distinct decisions.

Production requires verified staff accounts, server-enforced permissions, reasoned approval records tied to event revisions, protected evidence storage, independent reviewer/approver identities and durable audit logging. These are planned, not demonstrated security capabilities.

## State, privacy and reset

State is in memory, with no localStorage or server publication. Reloading clears reviewer incident decisions and audit records. Reset incident examples resets only the four incident fixtures and their filters; it records a reset action, preserving the existing audit and event/household state. The public global reset clears the full demo and reviewer state.

No real names, identity documents or household addresses populate the reviewer queue. A reason field requests fictional details. The audit is session-only and is neither immutable nor on-chain. Seeded household decisions change the example label and audit without creating a real claim or payout.

## Verification

Public build and all 13 existing tests passed. Browser checks exercised incident decision logging, event sequence, role-dependent buttons, primary approval, seeded household status updates and all six sections at 390px without document overflow. Desktop overview visually inspected at 1440px. Tables scroll inside their containers and mobile navigation scrolls horizontally. This is not a formal accessibility or production security audit.
