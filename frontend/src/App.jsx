import { useEffect } from "react";
import AppRouter from "./Routes/AppRouter";
import { applyTheme } from "./hooks/useTheme";
import { useAppDispatch } from "./store/hooks";
import { initializeAuth } from "./store/authSlice";
import { ProjectsProvider } from "./Pages/Projects/ProjectsContext";

function App() {
  const dispatch = useAppDispatch();

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

  return (
    <ProjectsProvider>
      <AppRouter />
    </ProjectsProvider>
  );
}

export default App;
