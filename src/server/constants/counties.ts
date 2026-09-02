/**
 * The 41 Romanian counties plus the municipality of București.
 * Used to validate order billing/delivery counties server-side.
 */
export const COUNTIES = [
  "Alba",
  "Arad",
  "Argeș",
  "Bacău",
  "Bihor",
  "Bistrița-Năsăud",
  "Botoșani",
  "Brașov",
  "Brăila",
  "Buzău",
  "Caraș-Severin",
  "Călărași",
  "Cluj",
  "Constanța",
  "Covasna",
  "Dâmbovița",
  "Dolj",
  "Galați",
  "Giurgiu",
  "Gorj",
  "Harghita",
  "Hunedoara",
  "Ialomița",
  "Iași",
  "Ilfov",
  "Maramureș",
  "Mehedinți",
  "Mureș",
  "Neamț",
  "Olt",
  "Prahova",
  "Satu Mare",
  "Sălaj",
  "Sibiu",
  "Suceava",
  "Teleorman",
  "Timiș",
  "Tulcea",
  "Vaslui",
  "Vâlcea",
  "Vrancea",
  "București",
] as const;

export type County = (typeof COUNTIES)[number];

const COUNTY_SET = new Set<string>(COUNTIES);

export function isValidCounty(value: string): value is County {
  return COUNTY_SET.has(value);
}

/** Auto-registration / SoftPro county codes (judet), keyed by county name. */
export const COUNTY_CODE: Record<string, string> = {
  Alba: "AB", Arad: "AR", Argeș: "AG", Bacău: "BC", Bihor: "BH",
  "Bistrița-Năsăud": "BN", Botoșani: "BT", Brașov: "BV", Brăila: "BR",
  Buzău: "BZ", "Caraș-Severin": "CS", Călărași: "CL", Cluj: "CJ",
  Constanța: "CT", Covasna: "CV", Dâmbovița: "DB", Dolj: "DJ", Galați: "GL",
  Giurgiu: "GR", Gorj: "GJ", Harghita: "HR", Hunedoara: "HD", Ialomița: "IL",
  Iași: "IS", Ilfov: "IF", Maramureș: "MM", Mehedinți: "MH", Mureș: "MS",
  Neamț: "NT", Olt: "OT", Prahova: "PH", "Satu Mare": "SM", Sălaj: "SJ",
  Sibiu: "SB", Suceava: "SV", Teleorman: "TR", Timiș: "TM", Tulcea: "TL",
  Vaslui: "VS", Vâlcea: "VL", Vrancea: "VN", București: "B",
};

export function countyCode(name: string): string {
  return COUNTY_CODE[name] ?? "";
}
