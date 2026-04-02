import AppRouter from "./Routes/AppRouter";
import { ProjectsProvider } from "./Pages/Projects/ProjectsContext";

function App() {
  return (
    <ProjectsProvider>
      <AppRouter />
    </ProjectsProvider>
  );
}

export default App;
