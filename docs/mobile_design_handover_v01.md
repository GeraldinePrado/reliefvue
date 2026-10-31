# ReliefVue mobile app — design handover v01

Recorded 30 October 2026. For the AI designer. Read this before producing any frame.
Companion sources: [brandbook v06](brandbook_v06/index.html), [design brief](design-brief.md),
[platform architecture](platform_architecture_v01.md).

Scope: the **recipient mobile web app** only. Not the donor site, not the staff workspace,
not the landing page.

---

## 1. What the board must contain

One board, eight screens, in this order, left to right, top to bottom. Every screen is
390 × 844 CSS px (iPhone 14/15 frame). Add a second row for states; do not mix states into
the main row.

| # | Screen | Route | Purpose |
| --- | --- | --- | --- |
| 1 | Sign in — phone | `#/help` | Identify the household by mobile number |
| 2 | Sign in — code | `#/help` | Six-digit verification |
| 3 | Onboarding 1 — identity | `#/help` | Who is asking, and on what document |
| 4 | Onboarding 2 — residence | `#/help` | Verified province, district, address |
| 5 | Onboarding 3 — payout | `#/help` | PromptPay or wallet, and review |
| 6 | Home | `#/help` | Status, eligibility, wallet |
| 7 | Request | `#/help/request` | Choose a response and submit |
| 8 | Activity and profile | `#/help/activity`, `#/help/profile` | History and correction path |

States board: empty, awaiting review, needs information, approved, paid, rejected,
ineligible, offline/error.

Language: produce **English and Thai** for screens 1, 6 and 7. Thai strings are in the
app already; match the layout, do not re-translate.

---

## 2. Brand lock — non-negotiable

These are the only colours. Any other hue is a defect.

| Token | Hex | Role | Rule |
| --- | --- | --- | --- |
| Ivory | `#FDFBF7` | Page background | Default canvas |
| Navy | `#111D2D` | Primary text, dark surfaces | Text on ivory; white text on navy |
| Purple | `#6840B5` | Primary action, links, focus | White text on purple |
| Purple deep | `#4C2B91` | Pressed state, positive surfaces | White text on it |
| Lavender | `#A78BFA` | Accent only | Never small text, never body copy |
| Coral | `#FF8B86` | Accent, error surface | Navy text on coral. Never small text |
| Ink soft | `#4A5260` | Secondary text | Minimum 12px |
| Line | `#DED9E2` | Dividers, borders | 1px |

Reading rule, quoted from the brandbook: **use navy on ivory and white on purple for
important text. Lavender and coral are accents, not small-text colours.**

Consequences you must follow:

- There is **no green** in this brand. Success and "paid" are purple, not green.
- There is **no amber or brown**. "Needs information" is purple-family or coral surface.
- Coral is never used for small text. If you need an error sentence, use navy text on a
  pale coral surface (`#FDF0EE`) with a coral 1px border or 4px left bar.
- No gradients except the approved wavescape imagery. No new shadows beyond the two tokens.

Type:

| Use | Family | Size / line | Notes |
| --- | --- | --- | --- |
| Wordmark | Alegreya Sans Bold | as drawn | Never re-letter |
| Display heading | Fraunces 400 | 32–40 / 1.1 | letter-spacing −0.035em |
| Section heading | Fraunces 400 | 20–24 / 1.2 | |
| Body | IBM Plex Sans | 14–16 / 1.55 | 15px minimum for Thai |
| Thai body | IBM Plex Sans Thai Looped | 14–16 / 1.6 | Loopless Thai is not approved |
| Label / meta | IBM Plex Sans 600 | 12 / 1.4 | 12px is the floor |

The current build uses 8.5–9px kickers. **Do not copy that.** Use 12px minimum.

Logo: the approved B 3D elephant mark plus Alegreya wordmark, as in
[approved identity](../docs/approved-identity_v01/README.md). The flat elephant
reconstruction is rejected and must not appear.

---

## 3. Layout system

- Baseline frame 390 × 844. Side padding 24px. Content column 342px.
- Spacing scale: 4, 8, 12, 16, 24, 32. Nothing between.
- Radii: 10px inputs and small chips, 16px cards and status surfaces, 100px pills.
- Bottom tab bar: 64px plus safe-area inset; four tabs, 20px icon, 11px label.
- Top bar: 56px, province chip, language picker, avatar.
- Touch targets 44 × 44 minimum. The language picker may not shrink below 44px height.
- One primary action per screen, full width, 48px tall.

---

## 4. Sample content — use exactly this

**Primary persona (use everywhere):**

- Name: **Tan Wei Ming**
- Situation: Malaysian-Chinese long-stay resident in Chiang Mai, household of four
- Verification: passport + TM30 + lease (foreign-resident path), not a Thai national ID
- Payout preference: PromptPay
- Response: *Chiang Mai river flood response* — Mae Rim, Saraphi, Chang Phueak, Hang Dong
- Grant: ฿3,000 fixed per household
- Status in the hero state: paid

**Other sample households:** Lim Mei Ling · Ng Jia Hui · Cheah Boon Keat · Ong Siew Lan

**Thai mirror for Tan Wei Ming:** use the same name. Do not substitute a Thai name.
Thai names in this product are staff names only (Anan, Malee are approvers).

Rules: fictional people only; no real identity numbers; do not invent a household size
supplement or a variable grant.

---

## 5. Screen notes

1. **Sign in — phone.** Eyebrow "Disaster relief · Thailand", h1 "Get help on your
   phone.", one field, primary "Send code", then "What you will need" list and a privacy
   line. Language picker top right. Demo household chips at the bottom, clearly secondary.
2. **Sign in — code.** Six-digit field, demo code chip, "Continue", "Use a different number".
3. **Onboarding 1.** Thai national / Foreign resident toggle. Full name, document number,
   TM30 (foreign only), address evidence type + reference. Progress dots 1–3. One note
   explaining TM30 is corroboration.
4. **Onboarding 2.** Province select, district, subdistrict, house/unit, people, income band.
   Note: district must be on the affected list.
5. **Onboarding 3.** Two payout cards (PromptPay, Solana wallet), the relevant field, a
   review summary, and "Finish verification".
6. **Home.** Identity-verified line, status card (navy default, purple when paid, navy with
   coral left bar when rejected), four-step timeline, eligibility callout, open responses
   list, wallet card, "How your grant works".
7. **Request.** List of responses with grant amount and eligibility. Detail view: what
   happened, optional evidence name, warning that submission is not approval.
8. **Activity and profile.** History cards with status badges; profile cards for identity,
   household, payout; sign out.

Copy tone: plain, calm, specific. Never promise money. Always say a human reviews.

---

## 6. Components to draw once, then reuse

Primary button, secondary button, ghost button, danger button (coral surface, navy text),
text input with label and hint, select, status badge (five states), status card, timeline,
district chip, wallet address block, toast, empty state, bottom tab bar, language picker.

Badge states and colours:

| State | Surface | Text |
| --- | --- | --- |
| Under review | `#F1EAFB` | `#4C2B91` |
| Needs information | `#FDF0EE` | `#111D2D` with coral dot |
| Awaiting signatures | `#F3EDF9` | `#4C2B91` |
| Paid | `#4C2B91` | `#FDFBF7` |
| Not approved | `#FDF0EE` | `#111D2D` with coral dot |

---

## 7. Accessibility

- Body text contrast 4.5:1 minimum; large text 3:1. Navy on ivory and white on purple both pass.
- Never place white text on lavender or coral.
- Focus ring: 2px `#6840B5`, 2px offset, never removed.
- Thai text: line-height 1.6, no all-caps, no letter-spacing tricks.
- Icons always paired with a label; status always has text, never colour alone.
- Reduced motion: no transitions above 160ms.

---

## 8. Do not

- Add a ninth screen or a feature not listed here.
- Invent colours, especially green for success.
- Use photographs of real disaster victims.
- Use Thai names for the sample household.
- Show a "guaranteed" or "instant" payout.
- Change the wordmark, the elephant, or the logo lockup.
- Use gradients, glassmorphism, or neon.
- Copy the 8.5px kickers from the current build.

---

## 9. What to hand back

1. Eight frames at 390 × 844, plus a states row.
2. English and Thai variants for screens 1, 6, 7.
3. One component sheet with all states.
4. Token sheet as CSS variables matching section 2.
5. No production code. No new copy without marking it as proposed.

---

## 10. Prompt to paste into the AI designer

> Design the ReliefVue recipient mobile web app as eight 390×844 frames, in this order:
> sign in phone, sign in code, identity onboarding, residence onboarding, payout
> onboarding, home, request, activity/profile. Use only this palette: ivory #FDFBF7
> canvas, navy #111D2D text and dark surfaces, purple #6840B5 primary action,
> purple-deep #4C2B91 positive surfaces, lavender #A78BFA and coral #FF8B86 as accents
> only, ink-soft #4A5260 secondary text, line #DED9E2 borders. Never use green, amber,
> blue or gradients. Never put white text on lavender or coral, and never use lavender
> or coral for small text. Type: Fraunces for headings, IBM Plex Sans for UI, IBM Plex
> Sans Thai Looped for Thai, Alegreya Sans for the wordmark. 24px side padding, 4/8/12/16/24/32
> spacing, 16px card radius, 10px input radius, 48px primary buttons, 44px minimum touch
> targets, 12px minimum text. Sample household: Tan Wei Ming, Malaysian-Chinese resident
> in Chiang Mai, household of four, Thai baht grant ฿3,000, response covering Mae Rim,
> Saraphi, Chang Phueak and Hang Dong. Show English and Thai for sign in, home and
> request. Deliver a component sheet and a token sheet. Do not add screens or invent
> features.

---

## 11. Known gaps in the current build

- Kicker and timeline labels are 8.5–9px; raise to 12px.
- The wallet card shows a raw address; consider a shortened form with a copy action.
- Bottom navigation labels need a Thai line-height pass at 11px.
- No offline state yet; the design should include one, but it is not implemented.
