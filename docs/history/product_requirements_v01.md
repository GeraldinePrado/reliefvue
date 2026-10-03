# Product Requirements Document — ReadyFund

## 1. Product summary

**ReadyFund** is a pre-funded disaster-relief reserve built around transparent Solana settlement.

Instead of starting fundraising only after a disaster happens, donors and organizations can contribute to an emergency reserve beforehand. When an official disaster area is activated, verified households in that affected zone become eligible to claim a defined relief allocation.

**Core promise:**  
> **Emergency money ready before disaster.**

**Supporting line:**  
> **One verified household. One claim per disaster. Every fund movement auditable.**

---

## 2. Problem

Disaster funding typically starts after the emergency is already happening.

This creates several problems:

- Relief fundraising begins late.
- Donors have limited visibility into where funds eventually move.
- Recipients may be asked to repeat verification across different programs.
- Duplicate or fraudulent claims can reduce funds available to legitimate households.
- Sensitive victim information should not be made public just to make funding transparent.
- Unused campaign money can be difficult for donors to understand or follow.

---

## 3. Product insight

The differentiator is **not** "blockchain donations."

The differentiator is:

> **Build emergency liquidity before the disaster, then activate transparent household-level distribution only when a verified disaster event occurs.**

ReadyFund separates:

- **Private identity verification** — off-chain
- **Public fund accountability** — on-chain
- **Eligibility usage / duplicate prevention** — on-chain or cryptographically referenced

---

## 4. Target users

### Primary

**Donor**
- Wants to contribute to disaster preparedness or an active disaster.
- Wants visible proof that funds remain in the reserve or are distributed.

**Affected household**
- Lives inside an activated disaster zone.
- Privately verifies eligibility.
- Claims the relief allocation without exposing identity publicly.

### Future institutional users

- NGOs
- Foundations
- CSR / corporate emergency programs
- Municipal / provincial partners
- Licensed payment / digital asset partners
- Disaster-response organizations

These are **not required for the hackathon MVP**.

---

## 5. MVP scenario

Use one fictional demo event:

**Chiang Mai Flood 2026 — DEMO ONLY**

The system contains:

- 1 emergency reserve
- 1 activated disaster
- 3 mock households
- 1 donor wallet
- 1 eligible recipient wallet
- 1 duplicate-claim attempt

### Successful demo flow

1. User opens ReadyFund.
2. Dashboard shows reserve balance.
3. "Chiang Mai Flood 2026" is activated.
4. Donor connects a Solana wallet and contributes Devnet SOL.
5. Dashboard updates with transaction confirmation.
6. Recipient opens "Request Relief."
7. Mock KYC/residency flow marks the household eligible.
8. Recipient connects wallet.
9. Recipient claims.
10. Devnet transfer succeeds.
11. Claim receipt is recorded.
12. Same household attempts a second claim.
13. Program rejects it.
14. Dashboard shows updated distributed / remaining balance.

---

## 6. User stories

### Donor

**US-D1**  
As a donor, I want to see the emergency reserve balance so I know funds already exist before a disaster.

**US-D2**  
As a donor, I want to contribute test funds with my Solana wallet and receive a transaction confirmation.

**US-D3**  
As a donor, I want to see how much has been allocated and distributed without seeing victims' private identities.

### Recipient

**US-R1**  
As an affected household, I want to privately prove that I am eligible.

**US-R2**  
As an eligible household, I want to claim my allocation directly to my wallet.

**US-R3**  
As a recipient, I should not be able to claim twice for the same disaster.

### Administrator / Demo operator

**US-A1**  
As the demo operator, I want to activate a mock disaster.

**US-A2**  
As the demo operator, I want to see eligible household records and fraud flags.

---

## 7. MVP screens

### Screen 1 — Public dashboard

Show:

- ReadyFund reserve balance
- Active disaster
- Amount allocated
- Amount distributed
- Amount remaining
- Verified households count
- Households helped count
- Recent transaction signatures

Primary CTAs:

- **Donate**
- **Request Relief**

### Screen 2 — Donate

Show:

- Wallet connection
- Amount entry
- "Donate test SOL"
- Transaction progress
- Success state
- Explorer link

### Screen 3 — Active disaster

Show:

- Disaster name
- Status: Officially activated — demo
- Affected area: Chiang Mai — demo
- Claim amount
- Vault balance
- Households helped

### Screen 4 — Eligibility

Mock three steps:

1. Identity verified
2. Residency verified
3. Household duplicate check passed

Never request real identity documents in the hackathon demo.

Return:

- **Eligible**
or
- **Already claimed**
or
- **Needs review**

### Screen 5 — Claim

Show:

- Household pseudonymous ID
- Disaster ID
- Available allocation
- Wallet
- Claim button

Successful state:

- "Relief sent"
- transaction signature
- claim receipt ID

### Screen 6 — Duplicate claim rejection

Show a deliberately clear error:

> **Claim rejected — this household has already received assistance for this disaster.**

This is a key demo moment.

---

## 8. Functional requirements

### FR-1 Wallet
- Connect a Solana-compatible browser wallet.
- Display public address.
- Display Devnet balance when practical.

### FR-2 Reserve funding
- A donor can submit a Devnet transaction to the reserve/disaster vault.
- UI must display pending / confirmed / failed state.

### FR-3 Disaster state
- System can represent one active disaster.
- Store disaster ID, name, status, claim amount, and vault.

### FR-4 Household eligibility
- Demo backend returns a pseudonymous household hash / ID.
- No real KYC documents are stored.

### FR-5 One claim per household per disaster
- On-chain claim receipt is derived from:
  - disaster ID
  - household hash
- If the claim receipt already exists, the second claim must fail.

### FR-6 Distribution
- Valid claim transfers Devnet SOL from the disaster vault/reserve path to recipient wallet.
- Claim transaction creates/records a claim receipt.

### FR-7 Transparency dashboard
- Show reserve/vault state.
- Show total distributed.
- Show claim count.
- Show transaction signatures.
- Never show household names or documents.

---

## 9. Non-functional requirements

- **Demo reliability > feature count**
- Mobile-responsive
- Clear error states
- No mainnet
- No real PII
- No seed phrases stored
- No private keys committed
- Environment variables excluded from git
- All "official" government / KYC data labeled as **DEMO / MOCK**
- A judge should understand the product in under 30 seconds

---

## 10. Privacy model

### Off-chain only

Production concept:

- government ID
- passport
- address
- utility / tenancy evidence
- liveness / biometrics
- phone number
- fraud signals

### On-chain

Only pseudonymous / non-sensitive state:

- disaster ID
- household eligibility hash or nullifier
- claim receipt / used status
- fund movement
- transaction signatures

Never put real Thai ID numbers, passport numbers, names, home addresses, photos, utility bills, or biometric information on-chain.

---

## 11. Anti-fraud concept

The MVP implements only the most demonstrable anti-fraud rule:

> **One household hash can claim once per disaster.**

Production vision may combine:

- KYC identity matching
- household / address verification
- phone verification
- device and IP risk signals
- document reuse detection
- wallet graph analysis
- registration velocity
- appeal / manual review

IP addresses are **risk signals**, not unique identities.

---

## 12. What is deliberately out of scope

Do not build these during the 6-hour sprint:

- Production KYC
- Government API integration
- Mainnet
- Real aid recipients
- Real THB
- PromptPay
- Exchange / off-ramp
- Full fraud engine
- Multiple countries
- Multiple disaster types
- Complex household weighting
- Appeal system
- Donations to individual people
- NFT / token launch
- DAO governance
- AI chatbot
- Tokenomics

If Codex starts adding these, stop it.

---

## 13. Success criteria

The MVP succeeds if we can demonstrate all of these live:

- [ ] Wallet connects
- [ ] Devnet donation confirms
- [ ] Active disaster is visible
- [ ] Mock household becomes eligible
- [ ] Eligible household claims Devnet SOL
- [ ] Transaction appears on Solana
- [ ] Second claim using the same household ID fails
- [ ] Dashboard reflects the new distribution
- [ ] No personal information is exposed on-chain

---

## 14. Product differentiation

Do **not** pitch ReadyFund as "a blockchain donation platform."

Pitch it as:

> **A pre-funded emergency reserve that is ready before disaster strikes, with direct, verifiable household-level distribution when a disaster is activated.**

Key differentiation:

- preparedness rather than post-disaster crowdfunding
- reserve already funded
- private recipient verification
- public settlement accountability
- one-claim enforcement
- unused funds remain ready for the next event

---

## 15. Monetization — future, not MVP

ReadyFund should be positioned as private infrastructure rather than taking a percentage from victims.

Possible business model:

- optional donor platform support contribution
- SaaS / infrastructure fees for organizations
- white-label emergency fund portals
- enterprise fraud / verification tooling
- reporting and audit infrastructure
- API access
- corporate matching / CSR campaign tooling

Production legal structure and regulated-money handling require dedicated legal review and qualified partners.

---

## 16. Pitch summary

> **ReadyFund keeps emergency money ready before disaster. Donors and organizations pre-fund a transparent reserve. When an official disaster area is activated, affected households privately verify eligibility and receive one claim per disaster. Identity stays private; fund movements and claim usage are auditable on Solana.**
