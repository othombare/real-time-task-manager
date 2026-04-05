import { useMemo, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon, FolderPlusIcon, PaperclipIcon, UsersIcon, XIcon } from "lucide-react";
import { seedProjects } from "./projectData";

const initialFormState = {
  title: "",
  description: "",
  members: [],
};

function CreateProjectModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState(initialFormState);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const attachmentInputRef = useRef(null);
  const memberOptions = useMemo(() => {
    const uniqueMembers = new Set(seedProjects.flatMap((project) => project.members));
    return Array.from(uniqueMembers).sort((a, b) => a.localeCompare(b));
  }, []);

  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const toggleMember = (member) => {
    setForm((current) => ({
      ...current,
      members: current.members.includes(member)
        ? current.members.filter((item) => item !== member)
        : [...current.members, member],
    }));
  };

  const handleAttachmentChange = (event) => {
    setSelectedFiles(Array.from(event.target.files || []));
  };

  const handleClose = () => {
    setForm(initialFormState);
    setSelectedFiles([]);
    setIsMembersOpen(false);
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const title = form.title.trim();
    const description = form.description.trim();
    const members = form.members;

    if (!title || !description || members.length === 0) {
      return;
    }

    onSubmit({
      title,
      description,
      members,
      attachments: selectedFiles.length,
      attachmentFiles: selectedFiles.map((file) => file.name),
    });

    handleClose();
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
            onClick={handleClose}
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

          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="project-members-trigger">
              Team members
            </label>
            <div className="relative space-y-3">
              <UsersIcon
                size={16}
                className="pointer-events-none absolute left-4 top-6 -translate-y-1/2 text-muted-foreground"
              />
              <button
                id="project-members-trigger"
                type="button"
                onClick={() => setIsMembersOpen((current) => !current)}
                className="flex h-12 w-full items-center justify-between rounded-2xl border border-input bg-background pl-11 pr-4 text-sm outline-none transition hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                <span className={form.members.length > 0 ? "text-foreground" : "text-muted-foreground"}>
                  {form.members.length > 0
                    ? `${form.members.length} member${form.members.length > 1 ? "s" : ""} selected`
                    : "Select team members"}
                </span>
                <ChevronDownIcon
                  size={16}
                  className={`text-muted-foreground transition-transform ${isMembersOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isMembersOpen && (
                <div className="rounded-2xl border border-border bg-card p-2 shadow-lg">
                  {memberOptions.map((member) => {
                    const isSelected = form.members.includes(member);

                    return (
                      <button
                        key={member}
                        type="button"
                        onClick={() => toggleMember(member)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition hover:bg-muted"
                      >
                        <span>{member}</span>
                        <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-transparent"}`}>
                          <CheckIcon size={12} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {form.members.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.members.map((member) => (
                    <span
                      key={member}
                      className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                    >
                      {member}
                      <button
                        type="button"
                        onClick={() => toggleMember(member)}
                        className="text-primary/80 transition hover:text-primary"
                        aria-label={`Remove ${member}`}
                      >
                        <XIcon size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="project-attachments">
              Attachments
              <span className="ml-2 text-xs font-medium text-muted-foreground">
                Optional
              </span>
            </label>
            <div className="space-y-2">
              <div className="relative">
                <PaperclipIcon
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  ref={attachmentInputRef}
                  id="project-attachments"
                  type="file"
                  multiple
                  onChange={handleAttachmentChange}
                  className="block w-full rounded-2xl border border-input bg-background py-3 pl-11 pr-4 text-sm text-muted-foreground file:mr-4 file:rounded-xl file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary"
                />
              </div>
              {selectedFiles.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
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
