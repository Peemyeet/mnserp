export type Company = {
  id: string;
  storeName: string;
  details: string;
  manager: string;
};

export type CompanyInput = Omit<Company, "id">;
