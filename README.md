# ReliefVue demo application

This repository contains ReliefVue's ideathon prototype and current product brief. The application uses a fictional Bangkok event, synthetic households and Solana Devnet test SOL. It is a demonstration, not a live relief service.

## Run locally

Requires Node 20 or later. In this folder:

```sh
npm install
npm run server
```

In a second terminal, from the same folder:

```sh
npm run dev
```

Open `http://127.0.0.1:5173/`. The demo API runs on `127.0.0.1:8787`. The two processes are both required. `npm run build` produces the frontend bundle.

The API creates Devnet-only demonstration keys and claim records in `data/` on first run. Do not publish that directory. It is excluded by `.gitignore`. Keep the server on localhost: the operator and claim endpoints are demonstration endpoints without production authentication.

## Features and limits

- A browser Solana wallet can sign a donation to the displayed Devnet treasury. The service verifies the confirmed transfer before recording it.
- A funded demo donor can also submit a real Devnet donation without a browser wallet. Its public address is shown in Donate. The public faucet was rate limited during this build, so that wallet is currently empty.
- After the fictional event is activated, a Bangkok synthetic household can receive one Devnet payout at its assigned demo address if the treasury has enough confirmed funds. Chiang Mai is blocked. The service stores the household/event claim state across reloads; this is backend enforcement, not a smart contract.
- The recipient screen can preview success and repeat-claim messages without moving SOL. Preview output is labeled as an illustration.
- The operator screen accepts a supplied notice and requires a human action to open the fictional event. The keyword scan is not AI. A prewritten AI review example is labeled illustrative. Set `OPENAI_API_KEY` for live server-side AI notice review; that path still needs a live test.
- Baht conversion, real identity checks, a real government feed and production authorization are not implemented.

No real transaction signature should be claimed in a submission until both donation and payout are confirmed and opened on Solana Explorer.

## Public web build

`npm run build:web` creates a static Vercel demo. `vercel.json` selects that command. The public build reads the Devnet treasury balance and can verify a wallet-signed donation. The fictional event activation is stored only in that visitor's browser. Recipient payouts and duplicate rejection are labeled previews: the local demo service is not deployed. Its key file and claim records must never be uploaded. The public receipt list contains only donations verified in the current browser, so it is not a complete ledger.

The Vercel project URL and GitHub-to-Vercel integration must be confirmed separately. Building the static bundle or pushing this repository does not deploy the site.

## Product and design documents

- [Current ReliefVue brief](docs/brief.md) records the active product decisions, open risks, and future safeguards. [Progress](docs/progress.md) tracks the MRI forge step. These decisions are not all implemented in the prototype.
- [Earlier corrected brief](docs/recovery_brief_v02.md) and [screen/state map](docs/screen_state_map_v01.md) provide historical design context; use the current brief when they differ.
- [Brandbook v02](docs/brandbook_v02/index.html) is the latest **review candidate** for identity and web design. It includes Geraldine's navy, purple, coral, mint, and off-white color direction; logo and typography options; and the requirement for real, consented impact photography. It is not implemented in this app.
- [Brandbook v01](docs/brandbook_v01/index.html) preserves the earlier design review.
- [Historical handover](docs/history/README.md) preserves the original ReadyFund requirements and build pack. Its early all-simulated ReliefVue brief is superseded by the corrected brief above.

The brandbooks are standalone local HTML files. Open them directly or serve the repository locally. They load review fonts from Google Fonts and have system fallbacks. Their logo concepts and photo placements are not approved production assets.

## Repository boundaries

This repository contains source code and design/requirements documents. It excludes locally generated demonstration keys and claim data, dependencies, browser profiles, screenshots, and build output. The repository is public; do not add identity documents, secrets, wallet keys, or private recipient records.

The latest brandbook proposes an optional $1, $2, or custom platform-support choice. The current app does not process that payment. A production checkout needs a separate recipient, payment rail, fee disclosure, and receipt from relief funding.
