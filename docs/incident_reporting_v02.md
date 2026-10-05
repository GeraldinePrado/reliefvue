# Incident reporting and verification — v02

## Status and authority

Requested by Geraldine on 2026-10-05: let community members report incidents, use AI to assess validity, and escalate reports that AI cannot verify to human reviewers. This document records the intended product flow. The homepage implements a local demonstration form and a fictional scenario map. There is no reporting backend, AI verification service, human queue or emergency dispatch integration yet.

Revision requested by Geraldine on 2026-10-05 for future pitch preparation. Preserves v01 and adds source strategy and evidence decisions below. This is a product plan, not a claim of connected feeds.

## Homepage experience

Place the map after the household story and before the fund record: understand household needs, explore reported conditions, then inspect the reserve and grant examples. Show a searchable list beside the map on desktop and above it on mobile. Every demonstration report has a time, incident type, approximate area, coordinates and review status. Red pulses mean needs review; teal means a resolved example. Color is accompanied by a written status. Pulses can be paused and respect reduced-motion preferences.

The example locations are Chiang Mai areas and districts: Mae Rim, Chang Phueak, Saraphi, Old Town, Hang Dong and San Sai. They are not separate provinces. Coordinates are approximate area centres, not household positions, road closure boundaries or safe-route directions. Map incidents and payment examples are separate illustrative datasets; proximity is not evidence of eligibility or a payout.

The data lives in `src/scenario-reports.ts`. Each record supports an optional image with alt text and caption. No verified incident photos have been supplied. Do not use generated humans or disaster images as report evidence. Future uploaded evidence needs consent, rights, source context, malware checks and removal of identifying metadata before public use.

## Proposed report journey

1. **Report:** choose incident type, observed date/time and timezone, approximate area or public landmark, and an observation description. Future evidence attachments and source links are optional; do not require identity documents or public household addresses. Explain public versus private fields and obtain consent before real submission.
2. **Intake:** issue a reference, validate required fields, rate-limit abuse and place the report in a private pending queue. Treat report text and attachments as untrusted input, including instructions embedded in them. A submission must not immediately appear as confirmed on the public map.
3. **AI assessment:** check relevance, time/location consistency, possible duplicates, evidence quality and corroboration against attributable trusted sources. Record source links, reasons, uncertainty, model/version and assessment time. An AI confidence score alone is not proof that an incident happened.
4. **Human escalation:** route insufficient, conflicting, suspicious, outdated, high-impact or otherwise uncertain evidence to a human reviewer. AI errors, provider outages and timeouts also route here; they must not silently mark a report verified. A reviewer can request more information, merge duplicates, confirm, reject or resolve a report and record a reason.
5. **Publication:** publish only the permitted, generalized fields after the verification policy is satisfied. Clearly distinguish received, under review, verified, rejected/duplicate and resolved states. Keep personal contact information and original evidence private. For the first real release, require human approval before any report gains a verified public label; later automation requires an explicitly approved evidence policy and evaluation.
6. **Correction:** offer a correction/reporting route, preserve an audit history, recheck stale reports and allow human overrides. Define ownership, retention, deletion and reviewer access before storing real reports.

AI assessment does not authorize disaster activation, establish household eligibility or release funds. These remain separate human-governed decisions in the product brief. A verified incident is not a promise of a grant. Reporting is not an emergency service; a production launch needs locally verified emergency guidance and operational response ownership.

## Current prototype boundaries

- The dialog collects fictional incident type, area, observation time and description with browser validation.
- “Preview report review” demonstrates the uncertain → human-review outcome. It does not run AI, enqueue work, persist data, upload evidence or publish a marker.
- Entries remain only in the current rendered page and clear after navigation or refresh. No actual submission receipt is claimed.
- The map has six fixed fictional reports; search and selection operate on these records only.
- OpenStreetMap provides the base map, not validation of the incident overlays. Keep visible attribution and follow its tile policy. If tiles fail, report text remains usable.

## Acceptance before real reporting launches

- Durable backend and authenticated reviewer access; audit trail and notification ownership.
- Abuse controls and safe attachment processing; documented private/public field policy.
- AI evaluation against false reports, duplicate reports, missing evidence, contradictory timestamps, prompt injection, provider failure and out-of-area submissions.
- Explicit escalation thresholds and human review service expectations. No unreviewed report becomes verified because of an AI failure.
- Accessible search, keyboard-selectable reports, equivalent text details, mobile dialog and reduced-motion behavior.
- Tests that report submission cannot activate a response or trigger a payment.

## Implementation references

[Leaflet quick start](https://leafletjs.com/examples/quick-start/) documents map, marker and popup behavior. [OpenStreetMap tile policy](https://operations.osmfoundation.org/policies/tiles/) governs tile requests, caching and attribution. Browser requests use the standard HTTPS tile endpoint and browser caching; no tile prefetch or bulk downloads are implemented.


## Evidence sources: official notices, news and observations

A feed is a delivery mechanism, not a verification decision. The AI should retrieve the original source and preserve provenance instead of treating a headline, aggregator summary or model answer as evidence. Proposed source registry:

| Source class | Candidate / discovery reference | What it can support | Limit and integration status |
| --- | --- | --- | --- |
| National and local incident notices | [DDPM daily reports](https://dpmreporter.disaster.go.th/portal/notification/daily-reports), [DDPM](https://www.disaster.go.th/home); original provincial/district/municipal notices where relevant | An official observed incident, declared affected area, date and authority, when the specific notice actually says so | Check the original notice, revisions and geographic scope. A general warning is not an observed incident. No DDPM ingestion is connected. |
| Weather warnings | [Thai Meteorological Department RSS directory](https://tmd.go.th/en/service/rss) lists forecast and warning categories | Early detection and a private Watching case | Forecast rainfall or a storm track does not prove household flooding. Directory discovered through search; direct retrieval failed during this review. No feed endpoint, uptime or integration is validated. |
| Water observations | [ThaiWater information](https://www.thaiwater.net/mobile), [Chiang Mai water centre](https://chiangmai.thaiwater.net/) | Rainfall and river-water observations as context, with their station location and observation time | An upstream level or heavy rainfall does not establish a specific road closure or household inundation. No API access, licensing or polling arrangement has been validated. |
| Original newsroom reporting | Established editorial organizations and attributable local reporters; select individual publishers in the source registry before ingestion | Independent observed reporting with a named location, observation time and original reporting/evidence | News is secondary evidence, not a government declaration. Five sites republishing one wire story count as one origin. No news subscription, partner or licensed feed is connected. |
| Community reports | ReliefVue report form; planned optional photo/video or original source link | A lead about a place, observation and unmet need | Initially private and unverified. Check age, location, reuse, edits, contradictions and possible duplicates. Image metadata and AI image analysis are supporting clues, not proof. Current form is a local preview only. |
| Relevant local operators | A responsible road authority, utility or documented field responder, where available | Incident-specific corroboration, such as a particular road closure or water-supply outage | Verify source identity and exact scope. No operational partners are secured. |

Research checked 2026-10-05. DDPM's retrieved page exposed a daily-report category but no report entries; the Chiang Mai portal was not readable as a live data feed in this review. These references establish candidate source discovery, not working integration or any current disaster claim. ThaiWater's own product description explicitly lists rain, water levels and forecasts. Validate source terms, availability, language, attribution, rate limits and permitted storage before implementing RSS/API polling; use authorized access or manual review when a feed is unavailable. Do not invent or scrape around restricted APIs.

## Proposed verification pipeline

1. Ingest an authorized feed item or submitted report into a private queue. Save canonical source URL, publisher, original author when known, source category, event time with timezone, publication/update time and retrieval time separately.
2. Normalize Thai/English place names and map the claim to the smallest defensible area. Preserve geocoding uncertainty; an area-centre pin is not an affected-area boundary. Deduplicate both incident records and common news origins.
3. Use AI to extract incident type, observed-versus-forecast language, location, time, stated impact, source quotations/references and conflicting information. Keep source-linked reasons; never fill missing fields with guessed facts. A confidence score must not become a “verified” badge.
4. Cross-check the particular assertion. A flooding report needs evidence of observed flooding; an impassable road needs road-specific evidence; a water outage needs utility or localized corroboration. Nearby rain is insufficient for all three. Seek independent, time-aligned evidence; recheck corrections and stale material.
5. Route uncertainty, contradictions, missing provenance, reused media, duplicates, out-of-area reports, provider outages and AI failure to a human reviewer. For the initial real release, a human approves every public verified label, even when AI finds strong corroboration.
6. Record the decision, reviewer, reasons, evidence links, scope, review time and next recheck. Publish only permitted generalized details. Label unresolved reports distinctly; do not silently turn “reported” into “confirmed.” Corrections and resolution retain a history.

### Four separate decisions

- **Incident status:** is the particular reported occurrence sufficiently supported for a public label?
- **Response activation:** should ReliefVue open a defined event and capped relief budget? The normal route uses an original official affected-area notice and the required human authorization.
- **Household eligibility:** does this privately verified household qualify for this event, and has it already received its one grant?
- **Payment confirmation:** did the intended transfer actually confirm? Only confirmed payments count as paid.

A positive result in one stage cannot skip the next. Official notice verification does not verify every resident; a Solana receipt does not verify an incident.

### Before an official declaration

Preserve the locked rules in [the product brief](brief.md): a forecast or unconfirmed tip starts Watching, which cannot open claims or pay grants. Resident reports alone cannot activate a flood response. A pre-declaration event needs independent corroboration of actual impact, a separate evidence reviewer's recommendation, and Geraldine or the formally authorized backup approving the same bounded event terms. The intended reserve program would enforce the reviewer-plus-approver authorization; the deployed prototype does not.

Public government observations can be independent evidence without being a formal declaration, if they genuinely support the event's place/time/impact. A limited first tranche and fresh authorization for expansion are planned. Exact evidence thresholds, boundary rules and cap formula remain open; neither “two articles agree” nor an AI score settles them.

### Example explanation for the future pitch

“A resident reports flooding in Saraphi. ReliefVue would check the original report against dated official notices, water observations and independent reporting. AI organizes the evidence and flags uncertainty. A human decides whether the incident is supported; separate reviewers authorize any relief response. Only then can eligible households receive a grant under the event's rules.”

This is an intended workflow. The current Saraphi map marker is fictional, and no live source checking runs behind it.
