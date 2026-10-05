import test from 'node:test';
import assert from 'node:assert/strict';
import {createDemo,donateSample,totals} from '../src/demo-state';
test('custom platform support above one SOL is preserved separately from relief',()=>{
 for(const support of [0,3,25.123456789,0.000000001]){
  const state=createDemo();donateSample(state,5,support);
  assert.equal(state.donorReceipt?.support,support);
  assert.equal(totals(state).support,support);
  assert.equal(totals(state).received,55925);
 }
});
test('invalid optional support cannot create a contribution',()=>{
 for(const support of [-1,NaN,Infinity,1e20,0.0000000001]){
  const state=createDemo();assert.throws(()=>donateSample(state,5,support));assert.equal(state.donationCount,0);
 }
});
