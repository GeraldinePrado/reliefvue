import { useEffect, useState } from "react";
import { Building2, CircleAlert, Copy, Database, KeyRound, RotateCcw, ShieldCheck, Users } from "lucide-react";
import type { PersonasResponse } from "../lib/api";
import { api, ApiError } from "../lib/api";
import { navigate, useSession } from "../lib/session";
import { StaffShell } from "../components/StaffShell";
import {
  Badge,
  Button,
  CopyButton,
  Field,
  Input,
  Modal,
  SectionHeader,
  StatusBadge,
  useToast,
} from "../components/ui";
import { shortWallet } from "../lib/format";

export function StaffSettingsPage() {
  const { user, org, signOut } = useSession();
  const toast = useToast();
  const [personas, setPersonas] = useState<PersonasResponse | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    api
      .personas()
      .then(setPersonas)
      .catch(() => undefined);
  }, []);

  async function resetDemo() {
    if (confirm !== "RESET") return;
    setResetting(true);
    try {
      await api.resetDemo();
      await signOut();
      toast.push("Demo data reset. Sign in again.", "success");
      navigate("/staff/login");
    } catch (cause) {
      toast.push(cause instanceof ApiError ? cause.message : "Could not reset the demo.", "error");
    } finally {
      setResetting(false);
    }
  }

  const isAdmin = user?.role === "admin";

  return (
    <StaffShell title="Settings" description="Organisation identity, roles and local demo controls.">
      <div className="settings-page">
        <section className="panel">
          <SectionHeader eyebrow="Organisation" title="ReliefVue Thailand" description="The operating entity, its wallet and its payment identity." />
          <div className="settings-grid">
            <div className="settings-field">
              <span className="settings-label">Organisation</span>
              <strong>{org?.name}</strong>
              <small>{org?.country} · single-country reserve for now</small>
            </div>
            <div className="settings-field">
              <span className="settings-label">Treasury wallet</span>
              <span className="wallet-line">
                <code>{shortWallet(org?.treasuryAddress ?? "")}</code>
                <CopyButton value={org?.treasuryAddress ?? ""} label="Copy address" />
              </span>
              <small>Demo keypair generated locally; production should be a Squads vault.</small>
            </div>
            <div className="settings-field">
              <span className="settings-label">PromptPay identity</span>
              <strong>{org?.promptpayId || "Not configured"}</strong>
              <small>Payouts require a bank or licensed payment partner.</small>
            </div>
            <div className="settings-field">
              <span className="settings-label">Approval threshold</span>
              <strong>2-of-3 signatures</strong>
              <small>Fixed by policy in this build. In production this would be a signed on-chain vault change.</small>
            </div>
          </div>
        </section>

        <section className="panel">
          <SectionHeader
            eyebrow="Team"
            title="Roles and separation of duties"
            description="Four staff accounts in the local demo. One person cannot review and release the same payout."
          />
          <div className="team-grid">
            <div className="role-card">
              <span className="role-card-icon">
                <ShieldCheck size={18} />
              </span>
              <h3>Admin</h3>
              <p>Creates activations, manages partner keys and can review or sign, but never twice on the same payout.</p>
              <span className="role-count">{personas?.staff.filter((person) => person.role === "admin").length ?? 1} account</span>
            </div>
            <div className="role-card">
              <span className="role-card-icon">
                <Users size={18} />
              </span>
              <h3>Reviewer</h3>
              <p>Checks identity, residence, duplicate flags and evidence. Cannot sign the payout.</p>
              <span className="role-count">{personas?.staff.filter((person) => person.role === "reviewer").length ?? 1} account</span>
            </div>
            <div className="role-card">
              <span className="role-card-icon">
                <KeyRound size={18} />
              </span>
              <h3>Approver</h3>
              <p>Signs queued payouts. Two distinct approvers are required to release funds.</p>
              <span className="role-count">{personas?.staff.filter((person) => person.role === "approver").length ?? 2} accounts</span>
            </div>
          </div>
          <div className="team-list">
            {personas?.staff.map((person) => (
              <div className="team-row" key={person.userId}>
                <span className="mini-avatar">{person.name.slice(0, 1)}</span>
                <span>
                  <strong>{person.name}</strong>
                  <small>{person.email}</small>
                </span>
                <Badge tone={person.role === "approver" ? "violet" : person.role === "reviewer" ? "amber" : "neutral"}>{person.role}</Badge>
                <StatusBadge value="verified" label="Active" />
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <SectionHeader
            eyebrow="Environment"
            title="Local prototype status"
            description="What is real, what is simulated and what must be replaced before a pilot."
          />
          <div className="status-grid">
            <div className="status-card">
              <Database size={18} />
              <h3>Durable local state</h3>
              <p>SQLite database under <code>data/</code>, seeded with fictional households and donations.</p>
              <Badge tone="green">Working</Badge>
            </div>
            <div className="status-card">
              <Building2 size={18} />
              <h3>Identity verification</h3>
              <p>Thai ID checksum, address evidence, TM30 capture for foreign residents. No DOPA/NDID match yet.</p>
              <Badge tone="amber">Demo only</Badge>
            </div>
            <div className="status-card">
              <CircleAlert size={18} />
              <h3>Money movement</h3>
              <p>All transfers are simulated with reference strings. No mainnet and no real customer funds.</p>
              <Badge tone="amber">Simulated</Badge>
            </div>
            <div className="status-card">
              <ShieldCheck size={18} />
              <h3>Partner surface</h3>
              <p>Read-only REST and MCP with per-organisation bearer keys and output that excludes PII.</p>
              <Badge tone="green">Working</Badge>
            </div>
          </div>
        </section>

        <section className="panel danger-panel">
          <div>
            <p className="eyebrow">Demo controls</p>
            <h2>Reset the local dataset</h2>
            <p>Restores the seeded response, households, donations and payout history. Sign-in sessions are cleared.</p>
          </div>
          <Button variant="danger" disabled={!isAdmin} onClick={() => setResetOpen(true)}>
            <RotateCcw size={15} /> Reset demo data
          </Button>
        </section>

        <section className="panel">
          <SectionHeader eyebrow="Before a pilot" title="Decisions this prototype does not make" />
          <ul className="open-list">
            <li>
              <strong>Payment partnership.</strong> PromptPay payouts need a bank or licensed PSP; holding donor balances
              may require an e-money licence.
            </li>
            <li>
              <strong>Identity partner.</strong> A DOPA/NDID-authorised channel is required for real Thai identity
              matching; TM30 is corroboration for foreign residents, not primary proof.
            </li>
            <li>
              <strong>Reserve policy.</strong> Approve whether the reserve is held in USDC, THB or a mix, and who can
              change that policy.
            </li>
            <li>
              <strong>PDPA and retention.</strong> Identity documents need a lawful basis, retention period and deletion
              process before any real household data is stored.
            </li>
          </ul>
        </section>
      </div>

      <Modal
        open={resetOpen}
        onClose={() => {
          setResetOpen(false);
          setConfirm("");
        }}
        title="Reset all demo data?"
        description="Every application, donation, payout and signature created in this local database will be replaced by the original seed."
        footer={
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={resetting} disabled={confirm !== "RESET"} onClick={() => void resetDemo()}>
              Reset and sign out
            </Button>
          </div>
        }
      >
        <div className="error-note">
          <CircleAlert size={16} /> This cannot be undone. The source code and approved public site are unaffected.
        </div>
        <Field label="Type RESET to confirm">
          {(id) => <Input id={id} placeholder="RESET" value={confirm} onChange={(event) => setConfirm(event.target.value.toUpperCase())} />}
        </Field>
      </Modal>
    </StaffShell>
  );
}
