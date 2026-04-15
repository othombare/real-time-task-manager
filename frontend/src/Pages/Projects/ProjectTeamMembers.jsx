import { useMemo, useState } from "react";
import {
  ArrowLeftIcon,
  CopyIcon,
  MailIcon,
  MapPinIcon,
  Trash2Icon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../Dashboard/DashboardLayout";
import { useProjects } from "./useProjects";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { getInitials, hasProjectAccess, resolveMemberLabel } from "./projectData";

function ProjectTeamMembers() {
  const navigate = useNavigate();
  const { projectSlug } = useParams();
  const { profile } = useCurrentUser();
  const { getProjectBySlug, removeProjectMember } = useProjects();
  const project = getProjectBySlug(projectSlug);
  const displayName = profile?.name || "Workspace User";
  const currentMemberId = getInitials(displayName);
  const [memberFeedback, setMemberFeedback] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [removingMemberId, setRemovingMemberId] = useState(null);

  const memberProfiles = useMemo(() => {
    const uniqueMembers = new Map();

    (project?.memberProfiles ?? []).forEach((member) => {
      const name = member.name || resolveMemberLabel(member.id, project?.memberDirectory);
      const normalizedName = name.trim().toLowerCase();
      const normalizedEmail = member.email?.trim().toLowerCase();
      const lookupKey =
        member.userId ||
        normalizedEmail ||
        normalizedName ||
        member.id;

      const normalizedMember = {
        id: member.id || getInitials(name),
        userId: member.userId || null,
        name,
        role: member.role || "Project Member",
        location: member.location || "Location not added",
        email: member.email || "No email available",
        memberRole: member.memberRole || "member",
        bio:
          member.about ||
          `${name} contributes to ${project?.title} and helps move work across planning, delivery, and review.`,
      };

      const existingMember = uniqueMembers.get(lookupKey);

      if (!existingMember) {
        uniqueMembers.set(lookupKey, normalizedMember);
        return;
      }

      uniqueMembers.set(lookupKey, {
        ...existingMember,
        ...normalizedMember,
        id:
          normalizedMember.id?.length >= existingMember.id?.length
            ? normalizedMember.id
            : existingMember.id,
        name:
          normalizedMember.name?.length >= existingMember.name?.length
            ? normalizedMember.name
            : existingMember.name,
      });
    });

    return Array.from(uniqueMembers.values());
  }, [project]);

  const selectedMember = useMemo(
    () => memberProfiles.find((member) => member.id === selectedMemberId) || null,
    [memberProfiles, selectedMemberId]
  );

  const normalizedDisplayName = displayName.trim().toLowerCase();
  const isCurrentUserProjectAdmin = useMemo(() => {
    if (!project) {
      return false;
    }

    if (profile?._id && project.createdBy?._id === profile._id) {
      return true;
    }

    return (project.memberProfiles || []).some((member) => {
      const matchesByUserId = Boolean(profile?._id && member.userId === profile._id);
      const matchesByName =
        Boolean(member.name) && member.name.trim().toLowerCase() === normalizedDisplayName;

      return (matchesByUserId || matchesByName) && member.memberRole === "admin";
    });
  }, [normalizedDisplayName, profile?._id, project]);

  const canRemoveSelectedMember = Boolean(
    isCurrentUserProjectAdmin &&
      selectedMember?.userId &&
      selectedMember.memberRole !== "admin" &&
      selectedMember.userId !== project?.createdBy?._id &&
      selectedMember.userId !== profile?._id
  );

  const handleCopyCode = async () => {
    if (!project?.joinCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(project.joinCode);
      setMemberFeedback(`Copied ${project.joinCode} to the clipboard.`);
    } catch {
      setMemberFeedback(`Share this code manually: ${project.joinCode}`);
    }
  };

  const handleRemoveMember = async () => {
    if (!project?._id || !selectedMember?.userId || !canRemoveSelectedMember) {
      return;
    }

    const confirmed = window.confirm(`Remove ${selectedMember.name} from ${project.title}?`);
    if (!confirmed) {
      return;
    }

    setRemovingMemberId(selectedMember.userId);
    const result = await removeProjectMember(project._id, selectedMember.userId);
    setRemovingMemberId(null);

    if (!result.success) {
      setMemberFeedback(result.error || "Unable to remove project member.");
      return;
    }

    setSelectedMemberId(null);
    setMemberFeedback(`${selectedMember.name} was removed from the project team.`);
  };

  if (!project || !hasProjectAccess(project, currentMemberId, displayName)) {
    return (
      <DashboardLayout>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">Project not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The project team page you requested is not available for your current account.
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
            <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
      
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-5">
            <div className="rounded-[32px] border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                  <UsersIcon size={18} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Members</h2>
                  <p className="text-sm text-muted-foreground">Tap a member to view their details.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {memberProfiles.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setSelectedMemberId(member.id)}
                    className={`flex items-center gap-3 rounded-3xl border px-4 py-4 text-left transition ${
                      selectedMember?.id === member.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-muted/20 hover:border-primary/30 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {member.id}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.id === currentMemberId ? "You" : member.role}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedMember && (
              <div className="rounded-[32px] border border-primary/20 bg-primary/5 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-base font-bold text-primary-foreground">
                      {selectedMember.id}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{selectedMember.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedMember.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canRemoveSelectedMember && (
                      <button
                        type="button"
                        onClick={handleRemoveMember}
                        disabled={removingMemberId === selectedMember.userId}
                        className="rounded-full p-2 text-muted-foreground transition hover:bg-background hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label={`Remove ${selectedMember.name} from the project`}
                      >
                        <Trash2Icon size={18} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedMemberId(null)}
                      className="rounded-full p-2 text-muted-foreground transition hover:bg-background hover:text-foreground"
                    >
                      <XIcon size={18} />
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-1">
                  <div className="rounded-2xl border border-border bg-background px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Location</p>
                    <p className="mt-1 flex items-center gap-2 font-medium">
                      <MapPinIcon size={14} className="text-primary" />
                      {selectedMember.location}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-background px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Email</p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium">
                    <MailIcon size={14} className="text-primary" />
                    {selectedMember.email}
                  </p>
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-background px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">About</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{selectedMember.bio}</p>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4 xl:w-[360px] 2xl:w-[400px]">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                  <UsersIcon size={18} />
                </div>
                <div>
                  <h3 className="font-semibold">Project Team</h3>
                  
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Admin</span>
                  <span className="font-semibold">{project.admin || project.owner}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Members</span>
                  <span className="font-semibold">{project.members.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Project code</span>
                  <span className="font-semibold">{project.joinCode}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <CopyIcon size={16} className="text-primary" />
                <h3 className="text-sm font-semibold">Invite by code</h3>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-muted/30 px-4 py-3 text-sm font-semibold">
                <span>{project.joinCode}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-primary transition hover:text-primary/80"
                >
                  <CopyIcon size={14} />
                  Copy
                </button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Other members can join the project using this code.
              </p>
            </div>

            {memberFeedback && (
              <p className="rounded-2xl bg-card px-4 py-3 text-xs font-medium text-muted-foreground shadow-sm">
                {memberFeedback}
              </p>
            )}
          </aside>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default ProjectTeamMembers;
