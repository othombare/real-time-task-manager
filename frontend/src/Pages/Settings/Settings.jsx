import {
  MoonStarIcon,
  SettingsIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  SunMediumIcon,
} from "lucide-react";
import DashboardLayout from "../Dashboard/DashboardLayout";
import { useTheme } from "../../hooks/useTheme";

const settingsGroups = [
  {
    title: "Workspace Preferences",
    description: "Set dashboard defaults, notification behavior, and preferred workspace flow.",
  },
  {
    title: "Security Controls",
    description: "Manage password hygiene, sessions, and future 2FA configuration from one place.",
  },
  {
    title: "Appearance",
    description: "Choose the theme you want to use across the workspace.",
  },
];

function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Control</p>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">
              A clean workspace settings area for preferences, security, and future customization.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <SettingsIcon size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold">Workspace settings ready</p>
              <p className="text-xs text-muted-foreground">Prepared for backend integration later</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="space-y-4">
            {settingsGroups.map((group) => (
              <article key={group.title} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <h2 className="text-lg font-semibold">{group.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{group.description}</p>

                {group.title === "Appearance" && (
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={`rounded-2xl border p-4 text-left transition ${
                        theme === "light"
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600">
                          <SunMediumIcon size={18} />
                        </div>
                        <div>
                          <p className="font-semibold">Light Theme</p>
                          <p className="text-sm text-muted-foreground">
                            Bright, clean workspace appearance.
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={`rounded-2xl border p-4 text-left transition ${
                        theme === "dark"
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-sky-500/10 p-2 text-sky-500">
                          <MoonStarIcon size={18} />
                        </div>
                        <div>
                          <p className="font-semibold">Dark Theme</p>
                          <p className="text-sm text-muted-foreground">
                            Lower-glare interface for darker environments.
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>

         
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Settings;
