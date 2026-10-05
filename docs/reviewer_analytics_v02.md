# Shared public and reviewer financial scenario

Supersedes reviewer_analytics_v01.md and its separate operational balances.

The homepage, public activity and reviewer analytics now share SCENARIO constants and totals(state). Initial figures: 55,920 SOL received; 7,680 SOL disbursed; 48,240 SOL remaining; 12,000 SOL response budget; 4,320 SOL allocation remaining, already included in the reserve. The fixed grant is 0.8 SOL and 9,600 households are paid examples.

Reviewer household fixtures now contain 10,440 applications: 9,600 paid plus 300 pending, 180 awaiting information, 72 escalated and 288 approved unpaid. Area summaries therefore reconcile to the same 7,680 SOL disbursed. A completed current walkthrough adds its paid household once. Routine approvals update commitments, not disbursement.

Daily relief contributions and grants are allocated deterministically across thirty scenario days with varied weights and exact whole-unit totals. Grants are allocated as whole household counts before multiplying by 0.8 SOL. This is illustrative history, not real dates or chain receipts. New session contributions/support/payouts appear on day 30. Values do not randomize on refresh.

Platform support is the same separate session support total used by the donation flow. It starts at zero and increases when a visitor confirms optional sample support. There is no fabricated operating income or expense; expenses remain zero until an expense workflow exists.

The independent event-authorization training sequence remains a simulation, but it no longer has a conflicting analytics treasury. A global reset restores shared baseline values.

Verification: regression test checks daily sums against public totals after a 5-SOL donation and 3-SOL platform contribution; verifies varied daily grants and incremental payout allocation. Browser verification shows initial 55,920/7,680/48,240 and, after donation, 55,925/7,680/48,245 with 3 SOL separate support. All fourteen tests and public build pass.
