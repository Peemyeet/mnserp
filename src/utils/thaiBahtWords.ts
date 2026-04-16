/** แปลงจำนวนเงินบาทเป็นจำนวนเต็ม → ข้อความภาษาไทย (บาทถ้วน) */
export function integerBahtToThaiWords(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) return "";
  const n = Math.floor(amount);
  if (n === 0) return "ศูนย์บาทถ้วน";

  const ones = [
    "",
    "หนึ่ง",
    "สอง",
    "สาม",
    "สี่",
    "ห้า",
    "หก",
    "เจ็ด",
    "แปด",
    "เก้า",
  ];
  const tens = [
    "",
    "สิบ",
    "ยี่สิบ",
    "สามสิบ",
    "สี่สิบ",
    "ห้าสิบ",
    "หกสิบ",
    "เจ็ดสิบ",
    "แปดสิบ",
    "เก้าสิบ",
  ];

  function threeDigits(x: number): string {
    if (x === 0) return "";
    const hundred = Math.floor(x / 100);
    const rem = x % 100;
    let s = "";
    if (hundred > 0) {
      s += hundred === 1 ? "หนึ่งร้อย" : `${ones[hundred]}ร้อย`;
    }
    if (rem === 0) return s;
    const ten = Math.floor(rem / 10);
    const one = rem % 10;
    if (ten === 0) {
      s += hundred && one === 1 ? "เอ็ด" : ones[one];
      return s;
    }
    if (ten === 1) {
      if (one === 0) s += "สิบ";
      else if (one === 1) s += "สิบเอ็ด";
      else s += `สิบ${ones[one]}`;
      return s;
    }
    s += tens[ten];
    if (one === 1) s += "เอ็ด";
    else if (one > 1) s += ones[one];
    return s;
  }

  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const rest = n % 1000;

  let out = "";
  if (millions > 0) out += `${threeDigits(millions)}ล้าน`;
  if (thousands > 0) out += `${threeDigits(thousands)}พัน`;
  out += threeDigits(rest);

  return `${out}บาทถ้วน`;
}
