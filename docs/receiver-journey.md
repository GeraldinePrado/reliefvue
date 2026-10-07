> Product update — 7 October 2026: [ReliefVue PRD](prd.md) records the planned recipient mobile app, web donations to country reserves, Thailand-first rollout and evacuation eligibility. Its latest confirmed decisions supersede conflicting older access/geography statements below. Current web journeys remain prototypes.

<!-- Current consolidated design requirements: design-brief.md. Later approved sections supersede earlier prompts. -->

# Receiver journey - hackathon redesign

Working name: ReliefVue; replacement-name exploration is pending. This document records agreed product interactions for the redesigned prototype, not features already deployed. It supersedes the receiver entry/registration portion of screen_state_map_v01.md. Donor and reviewer maps will be developed separately.

## Confirmed with Geraldine

- Public homepage first: explain what the app is, who it serves, how relief works, and privacy-safe fund activity.
- Get help offers sign in or account creation, followed by a private household dashboard.
- Registration and verification are available both before and during a disaster. New applicants are not excluded because they did not preregister.
- Separate identity, usual residence and household uniqueness checks. KYC alone does not establish affected-area eligibility.
- Pre-verification does not reserve a grant or establish priority over a complete verified claim from a new applicant.
- Hackathon accounts and evidence are fictional; never collect real identity documents to demonstrate this flow.

## Receiver screens agreed so far

| Screen | User task | Required states |
|---|---|---|
| Public homepage | Understand purpose, who can receive help, how funds move; choose Get help | No active response; Watching; approved response; sample activity clearly marked |
| Receiver entry | Sign in or create an account | Existing account; new applicant; account recovery entry; Try receiver demo using fictional data |
| Household dashboard | See verification, relevant response and claim status | Verification not started; draft; submitted; needs human review; verified; no approved event; approved event in home area |
| Verification | Complete identity, residence and household checks | Fictional prefilled data; incomplete information; submitted; more information needed; approved; duplicate concern routed to human review |

The dashboard remains available while checks are incomplete, showing what needs completion. This is a proposed presentation detail to confirm next, not a settled approval rule.

## Two routes to demonstrate

### Before a disaster

Homepage -> Get help -> sign in/create account -> dashboard -> complete fictional verification -> household verified, no active relief event. Watching is informational and does not open a claim. When an event is approved, check the verified usual home against the response boundary before presenting eligibility.

### During a disaster

Homepage -> Get help -> sign in/create account -> dashboard -> complete fictional verification -> eligibility and required human review -> request relief under the same household/event rules. Do not promise payment solely because an account or identity check was completed.

## Not settled in this mapping pass

- Exact verification fields and the dashboard's next-action presentation; the three-step guided flow is agreed.
- Claim confirmation, payment preference and receiver receipt screens.
- Demo treatment of exceptions, appeals and account recovery.
- Donor/reviewer journeys, visual direction and final product name.

Production KYC, custody, baht conversion and live evidence services remain funded-phase work. Prototype approval screens must identify simulations. Paid sample outcomes must not include invented Explorer receipts.
## Agreed demo form behavior

Geraldine confirmed a guided flow: identity -> usual residence -> household/room details. Visitors may type a display name and example details to experience it. No real account is created and entries are not retained.

Suggested visible notice: **Demo only. Try this flow with made-up details. No account is created, and your entries are not saved. Do not enter real ID numbers or upload personal documents.**

Implementation requirements before making that notice true:

- Keep typed entries only in temporary memory for the current walkthrough. No server submission, database, localStorage, sessionStorage, URL parameters or analytics capture of form values.
- Discard entries when the demo is reset or the page is refreshed/closed. Use a simulated continuation between steps, not a real registration request.
- Permit example names/text without identity authenticity checks. Apply basic format/length checks only where needed to demonstrate understandable forms; do not claim that acceptance verifies a person.
- Use sample document placeholders, with no real document uploads or real ID-number input requirement.
- A display name can personalize the visitor's private walkthrough but must never appear in the public recent-activity table or public household-to-wallet mapping.
- Show 'Demo verification complete' rather than implying real KYC approval. Explain that real verification would be required in a future funded service.
- Review hosting/logging and third-party integrations before claiming no form data is stored. This notice concerns entered form data and account creation, not a claim that hosting generates no technical access logs.

These are agreed redesign requirements, not a statement that the current deployed app already has this flow or privacy behavior.
## Agreed post-verification demo scenarios

After completing the guided demo verification, let the visitor explore either scenario without changing or publishing their entered details:

- **Before a disaster:** dashboard shows Demo verification complete, no approved event affecting the household, and readiness information. A Watching alert may be shown as an illustrative state; no claim is enabled.
- **Affected by a fictional flood:** dashboard shows an approved fictional response covering the example household's usual residence, the fixed illustrative grant and a Request relief action. Eligibility is a scripted demo result, not real identity, residence or disaster verification.

Provide a clearly labelled demo scenario switch/reset. It changes the walkthrough only and cannot activate a real response or authorize a transaction. Request confirmation, payment preferences, status progression and receipt presentation remain the next screens to map. The current app does not yet implement this revised receiver journey.
## Agreed claim detail confirmation

Geraldine confirmed that the receiver must review existing household and usual-residence details before submitting a relief request, with an option to edit them. Reuse the current walkthrough's temporary entries; do not ask for the same information again or imply persistent account storage.

- Show a private summary of example household and residence details.
- Offer Edit details and an explicit confirmation that the details are correct.
- Editing returns to the relevant guided verification step and preserves other temporary inputs during the current walkthrough.
- A residence change after the fictional event must not silently establish affected-area eligibility. Demonstrate a Needs human review state for that exception, consistent with the brief.
- Confirming unchanged details continues to payout preference and request review; it does not itself approve a grant.
- These are prototype requirements, not an implemented real claim or verification service.

Next mapping decision: payout preference presentation and disclosure. Keep SOL is the current technical route; Thai baht conversion is a future-provider option that may be illustrated but must be marked unavailable/simulated. No conversion, custody or exchange quote is promised by the demo.
## Agreed payout preference for the hackathon

Geraldine approved showing Keep SOL and Convert to Thai baht to explain the intended product. Thai baht must be marked 'Planned option - simulated in this demo.' No actual conversion or provider is available. The selection survives only within the current temporary walkthrough and is discarded on refresh/reset; future persistent preferences are not implemented.

This is sufficient to communicate the basic proposed choice in the pitch. Custody, conversion integration and other upgrades remain conditional on future selection/funding. No exchange quote, baht delivery or real bank details are needed for this demo.

## Approved final receiver screens

Request review: show fictional response, the illustrative fixed grant, confirmed household details and chosen payout preference. Submit demo request does not create a real claim or transfer.

Request tracking: show Submitted -> Under review -> Approved -> Demo payout complete as a scripted walkthrough. Needs more information, outside area, confirmed duplicate and awaiting allocation are separate explanatory exception states; do not imply that real review occurred. The receiver can inspect the reason and next step.

Outcome: show the illustrative grant, chosen route and sample timeline. Use 'Demo payout complete - no funds transferred' for simulated outcomes. Show an Explorer link only for a genuinely confirmed Devnet transaction, never for sample rows. No requester's name or residence appears in public activity.
## Receiver tracking approved; destination boundary

Geraldine approved the proposed request review, submission, tracking and illustrative outcome flow above as sufficient for the hackathon. Keep the destination choice limited: SOL to a Solana wallet, or future Thai-baht delivery through a provider, simulated and clearly labelled. Avoid a generic 'other' transfer route that promises undefined payment integrations. Use a sample wallet/destination in the walkthrough; do not request real bank information or create a production in-app wallet. Receiver destination mechanics are proposed demo presentation, not a live payout service.