import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { RequireAuth } from "./components/RequireAuth";
import { ChartOfAccountsPage } from "./pages/ChartOfAccountsPage";
import { CompanyNameSettingsPage } from "./pages/CompanyNameSettingsPage";
import { CustomerSettingsPage } from "./pages/CustomerSettingsPage";
import { HomePage } from "./pages/HomePage";
import { ItDashboardPage } from "./pages/ItDashboardPage";
import { ItReportPage } from "./pages/ItReportPage";
import { ApprovePage } from "./pages/ApprovePage";
import { CreateDocumentPage } from "./pages/CreateDocumentPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { DepartmentUnitSettingsPage } from "./pages/DepartmentUnitSettingsPage";
import { DivisionSettingsPage } from "./pages/DivisionSettingsPage";
import { AccountingBillNotePage } from "./pages/dept/AccountingBillNotePage";
import { AccountingReceiptPage } from "./pages/dept/AccountingReceiptPage";
import { AccountingTaxInvoicePage } from "./pages/dept/AccountingTaxInvoicePage";
import { DepartmentReportPage } from "./pages/dept/DepartmentReportPage";
import { DepartmentWorkPage } from "./pages/dept/DepartmentWorkPage";
import { ProductionDeptLanding } from "./pages/dept/ProductionDeptLanding";
import { ProductionDeptWork } from "./pages/dept/ProductionDeptWork";
import { PurchaseDeptLanding } from "./pages/dept/PurchaseDeptLanding";
import { PurchaseDeptWork } from "./pages/dept/PurchaseDeptWork";
import { SalesDeptLanding } from "./pages/dept/SalesDeptLanding";
import { SalesDeptWork } from "./pages/dept/SalesDeptWork";
import { SalesInputPage } from "./pages/SalesInputPage";
import { StageJobsPage } from "./pages/StageJobsPage";
import { WarehousePage } from "./pages/WarehousePage";
import { WarehouseSettingsPage } from "./pages/WarehouseSettingsPage";
import { LoginPage } from "./pages/LoginPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="it" element={<ItDashboardPage />} />
          <Route path="it/report" element={<ItReportPage />} />
          <Route path="approve" element={<ApprovePage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="documents/create/:kind" element={<CreateDocumentPage />} />
          <Route path="sales" element={<SalesInputPage />} />
          <Route path="stage/:stageCode" element={<StageJobsPage />} />
          <Route path="dept/accounting/invoice" element={<AccountingTaxInvoicePage />} />
          <Route path="dept/accounting/bill-note" element={<AccountingBillNotePage />} />
          <Route path="dept/accounting/receipt" element={<AccountingReceiptPage />} />
          <Route path="dept/production/work" element={<ProductionDeptWork />} />
          <Route path="dept/production" element={<ProductionDeptLanding />} />
          <Route path="dept/purchase/work" element={<PurchaseDeptWork />} />
          <Route path="dept/purchase" element={<PurchaseDeptLanding />} />
          <Route path="dept/sales/work" element={<SalesDeptWork />} />
          <Route path="dept/sales" element={<SalesDeptLanding />} />
          <Route path="dept/:deptId/report" element={<DepartmentReportPage />} />
          <Route path="dept/:deptId" element={<DepartmentWorkPage />} />
          <Route path="warehouse/:warehouseKind" element={<WarehousePage />} />
          <Route path="settings/customers" element={<CustomerSettingsPage />} />
          <Route
            path="settings/company-names"
            element={<CompanyNameSettingsPage />}
          />
          <Route path="settings/divisions" element={<DivisionSettingsPage />} />
          <Route
            path="settings/department-units"
            element={<DepartmentUnitSettingsPage />}
          />
          <Route
            path="settings/chart-of-accounts"
            element={<ChartOfAccountsPage />}
          />
          <Route path="settings/warehouses" element={<WarehouseSettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
