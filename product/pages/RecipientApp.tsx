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
import { assetAmount, firstName, shortWallet, thb } from "../lib/format";
import { useI18n, LocalePicker } from "../lib/i18n";
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
  const { t } = useI18n();

  if (loading) {
    return (
      <RecipientFrame>
        <Spinner label={t("Opening ReliefVue")} />
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
          <h1>{t("This is the recipient app.")}</h1>
          <p>{t("You are signed in as staff. Open the operations workspace instead.")}</p>
          <a className="btn btn-primary" href="#/staff">
            {t("Go to staff workspace")}
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
  const { t } = useI18n();
  return (
    <div className="recipient-stage">
      <aside className="recipient-context">
        <a href="#/" className="recipient-context-brand">
          <img src={mark} alt="" width={42} height={42} />
          <span>
            <strong>ReliefVue</strong>
            <small>{t("Recipient app · Thailand")}</small>
          </span>
        </a>
        <h1>{t("The household side of the relief record.")}</h1>
        <p>
          {t(
            "A phone-first web app. Verify once, see only the responses that cover your district, and follow your grant without visiting an office.",
          )}
        </p>
        <ol className="recipient-context-steps">
          <li>
            <span>1</span> {t("Verify identity and residence")}
          </li>
          <li>
            <span>2</span> {t("Request the fixed grant in an active response")}
          </li>
          <li>
            <span>3</span> {t("Follow review, signatures and payout")}
          </li>
        </ol>
        <div className="recipient-context-foot">
          <span className="demo-chip">
            <span className="demo-dot" /> {t("Local demo · fictional data")}
          </span>
          <a href="#/staff/login">{t("Staff workspace →")}</a>
        </div>
      </aside>
      <div className={`recipient-phone ${signedIn ? "is-app" : ""}`}>{children}</div>
    </div>
  );
}

/* --------------------------------------------------------------- sign in */

function RecipientSignIn() {
  const { refresh } = useSession();
  const { t } = useI18n();
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
      setError(cause instanceof ApiError ? cause.message : t("Could not send a code."));
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
      setError(cause instanceof ApiError ? cause.message : t("Could not verify the code."));
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
      toast.push(cause instanceof ApiError ? cause.message : t("Demo sign in failed."), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="recipient-signin">
      <div className="recipient-signin-top">
        <div className="recipient-signin-brand">
          <img src={mark} alt="" width={46} height={46} />
          <span>ReliefVue</span>
        </div>
        <LocalePicker />
      </div>
      <div className="recipient-signin-head">
        <p className="eyebrow">{t("Disaster relief · Thailand")}</p>
        <h1>{step === "phone" ? t("Get help on your phone.") : t("Enter the code.")}</h1>
        <p>
          {step === "phone"
            ? t(
                "Sign in with a Thai mobile number. In this local build, use a fictional number and the code shown on screen.",
              )
            : t("We sent a six-digit code to {phone}.", { phone })}
        </p>
      </div>

      {step === "phone" ? (
        <div className="recipient-form">
          <Field label={t("Mobile number")} hint={t("Thai mobile number, for example 081 234 5678.")}>
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
            {t("Send code")} <ArrowRight size={16} />
          </Button>
        </div>
      ) : (
        <div className="recipient-form">
          {devCode ? (
            <button type="button" className="dev-code" onClick={() => setCode(devCode)}>
              <span>{t("Demo code")}</span>
              <strong>{devCode}</strong>
              <small>{t("Tap to fill")}</small>
            </button>
          ) : null}
          <Field label={t("Six-digit code")}>
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
            {t("Continue")} <ArrowRight size={16} />
          </Button>
          <button type="button" className="text-btn" onClick={() => setStep("phone")}>
            {t("Use a different number")}
          </button>
        </div>
      )}

      <div className="signin-prep">
        <span className="signin-prep-title">{t("What you will need")}</span>
        <ul>
          <li>{t("Thai national ID, or passport and TM30 for foreign residents")}</li>
          <li>{t("An address reference: utility bill, lease or local attestation")}</li>
          <li>{t("A PromptPay number, or a Solana wallet address")}</li>
        </ul>
      </div>

      <div className="recipient-privacy">
        <ShieldCheck size={15} />
        <p>
          {t(
            "Only the operating team can see your identity and address. The public ledger shows totals, never your name.",
          )}
        </p>
      </div>

      {personas.length > 0 ? (
        <div className="recipient-demo">
          <span>{t("Or open a demo household")}</span>
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
  const { t } = useI18n();
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
      toast.push(t("Household verified in the local demo."), "success");
      await onDone();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : t("Could not save your details."));
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
        <div className="recipient-signin-top">
          <LocalePicker id="onboarding-locale" />
          <span className="onboarding-demo">{t("Local demo")}</span>
        </div>
      </header>

      <div className="onboarding-progress" aria-label={t("Step {step} of 3", { step })}>
        {[1, 2, 3].map((item) => (
          <span key={item} className={item <= step ? "active" : ""} />
        ))}
      </div>

      <div className="onboarding-copy">
        <p className="eyebrow">{t("Step {step} of 3", { step })}</p>
        <h1>
          {step === 1 ? t("Who is asking for help?") : step === 2 ? t("Where do you live?") : t("How should we send it?")}
        </h1>
        <p>
          {step === 1
            ? t("Use the name on your documents. One household can hold one account per disaster response.")
            : step === 2
              ? t("Your verified district must be on the affected list for a response.")
              : t("A fixed grant is paid after review and two executive signatures.")}
        </p>
      </div>

      {step === 1 ? (
        <div className="onboarding-form">
          <div className="identity-toggle" role="tablist" aria-label={t("Identity document")}>
            <button type="button" role="tab" aria-selected={identityType === "thai"} className={identityType === "thai" ? "active" : ""} onClick={() => setIdentityType("thai")}>
              {t("Thai national")}
            </button>
            <button type="button" role="tab" aria-selected={identityType === "foreign"} className={identityType === "foreign" ? "active" : ""} onClick={() => setIdentityType("foreign")}>
              {t("Foreign resident")}
            </button>
          </div>

          <Field label={t("Full name")}>
            {(id) => <Input id={id} value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder={t("Name on the document")} autoComplete="name" />}
          </Field>

          <Field
            label={identityType === "thai" ? t("Thai national ID") : t("Passport or alien ID")}
            hint={identityType === "thai" ? t("13 digits. Checked with the official checksum.") : t("Document number, 6–20 characters.")}
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
            <Field label={t("TM30 receipt")} hint={t("Filed by your landlord or host. Used as corroboration, not as the only address proof.")}>
              {(id) => <Input id={id} value={tm30Ref} onChange={(event) => setTm30Ref(event.target.value)} placeholder="TM30-2026-100123" />}
            </Field>
          ) : null}

          <Field label={t("Address evidence")} hint={t("A utility bill, lease or local-authority attestation reference.")}>
            {(id) => (
              <div className="inline-fields">
                <Select
                  value={addressEvidenceType}
                  onChange={(event) => setAddressEvidenceType(event.target.value)}
                  aria-label={t("Address evidence type")}
                >
                  <option value="utility_bill">{t("Utility bill")}</option>
                  <option value="lease">{t("Lease")}</option>
                  <option value="local_authority">{t("Local authority attestation")}</option>
                  {identityType === "foreign" ? <option value="tm30">{t("TM30 only (corroboration)")}</option> : null}
                </Select>
                <Input id={id} value={addressEvidenceRef} onChange={(event) => setAddressEvidenceRef(event.target.value)} placeholder={t("Reference or document number")} />
              </div>
            )}
          </Field>

          <div className="recipient-note">
            <Info size={15} />
            <p>
              {t(
                "TM30 only exists for foreign residents. Thai nationals are verified with their national ID plus address evidence. This local build does not query DOPA or NDID.",
              )}
            </p>
          </div>
        </div>
      ) : step === 2 ? (
        <div className="onboarding-form">
          <Field label={t("Province")}>
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
            <Field label={t("District")}>
              {(id) => <Input id={id} value={district} onChange={(event) => setDistrict(event.target.value)} placeholder="Mae Rim" />}
            </Field>
            <Field label={t("Subdistrict")}>
              {(id) => <Input id={id} value={subdistrict} onChange={(event) => setSubdistrict(event.target.value)} placeholder="San Phi Suea" />}
            </Field>
          </div>
          <Field label={t("House or unit address")} hint={t("Kept private. Never shown on the public ledger.")}>
            {(id) => <Input id={id} value={addressLine} onChange={(event) => setAddressLine(event.target.value)} placeholder="House 12, Soi 4" autoComplete="street-address" />}
          </Field>
          <div className="inline-fields">
            <Field label={t("People in the household")}>
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
            <Field label={t("Monthly income")}>
              {(id) => (
                <Select id={id} value={incomeBand} onChange={(event) => setIncomeBand(event.target.value)}>
                  {INCOME_BANDS.map((band) => (
                    <option key={band} value={band}>
                      {t(band)}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
          <div className="recipient-note">
            <MapPin size={15} />
            <p>{t("Your district is checked against each active response. If it is not listed, that response is not open to you.")}</p>
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
                <strong>{t("PromptPay")}</strong>
                <small>{t("Baht to your mobile number. Requires our bank/PSP partner.")}</small>
              </span>
              {cashoutMethod === "promptpay" ? <Check size={16} /> : null}
            </button>
            <button type="button" className={cashoutMethod === "wallet" ? "active" : ""} onClick={() => setCashoutMethod("wallet")}>
              <span className="payout-icon">
                <Wallet size={18} />
              </span>
              <span>
                <strong>{t("Solana wallet")}</strong>
                <small>{t("Receive USDC. You can cash out later.")}</small>
              </span>
              {cashoutMethod === "wallet" ? <Check size={16} /> : null}
            </button>
          </div>

          {cashoutMethod === "promptpay" ? (
            <Field label={t("PromptPay mobile number")} hint={t("The number registered with PromptPay.")}>
              {(id) => <Input id={id} inputMode="tel" value={promptpayPhone} onChange={(event) => setPromptpayPhone(event.target.value)} placeholder="081 234 5678" />}
            </Field>
          ) : (
            <Field label={t("Wallet address")} hint={t("Leave blank and we will create a demo wallet for you.")} optional>
              {(id) => <Input id={id} value={walletAddress} onChange={(event) => setWalletAddress(event.target.value.trim())} placeholder={t("Paste a Solana address or leave blank")} className="mono" />}
            </Field>
          )}

          <div className="review-box">
            <span className="review-title">{t("Review")}</span>
            <dl>
              <div>
                <dt>{t("Name")}</dt>
                <dd>{fullName || "—"}</dd>
              </div>
              <div>
                <dt>{t("Identity")}</dt>
                <dd>{identityType === "thai" ? t("Thai national ID") : t("Foreign resident")}</dd>
              </div>
              <div>
                <dt>{t("Residence")}</dt>
                <dd>
                  {subdistrict || "—"}, {district || "—"}, {province}
                </dd>
              </div>
              <div>
                <dt>{t("Payout")}</dt>
                <dd>{cashoutMethod === "promptpay" ? t("PromptPay") : t("USDC wallet")}</dd>
              </div>
            </dl>
          </div>

          <div className="recipient-note">
            <ShieldCheck size={15} />
            <p>{t("Verification is simulated in this local build. Production needs a DOPA/NDID-authorised identity channel.")}</p>
          </div>
        </div>
      )}

      {error ? <div className="error-note">{error}</div> : null}

      <div className="onboarding-actions">
        {step > 1 ? (
          <Button variant="ghost" onClick={() => setStep(step - 1)}>
            <ArrowLeft size={15} /> {t("Back")}
          </Button>
        ) : (
          <span />
        )}
        {step < 3 ? (
          <Button disabled={!canContinue} onClick={() => setStep(step + 1)}>
            {t("Continue")} <ArrowRight size={15} />
          </Button>
        ) : (
          <Button loading={busy} disabled={!canContinue} onClick={() => void submit()}>
            {t("Finish verification")}
          </Button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- home */

function RecipientHome({ route }: { route: string }) {
  const { user, household, refresh } = useSession();
  const { t } = useI18n();
  const toast = useToast();
  const [home, setHome] = useState<RecipientHome | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setHome(await api.recipientHome());
      setError(null);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : t("Could not load your account."));
    } finally {
      setLoading(false);
    }
  }, [t]);

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
        <Spinner label={t("Loading your household")} />
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
          <LocalePicker id="app-locale" />
          <a href="#/help/profile" className="recipient-avatar" aria-label={t("Your profile")}>
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

      <nav className="recipient-nav" aria-label={t("Recipient sections")}>
        {TABS.map((item) => {
          const Icon = item.icon;
          return (
            <a key={item.route} href={`#${item.route}`} className={tab === item.route ? "active" : ""} aria-current={tab === item.route ? "page" : undefined}>
              <Icon size={19} />
              <span>{t(item.label)}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}

function HomeTab({ home, household }: { home: RecipientHome; household: Household }) {
  const { t, status } = useI18n();
  const application = home.applications[0];
  const payout = application ? home.payouts.find((item) => item.applicationId === application.id) : undefined;
  const eligible = home.activations.filter((activation) => activation.eligible);

  return (
    <div className="recipient-home">
      <section className="recipient-greeting">
        <p>
          {t("Sawasdee, {name}", { name: "" }).trim()} <strong>{firstName(household.fullName)}</strong>
        </p>
        <div className="verified-line">
          <BadgeCheck size={15} /> {t("Identity verified")} <span>·</span> {household.district}
        </div>
      </section>

      {application ? (
        <section className={`recipient-status-card status-${application.status}`}>
          <div className="status-card-top">
            <span className="status-card-kicker">{t("Your request")}</span>
            <StatusBadge value={application.status} label={status(application.status)} />
          </div>
          <h2>{application.activationTitle}</h2>
          <div className="status-amount">
            <strong>{thb(application.grantThb)}</strong>
            <span>{application.reference}</span>
          </div>
          <Timeline status={application.status} />
          {application.status === "needs_info" ? (
            <div className="status-card-action">
              <p>{application.decisionReason ?? t("The team needs more information.")}</p>
              <a className="btn btn-primary btn-sm" href="#/help/request">
                {t("Update request")} <ArrowRight size={14} />
              </a>
            </div>
          ) : null}
          {application.status === "rejected" ? (
            <div className="status-card-action muted">
              <p>{application.decisionReason ?? t("This request was not approved.")}</p>
            </div>
          ) : null}
          {payout && application.status === "paid" ? (
            <div className="status-card-action">
              <p>
                {payout.asset === "THB"
                  ? t("Sent to PromptPay {destination}.", { destination: payout.destination })
                  : t("{amount} sent to your wallet.", { amount: assetAmount(payout.amountAsset, payout.asset) })}
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
            <h2>{t("A response covers your district.")}</h2>
            <p>
              {t("{title} · fixed grant {amount} per household.", {
                title: eligible[0].title,
                amount: thb(eligible[0].grantThb),
              })}
            </p>
            <a className="btn btn-primary btn-sm" href="#/help/request">
              {t("Request support")} <ArrowRight size={14} />
            </a>
          </div>
        </section>
      ) : (
        <section className="recipient-callout muted">
          <span className="callout-icon">
            <ShieldCheck size={20} />
          </span>
          <div>
            <h2>{t("No active response covers you yet.")}</h2>
            <p>
              {t("Your account is ready. When a response is activated for {district}, it will appear here.", {
                district: household.district,
              })}
            </p>
          </div>
        </section>
      )}

      <section className="recipient-section">
        <div className="recipient-section-head">
          <h3>{t("Open responses")}</h3>
          <a href="#/help/request">{t("See all")}</a>
        </div>
        {home.activations.length === 0 ? (
          <p className="recipient-empty">{t("There is no active disaster response today.")}</p>
        ) : (
          <div className="response-mini-list">
            {home.activations.slice(0, 3).map((activation) => (
              <div className={`response-mini ${activation.eligible ? "" : "disabled"}`} key={activation.id}>
                <span className="response-mini-icon">
                  <MapPin size={15} />
                </span>
                <span className="response-mini-main">
                  <strong>{activation.title}</strong>
                  <small>
                    {activation.eligible
                      ? t("{count} districts · {amount} grant", {
                          count: activation.districts.length,
                          amount: thb(activation.grantThb),
                        })
                      : activation.ineligibleReason
                        ? t(activation.ineligibleReason)
                        : null}
                  </small>
                </span>
                {activation.existingApplication ? (
                  <StatusBadge
                    value={activation.existingApplication.status}
                    label={status(activation.existingApplication.status)}
                  />
                ) : activation.eligible ? (
                  <ChevronRight size={16} />
                ) : (
                  <span className="mini-locked">{t("Not eligible")}</span>
                )}
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
            <strong>{t("Your wallet")}</strong>
            <small>{household.cashoutMethod === "promptpay" ? t("PromptPay preferred") : t("USDC wallet")}</small>
          </div>
          <CopyButton value={household.walletAddress} label={t("Copy")} />
        </div>
        <code className="wallet-address">{household.walletAddress}</code>
        <div className="wallet-meta">
          <span>
            <strong>{thb(home.payouts.filter((item) => item.status === "sent").reduce((sum, item) => sum + item.amountThb, 0))}</strong>
            <small>{t("received")}</small>
          </span>
          <span>
            <strong>{home.payouts.filter((item) => item.status === "sent").length}</strong>
            <small>{t("payouts")}</small>
          </span>
        </div>
      </section>

      <section className="recipient-help">
        <h3>{t("How your grant works")}</h3>
        <ol>
          <li>
            <span>1</span>
            <p>
              <strong>{t("One request per response.")}</strong> {t("Your household cannot request the same grant twice.")}
            </p>
          </li>
          <li>
            <span>2</span>
            <p>
              <strong>{t("A reviewer checks your details.")}</strong> {t("Residence and duplicate checks use your verified record.")}
            </p>
          </li>
          <li>
            <span>3</span>
            <p>
              <strong>{t("Two executives sign the payout.")}</strong> {t("Then it is sent to PromptPay or your wallet.")}
            </p>
          </li>
        </ol>
      </section>
    </div>
  );
}

function Timeline({ status }: { status: ApplicationStatus }) {
  const { t } = useI18n();
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
          <span>{t(step.label)}</span>
        </div>
      ))}
    </div>
  );
}

function CashoutActions({ payout, onDone }: { payout: Payout; onDone: () => void }) {
  const { t } = useI18n();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function cashout(method: "promptpay" | "wallet") {
    setBusy(true);
    try {
      await api.cashout(payout.id, method);
      toast.push(
        method === "promptpay" ? t("Cash-out requested to PromptPay (demo).") : t("Funds stay in your wallet."),
        "success",
      );
      onDone();
    } catch (cause) {
      toast.push(cause instanceof ApiError ? cause.message : t("Could not update cash-out."), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cashout-actions">
      <Button size="sm" loading={busy} onClick={() => void cashout("promptpay")}>
        <Banknote size={14} /> {t("Cash out to PromptPay")}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => void cashout("wallet")}>
        {t("Keep in wallet")}
      </Button>
    </div>
  );
}

function RequestTab({ home, reload }: { home: RecipientHome; reload: () => Promise<void> }) {
  const { t, status } = useI18n();
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
      toast.push(t("Request submitted. A reviewer will check it."), "success");
      await reload();
      navigate("/help");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : t("Could not submit the request."));
    } finally {
      setBusy(false);
    }
  }

  if (selected) {
    return (
      <div className="recipient-request">
        <button type="button" className="back-link" onClick={() => setSelected(null)}>
          <ArrowLeft size={15} /> {t("Back")}
        </button>
        <div className="request-head">
          <p className="eyebrow">{t("Request support")}</p>
          <h1>{selected.title}</h1>
          <p>
            {selected.province} · {thb(selected.grantThb)} {t("fixed grant")}
          </p>
        </div>
        <div className="request-eligibility">
          <div>
            <Check size={14} /> {t("Identity verified")}
          </div>
          <div>
            <Check size={14} /> {t("Your district is on the list")}
          </div>
          <div>
            <Check size={14} /> {t("No request yet for this response")}
          </div>
        </div>
        <Field label={t("What happened?")} hint={t("Describe the damage in your own words. Do not include ID numbers.")}>
          {(id) => (
            <Textarea id={id} rows={5} value={note} onChange={(event) => setNote(event.target.value)} maxLength={800} placeholder="Water entered the ground floor and the family slept upstairs for two nights." />
          )}
        </Field>
        <Field label={t("Photo or document name")} hint={t("Optional. Uploads are not wired in this local build.")} optional>
          {(id) => <Input id={id} value={reference} onChange={(event) => setReference(event.target.value)} placeholder="photo-flood-01.jpg" />}
        </Field>
        <div className="recipient-note">
          <Info size={15} />
          <p>{t("Submitting does not guarantee a grant. A reviewer checks residence and duplicate rules.")}</p>
        </div>
        {error ? <div className="error-note">{error}</div> : null}
        <Button size="lg" loading={busy} disabled={note.trim().length < 10} onClick={() => void submit()}>
          {t("Submit request")} <ArrowRight size={16} />
        </Button>
      </div>
    );
  }

  return (
    <div className="recipient-request">
      <div className="request-head">
        <p className="eyebrow">{t("Available support")}</p>
        <h1>{t("Request a grant")}</h1>
        <p>{t("Only responses that include your verified district are open to you.")}</p>
      </div>
      {home.activations.length === 0 ? (
        <div className="recipient-empty-card">
          <ShieldCheck size={24} />
          <h3>{t("No active response")}</h3>
          <p>{t("There is nothing to request right now. Your account stays ready.")}</p>
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
                  <StatusBadge
                    value={activation.existingApplication.status}
                    label={status(activation.existingApplication.status)}
                  />
                  <span>{activation.existingApplication.reference}</span>
                </div>
              ) : activation.eligible ? (
                <Button size="sm" onClick={() => setSelected(activation)}>
                  {t("Request {amount}", { amount: thb(activation.grantThb) })} <ArrowRight size={14} />
                </Button>
              ) : (
                <p className="request-ineligible">
                  {activation.ineligibleReason ? t(activation.ineligibleReason) : null}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
      {!home.activations.some((activation) => activation.eligible) ? (
        <div className="recipient-note">
          <Info size={15} />
          <p>
            {t("Nothing else is open to your district right now. Your existing request stays visible in Activity.")}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function ActivityTab({ home, reload }: { home: RecipientHome; reload: () => Promise<void> }) {
  const { t, status, relativeTime } = useI18n();
  void reload;
  return (
    <div className="recipient-activity">
      <div className="request-head">
        <p className="eyebrow">{t("Your record")}</p>
        <h1>{t("Activity")}</h1>
        <p>{t("Requests and payouts for this household.")}</p>
      </div>
      {home.applications.length === 0 ? (
        <div className="recipient-empty-card">
          <ClipboardList size={24} />
          <h3>{t("No requests yet")}</h3>
          <p>{t("When you request a grant it will appear here with its status.")}</p>
          <a className="btn btn-primary btn-sm" href="#/help/request">
            {t("Find a response")}
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
                  <StatusBadge value={application.status} label={status(application.status)} />
                </div>
                <div className="activity-card-meta">
                  <span>{thb(application.grantThb)}</span>
                  <span>{application.district}</span>
                  <span>{relativeTime(application.submittedAt)}</span>
                </div>
                {payout ? (
                  <div className="activity-payout">
                    <span className={`asset-badge asset-${payout.asset.toLowerCase()}`}>{payout.asset.slice(0, 1)}</span>
                    <span>
                      <strong>{payout.asset === "THB" ? thb(payout.amountThb) : assetAmount(payout.amountAsset, payout.asset)}</strong>
                      <small>{payout.asset === "THB" ? `${t("PromptPay")} ${payout.destination}` : t("Wallet payout")}</small>
                    </span>
                    <StatusBadge value={payout.status} label={status(payout.status)} />
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
  const { t, status } = useI18n();
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
        <StatusBadge value={household.kycStatus} label={status(household.kycStatus)} />
      </div>

      <section className="profile-card">
        <h3>{t("Identity")}</h3>
        <dl>
          <div>
            <dt>{t("Document")}</dt>
            <dd>{household.identityType === "thai" ? t("Thai national ID") : t("Foreign resident")}</dd>
          </div>
          <div>
            <dt>{t("Number")}</dt>
            <dd className="mono">•••••••••{household.identityLast4}</dd>
          </div>
          {household.tm30Ref ? (
            <div>
              <dt>TM30</dt>
              <dd>{household.tm30Ref}</dd>
            </div>
          ) : null}
          <div>
            <dt>{t("Address evidence")}</dt>
            <dd>
              {household.addressEvidenceRef}
              <small>{household.addressEvidenceType.replace("_", " ")}</small>
            </dd>
          </div>
        </dl>
        <p className="profile-note">{t("Verified in the local demo only. Not connected to DOPA or NDID.")}</p>
      </section>

      <section className="profile-card">
        <h3>{t("Household")}</h3>
        <dl>
          <div>
            <dt>{t("Address")}</dt>
            <dd>
              {household.addressLine}, {household.subdistrict}, {household.district}
            </dd>
          </div>
          <div>
            <dt>{t("People")}</dt>
            <dd>{household.members}</dd>
          </div>
          <div>
            <dt>{t("Income")}</dt>
            <dd>{t(household.incomeBand)}</dd>
          </div>
        </dl>
      </section>

      <section className="profile-card">
        <h3>{t("Payout")}</h3>
        <dl>
          <div>
            <dt>{t("Preference")}</dt>
            <dd>{household.cashoutMethod === "promptpay" ? t("PromptPay") : t("USDC wallet")}</dd>
          </div>
          <div>
            <dt>{t("Wallet")}</dt>
            <dd className="mono">{shortWallet(household.walletAddress)}</dd>
          </div>
          <div>
            <dt>{t("Received")}</dt>
            <dd>{thb(received)}</dd>
          </div>
        </dl>
      </section>

      <section className="profile-card profile-help">
        <h3>{t("Need to correct something?")}</h3>
        <p>
          {t(
            "In this build, sign out and open a fresh demo household to test another path. In production, corrections would go through a staff review without creating a second account.",
          )}
        </p>
      </section>

      <Button
        variant="secondary"
        onClick={async () => {
          await signOut();
          toast.push(t("Signed out."), "success");
          navigate("/help");
        }}
      >
        {t("Sign out")}
      </Button>

      <a className="profile-staff-link" href="#/">
        {t("About ReliefVue")}
      </a>
    </div>
  );
}
