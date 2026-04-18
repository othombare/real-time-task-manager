import { useEffect, useMemo, useState } from "react";
import { ClipboardListIcon, SparklesIcon } from "lucide-react";
import DashboardLayout from "../Dashboard/DashboardLayout";
import TodoForm from "./TodoForm";
import TodoItem from "./TodoItem";
import MyNotesPanel from "./MyNotesPanel";
import { TodoProvider } from "./contexts";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import {
  clearCompletedTodos,
  createTodo as createTodoRequest,
  deleteTodo as deleteTodoRequest,
  getTodos,
  updateTodo as updateTodoRequest,
} from "../../utils/todoApi";

const NOTES_STORAGE_KEY = "taskvue-personal-notes";

const filterOptions = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
];

const getStorageKey = (prefix, userId = "anonymous") => `${prefix}:${userId || "anonymous"}`;

function MySpace() {
  const { profile, token, initialized } = useCurrentUser();
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [processingTodoId, setProcessingTodoId] = useState(null);
  const [error, setError] = useState("");
  const notesStorageKey = getStorageKey(NOTES_STORAGE_KEY, profile?._id);
  const displayName = profile?.name || "Workspace User";

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!token) {
      setTodos([]);
      setLoading(false);
      return;
    }

    const loadTodos = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getTodos();
        setTodos(response.data.data?.todos || []);
      } catch (loadError) {
        setError(loadError.message || "Unable to load your todos.");
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, [initialized, token]);

  const addTodo = async ({ todo: todoText, description = "" }) => {
    const trimmedTodo = todoText.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTodo) {
      return false;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await createTodoRequest({
        todo: trimmedTodo,
        description: trimmedDescription,
      });

      const nextTodo = response.data.data?.todo;
      if (nextTodo) {
        setTodos((prevTodos) => [nextTodo, ...prevTodos]);
      }

      return true;
    } catch (createError) {
      setError(createError.message || "Unable to create todo.");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const updateTodo = async (id, { todo: todoText, description = "" }) => {
    const trimmedTodo = todoText.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTodo) {
      return false;
    }

    setProcessingTodoId(id);
    setError("");

    try {
      const response = await updateTodoRequest(id, {
        todo: trimmedTodo,
        description: trimmedDescription,
      });
      const updatedTodo = response.data.data?.todo;

      if (updatedTodo) {
        setTodos((prevTodos) =>
          prevTodos.map((todo) => (todo._id === id ? updatedTodo : todo))
        );
      }

      return true;
    } catch (saveError) {
      setError(saveError.message || "Unable to update todo.");
      return false;
    } finally {
      setProcessingTodoId(null);
    }
  };

  const deleteTodo = async (id) => {
    setProcessingTodoId(id);
    setError("");

    try {
      await deleteTodoRequest(id);
      setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== id));
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete todo.");
    } finally {
      setProcessingTodoId(null);
    }
  };

  const toggleComplete = async (id) => {
    const currentTodo = todos.find((todo) => todo._id === id);

    if (!currentTodo) {
      return;
    }

    setProcessingTodoId(id);
    setError("");

    try {
      const response = await updateTodoRequest(id, {
        completed: !currentTodo.completed,
      });
      const updatedTodo = response.data.data?.todo;

      if (updatedTodo) {
        setTodos((prevTodos) =>
          prevTodos.map((todo) => (todo._id === id ? updatedTodo : todo))
        );
      }
    } catch (toggleError) {
      setError(toggleError.message || "Unable to update todo status.");
    } finally {
      setProcessingTodoId(null);
    }
  };

  const clearCompleted = async () => {
    setError("");

    try {
      await clearCompletedTodos();
      setTodos((prevTodos) => prevTodos.filter((todo) => !todo.completed));
    } catch (clearError) {
      setError(clearError.message || "Unable to clear completed todos.");
    }
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
    <TodoProvider
      value={{
        todos,
        loading,
        submitting,
        processingTodoId,
        error,
        addTodo,
        deleteTodo,
        toggleComplete,
        updateTodo,
        clearCompleted,
        clearError: () => setError(""),
      }}
    >
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
                  {error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  ) : null}

                  {loading ? (
                    <div className="rounded-2xl border border-dashed border-border bg-slate-50 px-4 py-8 text-center">
                      <p className="text-sm font-semibold">Loading your todo list...</p>
                    </div>
                  ) : filteredTodos.length > 0 ? (
                    filteredTodos.map((todo) => <TodoItem key={todo._id} todo={todo} />)
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
