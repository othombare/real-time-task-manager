import { useContext } from "react";
import { ProjectsContext } from "./ProjectsContext";

export function useProjects() {
  return useContext(ProjectsContext);
}

export default useProjects;
