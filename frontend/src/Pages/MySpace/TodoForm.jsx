import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { useTodo } from "./contexts";

function TodoForm() {
  const [todo, setTodo] = useState("");
  const [description, setDescription] = useState("");
  const { addTodo, submitting } = useTodo();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const wasAdded = await addTodo({
      todo,
      description,
    });

    if (wasAdded) {
      setTodo("");
      setDescription("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="text"
        placeholder="Write your next task..."
        className="h-12 flex-1 rounded-2xl border border-input bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
        value={todo}
        disabled={submitting}
        onChange={(event) => setTodo(event.target.value)}
      />
      <textarea
        placeholder="Add a short description if needed..."
        className="min-h-24 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
        value={description}
        disabled={submitting}
        onChange={(event) => setDescription(event.target.value)}
      />
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-12 items-center justify-center gap-2 self-start rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 active:scale-[0.99]"
      >
        <PlusIcon size={16} />
        {submitting ? "Adding..." : "Add task"}
      </button>
    </form>
  );
}

export default TodoForm;
