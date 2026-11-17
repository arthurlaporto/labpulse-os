import { useState, type FormEvent } from "react";
import { Zap } from "lucide-react";
import { ApiError } from "../api";
import { useAuth } from "../auth";

const input =
  "w-full rounded-md border border-neutral-200 bg-white px-2.5 py-2 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-neutral-700 dark:bg-neutral-950";

export function Login() {
  const { login, aviso } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      await login(email, senha);
    } catch (err) {
      setErro(err instanceof ApiError ? err.messages[0] : "Erro inesperado.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="grid h-full place-items-center px-4">
      <form onSubmit={enviar} className="flex w-full max-w-sm flex-col gap-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-md bg-brand text-white"><Zap size={18} /></span>
          <span className="text-2xl font-extrabold tracking-tight">LabPulse OS</span>
        </div>
        <p className="text-[15px]">Entre com seu e-mail institucional.</p>
        <div>
          <label htmlFor="email" className="mb-1 block text-[12px] font-semibold text-neutral-600 dark:text-neutral-300">E-mail</label>
          <input id="email" type="email" required autoComplete="username" className={input}
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="senha" className="mb-1 block text-[12px] font-semibold text-neutral-600 dark:text-neutral-300">Senha</label>
          <input id="senha" type="password" required autoComplete="current-password" className={input}
            value={senha} onChange={(e) => setSenha(e.target.value)} />
        </div>
        {aviso && !erro && (
          <p role="status" className="rounded-md bg-amber-50 px-3 py-2 text-[13px] text-amber-900 dark:bg-amber-950 dark:text-amber-200">{aviso}</p>
        )}
        {erro && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-[13px] text-red-800 dark:bg-red-950 dark:text-red-200">{erro}</p>
        )}
        <button type="submit" disabled={enviando}
          className="rounded-lg bg-brand px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
