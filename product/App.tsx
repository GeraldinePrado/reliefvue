import { useEffect, type ReactNode } from "react";
import { isStaff, navigate, useRoute, useSession, SessionProvider } from "./lib/session";
import { ToastProvider } from "./components/ui";
import { LandingPage } from "./pages/Landing";
import { GivePage } from "./pages/Give";
import { LedgerPage } from "./pages/Ledger";
import { StaffLoginPage } from "./pages/StaffLogin";
import { StaffOverviewPage } from "./pages/StaffOverview";
import { StaffApplicationsPage } from "./pages/StaffApplications";
import { StaffActivationsPage } from "./pages/StaffActivations";
import { StaffTreasuryPage } from "./pages/StaffTreasury";
import { StaffDonationsPage } from "./pages/StaffDonations";
import { StaffPartnersPage } from "./pages/StaffPartners";
import { StaffSettingsPage } from "./pages/StaffSettings";
import { RecipientApp } from "./pages/RecipientApp";
import { Spinner } from "./components/ui";

function StaffRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useSession();

  useEffect(() => {
    if (!loading && !isStaff(user)) navigate("/staff/login");
  }, [loading, user]);

  if (loading) return <Spinner label="Checking your session" />;
  if (!isStaff(user)) return <Spinner label="Redirecting to sign in" />;
  return <>{children}</>;
}

export function App() {
  const route = useRoute();

  if (route === "/" || route === "") return <LandingPage />;
  if (route === "/give") return <GivePage />;
  if (route === "/ledger") return <LedgerPage />;
  if (route === "/help" || route.startsWith("/help/")) return <RecipientApp />;
  if (route === "/staff/login") return <StaffLoginPage />;
  if (route === "/staff") {
    return (
      <StaffRoute>
        <StaffOverviewPage />
      </StaffRoute>
    );
  }
  if (route === "/staff/applications") {
    return (
      <StaffRoute>
        <StaffApplicationsPage />
      </StaffRoute>
    );
  }
  if (route === "/staff/activations") {
    return (
      <StaffRoute>
        <StaffActivationsPage />
      </StaffRoute>
    );
  }
  if (route === "/staff/treasury") {
    return (
      <StaffRoute>
        <StaffTreasuryPage />
      </StaffRoute>
    );
  }
  if (route === "/staff/donations") {
    return (
      <StaffRoute>
        <StaffDonationsPage />
      </StaffRoute>
    );
  }
  if (route === "/staff/partners") {
    return (
      <StaffRoute>
        <StaffPartnersPage />
      </StaffRoute>
    );
  }
  if (route === "/staff/settings") {
    return (
      <StaffRoute>
        <StaffSettingsPage />
      </StaffRoute>
    );
  }

  return (
    <div className="not-found">
      <p className="eyebrow">404</p>
      <h1>That page does not exist.</h1>
      <a className="btn btn-primary" href="#/">
        Back to ReliefVue
      </a>
    </div>
  );
}

export function Root() {
  return (
    <SessionProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </SessionProvider>
  );
}
