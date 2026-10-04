# Technical demo operating notes

## Optional technical demonstration

1. Watching blocks payouts; review the fictional observed-impact fixture.
2. Simulate reviewer and primary or backup authorization. Activation requires enough reserve for the event budget.
3. Fund the displayed **Devnet** reserve and donor using test SOL only. A compatible Wallet Standard wallet can donate; the local demo donor needs its own test SOL plus fees. No airdrop is automatic.
4. Submit the earliest complete eligible household claim. A second applicant for that household is blocked; a separate rented unit may qualify. Pending cases need simulated human review and use a protected allocation.
5. Inspect confirmed Devnet receipts. Timeout/ambiguous payment intents remain blocked across restart; never reset state to retry them.

The fixture grant is 0.01 test SOL, event cap 0.05 and review hold 0.01. These are test values, not a Thai grant estimate. Real event approval and staff authorization are **not** enforced by the deployed reserve program because none is deployed yet.

## Data and recovery boundaries

Ignored `data/v2/` stores generated demonstration keys and atomic local claim state. Older `data/` is preserved but not imported into v2. Never publish keys or reset state against funded wallets. These keys belong to fictional demo recipients and do not establish a recoverable production wallet. A lost self-custody key cannot be recovered through a login reset.

Wallet submission is marked uncertain before broadcasting. If a wallet may have broadcast without returning a signature, check its history before another donation; the app blocks resending in that session. For a recorded signature, retry verification instead of sending again. Staff investigations of uncertain payouts are a manual developer task in this MVP; no unsafe reset button is provided.

## Public build and deployment

The default static preview is a fully simulated guided walkthrough. The separate optional Devnet interface reads a Devnet reserve and verifies donations, but its receipt list is browser-local. Its event approvals and recipient outcomes are illustrative; no public payout API is deployed. The public preview reserve differs from the new local v2 reserve. A Git push does not prove Vercel deployed this revision; inspect the deployment before presenting it.
