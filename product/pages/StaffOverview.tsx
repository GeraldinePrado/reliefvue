import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronRight,
  CircleAlert,
  Clock3,
  Inbox,
  MapPin,
  Plus,
  ShieldCheck,
  Signature,
  Users,
} from "lucide-react";
import type { Overview, Payout } from "../../shared/platform";
import { api, ApiError } from "../lib/api";
import { ago, dateShort, pct, thb } from "../lib/format";
import { useSession } from "../lib/session";
import { StaffShell } from "../components/StaffShell";
import {
  Badge,
  Button,
  EmptyState,
  Progress,
  SectionHeader,
  Spinner,
  Stat,
  StatusBadge,
  useToast,
} from "../components/ui";

export function SignatureDots({ payout }: { payout: Payout }) {
  return (
    <span className="sig-dots" aria-label={`${payout.signatures.length} of ${payout.requiredSignatures} signatures`}>
      {Array.from({ length: payout.requiredSignatures }, (_, index) => (
        <span
          key={index}
          className={`sig-dot ${index < payout.signatures.length ? "signed" : ""}`}
          title={index < payout.signatures.length ? payout.signatures[index]?.name : "Awaiting signature"}
        />
      ))}
      <small>
        {payout.signatures.length}/{payout.requiredSignatures}
      </small>
    </span>
  );
}

export function StaffOverviewPage() {
  const { user } = useSession();
  const toast = useToast();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await api.overview());
      setError(null);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not load the workspace.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function sign(payout: Payout) {
    setBusyId(payout.id);
    try {
      const result = await api.signPayout(payout.id);
      toast.push(
        result.payout.status === "sent"
          ? `${payout.reference} reached ${result.payout.requiredSignatures} signatures and was sent.`
          : `Signature added to ${payout.reference}.`,
        "success",
      );
      await load();
    } catch (cause) {
      toast.push(cause instanceof ApiError ? cause.message : "Could not sign the payout.", "error");
    } finally {
      setBusyId(null);
    }
  }

  if (!user) return null;
  const canSign = user.role === "approver" || user.role === "admin";
  const canReview = user.role === "reviewer" || user.role === "admin";

  return (
    <StaffShell
      title="Overview"
      description="Reserve, response coverage and the work waiting on a decision."
      counts={{ applications: data?.totals.pendingReviews, payouts: data?.awaitingPayouts.length }}
      actions={
        user.role === "admin" ? (
          <a className="btn btn-primary btn-sm" href="#/staff/activations">
            <Plus size={15} /> New response
          </a>
        ) : null
      }
    >
      {error ? (
        <div className="error-note">
          <CircleAlert size={16} /> {error} <Button variant="ghost" size="sm" onClick={() => void load()}>Retry</Button>
        </div>
      ) : null}

      {!data ? (
        <Spinner label="Loading operations data" />
      ) : (
        <div className="overview">
          <section className="kpi-row" aria-label="Key figures">
            <Stat
              label="Reserve available"
              value={thb(data.totals.reserveThb - data.totals.awaitingThb)}
              sub={`${thb(data.totals.awaitingThb)} held for signed payouts`}
              tone="accent"
            />
            <Stat label="Donated to date" value={thb(data.totals.donatedThb)} sub={`${data.totals.donors} donor names`} />
            <Stat label="Paid to households" value={thb(data.totals.paidThb)} sub={`${data.totals.householdsPaid} households`} />
            <Stat
              label="Open decisions"
              value={data.totals.pendingReviews + data.awaitingPayouts.length}
              sub={`${data.totals.pendingReviews} application${data.totals.pendingReviews === 1 ? "" : "s"} · ${data.awaitingPayouts.length} payout${data.awaitingPayouts.length === 1 ? "" : "s"}`}
            />
          </section>

          {data.awaitingPayouts.length > 0 ? (
            <div className="attention-bar">
              <Signature size={18} />
              <span>
                <strong>{data.awaitingPayouts.length} payout{data.awaitingPayouts.length === 1 ? "" : "s"} awaiting executive signatures.</strong>{" "}
                Each release needs {data.awaitingPayouts[0]?.requiredSignatures ?? 2} distinct approvers.
              </span>
              <a href="#/staff/treasury">Open treasury <ArrowRight size={15} /></a>
            </div>
          ) : null}

          <div className="overview-grid">
            <div className="overview-main">
              <section className="panel">
                <SectionHeader
                  eyebrow="Live responses"
                  title="Active operations"
                  description="Province-scoped only. A household outside the listed districts cannot request this grant."
                  actions={<a className="btn btn-ghost btn-sm" href="#/staff/activations">All responses <ChevronRight size={15} /></a>}
                />
                {data.activations.filter((activation) => activation.status === "active").length === 0 ? (
                  <EmptyState title="No active response" action={<a className="btn btn-primary btn-sm" href="#/staff/activations">Create one</a>}>
                    Nothing can be paid until a response is active.
                  </EmptyState>
                ) : (
                  <div className="response-list">
                    {data.activations
                      .filter((activation) => activation.status === "active")
                      .map((activation) => {
                        const coverage = data.coverage.filter((row) => row.activationId === activation.id);
                        const spent = activation.paidThb + activation.committedThb;
                        const reached = coverage.filter((row) => row.paid > 0).length;
                        return (
                          <article className="response-card" key={activation.id}>
                            <div className="response-head">
                              <div>
                                <div className="response-title-row">
                                  <h3>{activation.title}</h3>
                                  <StatusBadge value={activation.status} />
                                </div>
                                <p>
                                  <MapPin size={14} /> {activation.province} · {activation.districts.length} districts · started{" "}
                                  {dateShort(activation.startedAt)}
                                </p>
                              </div>
                              <div className="response-grant">
                                <span>Grant</span>
                                <strong>{thb(activation.grantThb)}</strong>
                              </div>
                            </div>
                            <div className="response-progress">
                              <div className="response-progress-label">
                                <span>
                                  {thb(spent)} allocated of {thb(activation.budgetThb)}
                                </span>
                                <span>{pct(spent, activation.budgetThb)}%</span>
                              </div>
                              <Progress value={spent} max={activation.budgetThb} label={`${activation.title} budget used`} />
                            </div>
                            <div className="response-meta">
                              <span>
                                <strong>{activation.applications}</strong> requests
                              </span>
                              <span>
                                <strong>{activation.approved + activation.paid}</strong> approved
                              </span>
                              <span>
                                <strong>{activation.paid}</strong> paid
                              </span>
                              <span className={reached < coverage.length ? "warn-text" : ""}>
                                <strong>
                                  {reached}/{coverage.length}
                                </strong>{" "}
                                districts reached
                              </span>
                            </div>
                            <div className="district-strip">
                              {coverage.map((row) => (
                                <span
                                  key={row.district}
                                  className={`district-chip ${row.unreached ? "unreached" : "reached"}`}
                                  title={`${row.district}: ${row.paid} paid, ${row.applications} requests`}
                                >
                                  <span className="chip-dot" aria-hidden="true" />
                                  {row.district}
                                  <small>{row.paid}</small>
                                </span>
                              ))}
                            </div>
                          </article>
                        );
                      })}
                  </div>
                )}
              </section>

              <section className="panel">
                <SectionHeader
                  eyebrow="Coverage"
                  title="Who has actually been reached"
                  description="Districts with requests but zero payouts are the first thing to investigate."
                  actions={<a className="btn btn-ghost btn-sm" href="#/staff/activations">Manage reach <ChevronRight size={15} /></a>}
                />
                {data.coverage.length === 0 ? (
                  <EmptyState title="Coverage appears when a response is active">No active districts yet.</EmptyState>
                ) : (
                  <div className="coverage-table" role="table" aria-label="Coverage by district">
                    <div className="coverage-row coverage-head" role="row">
                      <span role="columnheader">District</span>
                      <span role="columnheader">Requests</span>
                      <span role="columnheader">Approved</span>
                      <span role="columnheader">Paid</span>
                      <span role="columnheader">Status</span>
                    </div>
                    {data.coverage.map((row) => (
                      <div className={`coverage-row ${row.unreached ? "coverage-unreached" : ""}`} role="row" key={`${row.activationId}-${row.district}`}>
                        <span role="cell">
                          <strong>{row.district}</strong>
                          <small>{row.activationTitle}</small>
                        </span>
                        <span role="cell">{row.applications}</span>
                        <span role="cell">{row.approved}</span>
                        <span role="cell">{row.paid}</span>
                        <span role="cell">
                          {row.unreached ? <Badge tone="coral">No payout yet</Badge> : <Badge tone="green">Reached</Badge>}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside className="overview-side">
              <section className="panel">
                <SectionHeader
                  eyebrow="Signatures"
                  title="Approval queue"
                  description="Nothing leaves without two distinct signatures."
                  actions={<a className="icon-link" href="#/staff/treasury" aria-label="Open treasury"><ChevronRight size={17} /></a>}
                />
                {data.awaitingPayouts.length === 0 ? (
                  <EmptyState title="Nothing waiting">Approved applications appear here for signing.</EmptyState>
                ) : (
                  <ul className="approval-list">
                    {data.awaitingPayouts.map((payout) => (
                      <li key={payout.id}>
                        <div className="approval-top">
                          <div>
                            <strong>{payout.applicantName}</strong>
                            <small>
                              {payout.district} · {payout.reference}
                            </small>
                          </div>
                          <span className="approval-amount">{thb(payout.amountThb)}</span>
                        </div>
                        <div className="approval-bottom">
                          <SignatureDots payout={payout} />
                          <span className="rail-tag">{payout.asset === "THB" ? "PromptPay" : `${payout.asset} wallet`}</span>
                        </div>
                        {canSign ? (
                          <Button size="sm" variant="secondary" loading={busyId === payout.id} onClick={() => void sign(payout)}>
                            <Signature size={14} /> Add signature
                          </Button>
                        ) : (
                          <span className="muted-note">Waiting for an executive approver.</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="panel">
                <SectionHeader
                  eyebrow="Review"
                  title="New applications"
                  description={`${data.totals.pendingReviews} waiting for a reviewer.`}
                  actions={<a className="icon-link" href="#/staff/applications" aria-label="Open applications"><ChevronRight size={17} /></a>}
                />
                {data.pendingApplications.length === 0 ? (
                  <EmptyState title="Queue is clear" icon={<Inbox size={18} />}>
                    New requests appear here.
                  </EmptyState>
                ) : (
                  <ul className="compact-queue">
                    {data.pendingApplications.slice(0, 5).map((application) => (
                      <li key={application.id}>
                        <a href="#/staff/applications">
                          <span className="queue-avatar">{application.applicantName.slice(0, 1)}</span>
                          <span className="queue-main">
                            <strong>{application.applicantName}</strong>
                            <small>
                              {application.district} · {ago(application.submittedAt)}
                            </small>
                          </span>
                          {application.duplicateFlag ? <Badge tone="coral">Flag</Badge> : <ChevronRight size={15} />}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                {canReview ? (
                  <a className="panel-action" href="#/staff/applications">
                    Review applications <ArrowRight size={15} />
                  </a>
                ) : null}
              </section>

              <section className="panel">
                <SectionHeader eyebrow="Audit" title="Recent actions" />
                <ul className="audit-list">
                  {data.audit.slice(0, 6).map((entry) => (
                    <li key={entry.id}>
                      <span className="audit-dot" aria-hidden="true" />
                      <span>
                        <strong>{entry.actorLabel}</strong> {entry.detail}
                        <small>{ago(entry.at)}</small>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="panel guardrail-card">
                <ShieldCheck size={19} />
                <h3>Separation of duties</h3>
                <p>
                  A reviewer cannot sign the payout they approved. Payouts require {data.awaitingPayouts[0]?.requiredSignatures ?? 2}{" "}
                  signatures from different staff accounts. In production this maps to a Squads 2-of-3 vault.
                </p>
                <div className="guardrail-facts">
                  <span>
                    <Users size={14} /> 4 staff accounts
                  </span>
                  <span>
                    <Clock3 size={14} /> local audit trail
                  </span>
                </div>
              </section>
            </aside>
          </div>
        </div>
      )}
    </StaffShell>
  );
}
