import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Household, Organisation, SessionUser } from "../../shared/platform";
import { api, type MeResponse } from "./api";

interface SessionValue {
  loading: boolean;
  user: SessionUser | null;
  org: Organisation | null;
  household: Household | null;
  demoMode: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const value = await api.me();
      setState(value);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not reach the API.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setState((current) => (current ? { ...current, user: null, household: null } : current));
    }
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      loading,
      user: state?.user ?? null,
      org: state?.org ?? null,
      household: state?.household ?? null,
      demoMode: state?.demoMode ?? true,
      error,
      refresh,
      signOut,
    }),
    [loading, state, error, refresh, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider");
  return value;
}

function readRoute(): string {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return "/";
  return raw.startsWith("/") ? raw : `/${raw}`;
}

export function useRoute(): string {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const onChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [route]);
  return route;
}

export function navigate(path: string): void {
  if (readRoute() === path) return;
  window.location.hash = path;
}

export function isStaff(user: SessionUser | null): boolean {
  return Boolean(user && user.role !== "recipient");
}
