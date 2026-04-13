import { useMemo, useState } from "react";
import {
  ArrowLeftIcon,
  CalendarIcon,
  FolderOpenIcon,
  PaperclipIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../Dashboard/DashboardLayout";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { getInitials, hasProjectAccess } from "../Projects/projectData";
import { useProjects } from "../Projects/useProjects";

const normalizeComparableValue = (value = "") => String(value).trim().toLowerCase();

const isProjectAdmin = (project, profile, displayName) => {
  if (!project) {
    return false;
  }

  const profileId = profile?._id;
  const projectOwnerId =
    typeof project.createdBy === "object" ? project.createdBy?._id : project.createdBy;

  return (
    Boolean(profileId && projectOwnerId && profileId === projectOwnerId) ||
    normalizeComparableValue(displayName) === normalizeComparableValue(project.admin || "") ||
    normalizeComparableValue(displayName) === normalizeComparableValue(project.owner || "")
  );
};

const formatAttachmentDate = (value) => {
  if (!value) {
    return "No upload date";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "No upload date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
};

function Attachments() {
  const navigate = useNavigate();
  const { projectSlug } = useParams();
  const { profile } = useCurrentUser();
  const { getProjectBySlug, deleteProjectAttachment } = useProjects();
  const project = getProjectBySlug(projectSlug);
  const displayName = profile?.name || "Workspace User";
  const currentMemberId = getInitials(displayName);
  const [feedback, setFeedback] = useState("");

  const canDeleteAttachments = isProjectAdmin(project, profile, displayName);
  const attachments = useMemo(() => project?.attachmentItems || [], [project]);

  const handleDeleteAttachment = (attachment) => {
    if (!canDeleteAttachments) {
      window.alert("Only admin can delete attachments.");
      return;
    }

    const confirmed = window.confirm(`Delete "${attachment.name}" from ${project.title}?`);
    if (!confirmed) {
      return;
    }

    const result = deleteProjectAttachment(projectSlug, attachment.id);

    if (!result?.success) {
      window.alert(result?.error || "Unable to delete attachment.");
      return;
    }

    setFeedback(`Deleted ${attachment.name}. This change is saved on the frontend for now.`);
  };

  if (!project || !hasProjectAccess(project, currentMemberId, displayName)) {
    return (
      <DashboardLayout>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">Project not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The attachments page you requested is not available for your current account.
          </p>
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <ArrowLeftIcon size={16} />
            Back to Projects
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="flex flex-col gap-4 rounded-[32px] border border-border bg-card p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => navigate(`/projects/${project.slug}`)}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-primary transition hover:text-primary/80"
            >
              <ArrowLeftIcon size={14} />
              Back to Project Board
            </button>
            <h1 className="text-3xl font-bold tracking-tight">Project Attachments</h1>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              

              

              
            </div>

            <div className="rounded-[32px] border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                  <PaperclipIcon size={18} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Attachments</h2>
                  
                </div>
              </div>

              {attachments.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex flex-col gap-4 rounded-3xl border border-border bg-muted/20 px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="min-w-0 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                            <PaperclipIcon size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{attachment.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {attachment.sizeLabel || "Size not available"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 rounded-full bg-background px-3 py-1.5">
                            <CalendarIcon size={12} className="text-primary" />
                            {formatAttachmentDate(attachment.uploadedAt)}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-background px-3 py-1.5">
                            <UserIcon size={12} className="text-primary" />
                            {attachment.uploadedBy || project.admin || project.owner}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {attachment.url ? (
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted"
                          >
                            <FolderOpenIcon size={16} />
                            Open
                          </a>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => handleDeleteAttachment(attachment)}
                          disabled={!canDeleteAttachments}
                          className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-background px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-background"
                        >
                          <Trash2Icon size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-3xl border border-dashed border-border bg-muted/20 px-5 py-8 text-center">
                  <p className="text-sm font-semibold">No project attachments yet</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Files added while creating the project will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                  <ShieldCheckIcon size={18} />
                </div>
                <div>
                  <h3 className="font-semibold">Permissions</h3>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Admin</span>
                  <span className="font-semibold">{project.admin || project.owner}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Your access</span>
                  <span className="font-semibold">{canDeleteAttachments ? "Can delete" : "View only"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Project code</span>
                  <span className="font-semibold">{project.joinCode}</span>
                </div>
              </div>
            </div>

            {feedback && (
              <p className="rounded-2xl bg-card px-4 py-3 text-xs font-medium text-muted-foreground shadow-sm">
                {feedback}
              </p>
            )}
          </aside>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Attachments;