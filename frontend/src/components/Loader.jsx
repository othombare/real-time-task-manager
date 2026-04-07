import { Loader2Icon } from "lucide-react";
import { cn } from "../lib/utils";

function Loader({ label = "Loading...", className, size = 18 }) {
  return (
    <div className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <Loader2Icon size={size} className="animate-spin text-primary" />
      <span>{label}</span>
    </div>
  );
}

export default Loader;
