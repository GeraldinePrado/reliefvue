# Identity, PromptPay and KYC data security

Recorded 30 October 2026. Design documentation, **not legal advice**. Every regulated point
must be confirmed with Thai counsel and the chosen bank/PSP before real money moves.

This document answers three questions:

1. How do we know a Thai national ID is real, and how does KYC actually work?
2. How does a recipient connect PromptPay, and what should ReliefVue build?
3. Where do we store household KYC documents so they cannot be tampered with or leaked?

Companion documents: [platform policy constraints](platform_policy_constraints_v01.md),
[platform architecture](platform_architecture_v01.md), [open decisions](platform_open_questions_v01.md).

---

## 1. The national ID number

### What the number contains

Thirteen digits: type (1 digit), registration office or province (4), sequence (5), group
(2), check digit (1).

### The checksum

```text
sum   = Σ digit[i] × (13 - i)     for i = 1..12
check = (11 - (sum mod 11)) mod 10
valid if digit[13] == check
```

Implemented in `server/platform/identity.ts` as `isValidThaiNationalId`, and enforced on
profile save in `service.ts`. It strips spaces and hyphens, requires exactly 13 digits, and
computes the same check digit the Department of Provincial Administration uses.

### What the checksum proves — and does not

It proves the number is **well formed**. It catches typos, transposed digits and invented
numbers. It does **not** prove that the person exists, that the number belongs to them,
that they are alive, or that they live at the claimed address. Roughly one in ten random
13-digit strings passes the checksum.

Treat the checksum as **L0**. It may create an account. It may never authorise a payout.

### Other free checks worth adding

- Reject `0000000000000` and all-repeated digits.
- Reject a date-of-birth segment that cannot be a real date, if the ID encodes one.
- Rate-limit attempts per phone and per IP to stop enumeration.
- Hash the number with a server-side pepper before storing it, and keep only the last four
  digits for display. This is what the prototype already does.

---

## 2. How Thai KYC actually works

### The tiers

| Tier | Method | Proves | Unlocks |
| --- | --- | --- | --- |
| L0 | Phone OTP + checksum | Control of a phone number; plausible ID format | Account creation only |
| L1 | ID card photo + OCR + liveness selfie + face match | A document was present and a live person held it | Provisional onboarding, never a payout |
| L2 | DOPA / ThaID / NDID match through a licensed channel | The identity exists in the national record and the person consented | Claim eligibility and payout |
| L3 | Residence evidence plus human attestation | The person lives in the affected area | Edge cases: renters, shared rooms, unreachable households |

Rule for ReliefVue: **a payout requires L2 identity plus a residence check.** L1 alone
never releases money. L3 is a review input, not a substitute for identity.

### The channels

- **DOPA / ThaID.** The national ID authority. Private organisations cannot query the
  registry directly; they go through an authorised channel.
- **NDID.** A consent-based identity exchange. Members are Relying Parties (services),
  Identity Providers (banks and similar), Authoritative Sources (data owners) and Proxies.
  NDID's DID Platform holds an ETDA digital identity exchange licence and ISO 27001:2022,
  and states that every transaction carries an audit log that cannot be altered
  ([NDID platform](https://ndid.co.th/en/platform-en-2/)). By 2026 it reported more than
  150 member organisations and over 30 million registered users
  ([CGAP](https://www.cgap.org/research/beyond-access-thailand-and-frontiers-of-financial-inclusion)).
- **Packaged providers.** Olympus by J Ventures and SCB TechX wrap NDID/DOPA access; banks
  offer e-KYC to partners. International document-and-liveness vendors (Jumio, Onfido,
  Sumsub) do **not** provide a DOPA match on their own — they give you L1, not L2.
- **ThaID.** The citizen-facing DOPA app. In an NDID flow the user approves the request
  inside ThaID or their bank app; ReliefVue never sees the user's credentials.

### The flow we should build

```text
1. Phone + OTP
2. Consent screen  -> purpose, data categories, retention, withdrawal, PDPA notice
3. Choose Thai national or foreign resident
4. Thai: 13-digit ID + ID card photo + liveness selfie
   Foreign: passport MRZ + visa/extension + TM30 + address evidence
5. Local checks: checksum, duplicate hash, document quality
6. Send to IdP through our NDID Relying Party (Olympus, SCB TechX or a bank)
7. User approves the consent request inside ThaID / their bank app
8. IdP returns a signed assertion: name, date of birth, verification time, assurance level
9. Server compares the returned name with the entered name, stores the assertion reference,
   a hash of the ID, the last four digits, provider, timestamp and assurance level
10. Reviewer sees masked data, the assurance badge and the evidence, never the raw number
```

### What the prototype does today

Checksum + self-declared evidence, labelled demo. No DOPA, NDID, liveness or document
authenticity check. That is honest for a Devnet demo and must not be described as KYC.

---

## 3. PromptPay

### What PromptPay is

A proxy-ID payment rail operated by National ITMX under the Bank of Thailand. A proxy is a
mobile number, national ID, tax ID or e-wallet ID mapped to a bank account. Money moves
account-to-account; the proxy is just the address.

### Why "connect your PromptPay" is the wrong mental model

There is no OAuth-style connection to a person's PromptPay. A recipient does not authorise
ReliefVue to "access" their PromptPay. Two things actually happen:

1. The **recipient registers** their phone or national ID with their own bank once. Nothing
   to do with ReliefVue.
2. ReliefVue **instructs its bank or PSP** to pay that proxy ID. The money lands in the
   recipient's bank account. No app, no code, no balance.

### The two product models

| Model | What it is | Licence position |
| --- | --- | --- |
| **A. Disbursement only** (recommended) | ReliefVue keeps funds at a bank/PSP and initiates payouts to a proxy ID | No balance held for users; closest to a donation disbursement |
| **B. Wallet / balance** | The user tops up, holds a balance, then withdraws to PromptPay | Looks like e-money; BOT licence, reported THB 100 million paid-up capital, Thai juristic person, Thai-resident director |

Apps that let a user hold a balance and cash out to PromptPay sit in model B or partner with
a licensed e-money issuer. Model B is the expensive path and is not needed for household
grants. **ReliefVue should be model A.**

On the app you referenced: [Owego](https://www.owego.app/) is a JavaScript-rendered site;
its product model could not be confirmed from public text, so I am not assuming it holds
balances. If it does, that is the model to avoid, not to copy. Send me a screenshot of the
flow and I will map it precisely.

### What the bank actually provides

Krungsri's PromptPay API transfers in real time to mobile number, national ID, tax ID and
e-wallet proxy IDs, supports dual control, returns a transaction status, and can send a
payment advice to the recipient ([Krungsri Fund Transfer API](https://developers.krungsri.com/usecases/financial-services/fund-transfer)).
That maps cleanly onto ReliefVue's two-signature release: the second signature is the
"confirmation" step, and the bank's dual control is the backstop.

### Build recommendation

1. Collect the recipient's PromptPay **phone number** (most common) with a fallback to
   national ID as proxy.
2. Verify before paying: ask the PSP for a name match where the provider offers it. Never
   display a beneficiary name you have not verified.
3. Pay through the PSP/bank API, not by holding a balance.
4. Store only the proxy ID and the return reference, not bank credentials.
5. Handle the three real failure modes: proxy not registered, name mismatch, and provider
   outage. On outage, hold the payout and keep the household's place in the queue.
6. Tell the recipient what to expect: "the money arrives in the bank account linked to this
   number; there is no code to enter and nothing to install."

### The honest limitation

A PromptPay transfer is **push**, not pull. Once it leaves, it is gone. That is why identity,
duplicate checks and the two-signature release must be right before the instruction is sent,
and why the payout must be idempotent with a stored idempotency key.

---

## 4. Where KYC documents live

### Principle

The database never holds a document or a raw identity number. It holds a pointer, a hash and
a decision. Documents live in encrypted object storage with a separate key hierarchy.

### Classification

| Class | Examples | Store |
| --- | --- | --- |
| A — identity document | ID card photo, passport page, selfie | Encrypted object storage, restricted |
| B — contact and address | phone, address, TM30, lease | Encrypted database columns |
| C — claim evidence | flood photos, damage notes | Encrypted object storage |
| D — financial | payout reference, proxy ID | Database, tokenised where the bank supports it |

### Architecture

```text
Browser ──TLS──> API ──> KMS (master key)
                   │        └── per-household data key (envelope)
                   ├──> Postgres: hashes, last4, pointers, decisions
                   └──> Object storage (private, versioned, object-lock)
```

- **Envelope encryption.** Each household gets a data key, wrapped by a KMS master key.
  Documents are encrypted with the household key. Rotate the master key yearly; rotate a
  household key on request or on suspicion.
- **Storage location.** A private bucket with public access blocked, versioning on, and
  object lock for evidence. Prefer a region in Southeast Asia; confirm data-residency
  expectations with counsel before choosing.
- **No public URLs.** Access is through a signed URL with a five-minute lifetime, issued
  per request, per object, and logged. No bulk listing. No predictable paths.
- **Separation of duties.** Upload, review and payout read different scopes. A reviewer can
  view one application's evidence and cannot export a household's file.
- **Break-glass access.** Two-person approval, time-boxed, fully audited.

### Tamper evidence

1. Hash every uploaded file with SHA-256 at receipt, store the hash in the database and in
   the audit log, and re-verify on read.
2. Keep the audit log append-only: each entry includes the hash of the previous entry, so
   deleting or editing history breaks the chain.
3. Anchor the audit root nightly to a write-once store (object lock or WORM bucket). Only
   hashes and timestamps are anchored — never PII.
4. Never delete evidence in place. A correction adds a new version; history stays.
5. Optional and cheap: publish the nightly audit root hash somewhere public. That proves no
   retroactive edit without exposing household data.

### Retention and deletion

PDPA requires collecting only what is necessary and keeping it no longer than necessary
([PDPC](https://www.pdpc.or.th/)). Proposed defaults, to confirm with counsel:

- Identity documents: delete 90 days after a response closes, unless a legal hold applies.
- Claim evidence: same.
- Financial records: keep for the statutory accounting period, with personal data minimised.
- Deletion must cascade to object storage, backups and audit read-models, with a tombstone
  that proves deletion without retaining the content.
- Consent records and the fact of deletion are kept; the data itself is not.

### Threat model

| Threat | Control |
| --- | --- |
| Database dump leaks identities | Raw numbers never stored; only peppered hashes and last four |
| Object storage made public by mistake | Block public access at account level, signed URLs only, policy test in CI |
| IDOR: one household reads another | Authorisation on every object and row, not just URL obscurity |
| Insider bulk export | No bulk export, per-view audit, anomaly alerts, two-person break-glass |
| Tampering with evidence | SHA-256 at upload, hash-chained audit, object lock |
| Replay of a payout instruction | Idempotency key, unique constraint, provider-side dedupe |
| Stolen staff session | MFA, short sessions, device binding, immediate revocation |
| Logs capturing PII | Structured logging with redaction rules, no request bodies in logs |
| Backup leak | Separate key, encrypted, access reviewed quarterly |
| Supply-chain compromise | Lockfiles, dependency scanning, signed releases, least-privilege tokens |

### Baseline hardening for a public demo

TLS 1.3 and HSTS; CSP without inline scripts; CSRF tokens; rate limits on OTP, login and
document upload; MFA for staff; secrets in a manager, never in the repo; SAST and dependency
scanning in CI; a penetration test before any real household data; and an incident response
runbook with a PDPA 72-hour notification path.

---

## 5. Current prototype versus what a pilot needs

| Area | Today | Pilot requirement |
| --- | --- | --- |
| National ID | Checksum only | NDID/DOPA match through a licensed RP |
| Liveness | None | Face match and liveness |
| Documents | Filename only | Encrypted object storage, signed URLs, hashes |
| Identity storage | Peppered hash + last four | Same, plus encrypted contact data |
| Address, TM30 | Plaintext in SQLite | Encrypted columns, access-scoped |
| PromptPay | Simulated reference | PSP/bank payout API with name match and status inquiry |
| Audit | Append-only table | Hash-chained and anchored |
| Hosting | Laptop, SQLite | Managed Postgres, KMS, private object storage |
| Legal | None | DPIA, privacy notice, consent text, counsel sign-off |

---

## 6. Decisions needed

1. KYC provider: NDID through Olympus, SCB TechX, or a bank partner. This sets cost, speed
   and the consent wording.
2. Does ReliefVue ever store the raw national ID? Recommended: no, hash and last four only.
3. Who is the data controller — ReliefVue Thailand, the foundation partner, or the PSP?
4. Retention period and legal-hold rules.
5. Hosting region and data-residency position.
6. PSP/bank for payouts, and whether it offers a name-match API.
7. Whether a payout can proceed when name match is unavailable, or must be held for review.

---

## 7. References

- [NDID platform](https://ndid.co.th/en/platform-en-2/) — membership model, ETDA licence, ISO 27001:2022, immutable audit log.
- [CGAP, Beyond Access: Thailand](https://www.cgap.org/research/beyond-access-thailand-and-frontiers-of-financial-inclusion) — NDID scale, 2026.
- [Krungsri Fund Transfer API](https://developers.krungsri.com/usecases/financial-services/fund-transfer) — PromptPay proxy payouts, dual control, status inquiry, tokenisation.
- [DOPA](https://www.bora.dopa.go.th/) and [ThaID](https://www.bora.dopa.go.th/) — national identity authority and citizen app.
- [PDPC](https://www.pdpc.or.th/) — PDPA guidance.
- [BOT payment systems](https://www.bot.or.th/en/our-roles/payment-systems/payment-act-oversight.html) — licensing thresholds.
