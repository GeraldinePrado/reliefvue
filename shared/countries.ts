/**
 * Southeast Asia footprint.
 *
 * ReliefVue is built as a Southeast Asian network that operates country by
 * country. Thailand is the only operational country while the Devnet prototype
 * is being tested; every other entry is a placeholder that records what a new
 * country will need before it can be switched on.
 *
 * A country is not "supported" because it has a translation. It becomes
 * operational when it has an identity scheme, a payout rail, an operating
 * organisation and a legal basis. Keep those four together here.
 */

export type CountryCode = "TH" | "VN" | "KH" | "LA" | "ID" | "MY" | "PH" | "SG" | "MM" | "BN" | "TL";

export type CountryStatus = "operational" | "planned";

export interface CountryProfile {
  readonly code: CountryCode;
  readonly name: string;
  readonly nativeName: string;
  /** ISO 4217 code the grant is denominated in. */
  readonly currency: string;
  /** Locale used by default for this country's interface. */
  readonly primaryLocale: string;
  readonly status: CountryStatus;
  /** How a household proves identity in this country, once configured. */
  readonly identity: string;
  /** How money reaches a household in this country, once configured. */
  readonly payoutRail: string;
}

export const COUNTRIES: readonly CountryProfile[] = [
  {
    code: "TH",
    name: "Thailand",
    nativeName: "ประเทศไทย",
    currency: "THB",
    primaryLocale: "th",
    status: "operational",
    identity: "Thai national ID checksum + address evidence; passport + TM30 + address evidence for foreign residents",
    payoutRail: "PromptPay (THB) or USDC wallet",
  },
  {
    code: "VN",
    name: "Vietnam",
    nativeName: "Việt Nam",
    currency: "VND",
    primaryLocale: "vi",
    status: "planned",
    identity: "Not configured",
    payoutRail: "Not configured",
  },
  {
    code: "KH",
    name: "Cambodia",
    nativeName: "កម្ពុជា",
    currency: "KHR",
    primaryLocale: "km",
    status: "planned",
    identity: "Not configured",
    payoutRail: "Not configured",
  },
  {
    code: "LA",
    name: "Laos",
    nativeName: "ລາວ",
    currency: "LAK",
    primaryLocale: "lo",
    status: "planned",
    identity: "Not configured",
    payoutRail: "Not configured",
  },
  {
    code: "ID",
    name: "Indonesia",
    nativeName: "Indonesia",
    currency: "IDR",
    primaryLocale: "id",
    status: "planned",
    identity: "Not configured",
    payoutRail: "Not configured",
  },
  {
    code: "MY",
    name: "Malaysia",
    nativeName: "Malaysia",
    currency: "MYR",
    primaryLocale: "ms",
    status: "planned",
    identity: "Not configured",
    payoutRail: "Not configured",
  },
  {
    code: "PH",
    name: "Philippines",
    nativeName: "Pilipinas",
    currency: "PHP",
    primaryLocale: "fil",
    status: "planned",
    identity: "Not configured",
    payoutRail: "Not configured",
  },
  {
    code: "SG",
    name: "Singapore",
    nativeName: "Singapore",
    currency: "SGD",
    primaryLocale: "en",
    status: "planned",
    identity: "Not configured",
    payoutRail: "Not configured",
  },
  {
    code: "MM",
    name: "Myanmar",
    nativeName: "မြန်မာ",
    currency: "MMK",
    primaryLocale: "my",
    status: "planned",
    identity: "Not configured",
    payoutRail: "Not configured",
  },
  {
    code: "BN",
    name: "Brunei",
    nativeName: "Brunei",
    currency: "BND",
    primaryLocale: "ms",
    status: "planned",
    identity: "Not configured",
    payoutRail: "Not configured",
  },
  {
    code: "TL",
    name: "Timor-Leste",
    nativeName: "Timor-Leste",
    currency: "USD",
    primaryLocale: "tet",
    status: "planned",
    identity: "Not configured",
    payoutRail: "Not configured",
  },
];

export const OPERATIONAL_COUNTRY: CountryProfile = COUNTRIES[0]!;

export function countryByCode(code: string): CountryProfile | undefined {
  return COUNTRIES.find((country) => country.code === code);
}
