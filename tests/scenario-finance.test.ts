import test from 'node:test';
import assert from 'node:assert/strict';
import {SCENARIO,scenarioHistory} from '../src/scenario-finance';
import {createDemo,donateSample,totals} from '../src/demo-state';
test('varied daily history reconciles to public reserve including session contributions',()=>{
 const state=createDemo();donateSample(state,5,3);const t=totals(state);
 const rows=scenarioHistory(t.received-SCENARIO.received,t.support,t.distributed-SCENARIO.disbursed);
 const sum=(key:'received'|'paid'|'support')=>Math.round(rows.reduce((n,r)=>n+Math.round(r[key]*1e9),0))/1e9;
 assert.equal(sum('received'),t.received);assert.equal(sum('paid'),t.distributed);assert.equal(sum('support'),t.support);assert.equal(sum('received')-sum('paid'),t.reserve);
 assert.ok(new Set(rows.map(r=>r.paid)).size>10);
 assert.equal(scenarioHistory(0,0,.8).at(-1)!.paid,Math.round((scenarioHistory().at(-1)!.paid+.8)*1e9)/1e9);
});
