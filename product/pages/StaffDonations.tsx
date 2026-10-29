import { useEffect, useMemo, useState } from "react";
import { Download, HandCoins, Search } from "lucide-react";
import type { Donation, LedgerSummary } from "../../shared/platform";
import { api, ApiError } from "../lib/api";
import { dateTime, thb } from "../lib/format";
import { StaffShell } from "../components/StaffShell";
import { Badge, Button, EmptyState, Input, Spinner, Stat, useToast } from "../components/ui";

const FILTERS = ["ALL", "SOL", "USDC", "THB"] as const;

export function StaffDonationsPage() {
  const toast = useToast();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [ledger, setLedger] = useState<LedgerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .donations()
      .then((result) => {
        setDonations(result.donations);
        setLedger(result.ledger);
      })
      .catch((cause: unknown) => toast.push(cause instanceof ApiError ? cause.message : "Could not load donations.", "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return donations.filter((donation) => {
      if (filter !== "ALL" && donation.asset !== filter) return false;
      if (!term) return true;
      return [donation.reference, donation.donorName, donation.province ?? ""].join(" ").toLowerCase().includes(term);
    });
  }, [donations, filter, search]);

  const crypto = donations.filter((donation) => donation.channel === "crypto");
  const fiat = donations.filter((donation) => donation.channel === "fiat");
  const converted = donations.filter((donation) => donation.converted);

  function exportCsv() {
    const header = ["reference", "donor", "asset", "amount", "thb", "channel", "province", "settled_asset", "settled_amount", "tx", "created_at"];
    const rows = filtered.map((donation) => [
      donation.reference,
      donation.donorName,
      donation.asset,
      donation.amount,
      donation.amountThb,
      donation.channel,
      donation.province ?? "",
      donation.settledAsset,
      donation.settledAmount,
      donation.txRef,
      donation.createdAt,
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reliefvue-donations.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <StaffShell title="Donations" description="What came in, how it settled and which response it funds.">
      {loading || !ledger ? (
        <Spinner label="Loading donations" />
      ) : (
        <div className="donations-page">
          <section className="kpi-row">
            <Stat label="Donated in total" value={thb(ledger.totals.donatedThb)} sub={`${donations.length} recorded donations`} tone="accent" />
            <Stat label="Crypto" value={thb(crypto.reduce((sum, donation) => sum + donation.amountThb, 0))} sub={`${crypto.length} donations`} />
            <Stat label="Baht / PromptPay" value={thb(fiat.reduce((sum, donation) => sum + donation.amountThb, 0))} sub={`${fiat.length} donations`} />
            <Stat label="Auto-converted" value={thb(converted.reduce((sum, donation) => sum + donation.amountThb, 0))} sub={`${converted.length} settled to USDC`} />
          </section>

          <section className="panel">
            <div className="applications-toolbar">
              <div className="status-tabs" role="tablist" aria-label="Filter donations by asset">
                {FILTERS.map((item) => (
                  <button key={item} type="button" role="tab" aria-selected={filter === item} className={`status-tab ${filter === item ? "active" : ""}`} onClick={() => setFilter(item)}>
                    {item === "ALL" ? "All assets" : item}
                    <span>{item === "ALL" ? donations.length : donations.filter((donation) => donation.asset === item).length}</span>
                  </button>
                ))}
              </div>
              <div className="table-tools">
                <label className="search-box">
                  <Search size={16} />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Donor, reference or province" aria-label="Search donations" />
                </label>
                <Button size="sm" variant="secondary" onClick={exportCsv}>
                  <Download size={14} /> Export CSV
                </Button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <EmptyState title="No donations match" icon={<HandCoins size={20} />}>
                Try another asset or clear the search.
              </EmptyState>
            ) : (
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Donor</th>
                      <th>Received</th>
                      <th>Value</th>
                      <th>Channel</th>
                      <th>Target</th>
                      <th>Settlement</th>
                      <th>When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((donation) => (
                      <tr key={donation.id}>
                        <td className="mono">{donation.reference}</td>
                        <td>{donation.donorName}</td>
                        <td>
                          <strong>
                            {donation.amount.toLocaleString("en-US", { maximumFractionDigits: 6 })} {donation.asset}
                          </strong>
                        </td>
                        <td>{thb(donation.amountThb)}</td>
                        <td>
                          <Badge tone={donation.channel === "fiat" ? "neutral" : "violet"}>{donation.channel === "fiat" ? "PromptPay" : "Crypto"}</Badge>
                        </td>
                        <td>{donation.province ?? <span className="muted-note">Where needed most</span>}</td>
                        <td>
                          {donation.converted ? (
                            <span className="settled">
                              <Badge tone="green">Auto-converted</Badge>
                              <small>
                                {donation.settledAmount.toLocaleString("en-US", { maximumFractionDigits: 4 })} {donation.settledAsset}
                              </small>
                            </span>
                          ) : (
                            <Badge tone="neutral">As received</Badge>
                          )}
                        </td>
                        <td>
                          <span className="stacked">
                            <strong>{dateTime(donation.createdAt)}</strong>
                            <small className="mono">{donation.txRef.slice(0, 16)}…</small>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="panel-footnote">
              Assets settle according to policy: SOL can convert to USDC, USDC stays USDC, baht stays baht. Rates are
              indicative demo values.
            </p>
          </section>
        </div>
      )}
    </StaffShell>
  );
}
