import type { Company } from "../types/company";

const ADDR =
  "เลขที่ 7 ซอยเฉลิมพระเกียรติ ร.9 48 แยก 9 ถนนเฉลิมพระเกียรติ ร.9 แขวงดอกไม้ เขตประเวศ กรุงเทพฯ 10250";

export function createSeedCompanies(): Company[] {
  return [
    {
      id: "co-1",
      storeName: "บริษัท มณีสูรย์ กรุ๊ป จำกัด",
      details: ADDR,
      manager: "นายจรูญศักดิ์ พวกขุนทด",
    },
    {
      id: "co-2",
      storeName: "บริษัท มณีสูรย์ ซัพพลาย จำกัด",
      details: ADDR,
      manager: "นายจรูญศักดิ์ พวกขุนทด",
    },
  ];
}
