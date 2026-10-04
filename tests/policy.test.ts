import { test } from "node:test";
import assert from "node:assert/strict";
import { initialState, eventAction, prepareClaim } from "../server/policy.ts";
test("watching cannot pay; exact revision needs two roles", () => {
  const s = initialState();
  assert.throws(() => prepareClaim(s, "unit-a"), /active/);
  eventAction(s, "review", 100000000);
  eventAction(s, "approve-reviewer", 100000000);
  assert.equal(s.event.status, "review");
  eventAction(s, "approve-backup", 100000000);
  assert.equal(s.event.status, "active");
  assert.equal(prepareClaim(s, "unit-a").amountLamports, 10000000);
  assert.throws(() => prepareClaim(s, "duplicate-a"), /household/i);
  prepareClaim(s, "room-b");
  assert.throws(() => prepareClaim(s, "outside-area"), /area/);
  assert.throws(() => prepareClaim(s, "pending-room"), /review/);
});

import {
  reviewClaim,
  recordConfirmed,
  recordSubmitted,
} from "../server/policy.ts";
test("fixed grant, protected hold, earmarked review allocation, queue and no double paid count", () => {
  const s = initialState();
  eventAction(s, "review", 100000000);
  eventAction(s, "approve-reviewer", 100000000);
  eventAction(s, "approve-primary", 100000000);
  assert.throws(() => prepareClaim(s, "room-b"), /queue/);
  const a = prepareClaim(s, "unit-a");
  recordSubmitted(s, a.key, "a");
  recordConfirmed(s, a.key);
  recordConfirmed(s, a.key);
  assert.equal(s.event.paidLamports, 10000000);
  const b = prepareClaim(s, "room-b");
  recordSubmitted(s, b.key, "b");
  recordConfirmed(s, b.key);
  s.event.budgetLamports = 30000000;
  reviewClaim(s, "pending-room", true);
  assert.equal(s.event.reviewHoldLamports, 0);
  assert.equal(prepareClaim(s, "pending-room").amountLamports, 10000000);
});
test("forecast and insufficient reserve cannot activate", () => {
  const s = initialState();
  assert.throws(() => eventAction(s, "approve-primary", 100000000), /Observed/);
  eventAction(s, "review", 100000000);
  eventAction(s, "approve-primary", 100000000);
  assert.throws(() => eventAction(s, "approve-reviewer", 1000), /reserve/);
  assert.equal(s.event.status, "review");
});
