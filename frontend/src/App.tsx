import { Navigate, Route, Routes } from "react-router-dom";
import { EntityPage } from "./components/EntityPage";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { useData } from "./data";
import { entities } from "./entities";
import { Overview } from "./pages/Overview";
import { Settings } from "./pages/Settings";
import { useAuth } from "./auth"

export default function App() {
  const { error, reload } = useData();
  const { user } = useAuth();
  const admin = user?.tipoUsuario === "ADMINISTRADOR";
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
          {error && (
            <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-red-50 px-4 py-2.5 text-[13px] text-red-800 dark:bg-red-950 dark:text-red-200">
              <span>{error}</span>
              <button onClick={() => void reload()} className="font-semibold underline">Tentar de novo</button>
            </div>
          )}
          <Routes>
            <Route path="/" element={<Overview />} />
            {Object.values(entities).filter((e) => e.key !== "usuarios" || admin).map((e) => (
              <Route key={e.key} path={e.path} element={<EntityPage entity={e} />} />
            ))}
            <Route path="/configuracoes" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
