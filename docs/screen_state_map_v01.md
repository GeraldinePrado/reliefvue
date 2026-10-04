> Historical map. For the October 4 redesign, use [design-brief.md](design-brief.md) and the receiver/donor journey documents. Old test-profile UI and technical acceptance order below do not govern current submission priorities.

# ReliefVue screen and state map

Recorded 2026-10-02 after Geraldine confirmed the first AI feature: review a supplied official disaster notice, suggest affected area, and flag uncertainty for human approval. Shared client/colleague project. This is the working map for the next prototype, not approval of its visual design.

| Screen | First view and action | Important states |
|---|---|---|
| Overview | Bangkok demo event, reserve amount, Donate, Request Relief, Fund Activity | Prepared; claims open; claims closed; network unavailable |
| Donate | Connect wallet, enter test SOL, review destination, send | Disconnected; pending signature; confirmed with Explorer link; rejected/failed |
| Request Relief | Choose synthetic profile, see verified home area and event rule | Eligible; outside area; needs review; already received; claims closed |
| Payout | Choose wallet delivery or see baht partner status, claim | Wallet disconnected; pending transfer; paid with signature; repeat rejected; insufficient funds |
| Fund Activity | Reserve, allocated and distributed totals; transactions | No transactions; loading; confirmed entries; RPC error; fixtures clearly marked |
| Operator | Paste mock official notice, run AI review, inspect suggested area, approve activation | Empty; analyzing; area/date extracted with source; uncertain; approved by human; rejected |

The app must make the public journey understandable without a presenter. Operator controls belong behind a separate navigation route. The demo uses invented household profiles and does not ask for ID photos. Current GPS cannot replace verified home area. No real government connection or fiat conversion is claimed.

Technical path after environment check: Node and npm are present; Solana CLI, Rust and Anchor are absent. Use a browser wallet for donor signing and a small Devnet demo service for the relief treasury, receipts and persistent duplicate state. The backend fallback must be identified as backend enforcement, never smart-contract enforcement. Verify the actual signed transactions before showing them as paid.

Acceptance order: donor transaction and receipt; affected-area eligibility; recipient transfer and duplicate rejection after reload; public activity reconciliation; bounded AI notice review; mobile and submission evidence. Do not use mock numbers as confirmed chain balances.
