# ReliefVue — website review and MacBook handoff

**Date:** 5 October 2026 (Thailand)
**Project:** ReliefVue Solana ideathon prototype
**Canonical code:** `https://github.com/GeraldinePrado/reliefvue`, branch `main`
**Public site to check after deployment:** `https://reliefvue.vercel.app/`

## Direct verdict

The current interface is a usable **guided demo** of the proposed service. It is materially clearer than the earlier pitch-like page: the homepage has a human-facing entry, and the receiver and donor journeys can be followed in a browser. I am **not fully satisfied** with it as a finished product or proof of an operating relief network. The figures, alerts, accounts, documents, wallets, and transfers shown in the demo are fictional. The English/Thai copy has not had a native Thai editorial review. The fund display explains direction of movement but awaits the specific animation reference the project owner offered to send.

## What changed in this pass

1. **Restored the working app preview.** The earlier “Index of …” page appeared when the local Vite app server was no longer serving the site. With Vite running at `http://127.0.0.1:5173/`, Get Help, Donate, Transparency, and footer links route to app screens. A localhost URL on Windows will not work on the MacBook; use the Vercel URL or start Vite on the Mac.
2. **Homepage and identity.** Added the selected elephant logo in the header and footer, a distinct Chiang Mai household hero, concept imagery, a household story, the response numbers, and concise process/FAQ sections. Generated photos are marked as illustrations, not as real ReliefVue recipients.
3. **Household journey.** A visitor can create a fictional example account **before** a disaster, see a preparation dashboard, complete guided identity/residence/household checks using made-up entries, explore a fictional affected-area scenario, review a fixed household grant, choose SOL or a simulated future baht route, submit a request, and view tracking. No real KYC or documents are collected.
4. **Donor journey.** Donation amount, separate optional operating support, route choice, review, simulated receipt, and example public activity are navigable. No payment is taken.
5. **Header and alerts.** Header now remains visible when scrolling. Navigation uses IBM Plex Sans with clearer size and contrast. EN/TH switches the public and household demo text. A rotating, pausable **fictional scenario** strip shows storm, flood, landslide, and review examples with relative times in the scenario.
6. **Public fund activity.** Replaced the dark panel with a light lavender and paper surface. Separate “Received” and “Grants sent” lanes update every 1.25 seconds with amount, destination, and reference. Removed the accidental pause-on-hover bug. The full activity page remains filterable.
7. **Footer.** Replaced the sparse dark footer with a light closing section, clear household/donor actions, readable logo contrast, and links.
8. **Brand and design files.** The selected logo, approved identity source, the design direction study, and the logo package are included with the source and/or handoff. Candidate files are marked as candidates; they are not a replacement for the selected logo.

## Critical review of the rendered site

| Criterion | Result | Evidence / remaining work |
| --- | --- | --- |
| All main CTAs open app screens | **Pass locally** | Clicked Get Help, Donate, request and donor steps in the running Vite browser. The previous directory index was a local preview-server failure. Recheck the Vercel URL after deployment. |
| Account can be created before a disaster | **Pass locally** | Example name opens the dashboard with `Before a disaster` selected and verification available. |
| KYC expectations are understandable | **Pass as demo** | Three steps explain future ID, usual residence, and household/room evidence without asking for ID numbers or uploads. Real KYC remains unbuilt. |
| Sticky header | **Pass locally** | Header stayed at the top after scrolling on desktop. |
| Header typography | **Improved; visual judgment** | IBM Plex Sans, stronger contrast, larger text. It should still be checked by the project owner at the actual presenting screen size. |
| Thai language | **Partial** | Core public, donor, receiver, dashboard, verification, and common claim copy switches. Reviewer/technical screens are still primarily English; Thai wording has not been checked by a fluent editor. Do not describe the site as fully localized. |
| Scenario alert | **Pass as fictional demo** | Multiple examples rotate, with Next/Pause controls. They are explicitly labelled as scenario alerts, not actual weather warnings. |
| Fund record color and movement | **Improved; reference match open** | Light brand surface, two moving directions, faster updates. This remains fictional UI activity, not live Solana transactions. The exact motion should be revisited when the promised reference arrives. |
| Footer | **Pass after correction** | Logo contrast was fixed; footer now closes with a meaningful proposition and two routes. |
| Narrow layout | **Pass for horizontal overflow at 390 px** | Browser measured document width no greater than the viewport. A fuller device and accessibility review is still advisable. |
| Automated checks | **Pass** | `npm run check`: TypeScript, 11 tests, standard build, and public Vercel build all passed on 5 October. |
| Production deployment | **Verify after push** | A successful GitHub push alone does not prove Vercel deployed. Open the production URL and repeat the CTA smoke test. |
| MacBook Google Drive sync | **Verify on Mac** | Drive upload/readback confirms cloud storage only. On the Mac, wait for the Drive client, locate this handoff and source archive, and open them before assuming offline availability. |

## Why the design uses these references

The two supplied CSS concepts were inspected. **Kikin** informed the large type and alternation of human, light, and data sections. **Dala** offered energetic technical motion but its black canvas and neon treatment were rejected for an emergency aid service. GoFundMe informed the human entry and straightforward actions; Mempool informed the compact, readable money movements. ReliefVue keeps its selected ivory, navy, purple, coral, logo, and font families rather than copying either reference site.

## Items for the next working session

1. Open `https://reliefvue.vercel.app/` on the MacBook. Click **Get help**, complete an example profile and verification, then click **Donate** and reach the sample receipt.
2. Send the specific fund-record animation reference. Compare its direction, cadence, and visible origin/destination with the current two-lane replay.
3. Have a fluent Thai speaker review the Thai public and household copy. Translate the reviewer/technical demo only if it must be shown in Thai.
4. Record the 2–3 minute pitch walkthrough from the hosted site, keeping fictional figures and future features clearly identified.
5. For any real pilot, separately design secure KYC, governance/custody, vendor contracts, disaster-source verification, legal review, and payout operations. The demo does not establish those capabilities.

## MacBook startup

Use the GitHub `main` branch as the code source. If the repository already exists on the Mac, run `git pull` inside its local checkout. If it does not, clone `https://github.com/GeraldinePrado/reliefvue.git`. Then run `npm install` and `npm run dev`; open the URL Vite prints. The Drive source ZIP is a portable snapshot and can be kept as a backup or reference. Do not edit the ZIP and the Git checkout simultaneously.

The Drive folder is `2-projects/12_solana_hackaton`. This file and a dated source ZIP are to be placed there. On the Mac, confirm both files are fully downloaded. Keep `.git`, `node_modules`, `dist`, credentials, and local test data out of Drive source archives.
