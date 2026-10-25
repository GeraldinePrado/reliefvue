import * as anchor from "@coral-xyz/anchor";
import { ComputeBudgetProgram, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { randomBytes } from "node:crypto";
import assert from "node:assert/strict";

// Each case owns its roles, reserve, events and tokens. The provider pays fees,
// so exact snapshots include all affected program/recipient accounts without fees.
describe("independent reserve invariant fixtures", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.ReliefReserve as anchor.Program;
  const bn = (n: number) => new anchor.BN(n);
  const grant = 10_000_000;
  const pda = (...seeds: Buffer[]) => PublicKey.findProgramAddressSync(seeds, program.programId)[0];
  async function snapshot(addresses: PublicKey[]) {
    return Promise.all(addresses.map(async address => {
      const a = await provider.connection.getAccountInfo(address, "confirmed");
      return a && { lamports: a.lamports, owner: a.owner.toBase58(), data: a.data.toString("hex"), executable: a.executable };
    }));
  }
  async function unchanged(addresses: PublicKey[], action: () => Promise<unknown>, pattern?: RegExp) {
    const before = await snapshot(addresses);
    if (pattern) await assert.rejects(action, pattern);
    else await assert.rejects(action);
    assert.deepEqual(await snapshot(addresses), before);
  }
  async function fixture() {
    const reviewer = Keypair.generate(), primary = Keypair.generate(), backup = Keypair.generate();
    const verifier = Keypair.generate(), recipient = Keypair.generate();
    const area = randomBytes(32), id = randomBytes(32);
    const reserve = pda(Buffer.from("reserve"), reviewer.publicKey.toBuffer());
    const eventAt = (eventId: Buffer) => pda(Buffer.from("event"), reserve.toBuffer(), eventId);
    const event = eventAt(id);
    const entitlement = (token: Buffer, e = event) => pda(Buffer.from("entitlement"), e.toBuffer(), token);
    for (const key of [reviewer, verifier, recipient]) {
      await provider.sendAndConfirm(new Transaction().add(SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey, toPubkey: key.publicKey, lamports: 100_000_000,
      })));
    }
    await program.methods.initialize(verifier.publicKey).accountsStrict({ reserve,
      reviewer: reviewer.publicKey, primary: primary.publicKey, backup: backup.publicKey,
      systemProgram: SystemProgram.programId }).signers([reviewer, primary, backup]).rpc();
    await provider.sendAndConfirm(new Transaction().add(SystemProgram.transfer({
      fromPubkey: provider.wallet.publicKey, toPubkey: reserve, lamports: 100_000_000,
    })));
    const create = (eventId = id, approver = primary, budget = 40_000_000) =>
      program.methods.createEvent([...eventId], [...area], bn(grant), bn(budget), bn(grant))
        .accountsStrict({ reserve, event: eventAt(eventId), reviewer: reviewer.publicKey,
          approver: approver.publicKey, systemProgram: SystemProgram.programId })
        .signers([reviewer, approver]).rpc();
    const bind = (token: Buffer, reviewed = false, e = event, r = reserve) =>
      program.methods.bindEntitlement([...token], [...area], reviewed).accountsStrict({ reserve: r,
        event: e, verifier: verifier.publicKey, recipient: recipient.publicKey,
        entitlement: entitlement(token, e), systemProgram: SystemProgram.programId }).signers([verifier]).rpc();
    const claimInstruction = (token: Buffer, e = event, r = reserve) => program.methods.claim()
      .accountsStrict({ reserve: r, event: e, entitlement: entitlement(token), recipient: recipient.publicKey }).instruction();
    const claim = async (token: Buffer, nonce = 0) => provider.sendAndConfirm(new Transaction()
      .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 + nonce }))
      .add(await claimInstruction(token)), [recipient]);
    return { reviewer, primary, backup, verifier, recipient, area, id, reserve, event,
      eventAt, entitlement, create, bind, claim, claimInstruction };
  }
  it("rejects a zero token without changing rent, allocations or outstanding", async () => {
    const f = await fixture(); await f.create(); const zero = Buffer.alloc(32);
    await unchanged([f.reserve, f.event, f.entitlement(zero), f.verifier.publicKey, f.recipient.publicKey],
      () => f.bind(zero), /Terms/);
  });
  it("isolates equal event IDs across reserves and rejects a foreign reserve", async () => {
    const a = await fixture(), b = await fixture();
    await a.create(); await b.create(a.id, b.backup);
    assert.notEqual(a.event.toBase58(), b.eventAt(a.id).toBase58());
    const token = randomBytes(32);
    await unchanged([a.reserve, a.event, b.reserve, b.eventAt(a.id), a.entitlement(token), a.verifier.publicKey],
      () => a.bind(token, false, a.event, b.reserve), /Constraint/);
  });
  it("rejects entitlement substitution from another event with exact rollback", async () => {
    const f = await fixture(); await f.create(); const secondId = randomBytes(32); await f.create(secondId);
    const token = randomBytes(32); await f.bind(token);
    await unchanged([f.reserve, f.event, f.eventAt(secondId), f.entitlement(token), f.recipient.publicKey],
      async () => provider.sendAndConfirm(new Transaction().add(await f.claimInstruction(token, f.eventAt(secondId))), [f.recipient]), /Constraint/);
  });
  it("permits primary and backup approvals while preserving immutable terms", async () => {
    const f = await fixture(); await f.create(); const secondId = randomBytes(32); await f.create(secondId, f.backup);
    for (const approver of [f.primary, f.backup]) {
      await program.methods.increaseEvent(bn(grant), bn(0)).accountsStrict({ reserve: f.reserve,
        event: f.event, reviewer: f.reviewer.publicKey, approver: approver.publicKey })
        .signers([f.reviewer, approver]).rpc();
    }
    const e = await (program.account as any).reliefEvent.fetch(f.event);
    assert.equal(e.grant.toNumber(), grant); assert.equal(e.hold.toNumber(), grant);
    assert.equal(e.budget.toNumber(), 60_000_000); assert.deepEqual(e.area, [...f.area]);
    assert.equal((await (program.account as any).reserve.fetch(f.reserve)).outstanding.toNumber(), 100_000_000);
  });
  it("rejects changed event terms after signatures without creating a commitment", async () => {
    const f = await fixture();
    const build = (amount: number) => program.methods.createEvent([...f.id], [...f.area], bn(grant), bn(amount), bn(grant))
      .accountsStrict({ reserve: f.reserve, event: f.event, reviewer: f.reviewer.publicKey,
        approver: f.primary.publicKey, systemProgram: SystemProgram.programId }).instruction();
    const tx = new Transaction().add(await build(40_000_000));
    tx.feePayer = provider.wallet.publicKey;
    tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
    tx.partialSign(f.reviewer, f.primary);
    await provider.wallet.signTransaction(tx);
    tx.instructions[0] = await build(50_000_000);
    await unchanged([f.reserve, f.event, f.reviewer.publicKey], () => provider.connection.sendRawTransaction(
      tx.serialize({ requireAllSignatures: true, verifySignatures: false })), /signature verification/i);
  });
  it("settles exactly one of two distinct concurrent claims and preserves the second event", async () => {
    const f = await fixture(); await f.create(); const secondId = randomBytes(32); await f.create(secondId, f.backup);
    const secondEvent = f.eventAt(secondId), token = randomBytes(32); await f.bind(token);
    const secondBefore = await snapshot([secondEvent]);
    const beforeRecipient = await provider.connection.getBalance(f.recipient.publicKey);
    const beforeReserve = await provider.connection.getBalance(f.reserve);
    const beforeR = await (program.account as any).reserve.fetch(f.reserve);
    const beforeE = await (program.account as any).reliefEvent.fetch(f.event);
    // Different compute limits ensure distinct signatures, so RPC deduplication
    // cannot disguise a second executed transaction as another successful claim.
    const results = await Promise.allSettled([f.claim(token, 1), f.claim(token, 2)]);
    assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
    assert.equal(await provider.connection.getBalance(f.recipient.publicKey), beforeRecipient + grant);
    assert.equal(await provider.connection.getBalance(f.reserve), beforeReserve - grant);
    const after = await (program.account as any).entitlement.fetch(f.entitlement(token));
    const r = await (program.account as any).reserve.fetch(f.reserve);
    const e = await (program.account as any).reliefEvent.fetch(f.event);
    assert.equal(after.consumed, true);
    assert.equal(e.paid.toNumber(), beforeE.paid.toNumber() + grant);
    assert.equal(r.outstanding.toNumber(), beforeR.outstanding.toNumber() - grant);
    assert.deepEqual(await snapshot([secondEvent]), secondBefore);
    const info = await provider.connection.getAccountInfo(f.reserve); assert(info);
    const rent = await provider.connection.getMinimumBalanceForRentExemption(info.data.length);
    assert.equal(info.lamports - rent, 100_000_000 - grant);
    assert(info.lamports >= rent + r.outstanding.toNumber());
    await unchanged([f.reserve, f.event, secondEvent, f.entitlement(token), f.recipient.publicKey],
      () => f.claim(token, 3), /Consumed/);
  });
});
