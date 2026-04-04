import { useEffect } from "react";
import AppRouter from "./Routes/AppRouter";
import { useAppDispatch } from "./store/hooks";
import { initializeAuth } from "./store/authSlice";
import { ProjectsProvider } from "./Pages/Projects/ProjectsContext";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <ProjectsProvider>
      <AppRouter />
    </ProjectsProvider>
  );
}

export default App;
