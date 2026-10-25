# ReliefVue MVP delivery sequence v01

Date: 2026-10-24. Direction: global network, recipient mobile app, initial operational exploration in Southeast Asia country by country.

## Source of truth

[PRD v0.4](prd_v04.md) consolidates the supplied direction. [Review resolutions](requirements_review_v01.md) track differences and open decisions. [M1 brief v02](m1_build_brief_v02.md) is a scoped engineering requirement. [PromptPay research](promptpay_research_v01.md) records optional Thailand-rail feasibility.

## Milestones

| Stage | Work | Exit evidence |
| --- | --- | --- |
| M0 requirements | Consolidate PRDs, correct geographic/spending assumptions, review gaps, preserve source history, identify open decisions | Branch documentation and reviewed M1 boundaries; live partner choices may remain open |
| M1 Devnet | Compile/test existing program, deploy test reserve, fund/authorize/bind/claim, connect technical UI | Program/deployment IDs, real receipts, finalized state assertions, negative/recovery tests |
| M2 core/operations | PostgreSQL, authentication/MFA/RBAC, country and organization boundaries, auditable household/event/ledger records | Synthetic cases survive restarts; authorization and ledger isolation proven |
| M3 recipient mobile | Sandbox identity/residence checks, automatic eligible-event handling, recovery/appeals and mobile status | End-to-end synthetic device journey and supported failure paths |
| M4 controlled payments | Two allowances, merchant baskets, QR intents, provider sandbox, refunds/outages/reconciliation | Restricted carts and flexible rules enforced without duplicate debit or false settlement |
| M5 NGO/pilot readiness | Scoped portal/API, independent security/privacy review, operating drills and country readiness | Measured acceptance and separate live-pilot go/no-go decision |

Website redesign: shape journeys/design direction alongside M0; preserve public simulation during M1; implement donor and staff website changes with the backend in M2/M3. Mobile wallet, identity-provider and merchant-payment feasibility begin early, before platform commitments. No wholesale frontend rewrite in M1.

PromptPay: feasibility and requirements now, ledger/adapter interfaces in M2, optional sandbox after provider capability is confirmed (principally M4). It does not make Thailand the first launch country and does not enter the native-SOL M1 proof.

## Skill sequence

Completed in this documentation step: current-state inspection, adversarial requirements review, source consolidation and targeted PromptPay research.
Next: mri-code-design for M1 only → mri-code-devplan → mri-code-implement with focused tests → mri-code-review and mri-code-verify. Re-enter design for subsequent milestones rather than pretending a single contract sprint completes the whole product.

## First design decisions

Compare extending the existing reserve/client with a rewrite, justify the recommended smallest change, and specify signing ownership, generated-IDL integration, durable operation identity, confirmation/retry behavior and test evidence. Do not silently weaken reserve rules or implement absent production governance features. Keep existing brand and public simulation separate from verified chain state.

## Publication and status

Development branch: codex/reliefvue-mvp. User authorized continued branch commits/pushes on 24 October 2026. Main is not a publication target for this task. No automatic merge, mainnet launch or live payment activation follows from branch authorization.

This step changes documentation only. It does not claim M1 has compiled or deployed. Previous checks ran against an earlier local checkout; fresh clean dependency/build/native tests are required for the implementation branch. Product policy decisions listed in the PRD remain open until resolved.
