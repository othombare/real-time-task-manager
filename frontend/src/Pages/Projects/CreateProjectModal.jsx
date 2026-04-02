import { useState } from "react";
import { FolderPlusIcon, UsersIcon, XIcon } from "lucide-react";

const initialFormState = {
  title: "",
  description: "",
  stage: "Discovery",
  owner: "",
  members: "",
};

function CreateProjectModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState(initialFormState);

  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const title = form.title.trim();
    const description = form.description.trim();
    const owner = form.owner.trim();
    const members = form.members
      .split(",")
      .map((member) => member.trim())
      .filter(Boolean)
      .map((member) => member.slice(0, 2).toUpperCase());

    if (!title || !description || !owner || members.length === 0) {
      return;
    }

    onSubmit({
      title,
      description,
      stage: form.stage,
      owner,
      members,
    });

    setForm(initialFormState);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[28px] border border-border bg-card shadow-2xl shadow-slate-950/10">
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Create</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">New Project</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a project and give it its own Jira-style board.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border p-2 text-muted-foreground transition hover:border-primary/30 hover:text-primary"
            aria-label="Close create project form"
          >
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="project-title">
              Project title
            </label>
            <input
              id="project-title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="TaskVue Mobile App"
              className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="project-description">
              Description
            </label>
            <textarea
              id="project-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Summarize the initiative, scope, or delivery goal."
              className="min-h-28 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="project-stage">
                Stage
              </label>
              <select
                id="project-stage"
                name="stage"
                value={form.stage}
                onChange={handleChange}
                className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                <option>Discovery</option>
                <option>Sprint 1</option>
                <option>Sprint 2</option>
                <option>Sprint 3</option>
                <option>Build</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="project-owner">
                Owner
              </label>
              <input
                id="project-owner"
                name="owner"
                type="text"
                value={form.owner}
                onChange={handleChange}
                placeholder="Onkar"
                className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="project-members">
              Team initials
            </label>
            <div className="relative">
              <UsersIcon
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="project-members"
                name="members"
                type="text"
                value={form.members}
                onChange={handleChange}
                placeholder="OJ, AK, SK"
                className="h-12 w-full rounded-2xl border border-input bg-background pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-border px-4 text-sm font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              <FolderPlusIcon size={16} />
              Create project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProjectModal;
