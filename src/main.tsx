import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CompaniesProvider } from "./context/CompaniesContext";
import { CustomersProvider } from "./context/CustomersContext";
import { ItSupportProvider } from "./context/ItSupportContext";
import { JobsProvider } from "./context/JobsContext";
import { MnsConnectionProvider } from "./context/MnsConnectionContext";
import { OrgSettingsProvider } from "./context/OrgSettingsContext";

const baseUrl = import.meta.env.BASE_URL;

/**
 * GitHub Pages โปรเจกต์ — React Router แนะนำ HashRouter เพราะไม่ต้องพึ่ง
 * server rewrite ของ path (แก้หน้าขาวจาก history ไม่ตรง base)
 */
const useHashRouter =
  import.meta.env.PROD && baseUrl !== "/" && baseUrl !== "./";

const browserBasename = (() => {
  if (useHashRouter) return undefined;
  const trimmed = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  if (trimmed === "" || trimmed === "/") return undefined;
  return trimmed;
})();

function AppRouter({ children }: { children: ReactNode }) {
  if (useHashRouter) {
    return <HashRouter>{children}</HashRouter>;
  }
  return (
    <BrowserRouter basename={browserBasename}>{children}</BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppRouter>
      <MnsConnectionProvider>
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
      </MnsConnectionProvider>
    </AppRouter>
  </StrictMode>
);
