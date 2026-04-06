import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CompaniesProvider } from "./context/CompaniesContext";
import { CustomersProvider } from "./context/CustomersContext";
import { ItSupportProvider } from "./context/ItSupportContext";
import { JobsProvider } from "./context/JobsContext";
import { OrgSettingsProvider } from "./context/OrgSettingsContext";

/** ต้องสอดคล้องกับ `base` ใน vite.config (GitHub Pages โฟลเดอร์โปรเจกต์) */
const routerBasename = (() => {
  const base = import.meta.env.BASE_URL;
  const trimmed = base.endsWith("/") ? base.slice(0, -1) : base;
  return trimmed === "" ? undefined : trimmed;
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <AuthProvider>
        <ItSupportProvider>
          <JobsProvider>
            <CustomersProvider>
              <CompaniesProvider>
                <OrgSettingsProvider>
                  <App />
                </OrgSettingsProvider>
              </CompaniesProvider>
            </CustomersProvider>
          </JobsProvider>
        </ItSupportProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
