import useProjects from "./useProjects";

export default function Projects() {
  const { projects, removeProject } = useProjects();

  return (
    <div>
      <h1>Projects</h1>

      {projects.map((project) => (
        <div key={project._id || project.id}>
          <h3>{project.name || project.title}</h3>

          <button onClick={() => removeProject(project._id || project.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
