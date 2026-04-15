import { useRef, useState } from "react";
import { FolderPlusIcon, PaperclipIcon } from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Modal from "../../components/Modal";

const createInitialFormState = () => ({
  title: "",
  description: "",
});

function CreateProjectModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState(createInitialFormState);
  const [formError, setFormError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const attachmentInputRef = useRef(null);

  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormError("");
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleAttachmentChange = (event) => {
    setSelectedFiles(Array.from(event.target.files || []));
  };

  const handleClose = () => {
    setForm(createInitialFormState());
    setFormError("");
    setSelectedFiles([]);
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title || !description) {
      setFormError("Please complete all required project details.");
      return;
    }

    onSubmit({
      title,
      description,
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
            <p className="text-xs text-muted-foreground">
              Project code generation is handled automatically by the backend.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
          {formError && (
            <p className="text-sm font-medium text-rose-500 sm:mr-auto">
              {formError}
            </p>
          )}
          <Button
            type="button"
            onClick={handleClose}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button type="submit">
            <FolderPlusIcon size={16} />
            Create project
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateProjectModal;
