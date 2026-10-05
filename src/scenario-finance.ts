/** Shared fictional opening scenario for the public app and staff analytics. */
export const SCENARIO={received:55920,disbursed:7680,reserve:48240,responseBudget:12000,grant:.8,paidHouseholds:9600} as const;
/** Allocate whole units with an exact total and deterministic, non-flat daily weights. */
export function allocateDays(total:number){const weights=Array.from({length:30},(_,i)=>12+(i*23)%67+(i>19?35:0));const sum=weights.reduce((a,b)=>a+b,0);const values=weights.map(w=>Math.floor(total*w/sum));let remaining=total-values.reduce((a,b)=>a+b,0);for(let i=0;remaining>0;i++,remaining--)values[i%30]++;return values;}
export function scenarioHistory(extraRelief=0,extraSupport=0,extraPaid=0){const received=allocateDays(SCENARIO.received),households=allocateDays(SCENARIO.paidHouseholds);return received.map((amount,i)=>({day:i+1,received:amount+(i===29?extraRelief:0),paid:Math.round((households[i]*SCENARIO.grant+(i===29?extraPaid:0))*1e9)/1e9,support:i===29?extraSupport:0,expense:0}));}
