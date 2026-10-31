import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, CircleAlert, Coins, MapPin, Users } from "lucide-react";
import type { LedgerSummary } from "../../shared/platform";
import { api } from "../lib/api";
import { ago, assetAmount, pct, thb } from "../lib/format";
import { Badge, EmptyState, Progress, Spinner, Stat, StatusBadge } from "../components/ui";
import { PublicShell } from "../components/PublicShell";

export function LedgerPage() {
  const [ledger, setLedger] = useState<LedgerSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .ledger()
      .then(setLedger)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load the ledger."));
  }, []);

  return (
    <PublicShell>
      <div className="ledger-page">
        <header className="page-heading ledger-heading">
          <div>
            <p className="eyebrow">Public fund record</p>
            <h1>Every baht in, every grant out.</h1>
            <p>
              Totals and district reach are public. Household names, identity documents and addresses never are. This
              local build uses fictional data and simulated transfers.
            </p>
          </div>
          <div className="ledger-heading-side">
            <Badge tone="violet">Demo ledger</Badge>
            <span className="live-updated">
              <span className="live-dot" aria-hidden="true" /> Updated from the local API
            </span>
          </div>
        </header>

        {error ? <div className="error-note">{error}</div> : null}

        {!ledger ? (
          <Spinner label="Loading ledger" />
        ) : (
          <>
            <section className="ledger-stats" aria-label="Ledger totals">
              <Stat label="Donated in total" value={thb(ledger.totals.donatedThb)} sub={`${ledger.totals.donors} public donor names`} />
              <Stat label="Paid to households" value={thb(ledger.totals.paidThb)} sub={`${ledger.totals.householdsPaid} households across all responses`} />
              <Stat label="Reserve available" value={thb(ledger.totals.reserveThb)} sub={`${thb(ledger.totals.awaitingThb)} awaiting signatures`} tone="accent" />
              <Stat label="Active responses" value={ledger.totals.activeActivations} sub={`${ledger.coverage.length} districts listed`} />
            </section>

            <div className="ledger-grid">
              <div className="ledger-col">
                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <p className="eyebrow">Allocation</p>
                      <h2>Where the money went</h2>
                    </div>
                    <span className="panel-note">Grant value vs. donations, by province</span>
                  </div>
                  <div className="province-table" role="table" aria-label="Donations and grants by province">
                    <div className="province-row province-head" role="row">
                      <span role="columnheader">Province</span>
                      <span role="columnheader">Donated</span>
                      <span role="columnheader">Paid out</span>
                      <span role="columnheader">Households</span>
                      <span role="columnheader">Balance</span>
                    </div>
                    {ledger.byProvince.map((row) => {
                      const balance = row.donatedThb - row.paidThb;
                      return (
                        <div className="province-row" role="row" key={row.province}>
                          <span role="cell" className="province-name">
                            <MapPin size={14} aria-hidden="true" /> {row.province}
                          </span>
                          <span role="cell">{thb(row.donatedThb)}</span>
                          <span role="cell">{thb(row.paidThb)}</span>
                          <span role="cell">{row.householdsPaid}</span>
                          <span role="cell" className={balance < 0 ? "negative" : ""}>
                            {thb(balance)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="panel-footnote">
                    “Where needed most” is undesignated money available for any active response. A negative balance would
                    mean grants were paid from the shared reserve.
                  </p>
                </section>

                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <p className="eyebrow">Activity</p>
                      <h2>Recent movements</h2>
                    </div>
                    <span className="panel-note">Newest first · simulated references</span>
                  </div>
                  <ul className="activity-feed">
                    {ledger.recent.map((row) => (
                      <li key={`${row.kind}-${row.id}`}>
                        <span className={`activity-icon ${row.kind === "donation" ? "in" : "out"}`} aria-hidden="true">
                          {row.kind === "donation" ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        </span>
                        <span className="activity-main">
                          <strong>{row.label}</strong>
                          <small>
                            {row.reference} · {ago(row.at)}
                          </small>
                        </span>
                        <span className="activity-amount">
                          <strong>{assetAmount(row.amount, row.asset)}</strong>
                          <small>{thb(row.amountThb)}</small>
                        </span>
                        <span className={`activity-kind ${row.kind}`}>{row.kind === "donation" ? "In" : "Out"}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <aside className="ledger-col ledger-side">
                <section className="panel coverage-panel">
                  <div className="panel-head">
                    <div>
                      <p className="eyebrow">Reach</p>
                      <h2>District coverage</h2>
                    </div>
                  </div>
                  {ledger.coverage.length === 0 ? (
                    <EmptyState title="No active response">The coverage board appears when a response is active.</EmptyState>
                  ) : (
                    <div className="coverage-list">
                      {ledger.coverage.map((row) => (
                        <div className={`coverage-item ${row.unreached ? "unreached" : ""}`} key={`${row.activationId}-${row.district}`}>
                          <div className="coverage-item-head">
                            <strong>{row.district}</strong>
                            {row.unreached ? <Badge tone="coral">No payout yet</Badge> : <Badge tone="green">{row.paid} paid</Badge>}
                          </div>
                          <Progress value={row.paid} max={Math.max(row.applications, 1)} label={`${row.district} coverage`} />
                          <span className="coverage-meta">
                            {row.applications} request{row.applications === 1 ? "" : "s"} · {row.approved} approved · {row.paid} paid
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="panel-footnote">
                    A district with requests but no payout is the fairness case this system is built to surface.
                  </p>
                </section>

                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <p className="eyebrow">Holdings</p>
                      <h2>Reserve composition</h2>
                    </div>
                  </div>
                  <ul className="asset-list">
                    {ledger.assets.map((row) => (
                      <li key={row.asset}>
                        <span className="asset-badge">{row.asset.slice(0, 1)}</span>
                        <span>
                          <strong>{row.asset}</strong>
                          <small>{assetAmount(row.amount, row.asset)}</small>
                        </span>
                        <span>{thb(row.amountThb)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="rate-note">
                    <Coins size={15} />
                    <span>
                      Demo rate: ฿{ledger.demoRates.solThb.toLocaleString("en-US")}/SOL · ฿{ledger.demoRates.usdcThb}/USDC
                    </span>
                  </div>
                </section>

                <section className="panel ledger-explainer">
                  <CircleAlert size={18} />
                  <h3>What this page cannot tell you</h3>
                  <p>
                    A payment is not proof that a flood happened or that a claim was true. Human review, residence
                    evidence and duplicate checks remain necessary. The ledger shows money movement, not entitlement.
                  </p>
                  <div className="explainer-tags">
                    <span>No names</span>
                    <span>No ID documents</span>
                    <span>No addresses</span>
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <p className="eyebrow">Guardrails</p>
                      <h2>Who moves the reserve</h2>
                    </div>
                  </div>
                  <ul className="guardrail-list">
                    <li>
                      <Users size={16} />
                      <span>Reviewer approves the household; two executives sign the payout.</span>
                    </li>
                    <li>
                      <StatusBadge value="verified" label="One grant per household" />
                      <span>Duplicate identity and wallet checks run before approval.</span>
                    </li>
                    <li>
                      <CircleAlert size={16} />
                      <span>Operating support is tracked separately from the relief reserve.</span>
                    </li>
                  </ul>
                </section>
              </aside>
            </div>
          </>
        )}
      </div>
    </PublicShell>
  );
}
