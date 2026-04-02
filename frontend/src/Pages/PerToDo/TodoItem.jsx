import { useState } from "react";
import { CheckIcon, PencilIcon, SaveIcon, Trash2Icon, XIcon } from "lucide-react";
import { useTodo } from "./contexts";

function TodoItem({ todo }) {
  const [draft, setDraft] = useState(todo.todo);
  const [isEditing, setIsEditing] = useState(false);
  const { deleteTodo, toggleComplete, updateTodo } = useTodo();

  const handleSave = () => {
    const wasUpdated = updateTodo(todo.id, draft);

    if (wasUpdated) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setDraft(todo.todo);
    setIsEditing(false);
  };

  return (
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
          onClick={() => toggleComplete(todo.id)}
          className={`flex h-6 w-6 items-center justify-center rounded-full border transition ${
            todo.completed
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-border bg-background text-transparent hover:border-primary hover:text-primary"
          }`}
          aria-label={todo.completed ? "Mark task as active" : "Mark task as complete"}
        >
          <CheckIcon size={14} />
        </button>

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              autoFocus
            />
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
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                <SaveIcon size={14} />
                Save
              </button>
              <button
                type="button"
                onClick={handleCancel}
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
              disabled={todo.completed}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PencilIcon size={14} />
              Edit
            </button>
          )}

          <button
            type="button"
            onClick={() => deleteTodo(todo.id)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <Trash2Icon size={14} />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default TodoItem;
