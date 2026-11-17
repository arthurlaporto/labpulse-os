import { NavLink } from "react-router-dom";
import { ClipboardList, FlaskConical, Folder, Hand, LayoutGrid, SlidersHorizontal, User, Wrench, Zap, type LucideIcon } from "lucide-react";
import { useAuth } from "../auth";

const items: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/", label: "Visão Geral", icon: LayoutGrid },
  { to: "/servicos", label: "Serviços", icon: Hand },
    { to: "/projetos", label: "Projetos", icon: Folder },
  { to: "/usuarios", label: "Usuários", icon: User },
  { to: "/laboratorios", label: "Laboratórios", icon: FlaskConical },
  { to: "/equipamentos", label: "Equipamentos", icon: Wrench },
  { to: "/manutencao", label: "Manutenção", icon: ClipboardList },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex h-[35px] items-center gap-2.5 rounded-md px-4 py-0.5 text-[13px] font-semibold transition-colors",
    "focus-visible:outline-2 focus-visible:outline-brand",
    isActive
      ? "bg-brand/10 text-brand"
      : "text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800",
  ].join(" ");

export function Sidebar() {
  const { user } = useAuth();
  const visiveis = items.filter((i) => i.to !== "/usuarios" || user?.tipoUsuario === "ADMINISTRADOR");
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col justify-between bg-white px-4 py-6 dark:bg-neutral-950">
      <div>
        <div className="mb-6 flex items-center gap-1.5 px-1">
          <span className="grid size-6 place-items-center rounded-md bg-brand text-white"><Zap size={14} /></span>
          <span className="text-[17px] font-extrabold tracking-tight">LabPulse OS</span>
        </div>
        <nav className="flex flex-col gap-2.5">
          {visiveis.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"} className={linkClass}>
              <Icon size={16} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
      <NavLink to="/configuracoes" className={linkClass}>
        <SlidersHorizontal size={16} strokeWidth={1.8} />
        Configurações
      </NavLink>
    </aside>
  );
}
