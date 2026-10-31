/**
 * Interface languages.
 *
 * "shipped" means the strings are complete and reviewed. "preview" means the
 * dictionary exists but coverage is partial, so untranslated strings fall back
 * to English. "planned" locales are listed so the picker can show what is
 * coming, but they cannot be selected.
 *
 * Add a locale only when the country it belongs to has an identity scheme and a
 * payout rail. Translating a flow the service cannot complete is worse than
 * leaving it in English.
 */

export type LocaleCode = "en" | "th" | "vi" | "km" | "lo" | "id" | "ms" | "fil" | "my" | "tet";

export type LocaleStatus = "shipped" | "preview" | "planned";

export interface LocaleProfile {
  readonly code: LocaleCode;
  readonly englishName: string;
  readonly nativeName: string;
  readonly status: LocaleStatus;
}

export const LOCALES: readonly LocaleProfile[] = [
  { code: "en", englishName: "English", nativeName: "English", status: "shipped" },
  { code: "th", englishName: "Thai", nativeName: "ไทย", status: "shipped" },
  { code: "vi", englishName: "Vietnamese", nativeName: "Tiếng Việt", status: "planned" },
  { code: "km", englishName: "Khmer", nativeName: "ខ្មែរ", status: "planned" },
  { code: "lo", englishName: "Lao", nativeName: "ລາວ", status: "planned" },
  { code: "id", englishName: "Indonesian", nativeName: "Bahasa Indonesia", status: "planned" },
  { code: "ms", englishName: "Malay", nativeName: "Bahasa Melayu", status: "planned" },
  { code: "fil", englishName: "Filipino", nativeName: "Filipino", status: "planned" },
  { code: "my", englishName: "Burmese", nativeName: "မြန်မာ", status: "planned" },
  { code: "tet", englishName: "Tetum", nativeName: "Tetum", status: "planned" },
];

export const DEFAULT_LOCALE: LocaleCode = "en";

export const SELECTABLE_LOCALES: readonly LocaleProfile[] = LOCALES.filter(
  (locale) => locale.status !== "planned",
);

export function isLocaleCode(value: string): value is LocaleCode {
  return LOCALES.some((locale) => locale.code === value);
}

export function localeByCode(code: string): LocaleProfile | undefined {
  return LOCALES.find((locale) => locale.code === code);
}
