import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createStore } from "../server/store.ts";
import { createApp } from "../server/app.ts";
import type { Transport } from "../shared/types.ts";
test("auth, both approvals, concurrent duplicate, restart, uncertainty and forged receipt", async () => {
  const file = join(await mkdtemp(join(tmpdir(), "rv-api-")), "state.json");
  let sends = 0,
    uncertain = false;
  const transport: Transport = {
    treasuryAddress: "treasury",
    donorAddress: "donor",
    balance: async () => 100000000,
    prepareTransfer: async () => ({
      signature: "fake-" + (sends + 1),
      send: async () => {
        sends++;
      },
      confirm: async () => {
        if (uncertain) throw Error("timeout");
      },
    }),
    verifyDonation: async () => {
      throw Error("forged");
    },
  };
  let store = await createStore(file, {
    "unit-a": "recipient-a",
    "room-b": "recipient-b",
  });
  let server = createApp({ store, transport });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  let url = "http://127.0.0.1:" + (server.address() as { port: number }).port;
  let token = (await (await fetch(url + "/api/session")).json())
    .token as string;
  const post = (path: string, data: unknown, authorized = true) =>
    fetch(url + path, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(authorized ? { "x-reliefvue-session": token } : {}),
      },
      body: JSON.stringify(data),
    });
  try {
    assert.equal(
      (await post("/api/event", { action: "review" }, false)).status,
      401,
    );
    assert.equal(
      (await post("/api/claim", { profileId: "unit-a" })).status,
      400,
    );
    assert.equal(
      (
        await fetch(url + "/api/session", {
          headers: { Origin: "https://evil.example" },
        })
      ).status,
      403,
    );
    await post("/api/event", { action: "review" });
    await post("/api/event", { action: "approve-reviewer" });
    assert.equal(
      (await post("/api/claim", { profileId: "unit-a" })).status,
      400,
    );
    await post("/api/event", { action: "approve-primary" });
    const results = await Promise.all([
      post("/api/claim", { profileId: "unit-a" }),
      post("/api/claim", { profileId: "duplicate-a" }),
    ]);
    assert.deepEqual(results.map((x) => x.status).sort(), [200, 400]);
    assert.equal(sends, 1);
    assert.equal(
      (await post("/api/donation", { signature: "forged" })).status,
      400,
    );
    uncertain = true;
    assert.equal(
      (await post("/api/claim", { profileId: "room-b" })).status,
      400,
    );
    assert.equal(sends, 2);
  } finally {
    await new Promise<void>((r, j) => server.close((e) => (e ? j(e) : r())));
  }
  store = await createStore(file);
  server = createApp({ store, transport });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  url = "http://127.0.0.1:" + (server.address() as { port: number }).port;
  token = (await (await fetch(url + "/api/session")).json()).token as string;
  try {
    assert.equal(
      (await post("/api/claim", { profileId: "room-b" })).status,
      400,
    );
    assert.equal(
      (await post("/api/claim", { profileId: "unit-a" })).status,
      400,
    );
    assert.equal(sends, 2);
    assert.equal(store.state.event.paidLamports, 10000000);
  } finally {
    await new Promise<void>((r, j) => server.close((e) => (e ? j(e) : r())));
  }
});

test("public receipts exclude claim links, donation verification retries are idempotent, offline evidence review works", async () => {
  const store = await createStore(
    join(await mkdtemp(join(tmpdir(), "rv-private-")), "state.json"),
  );
  let online = false,
    verifications = 0;
  const transport: Transport = {
    treasuryAddress: "treasury",
    donorAddress: "donor",
    balance: async () => {
      if (!online) throw Error("offline");
      return 100000000;
    },
    prepareTransfer: async () => {
      throw Error("unused");
    },
    verifyDonation: async () => {
      verifications++;
      return 10000000;
    },
  };
  const server = createApp({ store, transport });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const url = "http://127.0.0.1:" + (server.address() as { port: number }).port;
  try {
    const token = (await (await fetch(url + "/api/session")).json())
      .token as string;
    const headers = {
      "content-type": "application/json",
      "x-reliefvue-session": token,
    };
    const post = (path: string, data: unknown) =>
      fetch(url + path, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
    assert.equal((await fetch(url + "/api/profiles")).status, 401);
    assert.equal((await fetch(url + "/api/profiles", { headers })).status, 200);
    assert.equal((await post("/api/event", { action: "review" })).status, 200);
    assert.equal(store.state.event.status, "review");
    assert.equal(
      (await post("/api/event", { action: "approve-primary" })).status,
      400,
    );
    assert.equal(store.state.event.approverRevision, null);
    store.state.donationIntents.receipt = {
      signature: "receipt",
      amountSol: 0.01,
      state: "submitted",
    };
    online = true;
    assert.equal(
      (await post("/api/donation", { signature: "receipt" })).status,
      200,
    );
    assert.equal(
      (await post("/api/donation", { signature: "receipt" })).status,
      200,
    );
    assert.equal(store.state.donationIntents.receipt?.state, "confirmed");
    assert.equal(verifications, 1);
    assert.equal(store.state.activity.length, 1);
    store.state.payments.private = {
      key: "private",
      profileId: "secret",
      householdId: "hidden",
      amountLamports: 10000000,
      destination: "wallet",
      state: "submitted",
      signature: "private-receipt",
      createdAt: "now",
      updatedAt: "now",
    };
    const publicStatus = await (await fetch(url + "/api/status")).json();
    assert.deepEqual(publicStatus.claims, {});
    const privateStatus = await (
      await fetch(url + "/api/status", { headers })
    ).json();
    assert.equal(privateStatus.claims.secret.signature, "private-receipt");
  } finally {
    await new Promise<void>((r, j) => server.close((e) => (e ? j(e) : r())));
  }
});
