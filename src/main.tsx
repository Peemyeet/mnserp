import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CompaniesProvider } from "./context/CompaniesContext";
import { ItSupportProvider } from "./context/ItSupportContext";
import { CustomersProvider } from "./context/CustomersContext";
import { JobsProvider } from "./context/JobsContext";
import { OrgSettingsProvider } from "./context/OrgSettingsContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
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
