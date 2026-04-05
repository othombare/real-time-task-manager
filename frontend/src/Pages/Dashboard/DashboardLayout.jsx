import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

function DashboardLayout({ children }) {
  // Keep the shell state here so every dashboard-style page feels identical.
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-dvh bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className="flex-1 flex flex-col min-w-0 min-h-dvh overflow-hidden">
        <Header sidebarCollapsed={collapsed} />
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-background/40 p-8 pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
