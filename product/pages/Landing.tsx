import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Check,
  ChevronRight,
  HandCoins,
  KeyRound,
  MapPin,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";
import type { LedgerSummary } from "../../shared/platform";
import { api } from "../lib/api";
import { thb } from "../lib/format";
import { Badge, Logo } from "../components/ui";
import elephant from "../assets/reliefvue-elephant.png";
import wavescape from "../assets/wavescape.jpg";

export function LandingPage() {
  const [ledger, setLedger] = useState<LedgerSummary | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .ledger()
      .then((value) => {
        if (alive) setLedger(value);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const activeCoverage = (ledger?.coverage ?? []).slice(0, 4);
  const reached = ledger?.coverage.filter((row) => row.paid > 0).length ?? 0;
  const listed = ledger?.coverage.length ?? 0;

  return (
    <div className="site">
      <header className="site-header">
        <a href="#/" className="brand-link" aria-label="ReliefVue home">
          <Logo />
        </a>
        <nav className="site-nav" aria-label="Main">
          <a href="#/ledger">Public ledger</a>
          <a href="#/give">Donate</a>
          <a href="#/staff/login">Staff workspace</a>
        </nav>
        <div className="site-actions">
          <a className="btn btn-ghost btn-sm" href="#/help">
            Get help
          </a>
          <a className="btn btn-dark btn-sm" href="#/give">
            Donate <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Thailand-first · province-level response</p>
            <h1>
              Relief that starts
              <br />
              before the water rises.
            </h1>
            <p className="hero-lede">
              A pre-funded relief reserve for verified households. One fixed grant per household, released only when an
              official response is active, approved by two executives and recorded on a public ledger.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary btn-lg" href="#/help">
                <Smartphone size={18} aria-hidden="true" /> Get help on your phone
              </a>
              <a className="btn btn-secondary btn-lg" href="#/give">
                Fund the reserve
              </a>
            </div>
            <ul className="hero-points">
              <li>
                <Check size={15} aria-hidden="true" /> Thailand only, for now
              </li>
              <li>
                <Check size={15} aria-hidden="true" /> Private evidence stays off-chain
              </li>
              <li>
                <Check size={15} aria-hidden="true" /> 2-of-3 signatures to release funds
              </li>
            </ul>
          </div>

          <div className="hero-panel">
            <div className="hero-panel-head">
              <div>
                <span className="panel-kicker">Active response</span>
                <h2>{activeCoverage[0]?.activationTitle ?? "Chiang Mai river flood response"}</h2>
                <p>
                  <MapPin size={14} aria-hidden="true" /> {activeCoverage[0]?.province ?? "Chiang Mai"} ·{" "}
                  {listed || 4} districts listed
                </p>
              </div>
              <span className="live-pill">
                <span aria-hidden="true" /> Live demo
              </span>
            </div>
            <div className="hero-panel-totals">
              <div>
                <span>Reserve</span>
                <strong>{ledger ? thb(ledger.totals.reserveThb) : "—"}</strong>
              </div>
              <div>
                <span>Households paid</span>
                <strong>{ledger?.totals.householdsPaid ?? "—"}</strong>
              </div>
              <div>
                <span>Districts reached</span>
                <strong>
                  {reached}/{listed || "—"}
                </strong>
              </div>
            </div>
            <div className="hero-coverage">
              {activeCoverage.length === 0 ? (
                <p className="muted-note">Connect the local API to see live response coverage.</p>
              ) : (
                activeCoverage.map((row) => (
                  <div key={`${row.activationId}-${row.district}`} className="hero-district">
                    <span className="hero-district-name">{row.district}</span>
                    <span className="hero-district-bar">
                      <span style={{ width: `${row.paid > 0 ? 100 : row.applications > 0 ? 38 : 6}%` }} />
                    </span>
                    <span className={`hero-district-state ${row.paid > 0 ? "ok" : row.applications > 0 ? "pending" : "none"}`}>
                      {row.paid > 0 ? `${row.paid} paid` : row.applications > 0 ? `${row.applications} in review` : "no requests yet"}
                    </span>
                  </div>
                ))
              )}
            </div>
            <a className="hero-panel-link" href="#/ledger">
              See the public ledger <ChevronRight size={15} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="doors" aria-labelledby="doors-title">
          <div className="doors-intro">
            <p className="eyebrow">One network, three front doors</p>
            <h2 id="doors-title">The same record, for the person giving, the person receiving and the team accountable.</h2>
          </div>
          <div className="door-grid">
            <article className="door door-recipient">
              <div className="door-head">
                <span className="door-icon">
                  <Smartphone size={20} />
                </span>
                <span className="door-number">01 · Recipient</span>
              </div>
              <h3>A phone-first claim, not a queue at a checkpoint.</h3>
              <p>
                Verify identity and residence once, see which responses cover your district, and follow the grant from
                review to payout.
              </p>
              <div className="door-screen" aria-hidden="true">
                <span className="mini-label">Chiang Mai river flood</span>
                <strong>฿3,000</strong>
                <span className="mini-bar">
                  <span style={{ width: "72%" }} />
                </span>
                <span className="mini-status">Approved · awaiting signatures</span>
              </div>
              <a href="#/help" className="door-link">
                Open the recipient app <ArrowRight size={16} />
              </a>
            </article>

            <article className="door door-staff">
              <div className="door-head">
                <span className="door-icon">
                  <ShieldCheck size={20} />
                </span>
                <span className="door-number">02 · Staff</span>
              </div>
              <h3>Review evidence, watch coverage gaps, sign every payout.</h3>
              <p>
                Applications, duplicates and district reach in one workspace. No single executive can move the reserve
                alone.
              </p>
              <div className="door-screen door-screen-staff" aria-hidden="true">
                <span className="mini-label">Approval queue</span>
                <div className="mini-row">
                  <span>RV-P-3003 · Mae Rim</span>
                  <strong>1 / 2</strong>
                </div>
                <div className="mini-row">
                  <span>RV-P-3004 · Saraphi</span>
                  <strong>2 / 2 sent</strong>
                </div>
                <div className="mini-row mini-row-muted">
                  <span>Hang Dong</span>
                  <strong>no payout yet</strong>
                </div>
              </div>
              <a href="#/staff/login" className="door-link">
                Sign in to the workspace <ArrowRight size={16} />
              </a>
            </article>

            <article className="door door-partner">
              <div className="door-head">
                <span className="door-icon">
                  <Bot size={20} />
                </span>
                <span className="door-number">03 · Partner</span>
              </div>
              <h3>Let another organisation run relief on the same rails.</h3>
              <p>
                A read-only REST and MCP surface for NGOs, community groups and local government desks — coverage,
                activation and ledger facts, never household records.
              </p>
              <div className="door-screen door-screen-code" aria-hidden="true">
                <span className="code-dim">POST</span> /api/v1/mcp
                <br />
                <span className="code-dim">tool</span> list_unreached_districts
                <br />
                <span className="code-dim">→</span> ["Hang Dong", "Saraphi"]
              </div>
              <a href="#/staff/partners" className="door-link">
                Partner access &amp; API keys <ArrowRight size={16} />
              </a>
            </article>
          </div>
        </section>

        <section className="fairness">
          <div className="fairness-copy">
            <p className="eyebrow">Designed for the household that cannot travel</p>
            <h2>Reach is measured by district, not by who arrived first.</h2>
            <p>
              A response is activated for named districts in one province. Every application is checked against that
              list, and the dashboard shows which districts still have no paid household. The fixed grant is the same
              for every eligible household, so the fund is not split by whoever queues earliest.
            </p>
            <div className="fairness-points">
              <div>
                <BadgeCheck size={18} aria-hidden="true" />
                <div>
                  <strong>One household, one grant</strong>
                  <span>A national ID or passport can hold one household account per response.</span>
                </div>
              </div>
              <div>
                <Users size={18} aria-hidden="true" />
                <div>
                  <strong>Private evidence, public totals</strong>
                  <span>Identity, TM30 and address evidence stay off-chain; the ledger shows money and reach.</span>
                </div>
              </div>
              <div>
                <KeyRound size={18} aria-hidden="true" />
                <div>
                  <strong>Two signatures, separate roles</strong>
                  <span>A reviewer approves the household; two executives sign the payout.</span>
                </div>
              </div>
            </div>
          </div>
          <div className="fairness-card">
            <div className="fairness-card-head">
              <span>Coverage check · Chiang Mai</span>
              <Badge tone="coral">Fairness signal</Badge>
            </div>
            <div className="coverage-demo">
              <div>
                <span>Mae Rim</span>
                <strong>3 paid</strong>
                <span className="cov-bar">
                  <i style={{ width: "100%" }} />
                </span>
              </div>
              <div>
                <span>Saraphi</span>
                <strong>1 paid</strong>
                <span className="cov-bar">
                  <i style={{ width: "42%" }} />
                </span>
              </div>
              <div className="attention">
                <span>Hang Dong</span>
                <strong>0 paid</strong>
                <span className="cov-bar">
                  <i style={{ width: "8%" }} />
                </span>
              </div>
              <div className="attention">
                <span>Chang Phueak</span>
                <strong>0 paid</strong>
                <span className="cov-bar">
                  <i style={{ width: "8%" }} />
                </span>
              </div>
            </div>
            <p className="fairness-note">
              Districts with requests but no payout are flagged for follow-up — the case for a local partner or a field
              visit, not another queue.
            </p>
          </div>
        </section>

        <section className="give-band">
          <img src={wavescape} alt="" className="give-band-art" />
          <div className="give-band-inner">
            <img src={elephant} alt="ReliefVue elephant mark" className="give-band-mark" />
            <div>
              <p className="eyebrow">The reserve is the product</p>
              <h2>Fund the quiet months, so the response does not wait for a headline.</h2>
              <p>
                Donate SOL, USDC or baht. Volatile crypto can settle to USDC; baht donations stay in baht. Every
                contribution appears in the public ledger with a simulated or on-chain reference.
              </p>
              <div className="give-band-actions">
                <a className="btn btn-primary btn-lg" href="#/give">
                  <HandCoins size={18} /> Donate
                </a>
                <a className="btn btn-ghost btn-lg" href="#/ledger">
                  View the ledger
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <Logo />
          <p>Thailand-first disaster relief, built for province-level operations and country-by-country expansion.</p>
        </div>
        <div className="footer-cols">
          <div>
            <span>Use</span>
            <a href="#/help">Recipient app</a>
            <a href="#/give">Donate</a>
            <a href="#/ledger">Public ledger</a>
          </div>
          <div>
            <span>Operate</span>
            <a href="#/staff/login">Staff workspace</a>
            <a href="#/staff/partners">Partner API &amp; MCP</a>
          </div>
        </div>
        <div className="footer-legal">
          <span>Local prototype · simulated funds</span>
          <span>No real aid recipients or donated reserve.</span>
        </div>
      </footer>
    </div>
  );
}
