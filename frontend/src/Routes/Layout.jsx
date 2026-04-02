import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "../Pages/Dashboard/Header";
import { Sidebar } from "../Pages/Dashboard/Sidebar";

function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="flex-1 min-w-0">
        <Header sidebarCollapsed={collapsed} />
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
