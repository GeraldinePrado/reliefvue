# Reviewer financial and location analytics

## Reference and scope

Geraldine provided five ChatGPT analytics screenshots showing large time charts, period controls, expandable tables and restrained visual hierarchy. The new Analytics view beside Overview adapts those patterns to ReliefVue using its light canvas, navy text, purple/teal charts and existing sidebar. No ChatGPT usage content or token metrics are reproduced.

## Working controls

- Overview / Analytics view switch; Analytics opens by default.
- Seven-day and thirty-day fund charts, previous/next period controls with bounds.
- Relief funds / Platform support selector.
- Exact daily values in expandable tables, accessible SVG labels and native bar titles.
- Area selector, paid-household shares and expandable status breakdowns for Mae Rim, Saraphi, Chang Phueak, San Sai, Hang Dong and Old Town. No household coordinates or addresses.

## Financial model and boundaries

The authored 30-day operational scenario is separate from the public homepage reserve illustration and visitor donation checkout. No real transfers, receipts, expenses or fees are claimed. Headline balances cover all thirty days; chart period controls affect only the fund chart. Area filters affect household geography, not treasury-wide contributions.

Initial fixture reconciliation:
- Opening relief balance: 0 SOL.
- Relief contributions received: 1,758 SOL.
- 360 sample paid households × 0.8 SOL = 288 SOL disbursed.
- Relief remaining: 1,470 SOL.
- 288 approved unpaid households × 0.8 SOL = 230.4 SOL committed.
- Remaining after approved commitments: 1,239.6 SOL.
- Optional platform support received: 135 SOL.
- Illustrative operating expenses: 48 SOL, six 8-SOL entries.
- Platform support remaining: 87 SOL.

Daily contributions and operating entries are deterministic authored fixtures. Sample payment counts and area summaries derive from the existing operational household records. Their scenario-day assignment is illustrative, not an observed payment timestamp. Household approvals update commitments without being treated as disbursements.

Platform expenses are never deducted from household relief. Pending applications are not approved commitments. Treasury editing and real disbursement controls are not introduced.

## Verification

Build passes. Browser checks exercised the thirty-row daily table, seven-day period navigation, platform-support chart, single-area filtering and mobile overflow. Desktop screenshot inspected at 1440px; mobile tested at 390px. Screenshots are stored in the active session.
