import { MessageSquareIcon, SendHorizonalIcon, SparklesIcon, UsersIcon } from "lucide-react";
import DashboardLayout from "../Dashboard/DashboardLayout";

const conversations = [
  {
    id: 1,
    name: "Design Team",
    preview: "Let’s finalize the updated button styles before the review.",
    time: "2m ago",
  },
  {
    id: 2,
    name: "Backend Sync",
    preview: "API payload is stable now. Frontend can continue integration.",
    time: "18m ago",
  },
  {
    id: 3,
    name: "Client Feedback",
    preview: "They liked the dashboard polish and want a profile edit flow next.",
    time: "1h ago",
  },
];

function Message() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Communication</p>
            <h1 className="text-3xl font-bold tracking-tight">Message</h1>
            <p className="text-sm text-muted-foreground">
              Keep your most important conversations and team check-ins easy to scan.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <MessageSquareIcon size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold">8 new messages</p>
              <p className="text-xs text-muted-foreground">Latest sync updated just now</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <article key={conversation.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold">{conversation.name}</h2>
                    <p className="text-sm leading-6 text-muted-foreground">{conversation.preview}</p>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{conversation.time}</span>
                </div>
              </article>
            ))}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-600">
                  <UsersIcon size={18} />
                </div>
                <div>
                  <h3 className="font-semibold">Conversation Health</h3>
                  <p className="text-xs text-muted-foreground">A quick communication pulse.</p>
                </div>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Unread threads</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Mentions today</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Awaiting reply</span>
                  <span className="font-semibold">2</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-primary">
                <SendHorizonalIcon size={18} />
                <h3 className="font-semibold">Next Layer</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                This page can later become a full chat or inbox once your backend messaging service is ready.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Message;
