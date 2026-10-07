# ReliefVue PRD and mobile app preview handoff — 7 October 2026

## Current product decisions

- Current source fetched from GitHub revision `0944e06` before changes; preserved the latest Mac-created screens and brandbook v06.
- Planned recipient product is a mobile app; the web household flow remains a prototype. Website donors can choose a country reserve as countries become operational; Thailand is first.
- Verified usual home in the activated affected area is the eligibility basis; lawful foreign residents can qualify; domestic evacuation does not cancel eligibility. Temporary cross-border evacuation can qualify after human review of event-time home and disaster connection.
- Registration/verification can happen before or during a disaster. Claims require active affected-area eligibility. Preregistration does not reserve aid.
- Guest donors do not complete household KYC; optional accounts can provide history. Payment-provider requirements are separate.
- Global lifetime donations and country histories are distinct from available reserves, commitments and paid aid. Multi-asset settlement/valuation remains open.

## Files and website outcome

`docs/prd.md` is the new working PRD. It consolidates journeys, country reserve accounting, privacy, human approval, payout/recovery, network stages, acceptance criteria and unresolved decisions. The README and older brief/journey/roadmap files link to it rather than silently retaining conflicting mobile-access descriptions.

`src/mobile-app-preview.ts` and `.css` add the homepage section immediately above the footer. It uses the selected elephant, wordmark, fonts, ivory/lavender/purple palette, a proposed mobile login screen, iOS/Android Coming soon status and a working household web-demo link. Following Geraldine's supplied composition reference, the complete phone has a subtle metallic edge and angle, extending across the section boundary into reserved footer space. The reference informs placement and depth, not financial dashboard content or branding. No actual app download, login, real verification or new payment route is implemented.

## Verification

- `npm run check` passed TypeScript, all 14 existing tests, normal build and public build including brand-guide copy.
- Local browser review at 1280 × 900 and 390 × 844: no page horizontal overflow. English desktop and Thai mobile preview inspected. Preview label and Coming soon statuses appear; no misleading store link.
- Thai demo link navigated to `#receiver`, displayed the household entry page and removed the homepage-only preview.
- Native login accessibility, app-store submission, production KYC and payments are outside this preview. Fluent Thai editorial review remains advisable.
- Vercel deployment and cloud Drive copy must be verified after publication; device/offline sync is independently unverified.

## Git metadata repair

Google Drive had inserted five Windows `desktop.ini` files inside `.git/refs`, causing fetch to fail with `bad object refs/desktop.ini`. Those files were preserved in the Windows temporary directory `reliefvue-git-metadata-20261007`; legitimate Git refs were retained. Fetch and fast-forward then succeeded. Keep `.git` out of shared Drive source snapshots; Google Drive decoration files are not Git references.

## Resume on Mac

Use the latest GitHub main checkout (`git pull`, then `npm ci` and `npm run dev`). The Drive ZIP is a versioned portable backup, excluding Git/dependencies/build outputs. Open `docs/prd.md` first. Check the latest commit against GitHub and wait for Drive downloads before relying on offline access. Never infer Mac completion from cloud metadata alone.

## Next discussion

Cross-border evacuation eligibility is confirmed, with evidence standards still to define. Other decisions include the first mobile platform, custody/recovery provider, multi-crypto conversion model, country-earmarked refunds and exceptions, validated Thai grant benchmark and pilot governance. These are production decisions, not requirements to build the entire network immediately.
