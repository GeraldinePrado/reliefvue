import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_LOCALE, LOCALES, SELECTABLE_LOCALES, isLocaleCode, type LocaleCode } from "../../shared/locales";
import { th } from "../locales/th";

const DICTIONARIES: Partial<Record<LocaleCode, Record<string, string>>> = { th };
const STORAGE_KEY = "rv_locale";

/** Server-side status codes still need an interface label. */
const STATUS_SOURCE: Record<string, string> = {
  submitted: "Under review",
  needs_info: "Needs information",
  approved: "Awaiting signatures",
  awaiting_approvals: "Awaiting signatures",
  rejected: "Not approved",
  paid: "Paid",
  sent: "Sent",
  active: "Active",
  draft: "Draft",
  closed: "Closed",
  verified: "Verified",
  pending: "Pending",
  unverified: "Unverified",
};

interface I18nValue {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  /** Translate an English source string; unknown strings fall back to English. */
  t: (source: string, vars?: Record<string, string | number>) => string;
  /** Translate a server status code such as "needs_info". */
  status: (value: string) => string;
  /** Locale-aware "3 hours ago" text. */
  relativeTime: (iso: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function isSelectable(code: string): boolean {
  return SELECTABLE_LOCALES.some((locale) => locale.code === code);
}

function initialLocale(): LocaleCode {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && isLocaleCode(stored) && isSelectable(stored)) return stored;
  const browser = window.navigator.language.slice(0, 2).toLowerCase();
  return isLocaleCode(browser) && isSelectable(browser) ? browser : DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const setLocale = useCallback((next: LocaleCode) => {
    if (!isSelectable(next)) return;
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (source: string, vars?: Record<string, string | number>) => {
      let text = DICTIONARIES[locale]?.[source] ?? source;
      if (vars) {
        for (const [key, value] of Object.entries(vars)) {
          text = text.split(`{${key}}`).join(String(value));
        }
      }
      return text;
    },
    [locale],
  );

  const status = useCallback(
    (value: string) => t(STATUS_SOURCE[value] ?? value),
    [t],
  );

  const relativeTime = useCallback(
    (iso: string) => {
      const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
      const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
      if (seconds < 60) return formatter.format(-seconds, "second");
      const minutes = Math.round(seconds / 60);
      if (minutes < 60) return formatter.format(-minutes, "minute");
      const hours = Math.round(minutes / 60);
      if (hours < 24) return formatter.format(-hours, "hour");
      const days = Math.round(hours / 24);
      if (days < 30) return formatter.format(-days, "day");
      return new Date(iso).toLocaleDateString(locale, { day: "2-digit", month: "short" });
    },
    [locale],
  );

  const value = useMemo<I18nValue>(
    () => ({ locale, setLocale, t, status, relativeTime }),
    [locale, setLocale, t, status, relativeTime],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside LocaleProvider.");
  return value;
}

/**
 * Language picker. Shipped languages are selectable; the rest are visible but
 * disabled so the Southeast Asian footprint is explicit without pretending the
 * translations exist.
 */
export function LocalePicker({ id = "locale-picker" }: { id?: string }) {
  const { locale, setLocale } = useI18n();
  const shipped = LOCALES.filter((item) => item.status !== "planned");
  const planned = LOCALES.filter((item) => item.status === "planned");
  return (
    <select
      id={id}
      className="locale-picker"
      aria-label="Language"
      value={locale}
      onChange={(event) => setLocale(event.target.value as LocaleCode)}
    >
      {shipped.map((item) => (
        <option key={item.code} value={item.code}>
          {item.nativeName}
        </option>
      ))}
      {planned.map((item) => (
        <option key={item.code} value={item.code} disabled>
          {item.nativeName} — {item.englishName}
        </option>
      ))}
    </select>
  );
}
