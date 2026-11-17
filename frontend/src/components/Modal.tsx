import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface Props { title: string; hint?: string; onClose: () => void; children: ReactNode }

export function Modal({ title, hint, onClose, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" aria-label={title}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl dark:bg-neutral-900">
        <div className="flex items-start justify-between px-6 pt-5">
          <div>
            <h2 className="text-lg font-bold">{title}</h2>
            {hint && <p className="mt-0.5 text-[13px] text-neutral-500">{hint}</p>}
          </div>
          <button onClick={onClose} aria-label="Fechar"
            className="grid size-8 place-items-center rounded-md text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
