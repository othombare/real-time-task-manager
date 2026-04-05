import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarIcon, PlusIcon, XIcon } from "lucide-react";

const initialFormState = {
  title: "",
  description: "",
  projectName: "",
  priority: "Medium",
  status: "To Do",
  assignee: "",
  dueDate: "",
};

function Addtask({
  isOpen,
  onClose,
  onSubmit,
  statuses,
  showProjectField = false,
  projectOptions = [],
  initialStatus = "To Do",
}) {
  const [form, setForm] = useState(initialFormState);
  const dueDateInputRef = useRef(null);

  const minDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm((current) => ({
      ...current,
      status: statuses.includes(initialStatus) ? initialStatus : statuses[0] || "To Do",
    }));
  }, [initialStatus, isOpen, statuses]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const openDatePicker = () => {
    const input = dueDateInputRef.current;
    if (!input) {
      return;
    }

    input.focus();
    if (typeof input.showPicker === "function") {
      input.showPicker();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedTitle = form.title.trim();
    const trimmedAssignee = form.assignee.trim();

    if (!trimmedTitle || !trimmedAssignee || !form.dueDate) {
      return;
    }

    onSubmit({
      title: trimmedTitle,
      description: form.description.trim(),
      projectName: form.projectName.trim(),
      priority: form.priority,
      status: form.status,
      assignee: trimmedAssignee
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((name) => name.slice(0, 2).toUpperCase()),
      dueDate: new Date(form.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      comments: 0,
      attachments: 0,
    });

    setForm({
      ...initialFormState,
      status: statuses[0] || "To Do",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[28px] border border-border bg-card shadow-2xl shadow-slate-950/10">
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Create</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Add New Task</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a new item and send it straight into your board.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border p-2 text-muted-foreground transition hover:border-primary/30 hover:text-primary"
            aria-label="Close add task form"
          >
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="task-title">
              Task title
            </label>
            <input
              id="task-title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Write a clear task title"
              className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="task-description">
              Description
              <span className="ml-2 text-xs font-medium text-muted-foreground">
                Optional
              </span>
            </label>
            <textarea
              id="task-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Add context, acceptance notes, or handoff details."
              className="min-h-24 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>

          {showProjectField && (
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="task-project-name">
                Project name
                <span className="ml-2 text-xs font-medium text-muted-foreground">
                  Optional
                </span>
              </label>
              <input
                id="task-project-name"
                name="projectName"
                type="text"
                list="project-name-options"
                value={form.projectName}
                onChange={handleChange}
                placeholder="TaskVue Web App"
                className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              {projectOptions.length > 0 && (
                <datalist id="project-name-options">
                  {projectOptions.map((projectName) => (
                    <option key={projectName} value={projectName} />
                  ))}
                </datalist>
              )}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="task-priority">
                Priority
              </label>
              <select
                id="task-priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="task-status">
                Status
              </label>
              <select
                id="task-status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="task-assignee">
                Assignee initials
              </label>
              <input
                id="task-assignee"
                name="assignee"
                type="text"
                value={form.assignee}
                onChange={handleChange}
                placeholder="OJ, AK"
                className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="task-due-date">
                Due date
              </label>
              <div className="relative">
                <CalendarIcon
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition hover:text-primary"
                  onClick={openDatePicker}
                />
                <input
                  ref={dueDateInputRef}
                  id="task-due-date"
                  name="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={handleChange}
                  min={minDate}
                  className="h-12 w-full rounded-2xl border border-input bg-background pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  onClick={openDatePicker}
                  required
                />
              </div>
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
              <PlusIcon size={16} />
              Add task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Addtask;
