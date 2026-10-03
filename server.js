import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(root, 'data');
const dataFile = path.join(dataDir, 'demo_state.json');
const rpc = process.env.RELIEFVUE_RPC_URL || 'https://api.devnet.solana.com';
const connection = new Connection(rpc, 'confirmed');
const eventId = 'bangkok-flood-demo';
const claimLamports = 10_000_000;
fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });

function createState() {
  const treasury = Keypair.generate();
  const demoDonor = Keypair.generate();
  const recipients = { bangkok_01: Keypair.generate().publicKey.toBase58(), bangkok_02: Keypair.generate().publicKey.toBase58() };
  return {
    treasurySecret: Array.from(treasury.secretKey),
    demoDonorSecret: Array.from(demoDonor.secretKey),
    recipients,
    active: false,
    notice: null,
    claims: {},
    activity: [],
  };
}

let state = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, 'utf8')) : createState();
const treasury = Keypair.fromSecretKey(Uint8Array.from(state.treasurySecret));
const demoDonor = Keypair.fromSecretKey(Uint8Array.from(state.demoDonorSecret));

function save() {
  const temp = `${dataFile}.writing`;
  fs.writeFileSync(temp, JSON.stringify(state, null, 2), { mode: 0o600 });
  fs.renameSync(temp, dataFile);
}
if (!fs.existsSync(dataFile)) save();

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}
function fail(res, status, message) { json(res, status, { error: message }); }
async function body(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 30_000) throw new Error('Request is too large.');
  }
  return raw ? JSON.parse(raw) : {};
}
function publicKey(value) {
  try { return new PublicKey(value); } catch { throw new Error('Enter a valid Solana wallet address.'); }
}
function explorer(signature) { return `https://explorer.solana.com/tx/${signature}?cluster=devnet`; }
function publicState(balance, donorBalance) {
  return {
    event: { id: eventId, name: 'Bangkok flood response', area: 'Bangkok', active: state.active, amountSol: claimLamports / LAMPORTS_PER_SOL },
    treasury: treasury.publicKey.toBase58(),
    balanceSol: balance / LAMPORTS_PER_SOL,
    demoDonor: demoDonor.publicKey.toBase58(),
    demoDonorBalanceSol: donorBalance / LAMPORTS_PER_SOL,
    recipients: state.recipients,
    claims: Object.fromEntries(Object.entries(state.claims).map(([key, value]) => [key, { status: value.status, signature: value.signature || null }])),
    activity: state.activity.map(({ type, signature, amountSol, at }) => ({ type, signature, amountSol, at, explorer: explorer(signature) })),
    notice: state.notice,
    aiAvailable: Boolean(process.env.OPENAI_API_KEY),
    enforcement: 'Demo server record, not an on-chain claim program',
  };
}
async function sendSol(from, to, lamports) {
  const tx = new Transaction().add(SystemProgram.transfer({ fromPubkey: from.publicKey, toPubkey: to, lamports }));
  return sendAndConfirmTransaction(connection, tx, [from], { commitment: 'confirmed' });
}
async function verifiedTransfer(signature, toAddress) {
  let transaction = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    transaction = await connection.getParsedTransaction(signature, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 });
    if (transaction) break;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  if (!transaction || transaction.meta?.err) throw new Error('The transaction is not confirmed on Devnet.');
  const instructions = transaction.transaction.message.instructions;
  const matching = instructions.find((instruction) => instruction.program === 'system' && instruction.parsed?.type === 'transfer' && instruction.parsed?.info?.destination === toAddress);
  if (!matching) throw new Error('The confirmed transaction did not fund the ReliefVue demo treasury.');
  return matching.parsed.info.lamports;
}

const server = http.createServer(async (req, res) => {
  try {
    const route = new URL(req.url, 'http://localhost').pathname;
    if (req.method === 'GET' && route === '/api/status') {
      const [balance, donorBalance] = await Promise.all([connection.getBalance(treasury.publicKey), connection.getBalance(demoDonor.publicKey)]);
      return json(res, 200, publicState(balance, donorBalance));
    }
    if (req.method === 'POST' && route === '/api/demo-fund') {
      const { amountSol } = await body(req);
      const amount = Number(amountSol);
      if (!Number.isFinite(amount) || amount < 0.001 || amount > 0.1) return fail(res, 400, 'Choose 0.001 to 0.1 test SOL.');
      const lamports = Math.round(amount * LAMPORTS_PER_SOL);
      if (await connection.getBalance(demoDonor.publicKey) < lamports + 10_000) return fail(res, 409, 'The demo donor needs Devnet SOL. Use a wallet donation or fund the displayed demo donor address.');
      const signature = await sendSol(demoDonor, treasury.publicKey, lamports);
      state.activity.unshift({ type: 'donation', signature, amountSol: lamports / LAMPORTS_PER_SOL, at: new Date().toISOString() });
      save();
      return json(res, 200, { signature, explorer: explorer(signature) });
    }
    if (req.method === 'POST' && route === '/api/donation') {
      const { signature } = await body(req);
      if (typeof signature !== 'string' || signature.length > 120) return fail(res, 400, 'Enter a valid transaction signature.');
      const existing = state.activity.find((entry) => entry.signature === signature);
      if (existing) return json(res, 200, { signature, explorer: explorer(signature) });
      const lamports = await verifiedTransfer(signature, treasury.publicKey.toBase58());
      if (state.activity.some((entry) => entry.signature === signature)) return json(res, 200, { signature, explorer: explorer(signature) });
      state.activity.unshift({ type: 'donation', signature, amountSol: lamports / LAMPORTS_PER_SOL, at: new Date().toISOString() });
      save();
      return json(res, 200, { signature, explorer: explorer(signature) });
    }
    if (req.method === 'POST' && route === '/api/activate') {
      const { notice } = await body(req);
      if (typeof notice !== 'string' || notice.trim().length < 25 || notice.length > 5000) return fail(res, 400, 'Enter a notice with at least 25 characters.');
      if (!/bangkok/i.test(notice)) return fail(res, 400, 'This demo can only activate a notice that names Bangkok.');
      state.active = true;
      state.notice = { text: notice.trim(), area: 'Bangkok', approvedAt: new Date().toISOString(), source: 'Supplied demo text, human approved' };
      save();
      return json(res, 200, { active: true });
    }
    if (req.method === 'POST' && route === '/api/notice-review') {
      if (!process.env.OPENAI_API_KEY) return fail(res, 503, 'No AI service key is configured for this demo.');
      const { notice } = await body(req);
      if (typeof notice !== 'string' || notice.trim().length < 25 || notice.length > 5000) return fail(res, 400, 'Enter 25 to 5,000 characters of notice text.');
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model: process.env.RELIEFVUE_AI_MODEL || 'gpt-4o-mini',
          instructions: 'You review supplied disaster notice text for a prototype. Extract only the geographic area explicitly named and flag ambiguity. Never infer that a notice is authentic, never approve activation, and never evaluate household identity. Respond with JSON containing area, uncertain, title, explanation. area must be Bangkok or Unclear. Keep explanation under 35 words.',
          input: notice,
          text: { format: { type: 'json_object' } },
          store: false,
        }),
      });
      if (!response.ok) return fail(res, 502, `AI service error (${response.status}).`);
      const result = await response.json();
      const output = result.output?.flatMap((part) => part.content || []).find((part) => part.type === 'output_text')?.text;
      if (!output) return fail(res, 502, 'AI service returned no review.');
      const parsed = JSON.parse(output);
      const area = parsed.area === 'Bangkok' ? 'Bangkok' : 'Unclear';
      return json(res, 200, {
        area,
        uncertain: Boolean(parsed.uncertain) || area !== 'Bangkok',
        title: String(parsed.title || 'AI notice review').slice(0, 100),
        explanation: String(parsed.explanation || 'Human verification required.').slice(0, 300),
      });
    }
    if (req.method === 'POST' && route === '/api/claim') {
      const { householdId, recipientAddress } = await body(req);
      if (!state.active) return fail(res, 409, 'Claims are closed until the Bangkok demo event is activated.');
      if (householdId === 'chiang_mai_01') return fail(res, 403, 'This household’s verified home is in Chiang Mai, outside the Bangkok demo area.');
      if (!['bangkok_01', 'bangkok_02'].includes(householdId)) return fail(res, 400, 'Choose a synthetic demo household.');
      const key = `${eventId}:${householdId}`;
      if (state.claims[key]) return fail(res, 409, state.claims[key].status === 'confirmed' ? 'This household has already received help for this disaster.' : 'This household’s claim is already being processed.');
      const recipient = publicKey(recipientAddress);
      if (recipient.toBase58() !== state.recipients[householdId]) return fail(res, 403, 'This demo household can only receive funds at its assigned synthetic wallet.');
      if (await connection.getBalance(treasury.publicKey) < claimLamports + 10_000) return fail(res, 409, 'The demo reserve does not have enough confirmed Devnet SOL.');
      if (state.claims[key]) return fail(res, 409, 'This household’s claim is already being processed or has been paid.');
      state.claims[key] = { status: 'pending', recipient: recipient.toBase58(), startedAt: new Date().toISOString() };
      save();
      try {
        const signature = await sendSol(treasury, recipient, claimLamports);
        state.claims[key] = { status: 'confirmed', signature, recipient: recipient.toBase58(), at: new Date().toISOString() };
        state.activity.unshift({ type: 'payout', signature, amountSol: claimLamports / LAMPORTS_PER_SOL, at: new Date().toISOString() });
        save();
        return json(res, 200, { signature, explorer: explorer(signature) });
      } catch (error) {
        state.claims[key] = { status: 'needs_review', recipient: recipient.toBase58(), error: String(error.message || error) };
        save();
        throw error;
      }
    }
    return fail(res, 404, 'Not found.');
  } catch (error) {
    console.error(error);
    return fail(res, 500, error?.message || 'Unexpected server error.');
  }
});

server.listen(8787, '127.0.0.1', () => console.log(`ReliefVue demo API listening on 127.0.0.1:8787; treasury ${treasury.publicKey.toBase58()}`));
