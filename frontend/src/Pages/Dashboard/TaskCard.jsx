import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  CalendarIcon,
  FolderKanbanIcon,
  MessageSquareIcon,
  PaperclipIcon,
  PlusIcon,
  Trash2Icon,
  UserIcon,
  XIcon,
} from "lucide-react"
import { memberNameMap } from "../Projects/projectData"
import { cn } from "../../lib/utils"
import UserStatus from "../../components/UserStatus"

const formatMetaDate = (value) => {
  if (!value) {
    return null
  }

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate)
}

const formatAttachmentSize = (value) => {
  const numericSize = Number(value)

  if (!Number.isFinite(numericSize) || numericSize <= 0) {
    return null
  }

  if (numericSize < 1024) {
    return `${numericSize} B`
  }

  if (numericSize < 1024 * 1024) {
    return `${(numericSize / 1024).toFixed(1)} KB`
  }

  return `${(numericSize / (1024 * 1024)).toFixed(1)} MB`
}

const normalizeCommentItem = (comment, index = 0) => {
  if (typeof comment === "string") {
    return {
      id: `comment-${index}`,
      text: comment,
      userName: null,
      createdAt: null,
    }
  }

  return {
    id: String(comment?._id || comment?.id || `comment-${index}`),
    text: comment?.text || "",
    userName: comment?.user?.name || comment?.userName || null,
    createdAt: comment?.createdAt || null,
  }
}

const normalizeAttachmentItem = (attachment, index = 0) => {
  if (typeof attachment === "string") {
    return {
      id: `attachment-${index}`,
      name: attachment,
      url: null,
      uploadedAt: null,
      uploadedBy: null,
      sizeLabel: null,
    }
  }

  return {
    id: String(attachment?._id || attachment?.id || `attachment-${index}`),
    name: attachment?.fileName || attachment?.name || attachment?.originalName || "",
    url: attachment?.fileUrl || attachment?.url || null,
    uploadedAt: attachment?.uploadedAt || attachment?.createdAt || null,
    uploadedBy: attachment?.uploadedBy?.name || attachment?.uploadedBy || null,
    sizeLabel: attachment?.sizeLabel || formatAttachmentSize(attachment?.size),
  }
}

const statusColors = {
  "to do": "bg-slate-500/10 text-slate-700 border-slate-500/20",
  "in progress": "bg-primary/10 text-primary border-primary/20",
  "in review": "bg-amber-500/10 text-amber-700 border-amber-500/20",
  done: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
}

export function TaskCard({
  id,
  title,
  description,
  notes,
  priority,
  status,
  assignee,
  assigneeNames = [],
  assignedToUserId,
  assignedToUserIds = [],
  createdBy,
  createdByUserId,
  dueDate,
  comments = 0,
  commentsList = [],
  commentItems = [],
  attachments = 0,
  attachmentFiles = [],
  attachmentItems = [],
  projectName,
  onUpdateTask,
  onAddComment,
  onAddAttachments,
  onDeleteTask,
  currentUserName,
  currentUserId,
  supportsTaskDetailsEditing = true,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [commentDraft, setCommentDraft] = useState("")
  const [isSavingComment, setIsSavingComment] = useState(false)
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false)

  const priorityColors = {
    high: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  }

  const normalizedPriority = String(priority || "Medium")
  const priorityKey = normalizedPriority.toLowerCase()
  const normalizedStatus = String(status || "To Do")
  const statusKey = normalizedStatus.toLowerCase()
  const taskKeyLabel = String(id || "").trim() || "Task"
  const dueDateLabel = dueDate || "No due date"
  const creatorLabel =
    typeof createdBy === "string" ? createdBy : createdBy?.name || createdBy?.label || ""
  const resolvedCreatorName = memberNameMap[creatorLabel] || creatorLabel || "Workspace"

  const assigneeInitials = Array.isArray(assignee)
    ? assignee.map((entry) => String(entry || "").trim()).filter(Boolean)
    : []
  const assigneeDisplayNames =
    Array.isArray(assigneeNames) && assigneeNames.length > 0
      ? assigneeNames.map((entry) => String(entry || "").trim()).filter(Boolean)
      : []
  const resolvedAssigneeName =
    assigneeDisplayNames.length > 0
      ? assigneeDisplayNames.join(", ")
      : assigneeInitials.length > 0
        ? assigneeInitials.join(", ")
        : null
  const primaryAssigneeInitial = String(assigneeInitials[0] || "NA")
    .slice(0, 2)
    .toUpperCase()

  const normalizedCommentItems =
    Array.isArray(commentItems) && commentItems.length > 0
      ? commentItems.map(normalizeCommentItem)
      : Array.isArray(commentsList)
        ? commentsList.map(normalizeCommentItem)
        : []
  const normalizedAttachmentItems =
    Array.isArray(attachmentItems) && attachmentItems.length > 0
      ? attachmentItems.map(normalizeAttachmentItem)
      : Array.isArray(attachmentFiles)
        ? attachmentFiles.map(normalizeAttachmentItem)
        : []

  const commentCount = Math.max(Number(comments) || 0, normalizedCommentItems.length)
  const attachmentCount = Math.max(Number(attachments) || 0, normalizedAttachmentItems.length)

  const resolvedAssignedUserIds =
    Array.isArray(assignedToUserIds) && assignedToUserIds.length > 0
      ? assignedToUserIds.map((entry) => String(entry || "").trim()).filter(Boolean)
      : assignedToUserId
        ? [String(assignedToUserId).trim()]
        : []
  const primaryAssigneeUserId = resolvedAssignedUserIds[0] || null

  const canDeleteTask =
    (Boolean(currentUserId) &&
      Boolean(createdByUserId) &&
      String(currentUserId) === String(createdByUserId)) ||
    (Boolean(currentUserName) &&
      String(currentUserName).trim().toLowerCase() === String(creatorLabel).trim().toLowerCase())

  const canAddComments =
    supportsTaskDetailsEditing !== false && (Boolean(onAddComment) || Boolean(onUpdateTask))
  const canAddAttachments =
    supportsTaskDetailsEditing !== false && (Boolean(onAddAttachments) || Boolean(onUpdateTask))

  const taskSnapshot =
    commentCount === 0 && attachmentCount === 0
      ? "No activity yet. Start by adding a comment or uploading an attachment."
      : `${commentCount} comment${commentCount === 1 ? "" : "s"} and ${attachmentCount} attachment${attachmentCount === 1 ? "" : "s"} tracked.`

  const openDetails = () => {
    setIsOpen(true)
  }

  const handleAddComment = async () => {
    const nextComment = commentDraft.trim()

    if (!nextComment || !canAddComments || isSavingComment) {
      return
    }

    setIsSavingComment(true)

    try {
      if (onAddComment) {
        const result = await onAddComment(id, nextComment)

        if (result?.success === false) {
          window.alert(result.error || "Unable to add comment.")
          return
        }
      } else if (onUpdateTask) {
        const nextCommentItems = [
          ...normalizedCommentItems,
          {
            id: `comment-${Date.now()}`,
            text: nextComment,
            userName: currentUserName || null,
            createdAt: new Date().toISOString(),
          },
        ]
        const result = await onUpdateTask(id, {
          comments: nextCommentItems.length,
          commentsList: nextCommentItems.map((item) => item.text),
          commentItems: nextCommentItems,
        })

        if (result?.success === false) {
          window.alert(result.error || "Unable to add comment.")
          return
        }
      } else {
        return
      }

      setCommentDraft("")
    } catch (error) {
      window.alert(error.message || "Unable to add comment.")
    } finally {
      setIsSavingComment(false)
    }
  }

  const handleAttachmentChange = async (event) => {
    const selectedFiles = Array.from(event.target.files || [])

    if (selectedFiles.length === 0 || !canAddAttachments || isUploadingAttachments) {
      event.target.value = ""
      return
    }

    setIsUploadingAttachments(true)

    try {
      if (onAddAttachments) {
        const result = await onAddAttachments(id, selectedFiles)

        if (result?.success === false) {
          window.alert(result.error || "Unable to add attachments.")
          return
        }
      } else if (onUpdateTask) {
        const nextAttachmentItems = [
          ...normalizedAttachmentItems,
          ...selectedFiles.map((file, index) => ({
            id: `attachment-${Date.now()}-${index}`,
            name: file.name,
            url: null,
            uploadedAt: new Date().toISOString(),
            uploadedBy: currentUserName || null,
            sizeLabel: formatAttachmentSize(file.size),
          })),
        ]
        const result = await onUpdateTask(id, {
          attachments: nextAttachmentItems.length,
          attachmentFiles: nextAttachmentItems.map((item) => item.name),
          attachmentItems: nextAttachmentItems,
        })

        if (result?.success === false) {
          window.alert(result.error || "Unable to add attachments.")
          return
        }
      } else {
        return
      }
    } catch (error) {
      window.alert(error.message || "Unable to add attachments.")
    } finally {
      setIsUploadingAttachments(false)
      event.target.value = ""
    }
  }

  const handleDeleteTask = async () => {
    if (!onDeleteTask || !canDeleteTask) {
      return
    }

    const confirmed = window.confirm(`Delete "${title}"?`)
    if (!confirmed) {
      return
    }

    try {
      const result = await onDeleteTask(id)

      if (result?.success === false) {
        window.alert(result.error || "Unable to delete task.")
        return
      }

      setIsOpen(false)
    } catch (error) {
      window.alert(error.message || "Unable to delete task.")
    }
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -2, rotate: 0.5, transition: { duration: 0.1 } }}
        whileTap={{ scale: 0.98 }}
        onClick={() => openDetails()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            openDetails()
          }
        }}
        role="button"
        tabIndex={0}
        className="group w-full cursor-pointer rounded-xl border border-border/60 bg-card p-5 text-left shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="flex min-h-[148px] items-start justify-between gap-4">
          <h4 className="line-clamp-5 flex-1 text-base font-semibold leading-7 text-foreground transition-colors group-hover:text-primary">
            {title}
          </h4>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground ring-2 ring-primary/20">
            {primaryAssigneeInitial}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="flex max-h-[90vh] w-full max-w-[1500px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wider",
                        priorityColors[priorityKey] || priorityColors.medium
                      )}
                    >
                      {normalizedPriority}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {taskKeyLabel}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    {title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Close task details"
                >
                  <XIcon size={16} />
                </button>
              </div>

              <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
                <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-6 custom-scrollbar">
                  <div className="space-y-6">
                    <section className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Description</p>
                      <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm leading-7 text-muted-foreground">
                        {description || "No description provided for this task."}
                      </div>

                      {notes && (
                        <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm leading-7 text-muted-foreground">
                          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Notes
                          </p>
                          <p>{notes}</p>
                        </div>
                      )}
                    </section>

                    <section className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">Comments</p>
                        <span className="text-xs text-muted-foreground">{commentCount} total</span>
                      </div>

                      {canAddComments && (
                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-3">
                          <textarea
                            value={commentDraft}
                            onChange={(event) => setCommentDraft(event.target.value)}
                            placeholder="Add a quick comment..."
                            className="min-h-20 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                          />
                          <div className="mt-3 flex justify-end">
                            <button
                              type="button"
                              onClick={handleAddComment}
                              disabled={isSavingComment || !commentDraft.trim()}
                              className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              <PlusIcon size={14} />
                              {isSavingComment ? "Saving..." : "Add comment"}
                            </button>
                          </div>
                        </div>
                      )}

                      {normalizedCommentItems.length > 0 ? (
                        <div className="space-y-2">
                          {normalizedCommentItems.map((comment) => (
                            <div
                              key={`${title}-${comment.id}`}
                              className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm leading-6 text-muted-foreground"
                            >
                              <p>{comment.text}</p>
                              {(comment.userName || comment.createdAt) && (
                                <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                  {[comment.userName, formatMetaDate(comment.createdAt)]
                                    .filter(Boolean)
                                    .join(" - ")}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                          No comment messages saved for this task yet.
                        </div>
                      )}
                    </section>

                    <section className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">Attachments</p>
                        <span className="text-xs text-muted-foreground">{attachmentCount} total</span>
                      </div>

                      {canAddAttachments && (
                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-3">
                          <input
                            type="file"
                            multiple
                            onChange={handleAttachmentChange}
                            disabled={isUploadingAttachments}
                            className="block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-muted-foreground file:mr-4 file:rounded-xl file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary"
                          />
                          {isUploadingAttachments && (
                            <p className="mt-2 text-xs text-muted-foreground">Uploading attachments...</p>
                          )}
                        </div>
                      )}

                      {normalizedAttachmentItems.length > 0 ? (
                        <div className="space-y-2">
                          {normalizedAttachmentItems.map((attachment) => (
                            <div
                              key={`${title}-${attachment.id}`}
                              className="rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm text-muted-foreground"
                            >
                              <p>{attachment.name}</p>
                              {(attachment.uploadedBy || attachment.uploadedAt || attachment.sizeLabel) && (
                                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                  {[attachment.uploadedBy, formatMetaDate(attachment.uploadedAt), attachment.sizeLabel]
                                    .filter(Boolean)
                                    .join(" - ")}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                          No files attached to this task yet.
                        </div>
                      )}
                    </section>
                  </div>
                </div>

                <aside className="min-h-0 overflow-y-auto border-t border-border/80 bg-muted/20 px-5 py-5 sm:px-6 md:border-l md:border-t-0 custom-scrollbar">
                  <div className="space-y-5">
                    <div className="rounded-2xl border border-border bg-background/80 p-4">
                      <h4 className="text-base font-semibold text-foreground">Details</h4>

                      <dl className="mt-4 space-y-4 text-sm">
                        <div className="grid grid-cols-[96px_1fr] items-start gap-3">
                          <dt className="text-muted-foreground">Status</dt>
                          <dd>
                            <span
                              className={cn(
                                "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
                                statusColors[statusKey] || statusColors["to do"]
                              )}
                            >
                              {normalizedStatus}
                            </span>
                          </dd>
                        </div>

                        <div className="grid grid-cols-[96px_1fr] items-start gap-3">
                          <dt className="text-muted-foreground">Assignee</dt>
                          <dd className="min-w-0">
                            {resolvedAssigneeName ? (
                              <div className="flex items-center gap-2">
                                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                                  {primaryAssigneeInitial}
                                  {primaryAssigneeUserId && (
                                    <UserStatus
                                      userId={primaryAssigneeUserId}
                                      className="absolute -bottom-1 -right-1"
                                      indicatorClassName="h-2.5 w-2.5"
                                    />
                                  )}
                                </div>
                                <span className="min-w-0 truncate font-medium text-foreground">
                                  {resolvedAssigneeName}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Unassigned</span>
                            )}
                          </dd>
                        </div>

                        <div className="grid grid-cols-[96px_1fr] items-start gap-3">
                          <dt className="text-muted-foreground">Project</dt>
                          <dd className="flex items-center gap-2 text-foreground">
                            <FolderKanbanIcon size={14} className="text-primary/80" />
                            <span className="min-w-0 truncate">{projectName || "Workspace"}</span>
                          </dd>
                        </div>

                        <div className="grid grid-cols-[96px_1fr] items-start gap-3">
                          <dt className="text-muted-foreground">Due date</dt>
                          <dd className="flex items-center gap-2 text-foreground">
                            <CalendarIcon size={14} className="text-primary/80" />
                            <span>{dueDateLabel}</span>
                          </dd>
                        </div>

                        <div className="grid grid-cols-[96px_1fr] items-start gap-3">
                          <dt className="text-muted-foreground">Priority</dt>
                          <dd>
                            <span
                              className={cn(
                                "inline-flex rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wider",
                                priorityColors[priorityKey] || priorityColors.medium
                              )}
                            >
                              {normalizedPriority}
                            </span>
                          </dd>
                        </div>

                        <div className="grid grid-cols-[96px_1fr] items-start gap-3">
                          <dt className="text-muted-foreground">Created by</dt>
                          <dd className="flex items-center gap-2 text-foreground">
                            <UserIcon size={14} className="text-primary/80" />
                            <span className="min-w-0 truncate">{resolvedCreatorName}</span>
                          </dd>
                        </div>

                        <div className="grid grid-cols-[96px_1fr] items-start gap-3">
                          <dt className="text-muted-foreground">Comments</dt>
                          <dd className="flex items-center gap-2 text-foreground">
                            <MessageSquareIcon size={14} className="text-primary/80" />
                            <span>{commentCount}</span>
                          </dd>
                        </div>

                        <div className="grid grid-cols-[96px_1fr] items-start gap-3">
                          <dt className="text-muted-foreground">Attachments</dt>
                          <dd className="flex items-center gap-2 text-foreground">
                            <PaperclipIcon size={14} className="text-primary/80" />
                            <span>{attachmentCount}</span>
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="rounded-2xl border border-border bg-background/80 p-4">
                      <h4 className="text-sm font-semibold text-foreground">Task Snapshot</h4>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{taskSnapshot}</p>
                    </div>

                    {canDeleteTask && onDeleteTask && (
                      <button
                        type="button"
                        onClick={() => {
                          void handleDeleteTask()
                        }}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        <Trash2Icon size={14} />
                        Delete task
                      </button>
                    )}
                  </div>
                </aside>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
