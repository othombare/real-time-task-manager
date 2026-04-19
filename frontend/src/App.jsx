import { useEffect } from "react";
import AppRouter from "./Routes/AppRouter";
import { applyTheme } from "./hooks/useTheme";
import { useAppDispatch } from "./store/hooks";
import { initializeAuth } from "./store/authSlice";
import { ProjectsProvider } from "./Pages/Projects/ProjectsContext";
import socket from "./lib/socket";
import useGlobalPresence from "./hooks/useGlobalPresence";

function App() {
  const dispatch = useAppDispatch();
  useGlobalPresence();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("themePreference");
      applyTheme(storedTheme === "dark" ? "dark" : "light");
    } catch {
      applyTheme("light");
    }
  }, []);

  useEffect(() => {
    const handleConnect = () => {
      console.log("Socket connected:", socket.id);
    };

    const handleConnectError = (error) => {
      console.error("Socket connect error:", error?.message || error);
    };

    const handleDisconnect = (reason) => {
      console.log("Socket disconnected:", reason);
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  return (
    <ProjectsProvider>
      <AppRouter />
    </ProjectsProvider>
  );
}

export default App;
