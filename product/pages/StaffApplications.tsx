import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CircleAlert,
  FileText,
  Filter,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import type { Application, ApplicationDetail, ReviewDecision } from "../../shared/platform";
import { api, ApiError } from "../lib/api";
import { ago, dateTime, shortWallet, thb } from "../lib/format";
import { useSession } from "../lib/session";
import { StaffShell } from "../components/StaffShell";
import {
  Badge,
  Button,
  Drawer,
  EmptyState,
  Field,
  Input,
  Modal,
  Spinner,
  StatusBadge,
  Textarea,
  useToast,
} from "../components/ui";

const TABS = [
  { key: "all", label: "All" },
  { key: "submitted", label: "Review" },
  { key: "needs_info", label: "Needs info" },
  { key: "approved", label: "Awaiting signatures" },
  { key: "paid", label: "Paid" },
  { key: "rejected", label: "Not approved" },
] as const;

const DECISION_COPY: Record<ReviewDecision, { title: string; description: string; cta: string; tone: "primary" | "danger" | "secondary" }> = {
  approve: {
    title: "Approve this household",
    description: "This creates a payout awaiting two executive signatures. The household cannot submit another request for this response.",
    cta: "Approve and queue payout",
    tone: "primary",
  },
  needs_info: {
    title: "Request more information",
    description: "The household can update the request and return to the review queue.",
    cta: "Send request",
    tone: "secondary",
  },
  reject: {
    title: "Reject this request",
    description: "The household will see the reason. Recorded in the audit trail.",
    cta: "Reject request",
    tone: "danger",
  },
};

export function StaffApplicationsPage() {
  const { user } = useSession();
  const toast = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [decision, setDecision] = useState<ReviewDecision | null>(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await api.applications();
      setApplications(result.applications);
      setError(null);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not load applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!selected) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    api
      .application(selected)
      .then(setDetail)
      .catch((cause: unknown) => toast.push(cause instanceof Error ? cause.message : "Could not open the application.", "error"))
      .finally(() => setDetailLoading(false));
  }, [selected, toast]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return applications.filter((application) => {
      if (tab !== "all" && application.status !== tab) return false;
      if (!term) return true;
      return [application.reference, application.applicantName, application.district, application.applicantPhone]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [applications, tab, search]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: applications.length };
    for (const application of applications) map[application.status] = (map[application.status] ?? 0) + 1;
    return map;
  }, [applications]);

  async function submitDecision() {
    if (!detail || !decision) return;
    if (reason.trim().length < 5) {
      toast.push("Record a reason of at least 5 characters.", "error");
      return;
    }
    setSaving(true);
    try {
      await api.review(detail.id, decision, reason.trim());
      toast.push(
        decision === "approve" ? `${detail.reference} approved and queued for signatures.` : decision === "reject" ? `${detail.reference} rejected.` : `Information requested for ${detail.reference}.`,
        "success",
      );
      setDecision(null);
      setReason("");
      await load();
      const refreshed = await api.application(detail.id);
      setDetail(refreshed);
    } catch (cause) {
      toast.push(cause instanceof ApiError ? cause.message : "The decision could not be saved.", "error");
    } finally {
      setSaving(false);
    }
  }

  const canReview = user?.role === "reviewer" || user?.role === "admin";
  const decidability = detail && (detail.status === "submitted" || detail.status === "needs_info") && canReview;

  return (
    <StaffShell
      title="Applications"
      description="Verify identity, residence and duplication before a household enters the payout queue."
      counts={{ applications: counts.submitted ?? 0 }}
    >
      <section className="panel applications-panel">
        <div className="applications-toolbar">
          <div className="status-tabs" role="tablist" aria-label="Filter by status">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={tab === item.key}
                className={`status-tab ${tab === item.key ? "active" : ""}`}
                onClick={() => setTab(item.key)}
              >
                {item.label}
                <span>{counts[item.key] ?? 0}</span>
              </button>
            ))}
          </div>
          <div className="table-tools">
            <label className="search-box">
              <Search size={16} aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reference, name or district"
                aria-label="Search applications"
              />
              {search ? (
                <button type="button" aria-label="Clear search" onClick={() => setSearch("")}>
                  <X size={14} />
                </button>
              ) : null}
            </label>
            <span className="table-count">
              <Filter size={14} /> {filtered.length} shown
            </span>
          </div>
        </div>

        {error ? <div className="error-note">{error}</div> : null}
        {loading ? (
          <Spinner label="Loading applications" />
        ) : filtered.length === 0 ? (
          <EmptyState title="No applications in this view" icon={<FileText size={20} />}>
            Adjust the status filter or clear the search.
          </EmptyState>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table applications-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Applicant</th>
                  <th>District</th>
                  <th>Household</th>
                  <th>Received</th>
                  <th>Checks</th>
                  <th>Status</th>
                  <th className="align-right">Grant</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((application) => (
                  <tr key={application.id} onClick={() => setSelected(application.id)} className={detail?.id === application.id ? "selected" : ""}>
                    <td>
                      <button type="button" className="row-link" onClick={() => setSelected(application.id)}>
                        {application.reference}
                      </button>
                    </td>
                    <td>
                      <span className="person-cell">
                        <span className="mini-avatar">{application.applicantName.slice(0, 1)}</span>
                        <span>
                          <strong>{application.applicantName}</strong>
                          <small>{application.applicantPhone}</small>
                        </span>
                      </span>
                    </td>
                    <td>{application.district}</td>
                    <td>{application.members} people</td>
                    <td>
                      <span className="stacked">
                        <strong>{ago(application.submittedAt)}</strong>
                        <small>{dateTime(application.submittedAt)}</small>
                      </span>
                    </td>
                    <td>
                      <span className="checks-cell">
                        {application.duplicateFlag ? (
                          <Badge tone="coral">
                            <ShieldAlert size={12} /> Flag
                          </Badge>
                        ) : (
                          <Badge tone="green">
                            <ShieldCheck size={12} /> Clear
                          </Badge>
                        )}
                      </span>
                    </td>
                    <td>
                      <StatusBadge value={application.status} />
                    </td>
                    <td className="align-right">
                      <strong>{thb(application.grantThb)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Drawer
        open={Boolean(selected)}
        onClose={() => {
          setSelected(null);
          setDecision(null);
        }}
        title={detail ? detail.applicantName : "Application"}
        subtitle={detail ? `${detail.reference} · ${detail.activationTitle}` : undefined}
        footer={
          decidability ? (
            <div className="decision-actions">
              <Button variant="secondary" onClick={() => setDecision("needs_info")}>
                Request info
              </Button>
              <Button variant="danger" onClick={() => setDecision("reject")}>
                Reject
              </Button>
              <Button onClick={() => setDecision("approve")}>
                <Check size={16} /> Approve
              </Button>
            </div>
          ) : (
            <div className="drawer-foot-note">
              {detail ? <StatusBadge value={detail.status} /> : null}
              <span>{detail && !canReview ? "Your role can view but not decide this application." : "Decision recorded."}</span>
            </div>
          )
        }
      >
        {detailLoading || !detail ? (
          <Spinner label="Opening application" />
        ) : (
          <div className="detail-stack">
            {detail.duplicateFlag ? (
              <div className="flag-banner">
                <AlertTriangle size={17} />
                <div>
                  <strong>Possible duplicate</strong>
                  <p>{detail.duplicateReason ?? "This request matches another household record."}</p>
                </div>
              </div>
            ) : null}

            <section className="detail-section">
              <h3>Eligibility</h3>
              <dl className="detail-grid">
                <div>
                  <dt>Identity</dt>
                  <dd>
                    {detail.identityMasked} <Badge tone="neutral">{detail.identityType === "thai" ? "Thai ID" : "Foreign resident"}</Badge>
                  </dd>
                </div>
                <div>
                  <dt>TM30</dt>
                  <dd>{detail.tm30Ref ?? <span className="muted-note">Not applicable for a Thai national</span>}</dd>
                </div>
                <div>
                  <dt>Address evidence</dt>
                  <dd>
                    {detail.addressEvidenceRef} <small>{detail.addressEvidenceType.replace("_", " ")}</small>
                  </dd>
                </div>
                <div>
                  <dt>Residence</dt>
                  <dd>
                    {detail.subdistrict}, {detail.district}, {detail.activationProvince}
                  </dd>
                </div>
                <div>
                  <dt>Household size</dt>
                  <dd>{detail.members} people</dd>
                </div>
                <div>
                  <dt>Income band</dt>
                  <dd>{detail.incomeBand}</dd>
                </div>
              </dl>
              <p className="detail-note">Demo verification only. Production requires a DOPA/NDID or approved e-KYC channel.</p>
            </section>

            <section className="detail-section">
              <h3>Duplicate and risk checks</h3>
              <ul className="check-list">
                <li className={detail.walletReuseCount > 0 ? "fail" : "pass"}>
                  {detail.walletReuseCount > 0 ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                  <span>
                    <strong>Wallet reuse</strong>
                    <small>
                      {detail.walletReuseCount > 0
                        ? `Used by ${detail.walletReuseCount} other household${detail.walletReuseCount === 1 ? "" : "s"}.`
                        : "Wallet not used by another household."}
                    </small>
                  </span>
                </li>
                <li className={detail.priorApplicationCount > 0 ? "warn" : "pass"}>
                  <UserRound size={16} />
                  <span>
                    <strong>Prior requests</strong>
                    <small>
                      {detail.priorApplicationCount > 0
                        ? `${detail.priorApplicationCount} earlier application${detail.priorApplicationCount === 1 ? "" : "s"} on this household.`
                        : "First application from this household."}
                    </small>
                  </span>
                </li>
                <li className={detail.duplicateFlag ? "fail" : "pass"}>
                  {detail.duplicateFlag ? <CircleAlert size={16} /> : <ShieldCheck size={16} />}
                  <span>
                    <strong>Household record</strong>
                    <small>{detail.duplicateFlag ? detail.duplicateReason : "No matching address and household pattern."}</small>
                  </span>
                </li>
              </ul>
            </section>

            <section className="detail-section">
              <h3>Evidence</h3>
              <p className="evidence-text">{detail.evidenceNote}</p>
              <div className="evidence-meta">
                <FileText size={15} /> {detail.evidenceRef || "No attachment named"}
              </div>
              <p className="detail-note">Photo evidence upload is not wired in this local build; the note and filename are stored.</p>
            </section>

            <section className="detail-section">
              <h3>Payout</h3>
              <dl className="detail-grid">
                <div>
                  <dt>Grant</dt>
                  <dd>{thb(detail.grantThb)}</dd>
                </div>
                <div>
                  <dt>Wallet</dt>
                  <dd className="mono">{shortWallet(detail.walletAddress)}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{detail.payoutStatus ? <StatusBadge value={detail.payoutStatus} /> : "Not queued"}</dd>
                </div>
                <div>
                  <dt>Reviewer</dt>
                  <dd>{detail.reviewerName ?? "Not decided"}</dd>
                </div>
              </dl>
              {detail.decisionReason ? <p className="decision-reason">“{detail.decisionReason}”</p> : null}
            </section>
          </div>
        )}
      </Drawer>

      <Modal
        open={Boolean(decision)}
        onClose={() => {
          setDecision(null);
          setReason("");
        }}
        title={decision ? DECISION_COPY[decision].title : ""}
        description={decision ? DECISION_COPY[decision].description : undefined}
        footer={
          decision ? (
            <div className="modal-actions">
              <Button variant="ghost" onClick={() => setDecision(null)}>
                Cancel
              </Button>
              <Button variant={DECISION_COPY[decision].tone} loading={saving} onClick={() => void submitDecision()}>
                {DECISION_COPY[decision].cta}
              </Button>
            </div>
          ) : null
        }
      >
        <Field
          label="Decision reason"
          hint="Stored in the audit trail and shown to the household. Do not include unnecessary personal data."
        >
          {(id) => (
            <Textarea
              id={id}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              maxLength={400}
              placeholder={
                decision === "approve"
                  ? "Identity, address evidence and household record verified against the affected district."
                  : decision === "reject"
                    ? "The household does not live in the listed districts."
                    : "Please provide a clearer utility bill that matches the stated address."
              }
            />
          )}
        </Field>
      </Modal>
    </StaffShell>
  );
}
