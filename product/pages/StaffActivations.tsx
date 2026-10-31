import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Plus, Siren, Trash2, X } from "lucide-react";
import type { Activation, CoverageRow } from "../../shared/platform";
import { api, ApiError, type MetaResponse } from "../lib/api";
import { dateFull, pct, thb } from "../lib/format";
import { useSession } from "../lib/session";
import { StaffShell } from "../components/StaffShell";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Input,
  Modal,
  Progress,
  Select,
  Spinner,
  StatusBadge,
  Textarea,
  useToast,
} from "../components/ui";

const DISASTER_TYPES = ["Flood", "Landslide", "Storm", "Fire", "Earthquake", "Drought", "Other"];

export function StaffActivationsPage() {
  const { user } = useSession();
  const toast = useToast();
  const [activations, setActivations] = useState<Activation[]>([]);
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [closing, setClosing] = useState<Activation | null>(null);
  const [busy, setBusy] = useState(false);
  const [coverage, setCoverage] = useState<Record<string, CoverageRow[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [disasterType, setDisasterType] = useState("Flood");
  const [province, setProvince] = useState("Chiang Mai");
  const [districts, setDistricts] = useState<string[]>([]);
  const [districtDraft, setDistrictDraft] = useState("");
  const [budget, setBudget] = useState("300000");
  const [grant, setGrant] = useState("3000");

  const load = useCallback(async () => {
    try {
      const [list, metaValue] = await Promise.all([api.activations(), api.meta()]);
      setActivations(list.activations);
      setMeta(metaValue);
    } catch (cause) {
      toast.push(cause instanceof ApiError ? cause.message : "Could not load responses.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  function addDistrict() {
    const value = districtDraft.trim().replace(/,$/, "");
    if (!value) return;
    if (districts.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setDistrictDraft("");
      return;
    }
    setDistricts((current) => [...current, value]);
    setDistrictDraft("");
  }

  async function create() {
    if (districts.length === 0) {
      toast.push("Add at least one affected district.", "error");
      return;
    }
    setBusy(true);
    try {
      await api.createActivation({
        title,
        disasterType,
        province,
        districts,
        budgetThb: Number(budget),
        grantThb: Number(grant),
      });
      toast.push("Response activated. Households in those districts can now request support.", "success");
      setCreateOpen(false);
      setTitle("");
      setDistricts([]);
      setDistrictDraft("");
      await load();
    } catch (cause) {
      toast.push(cause instanceof ApiError ? cause.message : "Could not create the response.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function close() {
    if (!closing) return;
    setBusy(true);
    try {
      await api.closeActivation(closing.id);
      toast.push(`${closing.title} closed.`, "success");
      setClosing(null);
      await load();
    } catch (cause) {
      toast.push(cause instanceof ApiError ? cause.message : "Could not close the response.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function toggleCoverage(activation: Activation) {
    if (expanded === activation.id) {
      setExpanded(null);
      return;
    }
    setExpanded(activation.id);
    if (!coverage[activation.id]) {
      try {
        const result = await api.coverage(activation.id);
        setCoverage((current) => ({ ...current, [activation.id]: result.coverage }));
      } catch (cause) {
        toast.push(cause instanceof ApiError ? cause.message : "Could not load coverage.", "error");
      }
    }
  }

  const active = activations.filter((item) => item.status === "active");
  const closed = activations.filter((item) => item.status !== "active");

  return (
    <StaffShell
      title="Responses"
      description="Activate a province and its named districts. Nothing outside that list is payable."
      counts={{ applications: undefined }}
      actions={
        user?.role === "admin" ? (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={15} /> New response
          </Button>
        ) : null
      }
    >
      {loading ? (
        <Spinner label="Loading responses" />
      ) : (
        <div className="activations-page">
          <section className="panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Active</p>
                <h2>{active.length} live response{active.length === 1 ? "" : "s"}</h2>
              </div>
              <span className="panel-note">Households can request only inside these districts</span>
            </div>
            {active.length === 0 ? (
              <EmptyState title="No active response" icon={<Siren size={20} />}>
                Create a response to open intake for a province.
              </EmptyState>
            ) : (
              <div className="activation-grid">
                {active.map((activation) => (
                  <ActivationCard
                    key={activation.id}
                    activation={activation}
                    coverage={coverage[activation.id]}
                    expanded={expanded === activation.id}
                    onToggle={() => void toggleCoverage(activation)}
                    onClose={user?.role === "admin" ? () => setClosing(activation) : undefined}
                  />
                ))}
              </div>
            )}
          </section>

          {closed.length > 0 ? (
            <section className="panel">
              <div className="panel-head">
                <div>
                  <p className="eyebrow">History</p>
                  <h2>Closed responses</h2>
                </div>
              </div>
              <div className="closed-list">
                {closed.map((activation) => (
                  <div className="closed-row" key={activation.id}>
                    <span className="closed-icon">
                      <Siren size={16} />
                    </span>
                    <span className="closed-main">
                      <strong>{activation.title}</strong>
                      <small>
                        {activation.province} · {activation.districts.length} districts · closed{" "}
                        {activation.closedAt ? dateFull(activation.closedAt) : "—"}
                      </small>
                    </span>
                    <span className="closed-metric">
                      <strong>{thb(activation.paidThb)}</strong>
                      <small>paid</small>
                    </span>
                    <span className="closed-metric">
                      <strong>{activation.paid}</strong>
                      <small>households</small>
                    </span>
                    <StatusBadge value={activation.status} />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="panel activation-rules">
            <h3>How activation works</h3>
            <div className="rules-grid">
              <div>
                <span>01</span>
                <strong>One province</strong>
                <p>A response belongs to a single province. Expansion happens country by country, never by mixing reserves.</p>
              </div>
              <div>
                <span>02</span>
                <strong>Named districts</strong>
                <p>Only households whose verified district appears on the list can submit a request.</p>
              </div>
              <div>
                <span>03</span>
                <strong>Fixed grant</strong>
                <p>Every approved household receives the same amount. The budget is a ceiling, not a target to divide.</p>
              </div>
            </div>
          </section>
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Activate a disaster response"
        description="This opens intake for the named districts. You can close it at any time."
        size="lg"
        footer={
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button loading={busy} onClick={() => void create()}>
              Activate response
            </Button>
          </div>
        }
      >
        <div className="form-stack">
          <Field label="Response title" hint="Shown to staff and recipients.">
            {(id) => (
              <Input
                id={id}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Chiang Mai river flood response"
                maxLength={120}
              />
            )}
          </Field>
          <div className="form-grid-3">
            <Field label="Disaster type">
              {(id) => (
                <Select id={id} value={disasterType} onChange={(event) => setDisasterType(event.target.value)}>
                  {DISASTER_TYPES.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Province">
              {(id) => (
                <Select id={id} value={province} onChange={(event) => setProvince(event.target.value)}>
                  {meta?.provinces.map((item) => (
                    <option key={item.en} value={item.en}>
                      {item.en}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Grant per household" hint="Fixed for the whole response.">
              {(id) => <Input id={id} inputMode="numeric" value={grant} onChange={(event) => setGrant(event.target.value.replace(/[^0-9]/g, ""))} />}
            </Field>
          </div>
          <Field label="Affected districts" hint="Add each district. Recipients must match one exactly.">
            {() => (
              <div className="tag-input">
                <div className="tag-list">
                  {districts.map((district) => (
                    <span className="tag" key={district}>
                      {district}
                      <button type="button" aria-label={`Remove ${district}`} onClick={() => setDistricts((current) => current.filter((item) => item !== district))}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <input
                    value={districtDraft}
                    onChange={(event) => setDistrictDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === ",") {
                        event.preventDefault();
                        addDistrict();
                      }
                    }}
                    placeholder="Type a district and press Enter"
                    aria-label="Add affected district"
                  />
                </div>
                <Button size="sm" variant="secondary" onClick={addDistrict}>
                  <Plus size={14} /> Add
                </Button>
              </div>
            )}
          </Field>
          <Field label="Total budget (THB)" hint="Hard ceiling for approved payouts in this response.">
            {(id) => (
              <Input id={id} inputMode="numeric" value={budget} onChange={(event) => setBudget(event.target.value.replace(/[^0-9]/g, ""))} />
            )}
          </Field>
          <div className="activation-preview">
            <span>Maximum households at this grant</span>
            <strong>{Math.floor(Number(budget) / Math.max(Number(grant), 1)) || 0}</strong>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(closing)}
        onClose={() => setClosing(null)}
        title="Close this response?"
        description="New requests stop immediately. Existing approved payouts can still be signed."
        footer={
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setClosing(null)}>
              Keep open
            </Button>
            <Button variant="danger" loading={busy} onClick={() => void close()}>
              Close response
            </Button>
          </div>
        }
      >
        <p className="modal-text">{closing?.title}</p>
      </Modal>
    </StaffShell>
  );
}

function ActivationCard({
  activation,
  coverage,
  expanded,
  onToggle,
  onClose,
}: {
  activation: Activation;
  coverage?: CoverageRow[];
  expanded: boolean;
  onToggle: () => void;
  onClose?: () => void;
}) {
  const spent = activation.paidThb + activation.committedThb;
  const reached = coverage?.filter((row) => row.paid > 0).length ?? 0;
  return (
    <article className="activation-card">
      <div className="activation-head">
        <div>
          <div className="activation-title-row">
            <h3>{activation.title}</h3>
            <StatusBadge value={activation.status} />
          </div>
          <p>
            <MapPin size={14} /> {activation.province} · opened {dateFull(activation.startedAt)}
          </p>
        </div>
        <div className="activation-grant">
          <span>per household</span>
          <strong>{thb(activation.grantThb)}</strong>
        </div>
      </div>

      <div className="activation-budget">
        <div className="response-progress-label">
          <span>
            {thb(spent)} of {thb(activation.budgetThb)}
          </span>
          <span>{pct(spent, activation.budgetThb)}%</span>
        </div>
        <Progress value={spent} max={activation.budgetThb} label={`${activation.title} budget`} />
      </div>

      <div className="activation-stats">
        <div>
          <strong>{activation.applications}</strong>
          <span>requests</span>
        </div>
        <div>
          <strong>{activation.approved}</strong>
          <span>awaiting signatures</span>
        </div>
        <div>
          <strong>{activation.paid}</strong>
          <span>paid</span>
        </div>
        <div>
          <strong>{thb(activation.remainingThb)}</strong>
          <span>budget left</span>
        </div>
      </div>

      <div className="activation-foot">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onToggle} aria-expanded={expanded}>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          {expanded ? "Hide coverage" : `Coverage${coverage ? ` · ${reached}/${coverage.length} reached` : ""}`}
        </button>
        {onClose ? (
          <Button size="sm" variant="secondary" onClick={onClose}>
            Close response
          </Button>
        ) : null}
      </div>

      {expanded ? (
        <div className="activation-coverage">
          {!coverage ? (
            <Spinner label="Loading coverage" />
          ) : (
            coverage.map((row) => (
              <div className={`activation-coverage-row ${row.unreached ? "unreached" : ""}`} key={row.district}>
                <span className="cov-name">{row.district}</span>
                <span>{row.applications} requests</span>
                <span>{row.approved} approved</span>
                <span>{row.paid} paid</span>
                {row.unreached ? <Badge tone="coral">No payout yet</Badge> : <Badge tone="green">Reached</Badge>}
              </div>
            ))
          )}
        </div>
      ) : null}
    </article>
  );
}
