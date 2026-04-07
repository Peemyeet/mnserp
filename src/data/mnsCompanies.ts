export type MnsCompanyOption = { key: string; label: string };

export const MNS_COMPANY_OPTIONS: MnsCompanyOption[] = [
  { key: "mns-group", label: "บริษัท มณีสูรย์ กรุ๊ป จำกัด" },
  { key: "mns-supply", label: "บริษัท มณีสูรย์ ซัพพลาย จำกัด" },
];

export function mnsCompanyLabel(key: string): string {
  return MNS_COMPANY_OPTIONS.find((c) => c.key === key)?.label ?? "";
}
