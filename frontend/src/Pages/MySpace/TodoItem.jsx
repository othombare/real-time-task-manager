import { useEffect, useState } from "react";
import { CheckIcon, PencilIcon, SaveIcon, Trash2Icon, XIcon } from "lucide-react";
import { useTodo } from "./contexts";

function TodoItem({ todo }) {
  const [draft, setDraft] = useState(todo.todo);
  const [draftDescription, setDraftDescription] = useState(todo.description || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { deleteTodo, toggleComplete, updateTodo, processingTodoId } = useTodo();
  const isProcessing = processingTodoId === todo._id;

  useEffect(() => {
    setDraft(todo.todo);
    setDraftDescription(todo.description || "");
  }, [todo.description, todo.todo]);

  const handleSave = async () => {
    const wasUpdated = await updateTodo(todo._id, {
      todo: draft,
      description: draftDescription,
    });

    if (wasUpdated) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setDraft(todo.todo);
    setDraftDescription(todo.description || "");
    setIsEditing(false);
  };

  return (
    <>
      <article
        className={`rounded-2xl border p-4 shadow-sm transition ${
          todo.completed
            ? "border-emerald-200 bg-emerald-50/80"
            : "border-border bg-white hover:border-primary/20"
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => toggleComplete(todo._id)}
          disabled={isProcessing}
          className={`flex h-6 w-6 items-center justify-center rounded-full border transition ${
            todo.completed
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-border bg-background text-transparent hover:border-primary hover:text-primary"
          }`}
          aria-label={todo.completed ? "Mark task as active" : "Mark task as complete"}
        >
          <CheckIcon size={14} />
        </button>

        <button
          type="button"
          onClick={() => !isEditing && setIsOpen(true)}
          className="min-w-0 flex-1 text-left"
        >
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={draft}
                disabled={isProcessing}
                onChange={(event) => setDraft(event.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                autoFocus
              />
              <textarea
                value={draftDescription}
                disabled={isProcessing}
                onChange={(event) => setDraftDescription(event.target.value)}
                placeholder="Add a short description..."
                className="min-h-20 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
          ) : (
            <div className="space-y-1">
              <p
                className={`text-sm font-medium ${
                  todo.completed ? "text-muted-foreground line-through" : "text-foreground"
                }`}
              >
                {todo.todo}
              </p>
              <p className="text-xs text-muted-foreground">
                {todo.completed ? "Completed" : "Active"} item
              </p>
            </div>
          )}
        </button>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={isProcessing}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                <SaveIcon size={14} />
                {isProcessing ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isProcessing}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-primary"
              >
                <XIcon size={14} />
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={todo.completed || isProcessing}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PencilIcon size={14} />
              Edit
            </button>
          )}

          <button
            type="button"
            onClick={() => deleteTodo(todo._id)}
            disabled={isProcessing}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <Trash2Icon size={14} />
            {isProcessing ? "Deleting..." : "Delete"}
          </button>
        </div>
        </div>
      </article>

      {isOpen && !isEditing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 p-4">
          <button
            type="button"
            aria-label="Close todo details"
            className="absolute inset-0 cursor-default"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-[28px] border border-primary/20 bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                    todo.completed
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {todo.completed ? "Completed" : "Active"}
                </span>
                <h3 className="mt-3 text-xl font-semibold tracking-tight">{todo.todo}</h3>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <XIcon size={18} />
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-border bg-muted/30 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Description
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {todo.description || "No description added for this item."}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TodoItem;
