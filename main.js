import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import './styles.css';

const app = document.querySelector('#app');
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const publicDemo = import.meta.env.VITE_PUBLIC_DEMO === '1';
const publicTreasury = '8x5Vb5taNo74fprnBTUBd7Dr5XWZc1nRNGtub77QndEx';
const publicRecipients = { bangkok_01: 'GvmQgnUFdPMJ1vxDFyAQDxnjzRPufYNfavGXNt3FCD4D', bangkok_02: '4L4Hzxnzpk9HrogYKDrwCdU2EFWtQdocWvdTcmndUysn' };
const fixtureNotice = 'Demonstration notice: Severe flooding has affected Bangkok. The fictional response area is Bangkok only. This is sample text, not an official government declaration.';
const profiles = {
  bangkok_01: { label: 'Bangkok household 01', home: 'Bangkok', note: 'Synthetic profile · home area on file' },
  bangkok_02: { label: 'Bangkok household 02', home: 'Bangkok', note: 'Synthetic profile · home area on file' },
  chiang_mai_01: { label: 'Chiang Mai household 01', home: 'Chiang Mai', note: 'Synthetic profile · home area on file' },
};
let data = null;
let page = location.hash.slice(1) || 'overview';
let householdId = 'bangkok_01';
let payoutMethod = 'wallet';
let connectedAddress = null;
let provider = null;
let noticeText = fixtureNotice;
let review = null;
let sampleClaimStage = 0;
let feedback = { text: '', tone: '' };
let busy = false;

const short = (address) => address ? `${address.slice(0, 5)}…${address.slice(-5)}` : '';
const fmt = (number) => Number(number || 0).toFixed(3);
const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const explorer = (signature) => `https://explorer.solana.com/tx/${encodeURIComponent(signature)}?cluster=devnet`;

async function api(route, options = {}) {
  if (publicDemo) return publicApi(route, options);
  const response = await fetch(`/api/${route}`, {
    headers: { 'content-type': 'application/json' },
    ...options,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Request failed.');
  return result;
}
const post = (route, value) => api(route, { method: 'POST', body: JSON.stringify(value) });

async function publicApi(route, options) {
  const value = options.body ? JSON.parse(options.body) : {};
  const store = JSON.parse(localStorage.getItem('reliefvue_public_demo') || '{"active":false,"activity":[],"notice":null}');
  if (route === 'status') {
    const balance = await connection.getBalance(new PublicKey(publicTreasury), 'confirmed');
    return {
      event: { id: 'bangkok-flood-demo', name: 'Bangkok flood response', area: 'Bangkok', active: store.active, amountSol: 0.01 },
      treasury: publicTreasury, balanceSol: balance / LAMPORTS_PER_SOL,
      demoDonor: '', demoDonorBalanceSol: 0, recipients: publicRecipients,
      claims: {}, activity: store.activity, notice: store.notice, aiAvailable: false,
      enforcement: 'This public demo previews claims; no live payout or duplicate-claim service',
    };
  }
  if (route === 'activate') {
    if (!/bangkok/i.test(value.notice || '')) throw new Error('The demo notice must name Bangkok.');
    store.active = true;
    store.notice = { approvedAt: new Date().toISOString(), area: 'Bangkok', source: 'Browser-only demo approval' };
    localStorage.setItem('reliefvue_public_demo', JSON.stringify(store));
    return { active: true };
  }
  if (route === 'donation') {
    const transaction = await connection.getParsedTransaction(value.signature, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 });
    const transfer = transaction?.transaction.message.instructions.find((item) => item.program === 'system' && item.parsed?.type === 'transfer' && item.parsed?.info?.destination === publicTreasury);
    if (!transaction || transaction.meta?.err || !transfer) throw new Error('Confirmed Devnet donation could not be verified.');
    if (!store.activity.some((item) => item.signature === value.signature)) {
      store.activity.unshift({ type: 'donation', signature: value.signature, amountSol: transfer.parsed.info.lamports / LAMPORTS_PER_SOL, at: new Date().toISOString(), explorer: explorer(value.signature) });
      localStorage.setItem('reliefvue_public_demo', JSON.stringify(store));
    }
    return { signature: value.signature, explorer: explorer(value.signature) };
  }
  if (route === 'claim') throw new Error('Live payout is unavailable in this public demo. Use the labeled recipient preview.');
  if (route === 'demo-fund') throw new Error('The shared demo donor is only available with the local demo service.');
  if (route === 'notice-review') throw new Error('Live AI is not configured in this public demo.');
  throw new Error('This action is unavailable in the public demo.');
}

async function refresh() {
  try { data = await api('status'); }
  catch (error) { feedback = { text: `Devnet status unavailable: ${error.message}`, tone: 'error' }; }
  render();
}
function setFeedback(text, tone = '') { feedback = { text, tone }; render(); }
function nav(target) {
  page = target;
  location.hash = target;
  feedback = { text: '', tone: '' };
  render();
  window.scrollTo(0, 0);
}
function walletProvider() { return window.phantom?.solana || window.solana || null; }
async function connectWallet() {
  const found = walletProvider();
  if (!found?.connect) return setFeedback('No Solana browser wallet found. Install or enable a compatible wallet, then switch it to Devnet. You can inspect the rest of the demo without a wallet.', 'error');
  try {
    const result = await found.connect();
    connectedAddress = (result.publicKey || found.publicKey).toBase58();
    provider = found;
    setFeedback(`Wallet connected: ${short(connectedAddress)}. Check that your wallet is using Devnet.`, 'success');
  } catch (error) { setFeedback(`Wallet connection was cancelled or failed: ${error.message}`, 'error'); }
}
function receipt(signature, label) {
  return `<div class="receipt"><div><span class="receipt-label">${label}</span><strong>${short(signature)}</strong></div><a href="${explorer(signature)}" target="_blank" rel="noopener noreferrer">View confirmed transaction ↗</a></div>`;
}
function statusBadge(active) { return `<span class="badge ${active ? 'active' : ''}">${active ? 'Area approved · demo' : 'Preparing response · demo'}</span>`; }
function banner() { return `<div class="demo-banner" role="region" aria-label="Demo status"><strong>${publicDemo ? 'PUBLIC PROTOTYPE' : 'DEMONSTRATION'} · SOLANA DEVNET</strong><span>Fictional disaster and synthetic households. ${publicDemo ? 'Recipient outcomes are previews; wallet donations require test SOL.' : 'Only transactions marked “confirmed” move test SOL.'}</span></div>`; }

function overview() {
  const active = data?.event.active;
  const claimCount = Object.values(data?.claims || {}).filter((claim) => claim.status === 'confirmed').length;
  const distributed = (data?.activity || []).filter((item) => item.type === 'payout').reduce((sum, item) => sum + item.amountSol, 0);
  return `<section class="page-intro home-intro"><p class="kicker">PREPARED RELIEF · DIRECT TO PEOPLE</p><h1>Help ready when a disaster begins.</h1><p>Bangkok flood response · ${active ? 'sample area approved' : 'preparing claims'}. Choose how you want to take part.</p></section>
    <section class="choice-grid" aria-label="Choose what you want to do"><article class="choice"><div class="choice-icon">↗</div><h2>I want to donate</h2><p>Add test SOL to the reserve and follow the confirmed transaction.</p><button class="button primary" data-nav="donate">Donate test SOL <span>→</span></button></article><article class="choice"><div class="choice-icon">⌂</div><h2>I need relief</h2><p>See whether a synthetic household’s verified home is in the affected area.</p><button class="button dark" data-nav="request">Request relief <span>→</span></button></article></section>
    <section class="event-panel" aria-labelledby="event-title"><div class="event-top"><div><p class="eyebrow">CURRENT DEMO EVENT</p><h2 id="event-title">Bangkok flood response</h2><p>Bangkok households can request help after a human approves the fictional notice. Chiang Mai remains outside this response area.</p></div>${statusBadge(active)}</div>
      <div class="stats"><div><span>Reserve on Devnet</span><strong>${data ? fmt(data.balanceSol) : '—'}</strong><small>test SOL · live account balance</small></div><div><span>Relief per household</span><strong>${data ? fmt(data.event.amountSol) : '—'}</strong><small>test SOL</small></div><div><span>Distributed</span><strong>${fmt(distributed)}</strong><small>test SOL · recorded confirmations</small></div><div><span>Households helped</span><strong>${claimCount}</strong><small>confirmed demo claims</small></div></div>
    </section>
    <div class="quiet-link"><button class="link-button" data-nav="activity">See the fund activity and Devnet receipts →</button></div>`;
}

function donate() {
  return `<section class="page-intro narrow"><p class="kicker">DONATE</p><h1>Fund the response reserve.</h1><p>A browser wallet can send test SOL directly to the ReliefVue Devnet treasury. The activity view shows confirmed transfers.</p></section>
  <div class="work-grid"><section class="work-card"><div class="step-head"><span>01</span><h2>Connect your wallet</h2></div><p>${connectedAddress ? `Connected as <code>${escape(connectedAddress)}</code>` : 'Your wallet signs the donation. ReliefVue never asks for a seed phrase.'}</p><button class="button secondary" id="connect-wallet">${connectedAddress ? 'Reconnect wallet' : 'Connect Solana wallet'}</button>
    <div class="step-head top-gap"><span>02</span><h2>Choose an amount</h2></div><form id="donate-form"><label for="donate-amount">Test SOL amount</label><input id="donate-amount" name="amount" type="number" min="0.001" max="0.1" step="0.001" value="0.020" required /><p class="field-note">Devnet only. Your wallet also needs a small amount for network fees.</p><button class="button primary full" type="submit" ${busy ? 'disabled' : ''}>${busy ? 'Waiting for confirmation…' : 'Send with my wallet →'}</button></form></section>
    <aside class="side-card"><p class="eyebrow">VERIFY THE DESTINATION</p><h3>ReliefVue demo treasury</h3><code class="address">${escape(data?.treasury || 'Loading…')}</code><p>Current confirmed balance</p><strong class="big-number">${data ? fmt(data.balanceSol) : '—'} <small>test SOL</small></strong><div class="divider"></div>${publicDemo ? '<p class="eyebrow">TEST WALLET REQUIRED</p><p>A Solana browser wallet with Devnet test SOL is needed to submit a donation. This public page has no hosted demo donor.</p>' : `<p class="eyebrow">NO WALLET INSTALLED?</p><p>The shared demo donor can make a real Devnet transfer if its test wallet is funded.</p><p class="field-note">Demo donor balance: ${data ? fmt(data.demoDonorBalanceSol) : '—'} test SOL</p><button class="button secondary full" id="demo-fund" ${busy || !data?.demoDonorBalanceSol ? 'disabled' : ''}>Use funded demo donor</button><p class="field-note">Demo donor address for a Devnet faucet: <code class="address">${escape(data?.demoDonor || '')}</code></p>`}</aside></div>`;
}

function eligibility() {
  const profile = profiles[householdId];
  const claim = data?.claims?.[`bangkok-flood-demo:${householdId}`];
  if (!data?.event.active) return { type: 'closed', title: 'Claims have not opened', explanation: 'An operator must review and approve the fictional Bangkok notice first.' };
  if (profile.home !== 'Bangkok') return { type: 'blocked', title: 'Outside the affected area', explanation: 'This household’s verified home is in Chiang Mai. The demo response covers Bangkok only.' };
  if (claim?.status === 'confirmed') return { type: 'blocked', title: 'Already received help', explanation: 'This household has already claimed once for this disaster. The demo service blocks a second payout.' };
  if (claim) return { type: 'review', title: 'Claim needs review', explanation: 'A previous payout is being processed or needs a manual check. Another transfer is blocked.' };
  if (data.balanceSol < data.event.amountSol) return { type: 'review', reason: 'unfunded', title: 'Area matches; reserve needs funding', explanation: 'The synthetic home is in Bangkok, but the Devnet treasury does not yet hold enough test SOL for a payout.' };
  return { type: 'eligible', title: 'Eligible for this demo response', explanation: 'The synthetic profile’s recorded home is in Bangkok and no prior claim is recorded for this event.' };
}
function request() {
  const result = eligibility();
  const canPreview = result.type === 'eligible' || result.reason === 'unfunded';
  const selected = profiles[householdId];
  return `<section class="page-intro narrow"><p class="kicker">REQUEST RELIEF</p><h1>Check your area. Then choose how to receive help.</h1><p>These are synthetic profiles for the prototype. A real service would verify identity and residence privately before approving a claim.</p></section>
  <div class="work-grid"><section class="work-card"><div class="step-head"><span>01</span><h2>Choose a sample profile</h2></div><label for="household">Synthetic household</label><select id="household">${Object.entries(profiles).map(([id, profile]) => `<option value="${id}" ${householdId === id ? 'selected' : ''}>${profile.label}</option>`).join('')}</select><div class="profile-line"><span>Recorded home</span><strong>${selected.home}</strong><small>${selected.note}</small></div>
  <div class="step-head top-gap"><span>02</span><h2>Check eligibility</h2></div><div class="eligibility ${result.type}" role="status"><strong>${result.title}</strong><p>${result.explanation}</p></div>
  <div class="step-head top-gap"><span>03</span><h2>Choose payout</h2></div><div class="payout-options"><label class="radio-card"><input type="radio" name="payout" value="wallet" ${payoutMethod === 'wallet' ? 'checked' : ''} /><span><strong>Crypto wallet</strong><small>0.010 test SOL on Devnet</small></span></label><label class="radio-card unavailable"><input type="radio" name="payout" value="baht" ${payoutMethod === 'baht' ? 'checked' : ''} /><span><strong>Thai baht</strong><small>Requires a licensed conversion and payment partner; unavailable in this demo</small></span></label></div>
  ${payoutMethod === 'wallet' ? `<label for="recipient-address">Assigned demo recipient wallet</label><input id="recipient-address" spellcheck="false" readonly value="${escape(data?.recipients?.[householdId] || '')}" /><p class="field-note">Each synthetic household has a fixed Devnet address so public demo visitors cannot redirect payouts.</p>` : `<div class="eligibility review"><strong>Baht payout is not connected</strong><p>The prototype cannot convert SOL or send money to a bank account.</p></div>`}
  <button class="button primary full top-gap" id="claim-button" ${publicDemo || result.type !== 'eligible' || payoutMethod !== 'wallet' || busy ? 'disabled' : ''}>${publicDemo ? 'Live payout unavailable in public preview' : busy ? 'Confirming on Devnet…' : 'Claim 0.010 test SOL →'}</button>
  <button class="link-button sample-link" id="sample-claim" ${!canPreview || payoutMethod !== 'wallet' ? 'disabled' : ''}>${sampleClaimStage === 0 ? 'Preview the recipient outcome' : 'Preview a repeat attempt'}</button>
  ${sampleClaimStage ? `<div class="eligibility ${sampleClaimStage === 2 ? 'blocked' : 'review'}"><strong>${sampleClaimStage === 2 ? 'Sample repeat claim rejected' : 'Sample relief outcome'}</strong><p>${sampleClaimStage === 2 ? 'This synthetic household already received a sample allocation in this preview. The actual demo server has not recorded a claim.' : 'In a funded run, this screen would show the confirmed payout and its real Explorer receipt. This preview moves no test SOL.'}</p><small>ILLUSTRATION ONLY · NO DEVNET TRANSACTION</small></div>` : ''}</section>
  <aside class="side-card"><p class="eyebrow">HOW THE DECISION WORKS</p><h3>Bangkok response only</h3><ol class="plain-list"><li>Human approves the fictional event notice.</li><li>Household home area matches the event area.</li><li>The household has no prior claim for this event.</li><li>The Devnet treasury has enough confirmed funds.</li></ol><div class="divider"></div><p>Current location is not used to exclude an evacuated household. Photos can support review, but cannot prove identity or residence by themselves.</p><p class="field-note">${publicDemo ? 'This public version previews claim outcomes in the browser. It has no live payout or duplicate-claim service.' : 'Duplicate protection is recorded in the demo service. There is no deployed claim smart contract.'}</p></aside></div>`;
}

function activity() {
  const entries = data?.activity || [];
  const donated = entries.filter((item) => item.type === 'donation').reduce((sum, item) => sum + item.amountSol, 0);
  const paid = entries.filter((item) => item.type === 'payout').reduce((sum, item) => sum + item.amountSol, 0);
  return `<section class="page-intro narrow"><p class="kicker">FUND ACTIVITY</p><h1>Follow the test funds.</h1><p>Every listed transfer has a Devnet signature. Household names and addresses stay out of this public activity list.</p></section>
  <div class="stats standalone"><div><span>Treasury now</span><strong>${data ? fmt(data.balanceSol) : '—'}</strong><small>test SOL · live balance</small></div><div><span>Recorded donations</span><strong>${fmt(donated)}</strong><small>test SOL · this demo</small></div><div><span>Recorded payouts</span><strong>${fmt(paid)}</strong><small>test SOL · this demo</small></div></div>
  <section class="activity-card"><div class="section-title"><div><p class="eyebrow">VERIFIED RECEIPTS</p><h2>Recent transfers</h2></div><button class="link-button" id="refresh-data">Refresh ↻</button></div>${entries.length ? entries.map((item) => `<div class="activity-row"><div><span class="activity-icon">${item.type === 'donation' ? '↘' : '↗'}</span><span><strong>${item.type === 'donation' ? 'Donation received' : 'Relief paid'}</strong><small>${new Date(item.at).toLocaleString()}</small></span></div><div><strong>${item.type === 'donation' ? '+' : '−'}${fmt(item.amountSol)} SOL</strong><a href="${item.explorer}" target="_blank" rel="noopener noreferrer">${short(item.signature)} ↗</a></div></div>`).join('') : `<div class="empty-state"><strong>No confirmed transfers recorded yet.</strong><p>Make a Devnet donation to start the public trail.</p><button class="button secondary" data-nav="donate">Go to Donate</button></div>`}</section><p class="small-disclosure">${publicDemo ? 'The account balance is read from Devnet. The receipt list only contains donations verified in this browser; it is not a complete public ledger.' : 'A Devnet account can receive external transfers that are not in this demo’s recorded activity. The live account balance is therefore shown separately from recorded donation and payout totals.'}</p>`;
}

function operator() {
  const active = data?.event.active;
  return `<section class="page-intro narrow"><p class="kicker">DEMO OPERATOR</p><h1>Review a notice before opening claims.</h1><p>A human must approve the affected area. This view uses supplied sample text and has no government connection or operator authentication.</p></section>
  <div class="work-grid"><section class="work-card"><label for="notice-text">Supplied notice text</label><textarea id="notice-text" rows="7">${escape(noticeText)}</textarea><div class="button-row"><button class="button secondary" id="review-notice" ${busy ? 'disabled' : ''}>${data?.aiAvailable ? 'Run AI notice review' : 'Run text scan'}</button><span class="field-note">${data?.aiAvailable ? 'AI suggestions require human approval.' : 'Live AI service unavailable; text scan only.'}</span></div>
  ${review ? `<div class="eligibility ${review.uncertain ? 'review' : 'eligible'}"><strong>${escape(review.title)}</strong><p>${escape(review.explanation)}</p><p><strong>Suggested area:</strong> ${escape(review.area)}</p><p><strong>Source:</strong> supplied notice text</p></div>` : ''}
  <button class="button primary full top-gap" id="activate-event" ${active || !review || review.area !== 'Bangkok' ? 'disabled' : ''}>${active ? 'Bangkok demo is open' : 'Human approves Bangkok demo →'}</button></section>
  <aside class="side-card"><p class="eyebrow">AI REVIEW EXAMPLE · ILLUSTRATIVE</p><h2>What the AI should flag</h2><p><strong>Area:</strong> Bangkok. <strong>Date:</strong> missing from the supplied text. <strong>Source:</strong> not authenticated. An operator would need to check the original notice and affected districts.</p><p class="field-note">This example was prepared in advance; it is not a live model response. Live AI is ${data?.aiAvailable ? 'configured for the Run AI notice review button' : 'not configured here'}.</p><div class="divider"></div><p>AI suggests areas and uncertainties. It cannot prove a declaration is genuine or decide household eligibility.</p>${data?.notice ? `<div class="approved-note"><strong>Human approved</strong><small>${new Date(data.notice.approvedAt).toLocaleString()} · Bangkok demo</small></div>` : ''}</aside></div>`;
}

function render() {
  const pages = { overview, donate, request, activity, operator };
  if (!pages[page]) page = 'overview';
  app.innerHTML = `${banner()}<header class="header"><div class="header-inner"><button class="wordmark" data-nav="overview" aria-label="ReliefVue home"><span class="mark">◈</span> relief<span>vue</span></button><nav aria-label="Main navigation"><button data-nav="overview" class="${page === 'overview' ? 'selected' : ''}">Overview</button><button data-nav="donate" class="${page === 'donate' ? 'selected' : ''}">Donate</button><button data-nav="request" class="${page === 'request' ? 'selected' : ''}">Request Relief</button><button data-nav="activity" class="${page === 'activity' ? 'selected' : ''}">Fund Activity</button></nav><button class="operator-link" data-nav="operator">Operator demo</button></div></header><main class="container">${feedback.text ? `<div class="message ${feedback.tone}" role="status">${escape(feedback.text)}</div>` : ''}${pages[page]()}</main><footer class="footer"><div class="container"><span>ReliefVue · working name · fictional disaster prototype</span><span>Devnet only · No real money or identity data</span></div></footer>`;
  app.querySelectorAll('[data-nav]').forEach((button) => button.addEventListener('click', () => nav(button.dataset.nav)));
  app.querySelector('#connect-wallet')?.addEventListener('click', connectWallet);
  app.querySelector('#donate-form')?.addEventListener('submit', donateWithWallet);
  app.querySelector('#demo-fund')?.addEventListener('click', demoFund);
  app.querySelector('#household')?.addEventListener('change', (event) => { householdId = event.target.value; sampleClaimStage = 0; render(); });
  app.querySelectorAll('input[name="payout"]').forEach((input) => input.addEventListener('change', () => { payoutMethod = input.value; render(); }));
  app.querySelector('#claim-button')?.addEventListener('click', claim);
  app.querySelector('#sample-claim')?.addEventListener('click', () => { sampleClaimStage = Math.min(2, sampleClaimStage + 1); render(); });
  app.querySelector('#refresh-data')?.addEventListener('click', refresh);
  app.querySelector('#notice-text')?.addEventListener('input', (event) => { noticeText = event.target.value; review = null; const activateButton = app.querySelector('#activate-event'); if (activateButton) activateButton.disabled = true; });
  app.querySelector('#review-notice')?.addEventListener('click', reviewNotice);
  app.querySelector('#activate-event')?.addEventListener('click', activate);
}

async function donateWithWallet(event) {
  event.preventDefault();
  if (!connectedAddress || !provider) return setFeedback('Connect a Solana browser wallet first.', 'error');
  const amount = Number(new FormData(event.currentTarget).get('amount'));
  if (!Number.isFinite(amount) || amount < 0.001 || amount > 0.1) return setFeedback('Choose 0.001 to 0.1 test SOL.', 'error');
  busy = true; setFeedback('Check the destination and approve the transaction in your wallet. Waiting for Devnet confirmation…');
  try {
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    const tx = new Transaction({ feePayer: new PublicKey(connectedAddress), recentBlockhash: blockhash }).add(SystemProgram.transfer({ fromPubkey: new PublicKey(connectedAddress), toPubkey: new PublicKey(data.treasury), lamports: Math.round(amount * LAMPORTS_PER_SOL) }));
    const sent = await provider.signAndSendTransaction(tx);
    const signature = typeof sent.signature === 'string' ? sent.signature : typeof sent === 'string' ? sent : null;
    if (!signature) throw new Error('Wallet did not return a transaction signature.');
    const confirmation = await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');
    if (confirmation.value.err) throw new Error('Devnet rejected the transfer.');
    await post('donation', { signature });
    await refresh();
    feedback = { text: `Donation confirmed on Devnet: ${signature}. Open Fund Activity for the receipt.`, tone: 'success' };
  } catch (error) { feedback = { text: `Donation was not confirmed: ${error.message}`, tone: 'error' }; }
  busy = false; render();
}
async function demoFund() {
  busy = true; setFeedback('Sending a real Devnet transfer from the funded demo donor…');
  try { const result = await post('demo-fund', { amountSol: 0.02 }); await refresh(); feedback = { text: `Demo donor transfer confirmed: ${result.signature}`, tone: 'success' }; }
  catch (error) { feedback = { text: error.message, tone: 'error' }; }
  busy = false; render();
}
async function claim() {
  const address = app.querySelector('#recipient-address')?.value?.trim();
  busy = true; setFeedback('Checking the claim and waiting for a confirmed Devnet payout…');
  try { const result = await post('claim', { householdId, recipientAddress: address }); await refresh(); feedback = { text: `Relief confirmed on Devnet: ${result.signature}. The household cannot claim this event again.`, tone: 'success' }; }
  catch (error) { feedback = { text: error.message, tone: 'error' }; }
  busy = false; render();
}
async function reviewNotice() {
  noticeText = app.querySelector('#notice-text').value;
  if (noticeText.trim().length < 25) return setFeedback('Enter at least 25 characters from the sample notice.', 'error');
  if (data?.aiAvailable) {
    busy = true; setFeedback('Reviewing the supplied notice…');
    try { review = await post('notice-review', { notice: noticeText }); feedback = { text: 'Review complete. A person must verify the original notice and approve activation.', tone: 'success' }; }
    catch (error) { feedback = { text: `AI review unavailable: ${error.message}`, tone: 'error' }; }
    busy = false; return render();
  }
  const namesBangkok = /bangkok/i.test(noticeText);
  const namesChiangMai = /chiang\s*mai/i.test(noticeText);
  review = { area: namesBangkok && !namesChiangMai ? 'Bangkok' : 'Unclear', uncertain: !namesBangkok || namesChiangMai, title: 'Text scan result (no AI)', explanation: namesBangkok && !namesChiangMai ? 'The supplied text names Bangkok. Check its real source and exact affected districts before approving.' : 'The supplied text is missing Bangkok or includes another area. Human review is required.' };
  setFeedback('Text scan complete. This is a keyword check, not AI or official-source verification.', 'success');
}
async function activate() {
  try { await post('activate', { notice: noticeText }); await refresh(); feedback = { text: 'The fictional Bangkok response is open after human approval in this demo.', tone: 'success' }; }
  catch (error) { feedback = { text: error.message, tone: 'error' }; }
  render();
}

window.addEventListener('hashchange', () => { page = location.hash.slice(1) || 'overview'; render(); });
render();
refresh();
