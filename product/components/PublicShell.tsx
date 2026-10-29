import type { ReactNode } from "react";
import { ArrowRight, Smartphone } from "lucide-react";
import { Logo } from "./ui";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="site public-site">
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
          <a className="btn btn-secondary btn-sm" href="#/help">
            <Smartphone size={15} aria-hidden="true" /> Get help
          </a>
          <a className="btn btn-dark btn-sm" href="#/give">
            Donate <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
      </header>
      <main className="public-main">{children}</main>
      <footer className="public-footer">
        <span>ReliefVue · Thailand-first disaster relief</span>
        <span>Local prototype · simulated funds · no real recipients</span>
      </footer>
    </div>
  );
}
