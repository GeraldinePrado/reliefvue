# ReliefVue — Colosseum pitch preparation v17

## One line

**ReliefVue — Emergency funds, ready before disaster.**

The five words after the name are the opening line. Follow with one plain sentence: “We are building a Thailand-first relief reserve that pays one grant to each approved household, with public Solana receipts and private eligibility checks.”

## Application answers — working draft

**About the product / what are you building, and for whom?** ReliefVue is a proposed pre-funded relief reserve for households affected by flooding in Thailand. Donors fund a shared SOL reserve; human reviewers check the event and household; approved households receive one fixed grant. Confirmed transfers would be visible on Solana without publishing names or documents. Later, local organizations could use the same platform to allocate grants and account for their own relief funds.

**Why build it, and why now?** I grew up in a low-income family in the Philippines and now live and work in Thailand as a digital nomad. I know how hard it can be to discover available help, and how little visibility people have into where relief funds go. Communities in both countries face recurring disasters. ReliefVue tests whether funding prepared in advance, private household review and public transfer receipts can make help more timely and accountable.

**Technology and tools.** The current guided website uses TypeScript, Vite, Leaflet and a browser-local fictional scenario. Optional Devnet tooling uses Solana Kit and Wallet Standard. Anchor reserve-program source exists, but is not compiled, deployed or connected to the public site. Codex assisted code and design work; generated decorative artwork is labelled. Planned AI evidence triage is not a working integration.

## Next steps — future direction, not current features

**One sentence for the pitch:** Start with disaster-affected households in Thailand, then give trusted local organizations the tools to deliver and account for grants, country by country.

- **Access:** People with a compatible Solana wallet could use it directly. A guided wallet setup and recovery route is planned for newcomers. Baht donations or payouts would need a qualified fiat partner; neither route exists in the public demo.
- **On-chain / off-chain:** The intended Solana layer records confirmed fund movements and enforces defined payout rules. Identity, residence evidence and case review stay private off-chain. A baht payout would also need a separate provider receipt and reconciliation; an on-chain transfer alone cannot prove the final baht reached a household.
- **Where help goes:** The first service is a Thailand-focused responsive web app. Thai residents and foreigners legally living in Thailand may seek a grant only when their usual home is inside the specifically approved disaster area and they pass private review. Evacuating within Thailand does not erase that home. TM30 may support a foreign resident's address evidence, but is not sufficient alone. People outside Thailand may donate, but do not qualify for a Thailand grant. Later countries would need their own local rules and partners.
- **Fair access:** Use a fixed grant per eligible household within each response. Help should not depend only on reaching a physical distribution point. Assisted registration, low-bandwidth access and appeals need design so remote or displaced households are not excluded. Different households can share an address; multiple wallets do not create multiple entitlements.
- **Organizations:** A future ReliefVue platform could give community groups, companies, NGOs, foundations and public agencies separate program funds, approved response areas, staff roles and views of allocations, confirmed payouts and remaining balances. An authenticated API and webhooks would connect existing systems; an optional MCP interface could help authorized AI tools query permitted records. MCP is not the payment or access-control layer. No partner has adopted this yet.
- **Partner settings:** Partners could configure their own dashboard and staff access within set permissions. Changing a household payout address would require re-verification, authorized approval and an audit record; an ordinary reviewer must not be able to redirect a grant. Changing a treasury address requires stronger governance.
- **Treasury control:** Organization relief funds should sit behind defined program rules and independent, threshold-based approvals by separate authorized signers (a multisignature treasury), not a shared seed phrase or one executive's unrestricted wallet. Every approved change and confirmed transfer needs an audit trail. Shared signing reduces single-key control but cannot by itself verify a household, prevent collusion or prove how money was spent after receipt.

The organization platform, wallet creation, baht route, country expansion and multisignature governance are design directions. The current public website is a fictional guided walkthrough, not an operating relief network. Detailed decisions and references are in the [access and organization roadmap](expansion_roadmap_v02.md).

## Deck story — six sparse slides

1. **ReliefVue** — Emergency funds, ready before disaster.
2. **The delay** — Relief money is often raised after impact.
3. **The model** — Fund reserve → review event and household → fixed grant.
4. **Why Solana** — Public transfer receipts; private household evidence.
5. **What works today** — Guided demo with fictional records and separate Devnet tools.
6. **Why I’m building it** — Geraldine’s lived experience with hard-to-find aid; she is building solo. Next proof: user feedback and the real Devnet flow.

Use one message per slide, large text and the light v06 brand system. The organizer note supplied by Geraldine is guidance to make the story immediately understandable, not evidence that ReliefVue has traction or an operating reserve.

## Two separate videos

**Product demo video:** The application requirement Geraldine supplied is YouTube, Loom or Vimeo, up to 3 minutes. Show the live product, without slides or a code walkthrough. Show the current donor route, household request, human review and labelled public fund view. Do not present fictional grants as real transfers. See the [recording plan](demo_video_plan_v01.md).

**Public pitch video:** Separate video, up to two minutes, on YouTube, Loom or Vimeo. Introduce Geraldine as the solo builder, say what ReliefVue is building, and explain why she is committed to it.

### Public pitch video — current founder script

Use the separate [public founder pitch script](public_pitch_video_v01.md). Speak to camera. The product demo has its own recording plan; do not turn this founder introduction into a website walkthrough.

The deck supports the pitch video; it does not replace either requested video.
