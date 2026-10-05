import "./technical.css";
import {siteHeader} from "./site-shell";
import {eventReviewPanel} from "./event-review";
import {localize,type Locale} from "./i18n";
let locale:Locale="en";
import type { PublicStatus } from "../shared/types";
import { api, getStatus, publicDemo, type Profile } from "./api";
import { availableWallets, connectWallet, donate } from "./wallet";
const root = document.querySelector<HTMLDivElement>("#app");
if (!root) throw new Error("Missing application root.");
const app = root;
let data: PublicStatus | undefined;
let profiles: Profile[] = [];
let selected = "unit-a";
let page = location.hash.split("/")[1] || "overview";
let busy = false;
let stale = true;
let feedback = "";
let walletAddress = "";
let pendingSignature =
  sessionStorage.getItem("reliefvue-pending-donation") || "";
let unknownSubmission =
  sessionStorage.getItem("reliefvue-unknown-donation") === "1";
let previewStage = 0;
const esc = (v: unknown) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const fmt = (v: number | null | undefined) => (v == null ? "—" : v.toFixed(3));
const disabled = () => busy || stale || !data || Boolean(data.rpcError);
const off = () => (disabled() ? "disabled" : "");
const sampleChoices = [
  ["unit-a", "Eligible unit A"],
  ["duplicate-a", "Duplicate applicant for unit A"],
  ["room-b", "Separate household in unit B"],
  ["outside-area", "Outside the affected area"],
  ["pending-room", "Waiting for human review"],
];
function intro(k: string, h: string, p: string) {
  return `<section class="page-intro narrow"><p class="kicker">${k}</p><h1>${h}</h1><p>${p}</p></section>`;
}
function stats() {
  return `<div class="stats"><div><span>Reserve on Devnet</span><strong>${fmt(data?.balanceSol)}</strong><small>test SOL · live balance</small></div><div><span>Fixed household grant</span><strong>${fmt(data?.event.amountSol)}</strong><small>test SOL · no baht equivalence</small></div><div><span>Event budget</span><strong>${fmt(data?.event.budgetSol)}</strong><small>${fmt(data?.event.reviewHoldSol)} held for review</small></div><div><span>Paid</span><strong>${fmt(data?.event.paidSol)}</strong><small>confirmed local event payouts</small></div></div>`;
}
function overview() {
  return `${intro("RELIEFVUE · DEVNET WORKSPACE", "Explore the technology behind relief.", "Optional test tools for donations, event approvals and receipts. This workspace uses a separate technical fixture; it does not move the guided demo’s fictional funds.")}<details class="technical-explanation"><summary>How this relates to the guided demo</summary><p>The guided experience explains ReliefVue with fictional Chiang Mai amounts. These tools use a separate Devnet test fixture and real test-network balances where available. They share the same interface and review sequence; approvals and balances are not copied between the two.</p><p>No real-money relief reserve or production payout service is connected.</p></details><section class="choice-grid"><article class="choice"><div class="choice-icon">↗</div><h2>Test a donation</h2><p>Fund the reserve with test SOL and follow a confirmed receipt.</p><button class="button primary" data-nav="donate">Donate test SOL →</button></article><article class="choice"><div class="choice-icon">⌂</div><h2>Explore a household test</h2><p>Explore a fixed grant for a synthetic household in the affected area.</p><button class="button dark" data-nav="request">Request relief →</button></article></section><section class="event-panel"><div class="event-top"><div><p class="eyebrow">CURRENT DEMO EVENT</p><h2>${esc(data?.event.name || "Fictional Khlong Sai flood")}</h2><p>Forecasts stay in Watching. Observed home inundation, evacuation, or blocked essential access may advance to review.</p></div><span class="badge ${data?.event.active ? "active" : ""}">${esc(data?.event.status || "Loading")}</span></div>${stats()}</section>`;
}
function donation() {
  const wallets=availableWallets();
  return `${intro("DONATE", "Fund the response reserve.", "Wallet Standard signs a Devnet transfer. ReliefVue never requests a seed phrase.")}<div class="work-grid"><section class="work-card"><h2>Connect a Devnet wallet</h2><label for="wallet">Installed compatible wallet</label><select id="wallet">${wallets.length?wallets
    .map((w) => `<option>${esc(w.name)}</option>`)
    .join(
      "",
    ):'<option value="">No compatible wallet detected</option>'}</select><button id="connect" class="button secondary top-gap" ${busy||!wallets.length ? "disabled" : ""}>Connect wallet</button><p class="field-note">${esc(walletAddress || "Enable a Wallet Standard wallet with Devnet support, then refresh.")}</p><form id="donate-form"><label for="amount">Amount in test SOL</label><input id="amount" name="amount" type="number" min="0.001" max="0.1" step="0.001" value="0.01" required><button class="button primary full top-gap" ${off() || (!walletAddress || pendingSignature || unknownSubmission ? "disabled" : "")}>Sign donation →</button></form>${!publicDemo ? `<button id="demo-fund" class="button secondary full top-gap" ${off()}>Demo donor sends 0.02 test SOL</button>` : ""}${unknownSubmission ? `<div class="eligibility review"><strong>Wallet submission outcome unknown</strong><p>Check the wallet transaction history before attempting another donation. Signing may have broadcast a transfer even when the wallet returned an error. Keep this session open for investigation.</p></div>` : ""}${pendingSignature ? `<div class="eligibility review"><strong>Submitted · confirmation pending</strong><code>${esc(pendingSignature)}</code><p>A signature alone is not a confirmed receipt. Retry verification without sending again.</p><button id="verify" class="button secondary" ${busy ? "disabled" : ""}>Verify existing signature</button></div>` : ""}</section><aside class="side-card"><p class="eyebrow">DEVNET TREASURY</p><code class="address">${esc(data?.treasury || "Loading")}</code><p>Test SOL only. Donations are recorded after chain verification.</p></aside></div>`;
}
function request() {
  const profile = profiles.find((p) => p.id === selected);
  return `${intro("REQUEST RELIEF", "A fixed grant for one household.", "Synthetic profiles demonstrate separate rented rooms, duplicate applications, and pending human review.")}<div class="work-grid"><section class="work-card"><label for="household">${publicDemo ? "Illustrative scenario" : "Synthetic household"}</label><select id="household">${(publicDemo ? sampleChoices : profiles.map((p) => [p.id, p.label])).map(([id, label]) => `<option value="${esc(id)}" ${id === selected ? "selected" : ""}>${esc(label)}</option>`).join("")}</select>${profile ? `<div class="profile-line"><strong>${esc(profile.label)}</strong><span>${esc(profile.reviewStatus)}</span><small>${esc(profile.home)} · synthetic local record</small></div><p>Assigned demo destination <code>${esc(profile.recipientAddress)}</code></p>` : ""}${!publicDemo && data?.claims[selected] ? `<div class="eligibility review"><strong>Claim: ${esc(data.claims[selected]?.status)}</strong>${data.claims[selected]?.signature ? `<code>${esc(data.claims[selected]?.signature)}</code><p>Only confirmed activity is a payment receipt. Submitted claims must not be sent again.</p>` : ""}</div>` : ""}<p>Event status: <strong>${esc(data?.event.status || "Loading")}</strong>. Approval alone does not establish household eligibility.</p>${publicDemo ? `<button id="preview" class="button primary full" ${off()}>Explore illustrative outcome</button>${previewStage ? `<div class="eligibility review"><strong>Illustrative only · no transfer</strong><p>${selected === "duplicate-a" ? "Same household: an illustrative second claim is blocked." : selected === "outside-area" ? "Outside the fictional response area." : selected === "pending-room" ? "Wait for a human to resolve the household review." : data?.event.active ? "An eligible separate household could receive one fixed grant, subject to budget and verification." : "Claims wait until both event roles authorize the response."}</p><small>BROWSER PREVIEW · NO CHAIN RECEIPT</small></div>` : ""}` : `<button id="claim" class="button primary full" ${off() || (!data?.event.active || !profile || Boolean(data?.claims[selected]) ? "disabled" : "")}>Submit local demo claim</button><p class="field-note">Server enforces household matching and caps. This is a server transfer demo; the reserve program is not deployed.</p>${profile?.reviewStatus === "pending" ? `<button id="review-claim" class="button secondary" ${off()}>Simulated staff resolves pending household</button>` : ""}`}<div class="divider"></div><p>Recoverable custodial wallets and Thai baht conversion are future investigations. They are unavailable here.</p></section><aside class="side-card"><h2>Review protects households</h2><p>One event grant per verified household. Names, wallet accounts, or a shared building address do not prove uniqueness. Separate rented units may qualify separately.</p><p>Pending cases use the approved review allocation only after human verification.</p></aside></div>`;
}
function activity() {
  return `${intro("FUND ACTIVITY", "Receipts you can inspect.", publicDemo ? "Confirmed donations saved in this browser only. This is not a global ledger; recipient outcomes are illustrative." : "Confirmed Devnet transfers. Public receipts omit private household records.")}<section class="activity-card"><div class="section-title"><h2>Confirmed transfers</h2><button class="button secondary" id="refresh" ${busy ? "disabled" : ""}>Refresh</button></div>${data?.activity.length ? data.activity.map((a) => `<div class="activity-row"><div><span class="activity-icon">${a.type === "donation" ? "↗" : "⌂"}</span><strong>${esc(a.type)}</strong></div><div><strong>${fmt(a.amountSol)} test SOL</strong><small>${esc(new Date(a.at).toLocaleString())}</small><a href="https://explorer.solana.com/tx/${encodeURIComponent(a.signature)}?cluster=devnet" target="_blank" rel="noopener noreferrer">Confirmed transaction ↗</a></div></div>`).join("") : '<div class="empty-state">No confirmed receipts recorded.</div>'}</section>`;
}
function operator() {
 const blocked=busy?"An action is processing. Please wait.":stale||!data?"Refresh the connection before continuing.":data.rpcError?"Devnet balance unavailable. Refresh before authorizing a funded test response.":undefined;
 return `${intro("DEVNET · SIMULATED REVIEW", "Review before authorizing.", "The same evidence-to-approval sequence as the guided app, using separate test data. No live AI or production staff authentication is connected.")}${eventReviewPanel({status:data?.event.status||'prepared',recommended:!!data?.event.approvals.reviewer,approver:data?.event.approvals.approver||null,area:data?.event.area||'Fictional technical test area',technical:true,locked:!!data&&Object.keys(data.claims).length>0,blocked})}<section class="work-card technical-terms"><h2>Technical test terms</h2><p>The amounts below belong to the Devnet fixture. They are not the homepage’s 0.8 SOL household example.</p>${stats()}<p>Review hold is part of the event budget. Local server rules are not a deployed reserve contract.</p></section>`;
}
async function refresh() {
  stale = true;
  render();
  try {
    data = await getStatus();
    if (!publicDemo) {
      profiles = (await api<{ profiles: Profile[] }>("profiles")).profiles;
      if (!profiles.some((p) => p.id === selected))
        selected = profiles[0]?.id || "";
    }
    stale = false;
    if (data.rpcError)
      feedback = `Devnet balance unavailable: ${data.rpcError}. Monetary actions are disabled.`;
  } catch (e) {
    feedback = errorText(e);
  }
  render();
}
function errorText(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}
async function run(action: () => Promise<void>) {
  busy = true;
  feedback = "Working…";
  render();
  try {
    await action();
    await refresh();
  } catch (e) {
    feedback = errorText(e);
  } finally {
    busy = false;
    render();
  }
}
function render() {
  const pages: Record<string, () => string> = {
    overview,
    donate: donation,
    request,
    activity,
    operator,
  };
  if (!pages[page]) page = "overview";
  app.innerHTML = `<div class="technical-app"><div class="demo-banner"><strong>TECHNICAL DEMO · SOLANA DEVNET</strong><span>Test SOL only · separate from the guided walkthrough</span><a href="#home">Return to ReliefVue</a></div>${siteHeader(locale)}<main id="main" class="container" aria-busy="${busy}"><div class="technical-context"><span>${publicDemo?'PUBLIC DEVNET PREVIEW':'LOCAL SERVER WORKSPACE'}</span><a href="#about">What works today ↗</a></div><nav class="technical-tabs" aria-label="Devnet tools">${[['overview','Overview'],['donate','Test donation'],['request','Household test'],['activity','Confirmed receipts'],['operator','Evidence review']].map(([id,label])=>`<button type="button" data-nav="${id}" ${page===id?'aria-current="page"':''}>${label}</button>`).join('')}</nav><div role="status" aria-live="polite">${feedback?`<div class="message">${esc(feedback)}</div>`:''}${stale?'<p class="field-note">Status unavailable or refreshing. Transaction actions wait for a valid connection.</p>':''}</div>${stale||data?.rpcError?`<button type="button" class="button secondary" id="retry-status" ${busy?'disabled':''}>Retry connection</button>`:''}${pages[page]!()}</main><footer class="footer"><div class="container technical-footer"><div><h2>Prepared relief.<br>Accountable fund movements.</h2><p>Technical proof uses test SOL. Community reports, household verification and production reserve governance remain separate responsibilities.</p></div><a class="button secondary" href="#home">Return to the guided experience →</a></div></footer></div>`;
  localize(app,locale);
  app.querySelectorAll<HTMLButtonElement>('[data-action^="lang-"]').forEach(b=>b.onclick=()=>{locale=b.dataset.action==='lang-th'?'th':'en';render();});
  app.querySelector('#retry-status')?.addEventListener('click',()=>void refresh());
  app.querySelectorAll<HTMLButtonElement>("[data-nav]").forEach(
    (b) =>
      (b.onclick = () => {
        location.hash = "technical/"+b.dataset.nav!;
        page = b.dataset.nav!;
        render();
      }),
  );
  app
    .querySelector<HTMLSelectElement>("#household")
    ?.addEventListener("change", (e) => {
      selected = (e.currentTarget as HTMLSelectElement).value;
      previewStage = 0;
      render();
    });
  app.querySelector("#preview")?.addEventListener("click", () => {
    previewStage++;
    render();
  });
  app
    .querySelector("#refresh")
    ?.addEventListener("click", () => void refresh());
  app.querySelector("#connect")?.addEventListener("click", () => {
    const walletName =
      app.querySelector<HTMLSelectElement>("#wallet")?.value || "";
    void run(async () => {
      walletAddress = await connectWallet(walletName);
      feedback = `Wallet connected: ${walletAddress}`;
    });
  });
  app.querySelector("#donate-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const amount = Number(new FormData(form).get("amount"));
    void run(async () => {
      if (stale || data?.rpcError || pendingSignature || unknownSubmission)
        throw new Error(
          "Refresh status or verify the pending signature before donating.",
        );
      if (!data) throw new Error("Status unavailable.");
      pendingSignature = await donate(data.treasury, amount, () => {
        unknownSubmission = true;
        sessionStorage.setItem("reliefvue-unknown-donation", "1");
      });
      sessionStorage.setItem("reliefvue-pending-donation", pendingSignature);
      unknownSubmission = false;
      sessionStorage.removeItem("reliefvue-unknown-donation");
      feedback = "Submitted signature received; checking confirmation…";
      render();
      await api("donation", { signature: pendingSignature });
      pendingSignature = "";
      sessionStorage.removeItem("reliefvue-pending-donation");
      feedback = "Donation confirmed on Devnet. See Fund Activity.";
    });
  });
  app.querySelector("#verify")?.addEventListener(
    "click",
    () =>
      void run(async () => {
        await api("donation", { signature: pendingSignature });
        pendingSignature = "";
        sessionStorage.removeItem("reliefvue-pending-donation");
        feedback = "Donation confirmed on Devnet.";
      }),
  );
  app.querySelector("#demo-fund")?.addEventListener(
    "click",
    () =>
      void run(async () => {
        await api("demo-fund", { amountSol: 0.02 });
        feedback = "Demo donor request completed. See confirmed activity.";
      }),
  );
  app.querySelector("#claim")?.addEventListener(
    "click",
    () =>
      void run(async () => {
        const result = await api<{ signature?: string; status?: string }>(
          "claim",
          { profileId: selected },
        );
        feedback = result.signature
          ? `Claim response: ${result.status || "submitted"} · ${result.signature}. Check confirmed activity for a receipt.`
          : "Claim request recorded; check its status.";
      }),
  );
  app.querySelector("#review-claim")?.addEventListener(
    "click",
    () =>
      void run(async () => {
        await api("review-claim", { profileId: selected, approved: true });
        feedback = "Simulated household review recorded.";
      }),
  );
  app.querySelectorAll<HTMLButtonElement>(".event-review [data-action]").forEach(
    (b) =>
      (b.onclick = () =>
        void run(async () => {
          await api("event", { action: b.dataset.action });
          feedback = "Simulated event action recorded.";
        })),
  );
}
window.addEventListener("hashchange", () => {
  if(!location.hash.startsWith("#technical")){location.reload();return;}
  page = location.hash.split("/")[1] || "overview";
  render();
});
render();
void refresh();
