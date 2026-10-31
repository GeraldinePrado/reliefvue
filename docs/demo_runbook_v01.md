# ReliefVue demo runbook — v01

Recorded 31 October 2026. Public-safe operating note for the local operations-platform demo.
No real money, no real household data, no production KYC.

## What this demo is

A local, rehearsal-ready product walkthrough: donor contribution → recipient onboarding and
request → reviewer decision → two executive signatures → payout status → public ledger →
read-only partner API.

**Say this once, early:** money is simulated, identity checks are demonstration-only, and the
API is local. Nothing shown is a live aid payout.

## Before the demo (10 minutes)

From `2-projects/12_reliefvue/reliefvue`:

```sh
npm ci
npm run demo:reset      # clean fictional seed; run before starting
npm run demo            # starts API + Vite, picks a free API port
npm run demo:check      # in a second terminal
```

Open **http://127.0.0.1:5173/app.html** — the platform app. The concept site at `/` is a
different surface; do not start there.

`npm run demo` prints the API port it chose. If port 8788 is busy, it moves to the next free
port automatically and passes that port to Vite, so the app keeps working. Keep the terminal
open.

## Optional 30-second opener

**Current film (primary)** — [reliefvue_explainer_30s_v03.html](reliefvue_explainer_30s_v03.html)
Six full-screen scenes following the site’s five steps: Prepare together, Review the disaster,
Verify the household, Deliver the grant and Trace the funds. It shows 0.8 SOL, “keep it or take
fiat via a planned PromptPay route”, random face-video KYC, one household = one wallet, the
UNAID-style six-month misuse ban and the `@ReliefVue` follow. No presenter.

**Earlier brand film** — [reliefvue_explainer_30s_v02.html](reliefvue_explainer_30s_v02.html)
The first cut, kept for comparison.

Both loop every 30 seconds. Press `F` for fullscreen, `Space` to pause, `R` to restart. For a
clean screen recording, add `?record=1` to the URL to hide the controls. The film is silent by
design; speak over it or let it run. It ends on “Concept demo · 0.8 SOL reference value · fiat
conversion planned” — keep that visible.

## Demo path (about 8 minutes)

| # | Surface | Action | What to say |
| --- | --- | --- | --- |
| 1 | `#/` or `#/ledger` | Show the landing page and public ledger | Prepared reserve, specific response, public totals; all amounts are simulated |
| 2 | `#/give` | Give 25 USDC (or a THB amount) | Donor flow, optional operating support kept separate, simulated receipt |
| 3 | `#/help` | Sign in with phone `0810000001`; use the OTP shown on screen | Recipient route; demo household is fictional |
| 4 | Recipient app | Open the request, submit the seeded household's grant request | Fixed THB grant, one request per household per response; evidence is a filename in this build |
| 5 | `#/staff/login` | One-click **Nok S.** (reviewer) | Segregation of duties: reviewer cannot sign the payout |
| 6 | `#/staff/applications` | Open the pending case, approve with a reason | Human decision, duplicate and address flags visible |
| 7 | `#/staff/treasury` | Sign in as **Anan T.** and add a signature | First of two required signatures |
| 8 | `#/staff/treasury` | Sign in as **Malee K.** and add the second signature | Payout releases only on the second distinct signature |
| 9 | `#/help` | Reload the recipient view | Status changes to sent/paid with the rail destination |
| 10 | `#/staff/partners` | Create a partner key and run the MCP tool | Read-only partner surface; no names, phones or ID numbers |

Staff demo password: `admin@reliefvue.demo` / `reliefvue-demo`. The reviewer and approver
personas are one-click buttons on the sign-in screen.

## Reset after the demo

```sh
npm run demo:reset
```

Restart `npm run demo` if the running server should pick up the clean seed. The in-app
Settings → Reset demo data control does the same thing while signed in as an admin.

## If something fails

| Symptom | Action |
| --- | --- |
| `npm run demo:check` reports API unreachable | Start `npm run demo` in a second terminal; confirm the port it printed |
| Vite port 5173 is busy | Stop the other Vite process; the launcher keeps 5173 fixed on purpose |
| App loads but data looks edited | `npm run demo:reset`, then restart |
| A workflow looks stale | Hard-refresh the browser; sessions persist for seven days by design |
| No network | The whole demo is local; no internet is required after `npm ci` |

Keep a set of screenshots from a successful run as a fallback. Do not present a screenshot as
a live interaction.

## Do not claim

- Real KYC, DOPA/NDID verification, liveness or document authenticity.
- Real donations, real treasury, real PromptPay or real USDC settlement.
- A deployed public API or production authentication.
- That the 2-of-3 signatures are on-chain; they are application-level in this build.
- That the reserve program is deployed or audited.

## Known limits before a public URL

No hosting account is configured. Before sharing a URL with strangers: add rate limits,
session expiry/revocation, CSRF review, security headers, encrypted evidence storage, a
retention and deletion policy, and a periodic demo reset. See
[the KYC and data-security note](identity_kyc_payout_and_data_security_v01.md).

## Related

- [Platform architecture](platform_architecture_v01.md)
- [Open decisions](platform_open_questions_v01.md)
- [Thai pilot constraints](platform_policy_constraints_v01.md)
- [Development checkpoint v02](development_checkpoint_v02.md)
