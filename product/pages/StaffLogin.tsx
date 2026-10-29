import { useEffect, useState } from "react";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { api, ApiError, type PersonasResponse } from "../lib/api";
import { navigate, useSession } from "../lib/session";
import { Button, Field, Input, Logo } from "../components/ui";
import elephant from "../assets/reliefvue-elephant.png";

const ROLE_COPY: Record<string, string> = {
  admin: "Full workspace, activations, partner keys",
  reviewer: "Decide applications, request evidence",
  approver: "Sign payouts, 2-of-3 threshold",
};

export function StaffLoginPage() {
  const { user, refresh } = useSession();
  const [personas, setPersonas] = useState<PersonasResponse | null>(null);
  const [email, setEmail] = useState("admin@reliefvue.demo");
  const [password, setPassword] = useState("reliefvue-demo");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .personas()
      .then(setPersonas)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (user && user.role !== "recipient") navigate("/staff");
  }, [user]);

  async function signInWithPassword() {
    setBusy("password");
    setError(null);
    try {
      await api.staffLogin(email, password);
      await refresh();
      navigate("/staff");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Sign in failed.");
    } finally {
      setBusy(null);
    }
  }

  async function signInAs(persona: { userId: string; name: string }) {
    setBusy(persona.userId);
    setError(null);
    try {
      await api.demoLogin({ userId: persona.userId });
      await refresh();
      navigate("/staff");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Demo sign in failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="login-page">
      <section className="login-art">
        <a href="#/" className="login-brand" aria-label="ReliefVue home">
          <Logo light />
        </a>
        <div className="login-art-copy">
          <p className="eyebrow">Operations workspace</p>
          <h1>Run a response without losing the household in the spreadsheet.</h1>
          <p>
            Applications, district coverage, duplicate checks and a two-signature treasury in one place. Built for a
            country-by-country relief network.
          </p>
          <ul>
            <li>
              <ShieldCheck size={17} /> Private evidence stays out of the public ledger
            </li>
            <li>
              <LockKeyhole size={17} /> No single executive can release the reserve
            </li>
            <li>
              <ArrowRight size={17} /> Partner MCP and REST access for other organisations
            </li>
          </ul>
        </div>
        <img src={elephant} alt="" className="login-elephant" />
        <span className="login-art-foot">Local demo · fictional households · simulated funds</span>
      </section>

      <section className="login-form-side">
        <div className="login-form">
          <div className="login-form-head">
            <p className="eyebrow">Staff sign in</p>
            <h2>Welcome back.</h2>
            <p>Use a demo persona or the seeded admin account.</p>
          </div>

          <div className="login-fields">
            <Field label="Work email">{(id) => <Input id={id} type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />}</Field>
            <Field label="Password">{(id) => <Input id={id} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />}</Field>
            {error ? <div className="error-note">{error}</div> : null}
            <Button size="lg" loading={busy === "password"} onClick={signInWithPassword}>
              Sign in <ArrowRight size={16} />
            </Button>
          </div>

          <div className="persona-section">
            <div className="persona-head">
              <span>Or enter as a demo role</span>
              <span className="persona-hint">password: {personas?.passwordHint ?? "reliefvue-demo"}</span>
            </div>
            <div className="persona-list">
              {personas?.staff.map((persona) => (
                <button
                  key={persona.userId}
                  type="button"
                  className="persona-card"
                  onClick={() => signInAs(persona)}
                  disabled={Boolean(busy)}
                >
                  <span className="persona-avatar">{persona.name.slice(0, 1)}</span>
                  <span className="persona-text">
                    <strong>{persona.name}</strong>
                    <small>{ROLE_COPY[persona.role] ?? persona.role}</small>
                  </span>
                  <span className={`role-tag role-${persona.role}`}>{persona.role}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="login-recipient">
            Are you a recipient? <a href="#/help">Open the mobile app</a> instead.
          </p>
        </div>
      </section>
    </div>
  );
}
