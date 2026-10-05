# Incident reporting and verification

## Status and authority

Requested by Geraldine on 2026-10-05: let community members report incidents, use AI to assess validity, and escalate reports that AI cannot verify to human reviewers. This document records the intended product flow. The homepage implements a local demonstration form and a fictional scenario map. There is no reporting backend, AI verification service, human queue or emergency dispatch integration yet.

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
