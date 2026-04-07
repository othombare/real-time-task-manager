import { useMemo, useRef, useState } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  FolderPlusIcon,
  KeyRoundIcon,
  PaperclipIcon,
  RefreshCwIcon,
  UsersIcon,
} from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import { generateJoinCode, memberNameMap, seedProjects } from "./projectData";

const createInitialFormState = () => ({
  title: "",
  description: "",
  members: [],
  joinCode: generateJoinCode(""),
});

function CreateProjectModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState(createInitialFormState);
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
    setForm(createInitialFormState());
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
    const joinCode = form.joinCode.trim().toUpperCase();

    if (!title || !description || !joinCode) {
      return;
    }

    onSubmit({
      title,
      description,
      members,
      joinCode,
      attachments: selectedFiles.length,
      attachmentFiles: selectedFiles.map((file) => file.name),
    });

    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      badge="Create"
      title="New Project"
      description="Create a project and give it its own Jira-style board."
    >
        <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto px-6 py-6">
          <Input
            label="Project title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="TaskVue Mobile App"
            required
          />

          <Input
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Summarize the initiative, scope, or delivery goal."
            multiline
            required
          />

          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="project-members-trigger">
              Team members
              <span className="ml-2 text-xs font-medium text-muted-foreground">Optional</span>
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
                        <span>{memberNameMap[member] || member}</span>
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
                    <span key={member} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {memberNameMap[member] || member}
                      <button
                        type="button"
                        onClick={() => toggleMember(member)}
                        className="text-primary/80 transition hover:text-primary"
                        aria-label={`Remove ${member}`}
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="project-join-code">
              Group code
            </label>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="relative">
                <KeyRoundIcon
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  name="joinCode"
                  type="text"
                  value={form.joinCode}
                  onChange={handleChange}
                  placeholder="TASK-A1B2"
                  inputClassName="pl-11 uppercase"
                  required
                />
              </div>
              <Button
                type="button"
                onClick={() => setForm((current) => ({ ...current, joinCode: generateJoinCode(current.title) }))}
                variant="secondary"
                size="lg"
              >
                <RefreshCwIcon size={14} />
                Generate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this code so teammates can use &quot;Take me to project&quot; to join from the Projects page.
            </p>
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
              <FolderPlusIcon size={16} />
              Create project
            </Button>
          </div>
        </form>
    </Modal>
  );
}

export default CreateProjectModal;
