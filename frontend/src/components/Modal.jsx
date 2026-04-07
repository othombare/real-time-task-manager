import { XIcon } from "lucide-react";
import Button from "./Button";
import { cn } from "../lib/utils";

function Modal({ isOpen, onClose, title, description, badge = "Create", children, className }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <div className={cn("flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-border bg-card shadow-2xl shadow-slate-950/10", className)}>
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">{badge}</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-10 w-10 rounded-xl border border-border p-0"
            aria-label="Close modal"
          >
            <XIcon size={18} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
