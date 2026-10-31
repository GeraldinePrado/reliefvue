import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  HandCoins,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Plug,
  Settings,
  Siren,
  Wallet,
  X,
} from "lucide-react";
import type { SessionUser } from "../../shared/platform";
import { navigate, useRoute, useSession } from "../lib/session";
import { Avatar, Badge, Logo } from "./ui";

interface NavItem {
  label: string;
  route: string;
  icon: ReactNode;
  count?: number;
}

const ROLE_LABEL: Record<string, string> = {
  admin: "Organisation admin",
  reviewer: "Reviewer",
  approver: "Executive approver",
  recipient: "Recipient",
};

export function StaffShell({
  title,
  description,
  actions,
  children,
  counts,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  counts?: { applications?: number; payouts?: number };
}) {
  const { user, org, demoMode, signOut } = useSession();
  const route = useRoute();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [route]);

  if (!user) return null;

  const nav: NavItem[] = [
    { label: "Overview", route: "/staff", icon: <LayoutDashboard size={18} /> },
    { label: "Applications", route: "/staff/applications", icon: <Inbox size={18} />, count: counts?.applications },
    { label: "Responses", route: "/staff/activations", icon: <Siren size={18} /> },
    { label: "Treasury", route: "/staff/treasury", icon: <Wallet size={18} />, count: counts?.payouts },
    { label: "Donations", route: "/staff/donations", icon: <HandCoins size={18} /> },
    { label: "Partner access", route: "/staff/partners", icon: <Plug size={18} /> },
    { label: "Settings", route: "/staff/settings", icon: <Settings size={18} /> },
  ];

  const active = (item: NavItem) =>
    item.route === "/staff" ? route === "/staff" : route === item.route || route.startsWith(`${item.route}/`);

  const navList = (
    <nav className="side-nav" aria-label="Staff sections">
      {nav.map((item) => (
        <a
          key={item.route}
          href={`#${item.route}`}
          className={`side-link ${active(item) ? "active" : ""}`}
          aria-current={active(item) ? "page" : undefined}
        >
          <span className="side-icon">{item.icon}</span>
          <span>{item.label}</span>
          {item.count ? <span className="side-count">{item.count}</span> : null}
        </a>
      ))}
    </nav>
  );

  return (
    <div className="staff-layout">
      <aside className={`staff-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="side-brand">
          <a href="#/" aria-label="ReliefVue home">
            <Logo light />
          </a>
          <button type="button" className="icon-btn side-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <div className="org-switcher">
          <span className="org-avatar">{org?.name.slice(0, 1) ?? "R"}</span>
          <span className="org-text">
            <strong>{org?.name ?? "ReliefVue"}</strong>
            <small>{org?.country ?? "Thailand"} operations</small>
          </span>
          <ArrowUpRight size={15} aria-hidden="true" />
        </div>
        {navList}
        <div className="side-foot">
          {demoMode ? (
            <span className="demo-chip">
              <span className="demo-dot" aria-hidden="true" /> Local demo · simulated funds
            </span>
          ) : null}
          <div className="side-user">
            <Avatar name={user.name} size="sm" />
            <span className="side-user-text">
              <strong>{user.name}</strong>
              <small>{ROLE_LABEL[user.role] ?? user.role}</small>
            </span>
            <button
              type="button"
              className="icon-btn icon-btn-light"
              title="Sign out"
              aria-label="Sign out"
              disabled={signingOut}
              onClick={async () => {
                setSigningOut(true);
                await signOut();
                navigate("/staff/login");
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      {menuOpen ? <button type="button" className="side-scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)} /> : null}

      <div className="staff-main">
        <header className="staff-topbar">
          <button type="button" className="icon-btn menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div className="topbar-heading">
            <h1>{title}</h1>
            {description ? <p>{description}</p> : null}
          </div>
          <div className="topbar-actions">
            {demoMode ? <Badge tone="violet">Demo data</Badge> : null}
            {actions}
            <div className="topbar-user">
              <Avatar name={user.name} size="sm" />
              <div>
                <strong>{user.name}</strong>
                <small>{ROLE_LABEL[user.role] ?? user.role}</small>
              </div>
            </div>
          </div>
        </header>
        <main className="staff-content">{children}</main>
      </div>
    </div>
  );
}

export function roleLabel(user: SessionUser): string {
  return ROLE_LABEL[user.role] ?? user.role;
}
