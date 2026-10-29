import { useCallback, useEffect, useState } from "react";
import { CircleAlert, Clock3, Landmark, LockKeyhole, ShieldCheck, Signature, Wallet } from "lucide-react";
import type { Donation, LedgerSummary, Payout } from "../../shared/platform";
import { api, ApiError } from "../lib/api";
import { dateTime, shortWallet, thb } from "../lib/format";
import { useSession } from "../lib/session";
import { StaffShell } from "../components/StaffShell";
import {
  Badge,
  Button,
  EmptyState,
  SectionHeader,
  Spinner,
  Stat,
  StatusBadge,
  useToast,
} from "../components/ui";
import { SignatureDots } from "./StaffOverview";

export function StaffTreasuryPage() {
  const { user } = useSession();
  const toast = useToast();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [ledger, setLedger] = useState<LedgerSummary | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [payoutResult, donationResult] = await Promise.all([api.payouts(), api.donations()]);
      setPayouts(payoutResult.payouts);
      setLedger(donationResult.ledger);
      setDonations(donationResult.donations);
    } catch (cause) {
      toast.push(cause instanceof ApiError ? cause.message : "Could not load treasury.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function sign(payout: Payout) {
    setBusy(payout.id);
    try {
      const result = await api.signPayout(payout.id);
      toast.push(
        result.payout.status === "sent"
          ? `${payout.reference} reached ${result.payout.requiredSignatures} signatures and was sent.`
          : `Signature recorded for ${payout.reference}.`,
        "success",
      );
      await load();
    } catch (cause) {
      toast.push(cause instanceof ApiError ? cause.message : "Could not sign the payout.", "error");
    } finally {
      setBusy(null);
    }
  }

  const awaiting = payouts.filter((payout) => payout.status === "awaiting_approvals");
  const sent = payouts.filter((payout) => payout.status === "sent");
  const canSign = user?.role === "approver" || user?.role === "admin";
  const available = ledger ? ledger.totals.reserveThb - ledger.totals.awaitingThb : 0;

  return (
    <StaffShell
      title="Treasury"
      description="One reserve, two signatures, a separate record for every payout."
      counts={{ payouts: awaiting.length }}
    >
      {loading || !ledger ? (
        <Spinner label="Loading treasury" />
      ) : (
        <div className="treasury-page">
          <section className="kpi-row" aria-label="Treasury figures">
            <Stat label="Available reserve" value={thb(available)} sub="Donated minus paid minus held" tone="accent" />
            <Stat label="Held for signatures" value={thb(ledger.totals.awaitingThb)} sub={`${awaiting.length} payout${awaiting.length === 1 ? "" : "s"} in the queue`} />
            <Stat label="Paid to households" value={thb(ledger.totals.paidThb)} sub={`${ledger.totals.householdsPaid} households`} />
            <Stat label="Signature threshold" value={`${payouts[0]?.requiredSignatures ?? 2}-of-3`} sub="Distinct staff accounts required" />
          </section>

          <div className="treasury-grid">
            <section className="panel treasury-main">
              <SectionHeader
                eyebrow="Approval queue"
                title="Payouts waiting on executives"
                description="Approving the household does not move money. Two different approvers must sign each payout."
              />
              {awaiting.length === 0 ? (
                <EmptyState title="No payout is waiting" icon={<Signature size={20} />}>
                  Approved applications appear here for signing.
                </EmptyState>
              ) : (
                <div className="payout-queue">
                  {awaiting.map((payout) => (
                    <article className="payout-card" key={payout.id}>
                      <div className="payout-card-head">
                        <div className="payout-person">
                          <span className="mini-avatar">{payout.applicantName.slice(0, 1)}</span>
                          <div>
                            <strong>{payout.applicantName}</strong>
                            <small>
                              {payout.district} · {payout.reference}
                            </small>
                          </div>
                        </div>
                        <div className="payout-amount-block">
                          <strong>{thb(payout.amountThb)}</strong>
                          <small>{payout.asset === "THB" ? "PromptPay" : `${payout.amountAsset.toFixed(2)} ${payout.asset}`}</small>
                        </div>
                      </div>
                      <div className="payout-card-body">
                        <div className="payout-rail">
                          <span className="rail-icon">{payout.asset === "THB" ? <Landmark size={15} /> : <Wallet size={15} />}</span>
                          <span>
                            <strong>{payout.asset === "THB" ? "PromptPay transfer" : "USDC wallet transfer"}</strong>
                            <small className="mono">{payout.asset === "THB" ? payout.destination : shortWallet(payout.destination)}</small>
                          </span>
                        </div>
                        <div className="payout-signatures">
                          <span className="signature-label">Signatures</span>
                          <SignatureDots payout={payout} />
                          <div className="signer-names">
                            {payout.signatures.map((signature) => (
                              <span key={signature.userId}>
                                <ShieldCheck size={12} /> {signature.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="payout-card-foot">
                        {canSign ? (
                          <Button size="sm" loading={busy === payout.id} onClick={() => void sign(payout)}>
                            <Signature size={14} /> Add my signature
                          </Button>
                        ) : (
                          <span className="muted-note">Waiting for an executive approver.</span>
                        )}
                        <span className="payout-created">
                          <Clock3 size={13} /> queued {dateTime(payout.createdAt)}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <aside className="treasury-side">
              <section className="panel">
                <SectionHeader eyebrow="Holdings" title="What backs the reserve" />
                <ul className="holding-list">
                  {ledger.assets.map((asset) => (
                    <li key={asset.asset}>
                      <span className="asset-badge">{asset.asset.slice(0, 1)}</span>
                      <span>
                        <strong>{asset.asset}</strong>
                        <small>{asset.amount.toLocaleString("en-US", { maximumFractionDigits: 4 })}</small>
                      </span>
                      <span>{thb(asset.amountThb)}</span>
                    </li>
                  ))}
                </ul>
                <div className="holding-note">
                  <LockKeyhole size={15} />
                  <span>
                    Net of sent payouts, including {thb(ledger.totals.awaitingThb)} held for signatures. USDC and THB are the
                    reserve; SOL is not the store of value.
                  </span>
                </div>
              </section>

              <section className="panel">
                <SectionHeader eyebrow="Controls" title="Release rules" />
                <ul className="rule-list">
                  <li>
                    <span className="rule-num">01</span>
                    <span>
                      <strong>Reviewer approves the household</strong>
                      <small>A payout is created with no transaction yet.</small>
                    </span>
                  </li>
                  <li>
                    <span className="rule-num">02</span>
                    <span>
                      <strong>Two approvers sign</strong>
                      <small>The reviewer cannot sign the same application.</small>
                    </span>
                  </li>
                  <li>
                    <span className="rule-num">03</span>
                    <span>
                      <strong>The rail settles</strong>
                      <small>PromptPay or USDC wallet; every send is written to the audit trail.</small>
                    </span>
                  </li>
                </ul>
                <div className="treasury-warning">
                  <CircleAlert size={15} />
                  <p>
                    Simulated in this build. Production requires a bank/PSP partner for PromptPay and a licensed
                    custody/swap path for crypto.
                  </p>
                </div>
              </section>
            </aside>
          </div>

          <section className="panel">
            <SectionHeader
              eyebrow="History"
              title="Payout record"
              description="Newest first. Simulated transfers are labelled."
              actions={<Badge tone="neutral">{sent.length} sent</Badge>}
            />
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Household</th>
                    <th>District</th>
                    <th>Amount</th>
                    <th>Rail</th>
                    <th>Signatures</th>
                    <th>Status</th>
                    <th>Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.id}>
                      <td className="mono">{payout.reference}</td>
                      <td>{payout.applicantName}</td>
                      <td>{payout.district}</td>
                      <td>
                        <strong>{thb(payout.amountThb)}</strong>
                      </td>
                      <td>
                        <span className="rail-tag">{payout.asset === "THB" ? "PromptPay" : `${payout.asset} wallet`}</span>
                      </td>
                      <td>
                        <SignatureDots payout={payout} />
                      </td>
                      <td>
                        <StatusBadge value={payout.status} />
                      </td>
                      <td>
                        <span className="stacked">
                          {payout.sentAt ? <strong>{dateTime(payout.sentAt)}</strong> : <span className="muted-note">—</span>}
                          {payout.txRef ? <small className="mono">{payout.txRef.slice(0, 18)}…</small> : null}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel donation-basis">
            <SectionHeader eyebrow="Funding" title="Recent donations into this reserve" />
            <div className="donation-mini-list">
              {donations.slice(0, 6).map((donation) => (
                <div key={donation.id} className="donation-mini">
                  <span className={`asset-badge asset-${donation.asset.toLowerCase()}`}>{donation.asset.slice(0, 1)}</span>
                  <span className="donation-mini-main">
                    <strong>{donation.donorName}</strong>
                    <small>
                      {donation.channel === "fiat" ? "PromptPay" : "Crypto"} · {donation.province ?? "Where needed most"}
                    </small>
                  </span>
                  <span className="donation-mini-amount">
                    <strong>{thb(donation.amountThb)}</strong>
                    <small>{donation.converted ? "→ USDC" : donation.asset}</small>
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </StaffShell>
  );
}
