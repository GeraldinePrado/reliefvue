import { useEffect, useMemo, useState } from "react";
import { Bot, Braces, Code2, KeyRound, Plus, RefreshCw, Server, Trash2 } from "lucide-react";
import type { PartnerActivationSummary } from "../../shared/platform";
import { api, ApiError, callMcp, type PartnersResponse } from "../lib/api";
import { thb } from "../lib/format";
import { useSession } from "../lib/session";
import { StaffShell } from "../components/StaffShell";
import {
  Badge,
  Button,
  CopyButton,
  EmptyState,
  Field,
  Input,
  Modal,
  Select,
  Spinner,
  StatusBadge,
  useToast,
} from "../components/ui";

const BASE_URL = `${window.location.origin}/papi`;

const EXAMPLES = [
  {
    title: "REST · read the network",
    method: "GET",
    path: "/api/v1/partner/overview",
    description: "Organisation, activations, district coverage and public totals.",
  },
  {
    title: "REST · coverage for a response",
    method: "GET",
    path: "/api/v1/partner/activations/:id/coverage",
    description: "District-level requests, approvals and which districts have no payout yet.",
  },
  {
    title: "MCP · read-only tools",
    method: "POST",
    path: "/api/v1/mcp",
    description: "JSON-RPC 2.0 over Streamable HTTP. Tools only; no money movement.",
  },
];

export function StaffPartnersPage() {
  const { user } = useSession();
  const toast = useToast();
  const [data, setData] = useState<PartnersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  const [testKey, setTestKey] = useState("");
  const [tool, setTool] = useState("list_activations");
  const [activationId, setActivationId] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const load = async () => {
    try {
      const value = await api.partners();
      setData(value);
      if (!activationId && value.snapshot.activations[0]) setActivationId(value.snapshot.activations[0].id);
    } catch (cause) {
      toast.push(cause instanceof ApiError ? cause.message : "Could not load partner access.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createKey() {
    setCreating(true);
    try {
      const value = await api.createApiKey(keyName);
      setNewKey(value.key);
      setTestKey(value.key);
      setCreateOpen(false);
      setKeyName("");
      toast.push("Partner key created. Copy it now; it is shown once.", "success");
      await load();
    } catch (cause) {
      toast.push(cause instanceof ApiError ? cause.message : "Could not create the key.", "error");
    } finally {
      setCreating(false);
    }
  }

  async function revoke(id: string) {
    setRevoking(id);
    try {
      await api.revokeApiKey(id);
      toast.push("Key revoked.", "success");
      await load();
    } catch (cause) {
      toast.push(cause instanceof ApiError ? cause.message : "Could not revoke the key.", "error");
    } finally {
      setRevoking(null);
    }
  }

  async function runTool() {
    setRunning(true);
    setResult(null);
    try {
      const argumentsValue = tool === "get_activation_coverage" || tool === "list_unreached_districts" ? { activation_id: activationId } : {};
      const response = await callMcp(testKey.trim(), {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name: tool, arguments: argumentsValue },
      });
      setResult(JSON.stringify(response, null, 2));
    } catch (cause) {
      setResult(JSON.stringify({ error: cause instanceof Error ? cause.message : "MCP call failed" }, null, 2));
    } finally {
      setRunning(false);
    }
  }

  const activePartners = useMemo(() => (data?.keys ?? []).filter((key) => !key.revokedAt), [data]);
  const snippet =
    tool === "list_activations"
      ? `curl -s ${BASE_URL}/v1/partner/overview -H "Authorization: Bearer $RV_KEY"`
      : `curl -s -X POST ${BASE_URL}/v1/mcp \\
  -H "Authorization: Bearer $RV_KEY" \\
  -H "content-type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call",
       "params":{"name":"${tool}","arguments":${JSON.stringify(
         tool === "list_activations" || tool === "get_ledger_summary" ? {} : { activation_id: activationId },
       )}}}'`;

  return (
    <StaffShell
      title="Partner access"
      description="A read-only REST and MCP surface for another organisation running relief on the same rails."
      actions={
        user?.role === "admin" ? (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={15} /> New API key
          </Button>
        ) : null
      }
    >
      {loading || !data ? (
        <Spinner label="Loading partner access" />
      ) : (
        <div className="partners-page">
          <section className="partner-hero">
            <div>
              <p className="eyebrow">Network model</p>
              <h2>Other organisations should not need to rebuild the rails.</h2>
              <p>
                Each partner organisation gets its own reserve, staff and wallet. The API exposes activation, coverage and
                ledger facts. Household identity documents never leave the operating organisation.
              </p>
              <div className="partner-chips">
                <Badge tone="violet">
                  <Server size={12} /> REST
                </Badge>
                <Badge tone="violet">
                  <Bot size={12} /> MCP {data.protocolVersion}
                </Badge>
                <Badge tone="green">
                  <KeyRound size={12} /> Scoped key
                </Badge>
                <Badge tone="neutral">Read-only</Badge>
              </div>
            </div>
            <div className="partner-stat-block">
              <div>
                <span>Activations exposed</span>
                <strong>{data.snapshot.activations.length}</strong>
              </div>
              <div>
                <span>Districts tracked</span>
                <strong>{data.snapshot.coverage.length}</strong>
              </div>
              <div>
                <span>Active keys</span>
                <strong>{activePartners.length}</strong>
              </div>
            </div>
          </section>

          <div className="partner-grid">
            <section className="panel">
              <div className="panel-head">
                <div>
                  <p className="eyebrow">Credentials</p>
                  <h2>API keys</h2>
                </div>
                <span className="panel-note">Shown once at creation</span>
              </div>
              {newKey ? (
                <div className="new-key-banner">
                  <div>
                    <strong>Copy this key now</strong>
                    <code>{newKey}</code>
                  </div>
                  <CopyButton value={newKey} label="Copy key" />
                </div>
              ) : null}
              {data.keys.length === 0 ? (
                <EmptyState title="No partner keys yet" icon={<KeyRound size={20} />}>
                  Create a read-only key for an NGO or government partner.
                </EmptyState>
              ) : (
                <div className="key-list">
                  {data.keys.map((key) => (
                    <div className={`key-row ${key.revokedAt ? "revoked" : ""}`} key={key.id}>
                      <span className="key-icon">
                        <KeyRound size={15} />
                      </span>
                      <span className="key-main">
                        <strong>{key.name}</strong>
                        <small>
                          {key.prefix}… · created {new Date(key.createdAt).toLocaleDateString("en-GB")}
                          {key.lastUsedAt ? ` · last used ${new Date(key.lastUsedAt).toLocaleDateString("en-GB")}` : ""}
                        </small>
                      </span>
                      {key.revokedAt ? (
                        <Badge tone="neutral">Revoked</Badge>
                      ) : (
                        <Button size="sm" variant="ghost" loading={revoking === key.id} onClick={() => void revoke(key.id)}>
                          <Trash2 size={13} /> Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="panel">
              <div className="panel-head">
                <div>
                  <p className="eyebrow">Try it</p>
                  <h2>Call an MCP tool</h2>
                </div>
                <span className="panel-note">Read-only, no mutations</span>
              </div>
              <div className="mcp-tester">
                <Field label="Partner key" hint="A newly created key is filled in automatically.">
                  {(id) => (
                    <Input id={id} value={testKey} onChange={(event) => setTestKey(event.target.value)} placeholder="rv_live_…" autoComplete="off" />
                  )}
                </Field>
                <div className="form-grid">
                  <Field label="Tool">
                    {(id) => (
                      <Select id={id} value={tool} onChange={(event) => setTool(event.target.value)}>
                        {data.tools.map((item) => (
                          <option key={item.name} value={item.name}>
                            {item.name}
                          </option>
                        ))}
                      </Select>
                    )}
                  </Field>
                  <Field label="Activation" hint="Used by coverage tools.">
                    {(id) => (
                      <Select id={id} value={activationId} onChange={(event) => setActivationId(event.target.value)}>
                        {data.snapshot.activations.map((activation: PartnerActivationSummary) => (
                          <option key={activation.id} value={activation.id}>
                            {activation.title}
                          </option>
                        ))}
                      </Select>
                    )}
                  </Field>
                </div>
                <div className="mcp-actions">
                  <Button size="sm" loading={running} disabled={!testKey.trim()} onClick={() => void runTool()}>
                    <RefreshCw size={14} /> Run tool
                  </Button>
                  <span className="mcp-endpoint mono">POST /papi/v1/mcp</span>
                </div>
                {result ? (
                  <pre className="code-result" aria-live="polite">
                    {result}
                  </pre>
                ) : (
                  <div className="code-placeholder">
                    <Braces size={16} /> The structured JSON response appears here.
                  </div>
                )}
              </div>
            </section>
          </div>

          <section className="panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Surface</p>
                <h2>Endpoints and tools</h2>
              </div>
              <span className="panel-note">Bearer key in the Authorization header</span>
            </div>
            <div className="endpoint-grid">
              {EXAMPLES.map((example) => (
                <article className="endpoint-card" key={example.path}>
                  <span className={`method method-${example.method.toLowerCase()}`}>{example.method}</span>
                  <code>{example.path}</code>
                  <p>{example.description}</p>
                  <CopyButton value={`${BASE_URL}${example.path.replace("/api", "")}`} label="Copy URL" />
                </article>
              ))}
            </div>
            <div className="tool-grid">
              {data.tools.map((toolItem) => (
                <div className="tool-card" key={toolItem.name}>
                  <span className="tool-icon">
                    <Code2 size={15} />
                  </span>
                  <div>
                    <strong>{toolItem.name}</strong>
                    <p>{toolItem.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="code-block-wrap">
              <div className="code-block-head">
                <span>Example call</span>
                <CopyButton value={snippet} label="Copy cURL" />
              </div>
              <pre className="code-block">{snippet}</pre>
            </div>
          </section>

          <section className="panel partner-snapshot">
            <div className="panel-head">
              <div>
                <p className="eyebrow">What a partner sees</p>
                <h2>{data.snapshot.organisation} · public-safe snapshot</h2>
              </div>
              <Badge tone="green">{data.snapshot.country}</Badge>
            </div>
            <div className="partner-activation-list">
              {data.snapshot.activations.map((activation) => (
                <div className="partner-activation" key={activation.id}>
                  <div>
                    <strong>{activation.title}</strong>
                    <small>
                      {activation.province} · {activation.householdsPaid} households paid
                    </small>
                  </div>
                  <StatusBadge value={activation.status} />
                  <span>
                    <strong>{thb(activation.remainingThb)}</strong>
                    <small>remaining</small>
                  </span>
                  <span>
                    <strong>{activation.pendingApplications}</strong>
                    <small>pending</small>
                  </span>
                </div>
              ))}
            </div>
            <p className="panel-footnote">
              No household names, phone numbers, identity numbers, TM30 references or addresses are returned by any
              partner endpoint or MCP tool.
            </p>
          </section>
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create a partner key"
        description="The key is read-only and belongs to this organisation. It is displayed once."
        footer={
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button loading={creating} disabled={keyName.trim().length < 2} onClick={() => void createKey()}>
              Create key
            </Button>
          </div>
        }
      >
        <Field label="Key name" hint="For example: Thai Red Cross pilot or Chiang Mai community desk.">
          {(id) => <Input id={id} value={keyName} onChange={(event) => setKeyName(event.target.value)} placeholder="Partner name" />}
        </Field>
      </Modal>
    </StaffShell>
  );
}
