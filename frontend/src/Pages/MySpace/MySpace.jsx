import { useEffect, useMemo, useState } from "react";
import { ClipboardListIcon, FilterIcon, SparklesIcon } from "lucide-react";
import DashboardLayout from "../Dashboard/DashboardLayout";
import TodoForm from "./TodoForm";
import TodoItem from "./TodoItem";
import MyNotesPanel from "./MyNotesPanel";
import { TodoProvider } from "./contexts";
import { useCurrentUser } from "../../hooks/useCurrentUser";

const STORAGE_KEY = "taskvue-personal-todos";
const NOTES_STORAGE_KEY = "taskvue-personal-notes";

const filterOptions = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
];

const getStorageKey = (prefix, userId = "anonymous") => `${prefix}:${userId || "anonymous"}`;

function MySpace() {
  const { profile } = useCurrentUser();
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  const notesStorageKey = getStorageKey(NOTES_STORAGE_KEY, profile?._id);
  const displayName = profile?.name || "Workspace User";

  useEffect(() => {
    const savedTodos = localStorage.getItem(STORAGE_KEY);

    if (!savedTodos) {
      return;
    }

    try {
      const parsedTodos = JSON.parse(savedTodos);

      if (Array.isArray(parsedTodos)) {
        setTodos(parsedTodos);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const addTodo = ({ todo: todoText, description = "" }) => {
    const trimmedTodo = todoText.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTodo) {
      return false;
    }

    setTodos((prevTodos) => [
      {
        id: Date.now(),
        todo: trimmedTodo,
        description: trimmedDescription,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      ...prevTodos,
    ]);

    return true;
  };

  const updateTodo = (id, { todo: todoText, description = "" }) => {
    const trimmedTodo = todoText.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTodo) {
      return false;
    }

    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              todo: trimmedTodo,
              description: trimmedDescription,
            }
          : todo
      )
    );

    return true;
  };

  const deleteTodo = (id) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  };

  const toggleComplete = (id) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
            }
          : todo
      )
    );
  };

  const clearCompleted = () => {
    setTodos((prevTodos) => prevTodos.filter((todo) => !todo.completed));
  };

  const filteredTodos = useMemo(() => {
    if (filter === "active") {
      return todos.filter((todo) => !todo.completed);
    }

    if (filter === "completed") {
      return todos.filter((todo) => todo.completed);
    }

    return todos;
  }, [filter, todos]);

  const stats = useMemo(() => {
    const completed = todos.filter((todo) => todo.completed).length;
    const active = todos.length - completed;

    return {
      total: todos.length,
      completed,
      active,
    };
  }, [todos]);

  return (
    <TodoProvider value={{ addTodo, deleteTodo, toggleComplete, updateTodo }}>
      <DashboardLayout>
        <div className="space-y-8">
          <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Focus</p>
              <h1 className="text-3xl font-bold tracking-tight">My Space</h1>
              <p className="text-sm text-muted-foreground">
                Keep your tasks and notes close to the workspace without losing focus.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <ClipboardListIcon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold">{stats.active} open items</p>
                <p className="text-xs text-muted-foreground">
                  {stats.completed} completed out of {stats.total}
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
            <div className="space-y-5">
              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                    <SparklesIcon size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold">Add a focus item</h3>
                    <p className="text-sm text-muted-foreground">
                      Capture the next thing you want to finish and keep the list lightweight.
                    </p>
                  </div>
                </div>

                <div className="pt-5">
                  <TodoForm />
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">My Space list</h2>
                    <p className="text-sm text-muted-foreground">
                      Review, complete, and edit items in one place.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {filterOptions.map((option) => {
                      const isActive = option.id === filter;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setFilter(option.id)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            isActive
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={clearCompleted}
                      disabled={stats.completed === 0}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Clear completed
                    </button>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {filteredTodos.length > 0 ? (
                    filteredTodos.map((todo) => <TodoItem key={todo.id} todo={todo} />)
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border bg-slate-50 px-4 py-8 text-center">
                      <p className="text-sm font-semibold">No items in this view yet.</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Add an item above or switch filters to review the rest of your space.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <MyNotesPanel storageKey={notesStorageKey} ownerName={displayName} />
          </section>
        </div>
      </DashboardLayout>
    </TodoProvider>
  );
}

export default MySpace;
