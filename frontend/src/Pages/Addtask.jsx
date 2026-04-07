import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarIcon, PlusIcon } from "lucide-react";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";

const initialFormState = {
  title: "",
  description: "",
  notes: "",
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
  assigneeOptions = [],
  initialStatus = "To Do",
}) {
  const [form, setForm] = useState(initialFormState);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const dueDateInputRef = useRef(null);
  const attachmentInputRef = useRef(null);

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

  const handleAttachmentChange = (event) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
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

  const handleClose = () => {
    setForm({
      ...initialFormState,
      status: statuses[0] || "To Do",
    });
    setSelectedFiles([]);
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedTitle = form.title.trim();
    const trimmedAssignee = form.assignee.trim();

    if (!trimmedTitle || !trimmedAssignee || !form.dueDate) {
      return;
    }

    const selectedAssigneeOption = assigneeOptions.find(
      (option) => option.value === trimmedAssignee
    );

    onSubmit({
      title: trimmedTitle,
      description: form.description.trim(),
      notes: form.notes.trim(),
      projectName: form.projectName.trim(),
      priority: form.priority,
      status: form.status,
      assignee: [trimmedAssignee],
      assigneeNames: selectedAssigneeOption ? [selectedAssigneeOption.label] : [trimmedAssignee],
      dueDate: new Date(form.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      comments: 0,
      attachments: selectedFiles.length,
      attachmentFiles: selectedFiles.map((file) => file.name),
    });

    setForm({
      ...initialFormState,
      status: statuses[0] || "To Do",
    });
    setSelectedFiles([]);
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      badge="Create"
      title="Add New Task"
      description="Add a new item and send it straight into your board."
    >
        <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto px-6 py-6">
          <Input
            label="Task title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Write a clear task title"
            required
          />

          <Input
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Add context, acceptance notes, or handoff details."
            hint="Optional"
            multiline
          />

          <Input
            label="Notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Add reminders, blockers, or small implementation notes."
            hint="Optional"
            multiline
            rows={3}
          />

          {showProjectField && (
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="task-project-name">
                Project name
                <span className="ml-2 text-xs font-medium text-muted-foreground">
                  Optional
                </span>
              </label>
              <Input
                name="projectName"
                type="text"
                list="project-name-options"
                value={form.projectName}
                onChange={handleChange}
                placeholder="TaskVue Web App"
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
                Assignee
              </label>
              <select
                id="task-assignee"
                name="assignee"
                value={form.assignee}
                onChange={handleChange}
                className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                required
              >
                <option value="" disabled>
                  Select team member
                </option>
                {assigneeOptions.map((assignee) => (
                  <option key={assignee.value} value={assignee.value}>
                    {assignee.label}
                  </option>
                ))}
              </select>
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

          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="task-attachments">
              Attachments
              <span className="ml-2 text-xs font-medium text-muted-foreground">
                Optional
              </span>
            </label>
            <input
              ref={attachmentInputRef}
              id="task-attachments"
              type="file"
              multiple
              onChange={handleAttachmentChange}
              className="block w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm text-muted-foreground file:mr-4 file:rounded-xl file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary"
            />
            {selectedFiles.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              onClick={handleClose}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
            >
              <PlusIcon size={16} />
              Add task
            </Button>
          </div>
        </form>
    </Modal>
  );
}

export default Addtask;
