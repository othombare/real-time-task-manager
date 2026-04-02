import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2Icon,
  ClipboardListIcon,
  FilterIcon,
  ListTodoIcon,
  SparklesIcon,
} from "lucide-react";
import DashboardLayout from "../Dashboard/DashboardLayout";
import TodoForm from "./TodoForm";
import TodoItem from "./TodoItem";
import { TodoProvider } from "./contexts";

const STORAGE_KEY = "taskvue-personal-todos";

const filterOptions = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
];

function PerToDo() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");

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

  const addTodo = (todoText) => {
    const trimmedTodo = todoText.trim();

    if (!trimmedTodo) {
      return false;
    }

    setTodos((prevTodos) => [
      {
        id: Date.now(),
        todo: trimmedTodo,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      ...prevTodos,
    ]);

    return true;
  };

  const updateTodo = (id, todoText) => {
    const trimmedTodo = todoText.trim();

    if (!trimmedTodo) {
      return false;
    }

    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              todo: trimmedTodo,
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
              <h1 className="text-3xl font-bold tracking-tight">Personal To Do</h1>
              <p className="text-sm text-muted-foreground">
                Keep your personal action list close to the workspace and move through it without losing focus.
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

          <section className="grid gap-5 lg:grid-cols-[1.5fr_0.8fr]">
            <div className="space-y-5">
              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Add a focus item</h2>
                    <p className="text-sm text-muted-foreground">
                      Capture the next thing you want to finish and keep the list lightweight.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                    <FilterIcon size={14} />
                    Personal workflow
                  </div>
                </div>

                <div className="pt-5">
                  <TodoForm />
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Your list</h2>
                    <p className="text-sm text-muted-foreground">
                      Review, complete, and edit tasks in one place.
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
                        Add a task above or switch filters to review the rest of your list.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-600">
                    <CheckCircle2Icon size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Personal Progress</h3>
                    <p className="text-xs text-muted-foreground">A simple pulse on your checklist.</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total items</span>
                    <span className="font-semibold">{stats.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Still active</span>
                    <span className="font-semibold">{stats.active}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-semibold">{stats.completed}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
                <div className="flex items-center gap-3 text-primary">
                  <SparklesIcon size={18} />
                  <h3 className="font-semibold">Workflow Note</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  This page now follows the same dashboard language as Projects and Tasks, so it feels native to the
                  workspace while still storing personal items locally.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                    <ListTodoIcon size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Suggested Flow</h3>
                    <p className="text-xs text-muted-foreground">Keep the list easy to maintain.</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <p>Add quick personal tasks as they come up.</p>
                  <p>Use the filter pills to focus on active work or review completed items.</p>
                  <p>Edit wording inline so tasks stay clear and actionable.</p>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </DashboardLayout>
    </TodoProvider>
  );
}

export default PerToDo;
