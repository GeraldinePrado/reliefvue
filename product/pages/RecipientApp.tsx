import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Check,
  ChevronRight,
  ClipboardList,
  Clock3,
  Copy,
  HandCoins,
  Home,
  Info,
  Landmark,
  MapPin,
  Phone,
  ShieldCheck,
  Smartphone,
  UserRound,
  Wallet,
} from "lucide-react";
import {
  INCOME_BANDS,
  type Application,
  type ApplicationStatus,
  type Household,
  type Payout,
  type RecipientActivation,
  type RecipientHome,
} from "../../shared/platform";
import { api, ApiError, type MetaResponse } from "../lib/api";
import { ago, assetAmount, dateShort, firstName, shortWallet, thb } from "../lib/format";
import { navigate, useRoute, useSession } from "../lib/session";
import {
  Badge,
  Button,
  CopyButton,
  Field,
  Input,
  Select,
  Spinner,
  StatusBadge,
  Textarea,
  useToast,
} from "../components/ui";
import mark from "../assets/reliefvue-mark.png";

const TABS = [
  { route: "/help", label: "Home", icon: Home },
  { route: "/help/request", label: "Request", icon: HandCoins },
  { route: "/help/activity", label: "Activity", icon: ClipboardList },
  { route: "/help/profile", label: "Profile", icon: UserRound },
] as const;

export function RecipientApp() {
  const { loading, user, household, refresh } = useSession();
  const route = useRoute();

  if (loading) {
    return (
      <RecipientFrame>
        <Spinner label="Opening ReliefVue" />
      </RecipientFrame>
    );
  }

  if (!user) {
    return (
      <RecipientFrame>
        <RecipientSignIn />
      </RecipientFrame>
    );
  }

  if (user.role !== "recipient") {
    return (
      <RecipientFrame>
        <div className="recipient-message">
          <ShieldCheck size={26} />
          <h1>This is the recipient app.</h1>
          <p>You are signed in as staff. Open the operations workspace instead.</p>
          <a className="btn btn-primary" href="#/staff">
            Go to staff workspace
          </a>
        </div>
      </RecipientFrame>
    );
  }

  if (!household) {
    return (
      <RecipientFrame>
        <Onboarding
          onDone={async () => {
            await refresh();
            navigate("/help");
          }}
        />
      </RecipientFrame>
    );
  }

  return (
    <RecipientFrame signedIn>
      <RecipientHome route={route} />
    </RecipientFrame>
  );
}

/* ------------------------------------------------------------------ frame */

function RecipientFrame({ children, signedIn = false }: { children: ReactNode; signedIn?: boolean }) {
  return (
    <div className="recipient-stage">
      <aside className="recipient-context">
        <a href="#/" className="recipient-context-brand">
          <img src={mark} alt="" width={42} height={42} />
          <span>
            <strong>ReliefVue</strong>
            <small>Recipient app · Thailand</small>
          </span>
        </a>
        <h1>The household side of the relief record.</h1>
        <p>
          A phone-first web app. Verify once, see only the responses that cover your district, and follow your grant
          without visiting an office.
        </p>
        <ol className="recipient-context-steps">
          <li>
            <span>1</span> Verify identity and residence
          </li>
          <li>
            <span>2</span> Request the fixed grant in an active response
          </li>
          <li>
            <span>3</span> Follow review, signatures and payout
          </li>
        </ol>
        <div className="recipient-context-foot">
          <span className="demo-chip">
            <span className="demo-dot" /> Local demo · fictional data
          </span>
          <a href="#/staff/login">Staff workspace →</a>
        </div>
      </aside>
      <div className={`recipient-phone ${signedIn ? "is-app" : ""}`}>{children}</div>
    </div>
  );
}

/* --------------------------------------------------------------- sign in */

function RecipientSignIn() {
  const { refresh } = useSession();
  const toast = useToast();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [personas, setPersonas] = useState<Array<{ id: string; name: string; phone: string }>>([]);

  useEffect(() => {
    api
      .personas()
      .then((value) => setPersonas(value.recipients))
      .catch(() => undefined);
  }, []);

  async function requestCode() {
    setBusy(true);
    setError(null);
    try {
      const result = await api.requestOtp(phone);
      setPhone(result.phone);
      setDevCode(result.devCode);
      setStep("code");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not send a code.");
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setBusy(true);
    setError(null);
    try {
      await api.verifyOtp(phone, code);
      await refresh();
      navigate("/help");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not verify the code.");
    } finally {
      setBusy(false);
    }
  }

  async function demo(persona: { id: string; name: string }) {
    setBusy(true);
    try {
      await api.demoLogin({ userId: persona.id });
      await refresh();
      navigate("/help");
    } catch (cause) {
      toast.push(cause instanceof ApiError ? cause.message : "Demo sign in failed.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="recipient-signin">
      <div className="recipient-signin-brand">
        <img src={mark} alt="" width={46} height={46} />
        <span>ReliefVue</span>
      </div>
      <div className="recipient-signin-head">
        <p className="eyebrow">Disaster relief · Thailand</p>
        <h1>{step === "phone" ? "Get help on your phone." : "Enter the code."}</h1>
        <p>
          {step === "phone"
            ? "Sign in with a Thai mobile number. In this local build, use a fictional number and the code shown on screen."
            : `We sent a six-digit code to ${phone}.`}
        </p>
      </div>

      {step === "phone" ? (
        <div className="recipient-form">
          <Field label="Mobile number" hint="Thai mobile number, for example 081 234 5678.">
            {(id) => (
              <Input
                id={id}
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="081 234 5678"
                autoComplete="tel"
              />
            )}
          </Field>
          {error ? <div className="error-note">{error}</div> : null}
          <Button size="lg" loading={busy} disabled={phone.replace(/\D/g, "").length < 9} onClick={() => void requestCode()}>
            Send code <ArrowRight size={16} />
          </Button>
        </div>
      ) : (
        <div className="recipient-form">
          {devCode ? (
            <button type="button" className="dev-code" onClick={() => setCode(devCode)}>
              <span>Demo code</span>
              <strong>{devCode}</strong>
              <small>Tap to fill</small>
            </button>
          ) : null}
          <Field label="Six-digit code">
            {(id) => (
              <Input
                id={id}
                inputMode="numeric"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                className="code-input"
                autoComplete="one-time-code"
                placeholder="000000"
              />
            )}
          </Field>
          {error ? <div className="error-note">{error}</div> : null}
          <Button size="lg" loading={busy} disabled={code.length !== 6} onClick={() => void verify()}>
            Continue <ArrowRight size={16} />
          </Button>
          <button type="button" className="text-btn" onClick={() => setStep("phone")}>
            Use a different number
          </button>
        </div>
      )}

      <div className="signin-prep">
        <span className="signin-prep-title">What you will need</span>
        <ul>
          <li>Thai national ID, or passport and TM30 for foreign residents</li>
          <li>An address reference: utility bill, lease or local attestation</li>
          <li>A PromptPay number, or a Solana wallet address</li>
        </ul>
      </div>

      <div className="recipient-privacy">
        <ShieldCheck size={15} />
        <p>Only the operating team can see your identity and address. The public ledger shows totals, never your name.</p>
      </div>

      {personas.length > 0 ? (
        <div className="recipient-demo">
          <span>Or open a demo household</span>
          <div className="recipient-demo-list">
            {personas.map((persona) => (
              <button key={persona.id} type="button" disabled={busy} onClick={() => void demo(persona)}>
                {persona.name}
                <small>{persona.phone}</small>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------- onboarding */

function Onboarding({ onDone }: { onDone: () => Promise<void> }) {
  const toast = useToast();
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [identityType, setIdentityType] = useState<"thai" | "foreign">("thai");
  const [fullName, setFullName] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [tm30Ref, setTm30Ref] = useState("");
  const [addressEvidenceType, setAddressEvidenceType] = useState("utility_bill");
  const [addressEvidenceRef, setAddressEvidenceRef] = useState("");

  const [province, setProvince] = useState("Chiang Mai");
  const [district, setDistrict] = useState("");
  const [subdistrict, setSubdistrict] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [members, setMembers] = useState("3");
  const [incomeBand, setIncomeBand] = useState<string>(INCOME_BANDS[0]);

  const [walletAddress, setWalletAddress] = useState("");
  const [cashoutMethod, setCashoutMethod] = useState<"wallet" | "promptpay">("promptpay");
  const [promptpayPhone, setPromptpayPhone] = useState("");

  useEffect(() => {
    api
      .meta()
      .then(setMeta)
      .catch(() => undefined);
  }, []);

  const canContinue =
    step === 1
      ? fullName.trim().length >= 2 &&
        identityNumber.trim().length >= 6 &&
        addressEvidenceRef.trim().length >= 4 &&
        (identityType === "thai" || tm30Ref.trim().length >= 6)
      : step === 2
        ? district.trim().length >= 2 && subdistrict.trim().length >= 2 && addressLine.trim().length >= 4
        : cashoutMethod === "wallet" || promptpayPhone.replace(/\D/g, "").length >= 9;

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await api.saveProfile({
        fullName,
        identityType,
        identityNumber,
        tm30Ref,
        addressEvidenceType,
        addressEvidenceRef,
        province,
        district,
        subdistrict,
        addressLine,
        members: Number(members),
        incomeBand,
        walletAddress,
        cashoutMethod,
        promptpayPhone,
      });
      toast.push("Household verified in the local demo.", "success");
      await onDone();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not save your details.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="onboarding">
      <header className="onboarding-head">
        <a href="#/" className="onboarding-brand">
          <img src={mark} alt="" width={34} height={34} />
          <span>ReliefVue</span>
        </a>
        <span className="onboarding-demo">Local demo</span>
      </header>

      <div className="onboarding-progress" aria-label={`Step ${step} of 3`}>
        {[1, 2, 3].map((item) => (
          <span key={item} className={item <= step ? "active" : ""} />
        ))}
      </div>

      <div className="onboarding-copy">
        <p className="eyebrow">Step {step} of 3</p>
        <h1>{step === 1 ? "Who is asking for help?" : step === 2 ? "Where do you live?" : "How should we send it?"}</h1>
        <p>
          {step === 1
            ? "Use the name on your documents. One household can hold one account per disaster response."
            : step === 2
              ? "Your verified district must be on the affected list for a response."
              : "A fixed grant is paid after review and two executive signatures."}
        </p>
      </div>

      {step === 1 ? (
        <div className="onboarding-form">
          <div className="identity-toggle" role="tablist" aria-label="Identity document">
            <button type="button" role="tab" aria-selected={identityType === "thai"} className={identityType === "thai" ? "active" : ""} onClick={() => setIdentityType("thai")}>
              Thai national
            </button>
            <button type="button" role="tab" aria-selected={identityType === "foreign"} className={identityType === "foreign" ? "active" : ""} onClick={() => setIdentityType("foreign")}>
              Foreign resident
            </button>
          </div>

          <Field label="Full name">
            {(id) => <Input id={id} value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Name on the document" autoComplete="name" />}
          </Field>

          <Field
            label={identityType === "thai" ? "Thai national ID" : "Passport or alien ID"}
            hint={identityType === "thai" ? "13 digits. Checked with the official checksum." : "Document number, 6–20 characters."}
          >
            {(id) => (
              <Input
                id={id}
                inputMode={identityType === "thai" ? "numeric" : "text"}
                value={identityNumber}
                onChange={(event) => setIdentityNumber(identityType === "thai" ? event.target.value.replace(/\D/g, "").slice(0, 13) : event.target.value.toUpperCase().slice(0, 20))}
                placeholder={identityType === "thai" ? "1 1017 00000 00 0" : "P1234567"}
              />
            )}
          </Field>

          {identityType === "foreign" ? (
            <Field label="TM30 receipt" hint="Filed by your landlord or host. Used as corroboration, not as the only address proof.">
              {(id) => <Input id={id} value={tm30Ref} onChange={(event) => setTm30Ref(event.target.value)} placeholder="TM30-2026-100123" />}
            </Field>
          ) : null}

          <Field label="Address evidence" hint="A utility bill, lease or local-authority attestation reference.">
            {(id) => (
              <div className="inline-fields">
                <Select
                  value={addressEvidenceType}
                  onChange={(event) => setAddressEvidenceType(event.target.value)}
                  aria-label="Address evidence type"
                >
                  <option value="utility_bill">Utility bill</option>
                  <option value="lease">Lease</option>
                  <option value="local_authority">Local authority attestation</option>
                  {identityType === "foreign" ? <option value="tm30">TM30 only (corroboration)</option> : null}
                </Select>
                <Input id={id} value={addressEvidenceRef} onChange={(event) => setAddressEvidenceRef(event.target.value)} placeholder="Reference or document number" />
              </div>
            )}
          </Field>

          <div className="recipient-note">
            <Info size={15} />
            <p>
              TM30 only exists for foreign residents. Thai nationals are verified with their national ID plus address
              evidence. This local build does not query DOPA or NDID.
            </p>
          </div>
        </div>
      ) : step === 2 ? (
        <div className="onboarding-form">
          <Field label="Province">
            {(id) => (
              <Select id={id} value={province} onChange={(event) => setProvince(event.target.value)}>
                {meta?.provinces.map((item) => (
                  <option key={item.en} value={item.en}>
                    {item.en} · {item.th}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <div className="inline-fields">
            <Field label="District">
              {(id) => <Input id={id} value={district} onChange={(event) => setDistrict(event.target.value)} placeholder="Mae Rim" />}
            </Field>
            <Field label="Subdistrict">
              {(id) => <Input id={id} value={subdistrict} onChange={(event) => setSubdistrict(event.target.value)} placeholder="San Phi Suea" />}
            </Field>
          </div>
          <Field label="House or unit address" hint="Kept private. Never shown on the public ledger.">
            {(id) => <Input id={id} value={addressLine} onChange={(event) => setAddressLine(event.target.value)} placeholder="House 12, Soi 4" autoComplete="street-address" />}
          </Field>
          <div className="inline-fields">
            <Field label="People in the household">
              {(id) => (
                <Select id={id} value={members} onChange={(event) => setMembers(event.target.value)}>
                  {Array.from({ length: 20 }, (_, index) => index + 1).map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Monthly income">
              {(id) => (
                <Select id={id} value={incomeBand} onChange={(event) => setIncomeBand(event.target.value)}>
                  {INCOME_BANDS.map((band) => (
                    <option key={band} value={band}>
                      {band}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
          <div className="recipient-note">
            <MapPin size={15} />
            <p>Your district is checked against each active response. If it is not listed, that response is not open to you.</p>
          </div>
        </div>
      ) : (
        <div className="onboarding-form">
          <div className="payout-choice">
            <button type="button" className={cashoutMethod === "promptpay" ? "active" : ""} onClick={() => setCashoutMethod("promptpay")}>
              <span className="payout-icon">
                <Landmark size={18} />
              </span>
              <span>
                <strong>PromptPay</strong>
                <small>Baht to your mobile number. Requires our bank/PSP partner.</small>
              </span>
              {cashoutMethod === "promptpay" ? <Check size={16} /> : null}
            </button>
            <button type="button" className={cashoutMethod === "wallet" ? "active" : ""} onClick={() => setCashoutMethod("wallet")}>
              <span className="payout-icon">
                <Wallet size={18} />
              </span>
              <span>
                <strong>Solana wallet</strong>
                <small>Receive USDC. You can cash out later.</small>
              </span>
              {cashoutMethod === "wallet" ? <Check size={16} /> : null}
            </button>
          </div>

          {cashoutMethod === "promptpay" ? (
            <Field label="PromptPay mobile number" hint="The number registered with PromptPay.">
              {(id) => <Input id={id} inputMode="tel" value={promptpayPhone} onChange={(event) => setPromptpayPhone(event.target.value)} placeholder="081 234 5678" />}
            </Field>
          ) : (
            <Field label="Wallet address" hint="Leave blank and we will create a demo wallet for you." optional>
              {(id) => <Input id={id} value={walletAddress} onChange={(event) => setWalletAddress(event.target.value.trim())} placeholder="Paste a Solana address or leave blank" className="mono" />}
            </Field>
          )}

          <div className="review-box">
            <span className="review-title">Review</span>
            <dl>
              <div>
                <dt>Name</dt>
                <dd>{fullName || "—"}</dd>
              </div>
              <div>
                <dt>Identity</dt>
                <dd>{identityType === "thai" ? "Thai national ID" : "Foreign resident"}</dd>
              </div>
              <div>
                <dt>Residence</dt>
                <dd>
                  {subdistrict || "—"}, {district || "—"}, {province}
                </dd>
              </div>
              <div>
                <dt>Payout</dt>
                <dd>{cashoutMethod === "promptpay" ? "PromptPay" : "USDC wallet"}</dd>
              </div>
            </dl>
          </div>

          <div className="recipient-note">
            <ShieldCheck size={15} />
            <p>Verification is simulated in this local build. Production needs a DOPA/NDID-authorised identity channel.</p>
          </div>
        </div>
      )}

      {error ? <div className="error-note">{error}</div> : null}

      <div className="onboarding-actions">
        {step > 1 ? (
          <Button variant="ghost" onClick={() => setStep(step - 1)}>
            <ArrowLeft size={15} /> Back
          </Button>
        ) : (
          <span />
        )}
        {step < 3 ? (
          <Button disabled={!canContinue} onClick={() => setStep(step + 1)}>
            Continue <ArrowRight size={15} />
          </Button>
        ) : (
          <Button loading={busy} disabled={!canContinue} onClick={() => void submit()}>
            Finish verification
          </Button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- home */

function RecipientHome({ route }: { route: string }) {
  const { user, household, refresh } = useSession();
  const toast = useToast();
  const [home, setHome] = useState<RecipientHome | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setHome(await api.recipientHome());
      setError(null);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not load your account.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, route]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 20_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const tab = TABS.find((item) => item.route === route)?.route ?? "/help";

  if (!user || !household) return null;

  if (loading) {
    return (
      <div className="recipient-app-body">
        <Spinner label="Loading your household" />
      </div>
    );
  }

  return (
    <div className="recipient-app">
      <header className="recipient-topbar">
        <a href="#/help" className="recipient-topbar-brand">
          <img src={mark} alt="" width={28} height={28} />
          <span>ReliefVue</span>
        </a>
        <div className="recipient-topbar-right">
          <span className="recipient-province">
            <MapPin size={12} /> {household.province}
          </span>
          <a href="#/help/profile" className="recipient-avatar" aria-label="Your profile">
            {firstName(household.fullName).slice(0, 1)}
          </a>
        </div>
      </header>

      <div className="recipient-app-body">
        {error ? <div className="error-note">{error}</div> : null}
        {!home ? null : tab === "/help" ? (
          <HomeTab home={home} household={household} />
        ) : tab === "/help/request" ? (
          <RequestTab home={home} reload={load} />
        ) : tab === "/help/activity" ? (
          <ActivityTab home={home} reload={load} />
        ) : (
          <ProfileTab household={household} home={home} />
        )}
      </div>

      <nav className="recipient-nav" aria-label="Recipient sections">
        {TABS.map((item) => {
          const Icon = item.icon;
          return (
            <a key={item.route} href={`#${item.route}`} className={tab === item.route ? "active" : ""} aria-current={tab === item.route ? "page" : undefined}>
              <Icon size={19} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}

function HomeTab({ home, household }: { home: RecipientHome; household: Household }) {
  const application = home.applications[0];
  const payout = application ? home.payouts.find((item) => item.applicationId === application.id) : undefined;
  const eligible = home.activations.filter((activation) => activation.eligible);

  return (
    <div className="recipient-home">
      <section className="recipient-greeting">
        <p>
          Sawasdee, <strong>{firstName(household.fullName)}</strong>
        </p>
        <div className="verified-line">
          <BadgeCheck size={15} /> Identity verified <span>·</span> {household.district}
        </div>
      </section>

      {application ? (
        <section className={`recipient-status-card status-${application.status}`}>
          <div className="status-card-top">
            <span className="status-card-kicker">Your request</span>
            <StatusBadge value={application.status} />
          </div>
          <h2>{application.activationTitle}</h2>
          <div className="status-amount">
            <strong>{thb(application.grantThb)}</strong>
            <span>{application.reference}</span>
          </div>
          <Timeline status={application.status} />
          {application.status === "needs_info" ? (
            <div className="status-card-action">
              <p>{application.decisionReason ?? "The team needs more information."}</p>
              <a className="btn btn-primary btn-sm" href="#/help/request">
                Update request <ArrowRight size={14} />
              </a>
            </div>
          ) : null}
          {application.status === "rejected" ? (
            <div className="status-card-action muted">
              <p>{application.decisionReason ?? "This request was not approved."}</p>
            </div>
          ) : null}
          {payout && application.status === "paid" ? (
            <div className="status-card-action">
              <p>
                {payout.asset === "THB"
                  ? `Sent to PromptPay ${payout.destination}.`
                  : `${assetAmount(payout.amountAsset, payout.asset)} sent to your wallet.`}
              </p>
              {payout.asset !== "THB" && !payout.cashoutStatus ? (
                <CashoutActions payout={payout} onDone={() => window.location.reload()} />
              ) : null}
            </div>
          ) : null}
        </section>
      ) : eligible.length > 0 ? (
        <section className="recipient-callout">
          <span className="callout-icon">
            <HandCoins size={20} />
          </span>
          <div>
            <h2>A response covers your district.</h2>
            <p>
              {eligible[0].title} · fixed grant {thb(eligible[0].grantThb)} per household.
            </p>
            <a className="btn btn-primary btn-sm" href="#/help/request">
              Request support <ArrowRight size={14} />
            </a>
          </div>
        </section>
      ) : (
        <section className="recipient-callout muted">
          <span className="callout-icon">
            <ShieldCheck size={20} />
          </span>
          <div>
            <h2>No active response covers you yet.</h2>
            <p>Your account is ready. When a response is activated for {household.district}, it will appear here.</p>
          </div>
        </section>
      )}

      <section className="recipient-section">
        <div className="recipient-section-head">
          <h3>Open responses</h3>
          <a href="#/help/request">See all</a>
        </div>
        {home.activations.length === 0 ? (
          <p className="recipient-empty">There is no active disaster response today.</p>
        ) : (
          <div className="response-mini-list">
            {home.activations.slice(0, 3).map((activation) => (
              <div className={`response-mini ${activation.eligible ? "" : "disabled"}`} key={activation.id}>
                <span className="response-mini-icon">
                  <MapPin size={15} />
                </span>
                <span className="response-mini-main">
                  <strong>{activation.title}</strong>
                  <small>{activation.eligible ? `${activation.districts.length} districts · ${thb(activation.grantThb)} grant` : activation.ineligibleReason}</small>
                </span>
                {activation.existingApplication ? <StatusBadge value={activation.existingApplication.status} /> : activation.eligible ? <ChevronRight size={16} /> : <span className="mini-locked">Not eligible</span>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="wallet-card">
        <div className="wallet-head">
          <span className="wallet-icon">
            <Wallet size={18} />
          </span>
          <div>
            <strong>Your wallet</strong>
            <small>{household.cashoutMethod === "promptpay" ? "PromptPay preferred" : "USDC wallet"}</small>
          </div>
          <CopyButton value={household.walletAddress} label="Copy" />
        </div>
        <code className="wallet-address">{household.walletAddress}</code>
        <div className="wallet-meta">
          <span>
            <strong>{thb(home.payouts.filter((item) => item.status === "sent").reduce((sum, item) => sum + item.amountThb, 0))}</strong>
            <small>received</small>
          </span>
          <span>
            <strong>{home.payouts.filter((item) => item.status === "sent").length}</strong>
            <small>payouts</small>
          </span>
        </div>
      </section>

      <section className="recipient-help">
        <h3>How your grant works</h3>
        <ol>
          <li>
            <span>1</span>
            <p>
              <strong>One request per response.</strong> Your household cannot request the same grant twice.
            </p>
          </li>
          <li>
            <span>2</span>
            <p>
              <strong>A reviewer checks your details.</strong> Residence and duplicate checks use your verified record.
            </p>
          </li>
          <li>
            <span>3</span>
            <p>
              <strong>Two executives sign the payout.</strong> Then it is sent to PromptPay or your wallet.
            </p>
          </li>
        </ol>
      </section>
    </div>
  );
}

function Timeline({ status }: { status: ApplicationStatus }) {
  const steps = [
    { key: "submitted", label: "Submitted" },
    { key: "review", label: "Reviewed" },
    { key: "approved", label: "Signatures" },
    { key: "paid", label: "Paid" },
  ];
  const order: Record<ApplicationStatus, number> = {
    submitted: 0,
    needs_info: 1,
    approved: 2,
    rejected: 1,
    paid: 3,
  };
  const current = status === "paid" ? steps.length : order[status];
  return (
    <div className={`timeline status-timeline ${status === "rejected" ? "rejected" : ""}`}>
      {steps.map((step, index) => (
        <div key={step.key} className={`timeline-node ${index < current ? "done" : index === current ? "current" : ""}`}>
          <span className="timeline-dot">{index < current ? <Check size={10} /> : null}</span>
          <span>{step.label}</span>
        </div>
      ))}
    </div>
  );
}

function CashoutActions({ payout, onDone }: { payout: Payout; onDone: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function cashout(method: "promptpay" | "wallet") {
    setBusy(true);
    try {
      await api.cashout(payout.id, method);
      toast.push(method === "promptpay" ? "Cash-out requested to PromptPay (demo)." : "Funds stay in your wallet.", "success");
      onDone();
    } catch (cause) {
      toast.push(cause instanceof ApiError ? cause.message : "Could not update cash-out.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cashout-actions">
      <Button size="sm" loading={busy} onClick={() => void cashout("promptpay")}>
        <Banknote size={14} /> Cash out to PromptPay
      </Button>
      <Button size="sm" variant="ghost" onClick={() => void cashout("wallet")}>
        Keep in wallet
      </Button>
    </div>
  );
}

function RequestTab({ home, reload }: { home: RecipientHome; reload: () => Promise<void> }) {
  const toast = useToast();
  const [selected, setSelected] = useState<RecipientActivation | null>(null);
  const [note, setNote] = useState("");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      await api.submitApplication({ activationId: selected.id, evidenceNote: note, evidenceRef: reference });
      toast.push("Request submitted. A reviewer will check it.", "success");
      await reload();
      navigate("/help");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not submit the request.");
    } finally {
      setBusy(false);
    }
  }

  if (selected) {
    return (
      <div className="recipient-request">
        <button type="button" className="back-link" onClick={() => setSelected(null)}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="request-head">
          <p className="eyebrow">Request support</p>
          <h1>{selected.title}</h1>
          <p>
            {selected.province} · {thb(selected.grantThb)} fixed grant
          </p>
        </div>
        <div className="request-eligibility">
          <div>
            <Check size={14} /> Identity verified
          </div>
          <div>
            <Check size={14} /> Your district is on the list
          </div>
          <div>
            <Check size={14} /> No request yet for this response
          </div>
        </div>
        <Field label="What happened?" hint="Describe the damage in your own words. Do not include ID numbers.">
          {(id) => (
            <Textarea id={id} rows={5} value={note} onChange={(event) => setNote(event.target.value)} maxLength={800} placeholder="Water entered the ground floor and the family slept upstairs for two nights." />
          )}
        </Field>
        <Field label="Photo or document name" hint="Optional. Uploads are not wired in this local build." optional>
          {(id) => <Input id={id} value={reference} onChange={(event) => setReference(event.target.value)} placeholder="photo-flood-01.jpg" />}
        </Field>
        <div className="recipient-note">
          <Info size={15} />
          <p>Submitting does not guarantee a grant. A reviewer checks residence and duplicate rules.</p>
        </div>
        {error ? <div className="error-note">{error}</div> : null}
        <Button size="lg" loading={busy} disabled={note.trim().length < 10} onClick={() => void submit()}>
          Submit request <ArrowRight size={16} />
        </Button>
      </div>
    );
  }

  return (
    <div className="recipient-request">
      <div className="request-head">
        <p className="eyebrow">Available support</p>
        <h1>Request a grant</h1>
        <p>Only responses that include your verified district are open to you.</p>
      </div>
      {home.activations.length === 0 ? (
        <div className="recipient-empty-card">
          <ShieldCheck size={24} />
          <h3>No active response</h3>
          <p>There is nothing to request right now. Your account stays ready.</p>
        </div>
      ) : (
        <div className="request-list">
          {home.activations.map((activation) => (
            <article className={`request-card ${activation.eligible ? "" : "disabled"}`} key={activation.id}>
              <div className="request-card-head">
                <span className="request-icon">
                  <MapPin size={16} />
                </span>
                <div>
                  <strong>{activation.title}</strong>
                  <small>{activation.province}</small>
                </div>
                <span className="request-grant">{thb(activation.grantThb)}</span>
              </div>
              <p className="request-districts">{activation.districts.join(" · ")}</p>
              {activation.existingApplication ? (
                <div className="request-existing">
                  <StatusBadge value={activation.existingApplication.status} />
                  <span>{activation.existingApplication.reference}</span>
                </div>
              ) : activation.eligible ? (
                <Button size="sm" onClick={() => setSelected(activation)}>
                  Request {thb(activation.grantThb)} <ArrowRight size={14} />
                </Button>
              ) : (
                <p className="request-ineligible">{activation.ineligibleReason}</p>
              )}
            </article>
          ))}
        </div>
      )}
      {!home.activations.some((activation) => activation.eligible) ? (
        <div className="recipient-note">
          <Info size={15} />
          <p>
            Nothing else is open to your district right now. Your existing request stays visible in{" "}
            <a href="#/help/activity" style={{ fontWeight: 600 }}>Activity</a>.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function ActivityTab({ home, reload }: { home: RecipientHome; reload: () => Promise<void> }) {
  void reload;
  return (
    <div className="recipient-activity">
      <div className="request-head">
        <p className="eyebrow">Your record</p>
        <h1>Activity</h1>
        <p>Requests and payouts for this household.</p>
      </div>
      {home.applications.length === 0 ? (
        <div className="recipient-empty-card">
          <ClipboardList size={24} />
          <h3>No requests yet</h3>
          <p>When you request a grant it will appear here with its status.</p>
          <a className="btn btn-primary btn-sm" href="#/help/request">
            Find a response
          </a>
        </div>
      ) : (
        <div className="activity-list">
          {home.applications.map((application: Application) => {
            const payout = home.payouts.find((item) => item.applicationId === application.id);
            return (
              <article className="activity-card" key={application.id}>
                <div className="activity-card-top">
                  <div>
                    <strong>{application.activationTitle}</strong>
                    <small>{application.reference}</small>
                  </div>
                  <StatusBadge value={application.status} />
                </div>
                <div className="activity-card-meta">
                  <span>{thb(application.grantThb)}</span>
                  <span>{application.district}</span>
                  <span>{ago(application.submittedAt)}</span>
                </div>
                {payout ? (
                  <div className="activity-payout">
                    <span className={`asset-badge asset-${payout.asset.toLowerCase()}`}>{payout.asset.slice(0, 1)}</span>
                    <span>
                      <strong>{payout.asset === "THB" ? thb(payout.amountThb) : assetAmount(payout.amountAsset, payout.asset)}</strong>
                      <small>{payout.asset === "THB" ? `PromptPay ${payout.destination}` : "Wallet payout"}</small>
                    </span>
                    <StatusBadge value={payout.status} />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProfileTab({ household, home }: { household: Household; home: RecipientHome }) {
  const { signOut } = useSession();
  const toast = useToast();
  const payouts = home.payouts.filter((item) => item.status === "sent");
  const received = payouts.reduce((sum, item) => sum + item.amountThb, 0);

  return (
    <div className="recipient-profile">
      <div className="profile-head">
        <span className="profile-avatar">{firstName(household.fullName).slice(0, 1)}</span>
        <h1>{household.fullName}</h1>
        <p>
          {household.phone} · {household.province}
        </p>
        <StatusBadge value={household.kycStatus} />
      </div>

      <section className="profile-card">
        <h3>Identity</h3>
        <dl>
          <div>
            <dt>Document</dt>
            <dd>{household.identityType === "thai" ? "Thai national ID" : "Foreign resident"}</dd>
          </div>
          <div>
            <dt>Number</dt>
            <dd className="mono">•••••••••{household.identityLast4}</dd>
          </div>
          {household.tm30Ref ? (
            <div>
              <dt>TM30</dt>
              <dd>{household.tm30Ref}</dd>
            </div>
          ) : null}
          <div>
            <dt>Address evidence</dt>
            <dd>
              {household.addressEvidenceRef}
              <small>{household.addressEvidenceType.replace("_", " ")}</small>
            </dd>
          </div>
        </dl>
        <p className="profile-note">Verified in the local demo only. Not connected to DOPA or NDID.</p>
      </section>

      <section className="profile-card">
        <h3>Household</h3>
        <dl>
          <div>
            <dt>Address</dt>
            <dd>
              {household.addressLine}, {household.subdistrict}, {household.district}
            </dd>
          </div>
          <div>
            <dt>People</dt>
            <dd>{household.members}</dd>
          </div>
          <div>
            <dt>Income</dt>
            <dd>{household.incomeBand}</dd>
          </div>
        </dl>
      </section>

      <section className="profile-card">
        <h3>Payout</h3>
        <dl>
          <div>
            <dt>Preference</dt>
            <dd>{household.cashoutMethod === "promptpay" ? "PromptPay" : "USDC wallet"}</dd>
          </div>
          <div>
            <dt>Wallet</dt>
            <dd className="mono">{shortWallet(household.walletAddress)}</dd>
          </div>
          <div>
            <dt>Received</dt>
            <dd>{thb(received)}</dd>
          </div>
        </dl>
      </section>

      <section className="profile-card profile-help">
        <h3>Need to correct something?</h3>
        <p>
          In this build, sign out and open a fresh demo household to test another path. In production, corrections would
          go through a staff review without creating a second account.
        </p>
      </section>

      <Button
        variant="secondary"
        onClick={async () => {
          await signOut();
          toast.push("Signed out.", "success");
          navigate("/help");
        }}
      >
        Sign out
      </Button>

      <a className="profile-staff-link" href="#/">
        About ReliefVue
      </a>
    </div>
  );
}
