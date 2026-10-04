import * as anchor from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { randomBytes } from "node:crypto";
import assert from "node:assert/strict";

describe("reserve on a fresh local validator", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  // Generated IDL is loaded by Anchor; generated typed client must be integrated separately.
  const program = anchor.workspace.ReliefReserve as anchor.Program;
  const reviewer = Keypair.generate(), primary = Keypair.generate(), backup = Keypair.generate();
  const verifier = Keypair.generate(), outsider = Keypair.generate(), recipient = Keypair.generate();
  const reserve = PublicKey.findProgramAddressSync(
    [Buffer.from("reserve"), reviewer.publicKey.toBuffer()], program.programId)[0];
  const area = randomBytes(32), id = randomBytes(32);
  const event = PublicKey.findProgramAddressSync(
    [Buffer.from("event"), reserve.toBuffer(), id], program.programId)[0];
  const bn = (n: number) => new anchor.BN(n);
  const grant = 10_000_000, budget = 50_000_000, hold = 10_000_000;
  const entitlement = (token: Buffer) => PublicKey.findProgramAddressSync(
    [Buffer.from("entitlement"), event.toBuffer(), token], program.programId)[0];
  async function rejects(work: Promise<unknown>, pattern?: RegExp) {
    await assert.rejects(work, pattern);
  }
  const create = (eventId: Buffer, target: PublicKey, amount: number, who = primary) =>
    program.methods.createEvent([...eventId], [...area], bn(grant), bn(amount), bn(hold))
      .accountsStrict({ reserve, reviewer: reviewer.publicKey, approver: who.publicKey,
        event: target, systemProgram: SystemProgram.programId }).signers([reviewer, who]).rpc();
  const bind = (token: Buffer, reviewed: boolean, who = verifier, target = recipient.publicKey, areaId = area) =>
    program.methods.bindEntitlement([...token], [...areaId], reviewed)
      .accountsStrict({ reserve, event, verifier: who.publicKey, recipient: target,
        entitlement: entitlement(token), systemProgram: SystemProgram.programId }).signers([who]).rpc();
  const claim = (token: Buffer, who = recipient) =>
    program.methods.claim().accountsStrict({ reserve, event, entitlement: entitlement(token),
      recipient: who.publicKey }).signers([who]).rpc();
  before(async () => {
    for (const key of [reviewer, primary, backup, verifier, outsider, recipient]) {
      await provider.sendAndConfirm(new Transaction().add(SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey, toPubkey: key.publicKey, lamports: 100_000_000,
      })));
    }
  });
  it("rejects collapsed initialization roles and initializes fixed independent roles", async () => {
    await rejects(program.methods.initialize(verifier.publicKey).accountsStrict({
      reserve, reviewer: reviewer.publicKey, primary: reviewer.publicKey, backup: backup.publicKey,
      systemProgram: SystemProgram.programId }).signers([reviewer, backup]).rpc(), /Roles/);
    await program.methods.initialize(verifier.publicKey).accountsStrict({
      reserve, reviewer: reviewer.publicKey, primary: primary.publicKey, backup: backup.publicKey,
      systemProgram: SystemProgram.programId }).signers([reviewer, primary, backup]).rpc();
    await rejects(program.methods.initialize(outsider.publicKey).accountsStrict({
      reserve, reviewer: reviewer.publicKey, primary: primary.publicKey, backup: backup.publicKey,
      systemProgram: SystemProgram.programId }).signers([reviewer, primary, backup]).rpc());
    await provider.sendAndConfirm(new Transaction().add(SystemProgram.transfer({
      fromPubkey: provider.wallet.publicKey, toPubkey: reserve, lamports: 100_000_000,
    })));
  });
  it("rejects wrong or absent approver signatures, activates jointly with backup", async () => {
    await rejects(create(id,event,budget,outsider), /Unauthorized/);
    await rejects(program.methods.createEvent([...id],[...area],bn(grant),bn(budget),bn(hold))
      .accountsStrict({reserve,event,reviewer:reviewer.publicKey,approver:primary.publicKey,
        systemProgram:SystemProgram.programId}).signers([reviewer]).rpc());
    await rejects(program.methods.createEvent([...id],[...area],bn(grant),bn(budget),bn(hold))
      .accountsStrict({reserve,event,reviewer:reviewer.publicKey,approver:primary.publicKey,
        systemProgram:SystemProgram.programId}).signers([primary]).rpc());
    await rejects(program.methods.createEvent([...id],[...area],bn(grant),bn(budget),bn(hold))
      .accountsStrict({reserve,event,reviewer:primary.publicKey,approver:backup.publicKey,
        systemProgram:SystemProgram.programId}).signers([primary,backup]).rpc(), /Unauthorized/);
    await create(id,event,budget,backup);
    await rejects(create(id,event,budget)); // Same PDA cannot be recreated.
  });
  it("protects commitments across events and permits only funded additive increases", async () => {
    const id2=randomBytes(32);
    const event2=PublicKey.findProgramAddressSync([Buffer.from("event"),reserve.toBuffer(),id2],program.programId)[0];
    await rejects(create(id2,event2,60_000_000), /Funds/);
    const increase=(amount:number,extraHold:number) => program.methods.increaseEvent(bn(amount),bn(extraHold))
      .accountsStrict({reserve,event,reviewer:reviewer.publicKey,approver:primary.publicKey})
      .signers([reviewer,primary]).rpc();
    await rejects(increase(60_000_000,0), /Funds/);
    await rejects(increase(1,2), /Terms/);
    await increase(10_000_000,10_000_000);
    const state=await (program.account as any).reliefEvent.fetch(event);
    assert.equal(state.budget.toNumber(),60_000_000);
    assert.equal(state.hold.toNumber(),20_000_000);
    await create(id2,event2,40_000_000);
    const committed=await (program.account as any).reserve.fetch(reserve);
    assert.equal(committed.outstanding.toNumber(),100_000_000);
  });
  it("binds immutable opaque household tokens, rejects oracle impersonation and wrong area", async () => {
    await rejects(bind(randomBytes(32),false,outsider), /Unauthorized/);
    await rejects(bind(randomBytes(32),false,verifier,recipient.publicKey,randomBytes(32)), /Area/);
    const token=randomBytes(32);
    await bind(token,false);
    await rejects(bind(token,false,verifier,outsider.publicKey));
    await rejects(claim(token,outsider), /Recipient/);
    const before=await provider.connection.getBalance(recipient.publicKey);
    await claim(token);
    assert.equal(await provider.connection.getBalance(recipient.publicKey),before+grant);
    await rejects(claim(token), /Consumed/);
  });
  it("caps regular allocations independently of review hold; spends review only once", async () => {
    for(let n=0;n<3;n++) {
      const token=randomBytes(32); await bind(token,false); await claim(token);
    }
    await rejects(bind(randomBytes(32),false), /Cap/);
    for(let n=0;n<2;n++) {
      const token=randomBytes(32); await bind(token,true); await claim(token);
      await rejects(claim(token), /Consumed/);
    }
    await rejects(bind(randomBytes(32),true), /Cap/);
    const r=await (program.account as any).reserve.fetch(reserve);
    const e=await (program.account as any).reliefEvent.fetch(event);
    assert.equal(e.paid.toNumber(),60_000_000);
    assert.equal(r.outstanding.toNumber(),40_000_000);
    const balance=await provider.connection.getBalance(reserve);
    const info=await provider.connection.getAccountInfo(reserve);
    assert(info);
    const rent=await provider.connection.getMinimumBalanceForRentExemption(info.data.length);
    assert.equal(balance-rent,40_000_000);
  });
});
