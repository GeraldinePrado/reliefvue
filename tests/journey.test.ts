import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDemo, submitClaim, decideClaim, completePayout, donateSample, totals } from '../src/demo-state.ts';

test('unverified, unapproved and duplicate claims cannot produce sample payouts', () => {
 const s=createDemo();
 assert.throws(()=>submitClaim(s), /verification/i);
 s.receiver.verified=true;
 assert.throws(()=>submitClaim(s), /event/i);
 s.event='active';s.receiver.scenario='flood';
 submitClaim(s);assert.throws(()=>submitClaim(s), /already/i);
 assert.throws(()=>completePayout(s), /approved/i);
 decideClaim(s,'approve','Example residence checked');completePayout(s);
 assert.throws(()=>completePayout(s), /already/i);
 assert.equal(totals(s).distributed,0.03);
});

test('sample public records omit entered identity; reserve and support reconcile separately',()=>{
 const s=createDemo();s.receiver.name='Private Person';s.receiver.residence='Private street';
 s.receiver.verified=true;s.receiver.scenario='flood';s.event='active';submitClaim(s);
 assert.throws(()=>decideClaim(s,'approve',''),/reason/i);
 decideClaim(s,'more','Please confirm the example room');assert.equal(s.claim?.status,'more');
 decideClaim(s,'approve','Example resolved');completePayout(s);
 donateSample(s,0.03,0.005);const t=totals(s);
 assert.equal(t.reserve,0.52);assert.equal(t.support,0.005);
 assert.equal(t.reserve+t.distributed,0.55);
 assert.doesNotMatch(JSON.stringify(s.activity),/Private Person|Private street/);
 assert.throws(()=>donateSample(s,NaN,0),/amount/i);
});

test('changed residence requires human review and review rejection never pays',()=>{
 const s=createDemo();s.receiver.verified=true;s.receiver.scenario='flood';s.receiver.changedResidence=true;s.event='active';submitClaim(s);
 assert.equal(s.claim?.status,'review');decideClaim(s,'reject','Outside sample boundary');
 assert.throws(()=>completePayout(s),/approved/i);
 assert.equal(totals(s).distributed,0.02);
});
