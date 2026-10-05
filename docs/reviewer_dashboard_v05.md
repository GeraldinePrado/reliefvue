# ReliefVue reviewer operations — populated response

v05 supersedes reviewer_dashboard_v04.md; reconciles the shared finance, current entry placement and camera replay-detection decision. Horizon UI reference analysis and prototype security boundaries still apply.

## Confirmed responsibilities

Geraldine confirmed on 5 October 2026:
- Household reviewers approve routine eligible grant applications.
- Supervisor / Admin handles disputed duplicates, suspected fraud, contradictory evidence and exceptions.
- Grant amounts are embedded response terms. Only executive leadership allocates the response budget and fixed household grant, based on assessed disaster needs and severity. Reviewers and supervisors cannot edit amounts.
- Separate event authorization remains in place. Allocating terms, authorizing an event, verifying a household and sending a payment are separate responsibilities.

The fixed grant can differ between executive-approved disaster responses; it does not vary by household size or individual reviewer discretion within one response. Existing policy guardrails still apply. No executive editing interface or production allocation enforcement was added.

## Visible navigation and role behavior

Reviewer / Admin Dashboard · Demo appears in the top demo strip and footer, outside the main public navigation. The alert and public navigation stick together.

Switching demo role opens a relevant queue:
- Fact checker → AI attention.
- Household reviewer → Household verification.
- Supervisor / Admin → Supervisor escalations.

Overview copy and primary action also change by role. All roles can inspect other sections; decision controls depend on the simulated responsibility. This is a publicly accessible mockup, not authenticated staff access.

## Operational scenario

The populated fictional Chiang Mai response contains 10,440 applications across six areas: 300 pending review, 180 awaiting information, 72 escalated, 288 approved but unpaid and 9,600 sample paid. Counts derive from the records, with 20-row pagination. Verified includes approved and paid, not merely applications received.

At 0.8 SOL per household, 230.4 SOL is approved and unpaid; 7,680 SOL has been paid in the scenario. Public and reviewer balances reconcile to 55,920 received and 48,240 remaining. The 12,000 SOL response budget has 4,320 SOL still allocated inside the reserve. Optional platform support starts at zero and remains separate. Daily bars vary deterministically; they are not real transaction history. See reviewer_analytics_v02.md.

The incident fixture contains 240 reports. These are incident evidence, not supply orders; ReliefVue provides cash grants rather than dispatching water or packages.

Zero is legitimate after resolving a queue; the interface never fabricates cases to keep metrics positive. Seeded audit history is marked sample and includes an executive allocation, approval and escalation. New decisions receive actual browser-session times.

## Household file contents

Application details include an opaque sample household ID, area, private fictional unit identifier, household arrangement, payment preference and read-only response grant.

Expandable sample evidence panels illustrate:
1. Identity: example ID/passport placeholder; consistency and validity checks.
2. Usual residence: example tenancy record/recent bill placeholder; date, applicant connection and affected-area match.
3. Household declaration: separate living arrangement and existing application/grant checks.
4. Missing documents: alternative evidence and documented human review, without automatic rejection based on one missing preferred document.

Geraldine confirmed identity evidence, residence evidence and household declaration with an alternative-evidence route. Exact acceptable documents and production evaluation rules remain to be approved. No real documents, realistic ID replicas or file uploads are added. Impact photography is not imposed as a requirement.

Routine approval requires acknowledgement of identity review, residence/area, uniqueness/no prior grant, and approved response/completeness. Reviewers can request information, escalate, or reject with a reason. Suspected duplication does not automatically establish fraud.

Supervisor outcomes include return to routine review after clarification, request more evidence, and rejection with a documented reason. Returning a case does not automatically approve or pay it. Approved and paid examples are read-only in this demo.

## Shared financial story and separate exercises

The public and reviewer finance share a single scenario source. Sample contributions update both; a completed walkthrough grant is reconciled once. The seeded applications were not submitted through the public form. Response authorization and visitor-entered household evidence remain separate explanatory exercises; approving a seeded application does not itself send a payment.

Reset incident examples affects incidents only. Reset response snapshot restores the populated seeded household cases and logs the reset, without changing the separate interactive walkthrough. The public Reset demo restores the household snapshot and clears interactive walkthrough state. Refresh restores the fixture. No persistent storage, real AI, authentication, live ingestion or actual payout is introduced.

## Judge questions the overview answers

- How many applications are waiting, and what is blocking them?
- How many have passed eligibility checks versus actually received a payment?
- Which cases need a supervisor rather than routine approval?
- Can a reviewer change the grant? No; executive-approved event terms are read-only.
- Does AI approve people or prove fraud? No; scripted flags demonstrate investigation leads.
- Is a shared address a duplicate? Not necessarily; independent rented rooms can qualify after review.
- Does a transaction prove a household qualified? No; evidence review and grant accounting are distinct.

## Verification

Browser checks verified role-dependent queue routing; incomplete-check approval blocking; successful routine approval; supervisor return reducing the escalation queue; no editable grant amount; public entry visibility; and mobile document overflow. Existing build and automated tests are run before publishing. Evidence categories are confirmed; exact document acceptance policy remains open.

## Alternative camera evidence
Geraldine requested a capture-only alternative evidence route without gallery uploads. The reviewer panel now previews a planned capture record and a scripted possible photo-of-screen flag in HH-207. It does not access the camera or collect imagery. Geraldine confirmed replay detection: AI should flag a photograph of a screen or printed photo being presented as fresh evidence, then send it for human review. The flag is not proof of fraud and does not automatically reject an application.

Production camera provenance and replay checks are not implemented. AI may surface suspicious patterns but cannot prove authenticity or fraud. A flag must lead to human assessment and safe alternative evidence, not automatic exclusion. Browser capture controls alone do not establish when/where an event happened or guarantee that a displayed image was not rephotographed. No selfie, liveness or compulsory impact-photo policy is inferred.


## High-volume simulation update
The household scale above supersedes all earlier 12-case and 1,200-case snapshots. All records are fictional and inspectable.

The incident fixture contains 240 inputs: 192 AI checks passed (simulated), 35 fact-checker cases, 12 supervisor escalations and one resolved example. The initial evidence-gap count is 47; total supervisor exceptions across incident and household queues are 84. Source-channel mix: 44 resident reports, 40 news alerts and 39 each for national weather stations, local government, governor offices and disaster agencies. These are authored channel assignments, not integrations or AI accuracy measurements. Incident queues paginate 15 rows.

AI attention offers separate checks-passed and human-verification lanes. Passing simulated provenance/time/area checks makes evidence ready for human publication review, not disaster activation, household approval or payment. Human reviewers can record verification or escalation with reasons. Supervisors can act on escalated incident evidence as well as household exceptions. Weather observations alone cannot establish impact. The initial state includes a closed record, so the two AI lane counts do not equal total inputs without it.
