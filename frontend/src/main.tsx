import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider, useAuth } from "./auth";
import { DataProvider } from "./data";
import { SettingsProvider } from "./hooks/useSettings";
import { Login } from "./pages/Login";
import "./index.css";

// O DataProvider só existe depois do login, então os dados só são buscados com token.
function Gate() {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-8 text-[13px] text-neutral-500">Carregando...</p>;
  if (!user) return <Login />;
  return (
    <DataProvider>
      <App />
    </DataProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <Gate />
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
