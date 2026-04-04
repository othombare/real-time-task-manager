import { useMemo, useState } from "react";
import {
  MailIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersIcon,
  UserRoundCheckIcon,
  XIcon,
} from "lucide-react";
import { cn } from "../../lib/utils";
import DashboardLayout from "../Dashboard/DashboardLayout";

const members = [
  {
    id: 1,
    name: "Onkar J.",
    role: "Frontend Developer",
    status: "Active",
    email: "onkar.j@taskvue.app",
    team: "Engineering",
    location: "Pune, India",
    bio: "Owns the dashboard experience and frontend interaction polish across the workspace.",
  },
  {
    id: 2,
    name: "Aarav K.",
    role: "Backend Engineer",
    status: "In Review",
    email: "aarav.k@taskvue.app",
    team: "Platform",
    location: "Bengaluru, India",
    bio: "Builds API flows, auth logic, and data contracts used by the web app.",
  },
  {
    id: 3,
    name: "Meera S.",
    role: "UI Designer",
    status: "Active",
    email: "meera.s@taskvue.app",
    team: "Design",
    location: "Mumbai, India",
    bio: "Leads visual systems, layout direction, and interaction clarity for product screens.",
  },
  {
    id: 4,
    name: "Sana P.",
    role: "QA Analyst",
    status: "Support",
    email: "sana.p@taskvue.app",
    team: "QA / Ops",
    location: "Hyderabad, India",
    bio: "Tracks edge cases, regression issues, and release readiness before delivery.",
  },
];

function TeamMembers() {
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const selectedMember = useMemo(
    () => members.find((member) => member.id === selectedMemberId) ?? null,
    [selectedMemberId]
  );

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
              <button
                key={member.id}
                type="button"
                onClick={() => setSelectedMemberId(member.id)}
                className={cn(
                  "rounded-3xl border bg-card p-5 text-left shadow-sm transition",
                  selectedMember?.id === member.id
                    ? "border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/10"
                    : "border-border hover:border-primary/20 hover:shadow-md"
                )}
              >
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
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {member.bio}
                </p>
              </button>
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

      {selectedMember && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 p-4">
          <button
            type="button"
            aria-label="Close member details"
            className="absolute inset-0 cursor-default"
            onClick={() => setSelectedMemberId(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-[28px] border border-primary/20 bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-base font-bold text-primary-foreground">
                  {selectedMember.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{selectedMember.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedMember.role}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMemberId(null)}
                className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <XIcon size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold">{selectedMember.status}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Team</span>
                <span className="font-semibold">{selectedMember.team}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Location</span>
                <span className="font-semibold">{selectedMember.location}</span>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MailIcon size={16} className="text-primary" />
                Contact
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {selectedMember.email}
              </p>
            </div>

            <div className="mt-4 rounded-2xl bg-primary/5 p-4">
              <p className="text-sm leading-6 text-muted-foreground">
                {selectedMember.bio}
              </p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default TeamMembers;
