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
import { AccountingAccountReportPage } from "./pages/dept/AccountingAccountReportPage";
import { AccountingBillNotePage } from "./pages/dept/AccountingBillNotePage";
import { AccountingReceiptPage } from "./pages/dept/AccountingReceiptPage";
import { AccountingTaxInvoicePage } from "./pages/dept/AccountingTaxInvoicePage";
import { DepartmentReportPage } from "./pages/dept/DepartmentReportPage";
import { DepartmentWorkPage } from "./pages/dept/DepartmentWorkPage";
import { ProductionDeptLanding } from "./pages/dept/ProductionDeptLanding";
import { ProductionDeptWork } from "./pages/dept/ProductionDeptWork";
import { PurchaseDeptLanding } from "./pages/dept/PurchaseDeptLanding";
import { PurchaseDeptWork } from "./pages/dept/PurchaseDeptWork";
import { SalesRequirementsPage } from "./pages/dept/SalesRequirementsPage";
import { SalesDeptDashboardPage } from "./pages/dept/SalesDeptDashboardPage";
import { SalesDeptWork } from "./pages/dept/SalesDeptWork";
import { SalesRepairJobSheetPage } from "./pages/dept/SalesRepairJobSheetPage";
import { SalesQuotationListPage } from "./pages/dept/SalesQuotationListPage";
import { SalesPoArrivedPage } from "./pages/dept/SalesPoArrivedPage";
import { SalesPurchaseSystemPage } from "./pages/dept/SalesPurchaseSystemPage";
import { SalesRepairCompletedPage } from "./pages/dept/SalesRepairCompletedPage";
import { SalesWaitPoListPage } from "./pages/dept/SalesWaitPoListPage";
import { SalesSaleJobSheetPage } from "./pages/dept/SalesSaleJobSheetPage";
import { SalesInputPage } from "./pages/SalesInputPage";
import { StageJobsPage } from "./pages/StageJobsPage";
import { WarehousePage } from "./pages/WarehousePage";
import { WarehouseSettingsPage } from "./pages/WarehouseSettingsPage";
import { UserSettingsPage } from "./pages/UserSettingsPage";
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
          <Route
            path="dept/accounting/account-report"
            element={<AccountingAccountReportPage />}
          />
          <Route path="dept/production/work" element={<ProductionDeptWork />} />
          <Route path="dept/production" element={<ProductionDeptLanding />} />
          <Route path="dept/purchase/work" element={<PurchaseDeptWork />} />
          <Route path="dept/purchase" element={<PurchaseDeptLanding />} />
          <Route
            path="dept/sales/dashboard"
            element={<SalesDeptDashboardPage />}
          />
          <Route path="dept/sales/work" element={<SalesDeptWork />} />
          <Route
            path="dept/sales/work/job-sale"
            element={<SalesSaleJobSheetPage />}
          />
          <Route
            path="dept/sales/work/job-repair"
            element={<SalesRepairJobSheetPage />}
          />
          <Route
            path="dept/sales/requirements"
            element={<SalesRequirementsPage />}
          />
          <Route
            path="dept/sales/quotation/:slug"
            element={<SalesQuotationListPage />}
          />
          <Route
            path="dept/sales/wait-po/:bucket"
            element={<SalesWaitPoListPage />}
          />
          <Route
            path="dept/sales/po-arrived"
            element={<SalesPoArrivedPage />}
          />
          <Route
            path="dept/sales/purchase-system"
            element={<SalesPurchaseSystemPage />}
          />
          <Route
            path="dept/sales/repair-completed"
            element={<SalesRepairCompletedPage />}
          />
          <Route
            path="dept/sales"
            element={<Navigate to="/dept/sales/dashboard" replace />}
          />
          <Route path="dept/:deptId/report" element={<DepartmentReportPage />} />
          <Route path="dept/:deptId" element={<DepartmentWorkPage />} />
          <Route path="warehouse/:warehouseKind" element={<WarehousePage />} />
          <Route path="settings/customers" element={<CustomerSettingsPage />} />
          <Route path="settings/users" element={<UserSettingsPage />} />
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
