import { ShieldCheckIcon, SparklesIcon, UsersIcon, UserRoundCheckIcon } from "lucide-react";
import DashboardLayout from "../Dashboard/DashboardLayout";

const members = [
  { id: 1, name: "Onkar J.", role: "Frontend Developer", status: "Active" },
  { id: 2, name: "Aarav K.", role: "Backend Engineer", status: "In Review" },
  { id: 3, name: "Meera S.", role: "UI Designer", status: "Active" },
  { id: 4, name: "Sana P.", role: "QA Analyst", status: "Support" },
];

function TeamMembers() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Collaboration</p>
            <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
            <p className="text-sm text-muted-foreground">
              A simple teammate directory to keep roles, collaboration, and ownership visible.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <UsersIcon size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold">14 collaborators</p>
              <p className="text-xs text-muted-foreground">4 online right now</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="grid gap-4 md:grid-cols-2">
            {members.map((member) => (
              <article key={member.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground">
                    {member.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </div>
                  <div>
                    <h2 className="font-semibold">{member.name}</h2>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    {member.status}
                  </span>
                </div>
              </article>
            ))}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-600">
                  <UserRoundCheckIcon size={18} />
                </div>
                <div>
                  <h3 className="font-semibold">Team Snapshot</h3>
                  <p className="text-xs text-muted-foreground">Quick collaboration readout.</p>
                </div>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Design</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Engineering</span>
                  <span className="font-semibold">7</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">QA / Ops</span>
                  <span className="font-semibold">4</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-primary">
                <ShieldCheckIcon size={18} />
                <h3 className="font-semibold">Note</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                This can grow into invitations, member permissions, and workspace role management later.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default TeamMembers;
