import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Check, HandCoins, Info, Landmark, ShieldCheck, Sparkles } from "lucide-react";
import type { DonationReceipt } from "../../shared/platform";
import { api, ApiError, type MetaResponse } from "../lib/api";
import { assetAmount, thb } from "../lib/format";
import { Badge, Button, Field, Input, Select, StatusBadge } from "../components/ui";
import { PublicShell } from "../components/PublicShell";

type Asset = "SOL" | "USDC" | "THB";

const DEFAULT_AMOUNT: Record<Asset, string> = { SOL: "0.25", USDC: "100", THB: "3000" };
const PRESETS: Record<Asset, number[]> = {
  SOL: [0.1, 0.25, 1, 5],
  USDC: [25, 100, 250, 1000],
  THB: [500, 1500, 3000, 10000],
};

export function GivePage() {
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [asset, setAsset] = useState<Asset>("SOL");
  const [amount, setAmount] = useState("0.25");
  const [convert, setConvert] = useState(true);
  const [province, setProvince] = useState("");
  const [donorName, setDonorName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<DonationReceipt | null>(null);

  useEffect(() => {
    api
      .meta()
      .then(setMeta)
      .catch(() => undefined);
  }, []);

  const rates = meta?.rates ?? { solThb: 5200, usdcThb: 36.5, note: "Indicative demonstration rates." };
  const numeric = Number(amount);
  const valid = Number.isFinite(numeric) && numeric > 0;
  const amountThb = !valid ? 0 : asset === "SOL" ? Math.round(numeric * rates.solThb) : asset === "USDC" ? Math.round(numeric * rates.usdcThb) : Math.round(numeric);
  const settled = useMemo(() => {
    if (asset === "SOL" && convert) {
      return { asset: "USDC" as Asset, amount: Math.round((amountThb / rates.usdcThb) * 1_000_000) / 1_000_000 };
    }
    return { asset, amount: numeric || 0 };
  }, [asset, convert, amountThb, numeric, rates.usdcThb]);

  const grants = amountThb / 3000;

  function chooseAsset(next: Asset) {
    setAsset(next);
    setAmount(DEFAULT_AMOUNT[next]);
    setError(null);
    if (next !== "SOL") setConvert(false);
    if (next === "SOL") setConvert(true);
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const result = await api.donate({
        asset,
        amount: numeric,
        channel: asset === "THB" ? "fiat" : "crypto",
        province: province || null,
        donorName: donorName || "Anonymous",
        convert: asset === "SOL" ? convert : false,
      });
      setReceipt(result.receipt);
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }));
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "The donation could not be recorded.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PublicShell>
      <div className="give-page">
        <header className="page-heading">
          <p className="eyebrow">Give to the reserve</p>
          <h1>Money ready before the next flood.</h1>
          <p>
            Your donation funds household grants in Thailand. Volatile crypto can settle to USDC; baht stays in baht.
            Nothing is paid out until a response is active and two executives sign.
          </p>
        </header>

        <div className="give-grid">
          <section className="give-card" aria-label="Donation form">
            {receipt ? (
              <div className="receipt">
                <div className="receipt-mark">
                  <Check size={26} aria-hidden="true" />
                </div>
                <p className="eyebrow">Donation recorded</p>
                <h2>{thb(receipt.amountThb)} toward the reserve.</h2>
                <p className="receipt-lede">
                  Reference <strong>{receipt.reference}</strong>. The reserve ledger updates immediately in this local
                  build.
                </p>
                <dl className="summary-list">
                  <div>
                    <dt>You gave</dt>
                    <dd>{assetAmount(receipt.amount, receipt.asset)}</dd>
                  </div>
                  <div>
                    <dt>Settled as</dt>
                    <dd>
                      {assetAmount(receipt.settledAmount, receipt.settledAsset)}{" "}
                      {receipt.converted ? <Badge tone="violet">auto-converted</Badge> : null}
                    </dd>
                  </div>
                  <div>
                    <dt>Value</dt>
                    <dd>{thb(receipt.amountThb)}</dd>
                  </div>
                  <div>
                    <dt>Transfer</dt>
                    <dd className="mono">{receipt.txRef}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>
                      <StatusBadge value="paid" label={receipt.simulated ? "Confirmed · simulated" : "Confirmed"} />
                    </dd>
                  </div>
                </dl>
                <div className="receipt-actions">
                  <a className="btn btn-primary" href="#/ledger">
                    See it in the ledger <ArrowRight size={16} />
                  </a>
                  <Button variant="ghost" onClick={() => setReceipt(null)}>
                    Give again
                  </Button>
                </div>
                <p className="fine-print">
                  This local prototype records simulated transfers. No real funds moved. Live crypto settlement requires a
                  licensed swap or custody partner.
                </p>
              </div>
            ) : (
              <>
                <div className="donation-head">
                  <div>
                    <h2>Choose how to give</h2>
                    <p>Every option appears in the same public ledger.</p>
                  </div>
                  <span className="secure-note">
                    <ShieldCheck size={15} /> No account needed
                  </span>
                </div>

                <div className="asset-tabs" role="tablist" aria-label="Donation asset">
                  {(["SOL", "USDC", "THB"] as Asset[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      role="tab"
                      aria-selected={asset === item}
                      className={`asset-tab ${asset === item ? "active" : ""}`}
                      onClick={() => chooseAsset(item)}
                    >
                      <span className={`asset-glyph asset-${item.toLowerCase()}`}>{item === "THB" ? "฿" : item.slice(0, 1)}</span>
                      <span>
                        <strong>{item === "THB" ? "Baht" : item}</strong>
                        <small>{item === "THB" ? "PromptPay · demo" : item === "SOL" ? "Solana" : "Stablecoin"}</small>
                      </span>
                    </button>
                  ))}
                </div>

                <Field
                  label={asset === "THB" ? "Amount in baht" : `Amount in ${asset}`}
                  hint={
                    valid ? (
                      <>
                        ≈ {thb(amountThb)} at the demo rate of{" "}
                        {asset === "SOL"
                          ? `฿${rates.solThb.toLocaleString("en-US")}/SOL`
                          : asset === "USDC"
                            ? `฿${rates.usdcThb}/USDC`
                            : "1:1"}
                      </>
                    ) : (
                      "Enter an amount greater than zero."
                    )
                  }
                >
                  {(id) => (
                    <div className="amount-wrap">
                      <span className="amount-prefix">{asset === "THB" ? "฿" : asset === "SOL" ? "◎" : "$"}</span>
                      <Input
                        id={id}
                        inputMode="decimal"
                        value={amount}
                        onChange={(event) => setAmount(event.target.value.replace(/[^0-9.]/g, ""))}
                        aria-label={`Donation amount in ${asset}`}
                      />
                      <span className="amount-suffix">{asset}</span>
                    </div>
                  )}
                </Field>

                <div className="preset-row" aria-label="Suggested amounts">
                  {PRESETS[asset].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`preset ${Number(amount) === value ? "active" : ""}`}
                      onClick={() => setAmount(String(value))}
                    >
                      {asset === "THB" ? thb(value) : `${value} ${asset}`}
                    </button>
                  ))}
                </div>

                {asset === "SOL" ? (
                  <label className="switch-row">
                    <span className="switch">
                      <input type="checkbox" checked={convert} onChange={(event) => setConvert(event.target.checked)} />
                      <span className="switch-track" aria-hidden="true" />
                    </span>
                    <span>
                      <strong>Settle as USDC</strong>
                      <small>Recommended. A baht-denominated grant should not sit in a volatile asset.</small>
                    </span>
                  </label>
                ) : null}

                <div className="form-grid">
                  <Field label="Direct to" hint="Leave blank for where the need is greatest." optional>
                    {(id) => (
                      <Select id={id} value={province} onChange={(event) => setProvince(event.target.value)}>
                        <option value="">Where needed most</option>
                        {meta?.provinces.map((item) => (
                          <option key={item.en} value={item.en}>
                            {item.en} · {item.th}
                          </option>
                        ))}
                      </Select>
                    )}
                  </Field>
                  <Field label="Name on the ledger" hint="Shown publicly. Leave blank to give anonymously." optional>
                    {(id) => (
                      <Input
                        id={id}
                        value={donorName}
                        onChange={(event) => setDonorName(event.target.value.slice(0, 60))}
                        placeholder="Anonymous"
                        autoComplete="name"
                      />
                    )}
                  </Field>
                </div>

                <dl className="summary-list summary-compact">
                  <div>
                    <dt>You give</dt>
                    <dd>{valid ? `${amount} ${asset}` : "—"}</dd>
                  </div>
                  <div>
                    <dt>Settles as</dt>
                    <dd>{valid ? assetAmount(settled.amount, settled.asset) : "—"}</dd>
                  </div>
                  <div>
                    <dt>Platform fee</dt>
                    <dd>{thb(0)}</dd>
                  </div>
                </dl>

                {error ? (
                  <div className="error-note" role="alert">
                    <AlertTriangle size={16} /> {error}
                  </div>
                ) : null}

                <Button size="lg" loading={submitting} disabled={!valid} onClick={submit} className="give-submit">
                  <HandCoins size={18} /> {asset === "THB" ? "Give with PromptPay (demo)" : `Give ${asset}`}
                </Button>
                <p className="fine-print">
                  {asset === "THB"
                    ? "PromptPay is simulated locally. Live baht payouts require a bank or licensed payment partner."
                    : "Crypto transfers are simulated in this build. Devnet mode is not yet enabled for donations."}
                </p>
              </>
            )}
          </section>

          <aside className="give-aside">
            <div className="impact-card">
              <p className="eyebrow">Your impact</p>
              <h2>{grants >= 1 ? `${grants.toFixed(grants >= 10 ? 0 : 1)} household grants` : `${Math.round(grants * 100)}% of one grant`}</h2>
              <p>One grant is a fixed ฿3,000 per verified household in an active response.</p>
              <div className="grant-visual">
                <span className="grant-person" aria-hidden="true" />
                <span className="grant-person" aria-hidden="true" />
                <span className="grant-person" aria-hidden="true" />
                <span className="grant-person muted" aria-hidden="true" />
              </div>
              <ul className="plain-list">
                <li>
                  <Check size={15} /> Same amount for every eligible household
                </li>
                <li>
                  <Check size={15} /> Paid only after two executive signatures
                </li>
                <li>
                  <Check size={15} /> No names or ID documents on the public ledger
                </li>
              </ul>
            </div>

            <div className="reserve-card">
              <div className="reserve-card-head">
                <Landmark size={18} />
                <h3>Where the reserve sits</h3>
              </div>
              <div className="reserve-row">
                <span>Stable reserve</span>
                <strong>USDC</strong>
              </div>
              <div className="reserve-row">
                <span>Baht donations</span>
                <strong>THB</strong>
              </div>
              <div className="reserve-row">
                <span>Operating support</span>
                <strong>Separate</strong>
              </div>
              <p>
                The reserve is not held in SOL by default. SOL is used for network fees, not as the store of value for a
                household grant.
              </p>
            </div>

            <div className="aside-note">
              <Sparkles size={16} />
              <p>
                <strong>Auto-convert is a policy, not a promise.</strong> Live conversion needs a licensed counterparty.
                This build labels every simulated transfer.
              </p>
            </div>

            <div className="aside-note aside-note-muted">
              <Info size={16} />
              <p>Rates are indicative demonstration values, not a market quote.</p>
            </div>
          </aside>
        </div>
      </div>
    </PublicShell>
  );
}
