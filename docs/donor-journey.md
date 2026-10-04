<!-- Current consolidated design requirements: design-brief.md. Later approved sections supersede earlier prompts. -->

# Donor journey - hackathon redesign

Working draft for discussion, 2026-10-04. ReliefVue is the provisional name. Product rules already agreed in the brief remain authoritative; proposed screens below await Geraldine's review. This document does not describe implemented deployment behavior.

## Established product intent

- Donors worldwide may contribute to one Thailand-wide SOL relief reserve.
- No province/event earmarking in this first product concept.
- Operating support is optional, separate from relief funds and off by default.
- Public activity does not reveal household identities or private residence evidence.
- Hackathon sample activity is labelled simulated; real Devnet transactions require genuine confirmed receipts.

## Proposed donor journey

Public homepage explains the product and fund transparency -> Donate -> choose SOL relief amount -> optional separate platform support -> review destinations and totals -> confirm demo contribution -> receipt -> follow reserve and relief activity.

The main recording walkthrough can use a sample wallet and simulated confirmation so judges can explore without installing a wallet or transferring funds. If a live Devnet mode is retained, keep it a separate explicit action with its own verified receipt. A sample wallet connection must not be represented as a real signature.

No donor sign-in or personal details are needed merely to browse or try the demo. Whether to require accounts in a future funded service remains unresolved. Suggested first discussion: donation entry without account creation, with an optional future account for history if later justified.
## Confirmed donor entry and journey

Geraldine approved the proposed donor journey and contribution without a ReliefVue account for donor-only visitors. An actual wallet/provider may have its own requirements; do not imply anonymous or unrestricted fiat payment.

Relief donations are intended to reach the designated official relief reserve, separate from the optional operating-support destination. The current prototype's wallet/server transfer route is not a deployed program-controlled reserve. Public balances and accounting remain SOL.

## Local currency clarification and next design decision

Geraldine intends local-currency contributions to become an equivalent SOL contribution. This would require a future payment/conversion provider and an explicit exchange quote, fees and resulting SOL amount before confirmation. No such provider, live exchange-rate service or fiat payment flow is implemented in the demo. Displaying an approximate local-currency value alone cannot convert funds.

Two proposed entry choices for the walkthrough: 'Donate SOL' and 'Pay in local currency - planned, demo only.' A local-currency example must use a clearly labelled illustrative quote, not a claimed live rate; never collect real card/bank data. Confirmed proposal selection and its screen treatment remain to be discussed. Keep the public reserve and relief activity denominated in SOL.
## Confirmed future local-currency presentation

Geraldine approved showing both SOL and a future local-currency donation route, explicitly as intended product direction rather than a working integration. Use 'Proposed future feature - simulated in this demo' at selection and confirmation. Any example quote is illustrative, not live or guaranteed. Provider/technology feasibility, conversion, fees, settlement and applicable requirements remain to be investigated; no provider has been selected. Do not claim funding or selection makes the integration certain.

## Approved donor review screen

Reuse the already agreed optional-support policy: relief amount goes to the relief reserve; optional platform support is off by default and uses a separate operating destination. Show both amounts, any applicable fees only when known (otherwise label illustrative/undetermined), and total separately before confirmation. Donors can decline support without changing the relief contribution. In the hackathon, a demo confirmation creates a sample receipt only; actual Devnet receipts require verified transactions and remain distinct.

Geraldine confirmed the review-screen recommendations: optional support off by default, separate destinations/totals and a labelled sample receipt. Receipt/public-activity presentation follows the current design brief. Reviewer details remain to be mapped.