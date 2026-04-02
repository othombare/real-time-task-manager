import { SettingsIcon, ShieldCheckIcon, SlidersHorizontalIcon, SparklesIcon } from "lucide-react";
import DashboardLayout from "../Dashboard/DashboardLayout";

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
    description: "Prepare this page for themes, density controls, and personalized visual settings later.",
  },
];

function Settings() {
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
              </article>
            ))}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-600">
                  <ShieldCheckIcon size={18} />
                </div>
                <div>
                  <h3 className="font-semibold">Recommended</h3>
                  <p className="text-xs text-muted-foreground">A sensible next setup list.</p>
                </div>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>Connect your account profile to real user data.</li>
                <li>Store workspace preferences per user session.</li>
                <li>Prepare role-based settings visibility.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-primary">
                <SlidersHorizontalIcon size={18} />
                <h3 className="font-semibold">Design Note</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                This screen is intentionally calm and structured so it scales well once forms are added.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Settings;
