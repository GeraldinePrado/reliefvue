# Identity on Solana: names, attestations and KYC

Recorded 30 October 2026. Research note, not a provider selection, integration claim or legal
advice. ReliefVue has not chosen a KYC/KYB provider.

ReliefVue has to answer several different identity questions, and no single Solana primitive
answers all of them. This note separates the layers so the product does not treat a name, an
attestation or a wallet signature as something it is not.

## The questions

| Question | What answers it | What does not |
| --- | --- | --- |
| Does this person control this wallet? | A signed message or transaction | A name, an avatar, a screenshot |
| Is this a real, unique person? | KYC/KYB, proof of personhood, duplicate checks | A `.sol` name alone |
| Is this the person they claim to be? | Document, liveness and a registry match | Social records, on-chain history |
| Does the person live in the affected area? | Address evidence and field attestation | A national ID alone |
| Is this a new household for this response? | Household hash and duplicate rules | A wallet address alone |
| Is this organisation legitimate? | KYB, registry checks, ownership and sanctions screening | A `.sol` name or a logo |
| Is the wallet sanctioned? | Wallet screening and transaction monitoring | KYC of a different wallet |

## The four layers

| Layer | Example | Proves | Does not prove |
| --- | --- | --- | --- |
| Wallet control | Phantom or Backpack signature | Control of a key at that moment | Legal identity or uniqueness |
| Naming | Solana Name Service `.sol` | The current owner controls the name and its records | That the owner is who the name suggests |
| Attestation | Solana Attestation Service | A trusted issuer signed a claim about a wallet | That the claim is true unless the issuer is trusted and pinned |
| KYC/KYB | Sumsub, Civic, a local NDID provider | A verification process happened | Residence, household uniqueness or disaster impact |

They are complementary:

```text
KYC/KYB provider verifies the person or organisation
        ↓
a minimal claim is signed (SAS attestation or an off-chain credential)
        ↓
the claim is bound to the wallet
        ↓
SNS gives the wallet or organisation a human-readable name
        ↓
ReliefVue checks the claim, the duplicate/nullifier and human approval
```

## SNS — the name layer

Solana Name Service maps `.sol` names to Solana accounts. Records can hold a SOL address, an
ETH address, a URL, a CNAME, social handles and profile data. Most Solana wallets support
sending to a `.sol` name, and SNS reports more than 160 integrations.

SNS also documents two useful properties:

- **Staleness.** A record is only valid for the current domain owner. If the domain is sold or
  transferred, the old record becomes stale.
- **Right of association.** For certain records, the domain owner must prove control of the
  linked account or domain, which reduces impersonation.

What it means for ReliefVue: a `.sol` name is a good human-readable address for the
organisation, a partner or a donation vault. It is not a KYC check, not a uniqueness check,
and not permanent. Show the name for convenience, but verify the full address and the claim
behind it.

## SAS — the attestation layer

The Solana Attestation Service is an open, permissionless program for issuing, verifying and
revoking attestations. The model has three parts:

1. **Credential** — an issuer registers its name and authorised signers.
2. **Schema** — the issuer publishes the field names, types and description of a claim.
3. **Attestation** — an authorised signer writes a claim bound to a subject/nonce, with an
   optional expiry. Closing the account revokes it.

A schema can be tokenised, which mints a soulbound Token-2022 token for the subject. The token
is a display convenience, not proof: a verifier must read the underlying attestation, check
the program owner, the credential, the schema and the expiry, and confirm the account is the
expected PDA.

Two cautions matter for a relief product:

- **Anyone can create a credential.** SAS does not tell you which issuer to trust. The
  verifier must pin the issuer, the schema and the program.
- **Attestation data is public.** Never put a name, national ID, address, phone number or
  document image on-chain. Even "country + level + date" can be sensitive in a small
  community. A minimal claim, an off-chain credential, or a commitment/nullifier is safer.

## KYC and KYB providers — the verification layer

A provider does the document, liveness, database and sanctions work. It can then issue a
reusable credential, either off-chain or as a Solana attestation.

**Sumsub** is one example. It provides individual KYC, business KYB, AML and sanctions
screening, transaction monitoring, Travel Rule support and reusable KYC through Sumsub ID. In
May 2025 Sumsub and Solana demonstrated on-chain identity attestations through SAS: a user
completes verification, links a self-hosted Solana wallet, and Sumsub issues an attestation
tied to that wallet.

That does not make Sumsub a Thai registry match. International document-and-liveness vendors
generally provide L1 assurance. A Thai payout needs an L2 match through DOPA/NDID or an
authorised channel, with the user's consent. The two can work together: an L1 pre-check
reduces failed L2 attempts, and the L2 result is what releases money.

Other examples:

- **Civic Pass** — reusable verification and proof of personhood, with Solana support and SAS
  compatibility.
- **Quadrata** — a passport with KYC, KYB, AML, wallet screening and country/age attributes;
  its current documentation lists EVM chains, so Solana support must be verified before use.
- **Didit, Persona, Veriff, Onfido, Jumio** — document and liveness providers, generally L1.
- **Local NDID providers** — Thai DOPA-backed matching with consent, through a licensed
  relying party or bank partner. This is the route a Thai payout needs.

No provider is endorsed here. The choice depends on assurance level, coverage, data
residency, SAS support, price and contract terms.

## What each journey needs

| Journey | Identity need | Why |
| --- | --- | --- |
| Donor | Wallet control and sanctions screening; KYC only above a threshold or when a payment provider requires it | Small donations should stay low-friction; large or regulated flows need more |
| Recipient | L2 local identity before payout; L1 may open an application but must not release money | Prevents impersonation and duplicate claims |
| Partner organisation | KYB before it can operate a reserve, plus a human-readable name | Protects the network from fraudulent operators |
| Treasury signer | Internal identity and role checks, hardware-backed keys | A signer is a governance role, not a customer |

## What not to do

- Do not call a `.sol` name "verified identity".
- Do not treat an attestation as true because it exists; check the issuer, schema and expiry.
- Do not put personal data on-chain.
- Do not let a KYC provider's score replace a human eligibility decision.
- Do not describe a Devnet demo as KYC or as a live payout service.

## Open questions

1. Which assurance level does each journey need, and who signs off on it?
2. Does the chosen provider issue a SAS attestation on Solana mainnet, and can ReliefVue pin
   the credential and schema?
3. Should ReliefVue issue its own attestation after an NDID match, or rely on a provider's?
4. Which fields are the minimum for the claim, and how long should it live?
5. Where are identity documents stored, and which data-residency rule applies?
6. Who is the data controller, and what is the retention and deletion schedule?
7. Does the partner KYB cover Thai charity registration and ultimate beneficial ownership?
8. How are revoked, expired and re-verified claims handled in the payout program?

## Sources

- [Solana Attestation Service](https://github.com/solana-foundation/solana-attestation-service)
- [Sumsub and Solana on-chain attestations](https://sumsub.com/newsroom/sumsub-and-solana-debut-on-chain-identity-attestations-at-accelerate-new-york/)
- [Sumsub crypto KYC/KYB](https://sumsub.com/crypto/)
- [SNS records](https://docs.sns.id/collection/sns-v1/records)
- [SNS overview](https://docs.sns.id/collection/master)
- [Civic joins SAS](https://www.biometricupdate.com/202505/civic-joins-solana-attestation-service-for-solid-foundation-for-verifiable-credentials)
- [Quadrata introduction](https://docs.quadrata.com/integration/introduction/introduction-to-quadrata)
- [Squads multisig](https://docs.squads.so/main)
