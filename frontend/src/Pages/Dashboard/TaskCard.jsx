import { useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  CalendarIcon,
  FolderKanbanIcon,
  PlusIcon,
  MessageSquareIcon,
  PaperclipIcon,
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

export function TaskCard({
  id,
  title,
  description,
  notes,
  priority,
  assignee,
  assigneeNames = [],
  assignedToUserId,
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
  const [activeSection, setActiveSection] = useState("details")
  const [commentDraft, setCommentDraft] = useState("")
  const [isSavingComment, setIsSavingComment] = useState(false)
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false)
  const attachmentInputRef = useRef(null)
  const priorityColors = {
    high: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  }
  const normalizedPriority = String(priority || "Medium")
  const priorityKey = normalizedPriority.toLowerCase()
  const creatorLabel =
    typeof createdBy === "string" ? createdBy : createdBy?.name || createdBy?.label || ""
  const resolvedCreatorName = memberNameMap[creatorLabel] || creatorLabel || "Workspace"
  const resolvedAssigneeName =
    Array.isArray(assigneeNames) && assigneeNames.length > 0
      ? assigneeNames.join(", ")
      : Array.isArray(assignee) && assignee.length > 0
        ? assignee.join(", ")
        : null
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
  const commentTexts = normalizedCommentItems.map((item) => item.text).filter(Boolean)
  const attachmentNames = normalizedAttachmentItems.map((item) => item.name).filter(Boolean)
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

  const openDetails = (section = "details") => {
    setActiveSection(section)
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
      setActiveSection("comments")
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

      setActiveSection("attachments")
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
        className="group w-full cursor-pointer space-y-3 rounded-xl border border-border/60 bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="flex items-center justify-between gap-3">
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-xs font-bold uppercase tracking-wider",
              priorityColors[priorityKey] || priorityColors.medium
            )}
          >
            {normalizedPriority}
          </span>
          <div className="flex items-center gap-2">
            {canDeleteTask && onDeleteTask && (
              <button
                type="button"
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation()
                  void handleDeleteTask()
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
                aria-label={`Delete ${title}`}
                title="Delete task"
              >
                <Trash2Icon size={14} />
              </button>
            )}
            <div className="flex -space-x-2">
              {(Array.isArray(assignee) ? assignee : []).map((initial, index) => (
                <div
                  key={`${title}-assignee-${index}`}
                  className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-primary text-[10px] font-bold text-primary-foreground transition-transform hover:-translate-y-1 hover:z-10"
                >
                  {initial}
                  {index === 0 && assignedToUserId && (
                    <UserStatus
                      userId={assignedToUserId}
                      className="absolute -bottom-1 -right-1"
                      indicatorClassName="h-2.5 w-2.5"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <h4 className="line-clamp-2 text-sm font-semibold leading-relaxed transition-colors group-hover:text-primary">
          {title}
        </h4>

        {projectName && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <FolderKanbanIcon size={12} className="text-primary/70" />
            {projectName}
          </p>
        )}

        {resolvedAssigneeName && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <UserIcon size={12} className="text-primary/70" />
            Assigned to {resolvedAssigneeName}
            {assignedToUserId && <UserStatus userId={assignedToUserId} />}
          </p>
        )}

        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <UserIcon size={12} className="text-primary/70" />
          Created by {resolvedCreatorName}
        </p>

        <p className="flex items-center gap-1.5 pb-1 text-xs text-muted-foreground">
          <CalendarIcon size={12} className="text-primary/60" />
          Due: {dueDate}
        </p>

        <div className="flex items-center justify-between border-t border-border pt-3 text-muted-foreground">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                openDetails("comments")
              }}
              className="flex items-center gap-1 text-xs transition-colors hover:text-foreground"
            >
              <MessageSquareIcon size={12} /> {commentCount}
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                openDetails("attachments")
              }}
              className="flex items-center gap-1 text-xs transition-colors hover:text-foreground"
            >
              <PaperclipIcon size={12} /> {attachmentCount}
            </button>
          </div>
          <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
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
              className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="min-h-0 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2 py-1 text-xs font-bold uppercase tracking-wider",
                        priorityColors[priorityKey] || priorityColors.medium
                      )}
                    >
                      {normalizedPriority}
                    </span>
                    <h3 className="text-xl font-semibold tracking-tight text-foreground">{title}</h3>
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

                <div className="mt-5 grid gap-3 text-sm text-muted-foreground">
                  {projectName && (
                    <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
                      <FolderKanbanIcon size={15} className="text-primary/80" />
                      <span>{projectName}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
                    <CalendarIcon size={15} className="text-primary/80" />
                    <span>Due: {dueDate}</span>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
                    <UserIcon size={15} className="text-primary/80" />
                    <span>Created by: {resolvedCreatorName}</span>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <p className="text-sm font-semibold text-foreground">Description</p>
                  <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm leading-7 text-muted-foreground">
                    {description || "No description provided for this task."}
                  </div>
                </div>

                {notes && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold text-foreground">Notes</p>
                    <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm leading-7 text-muted-foreground">
                      {notes}
                    </div>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setActiveSection("comments")}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-3 py-1.5 transition",
                      activeSection === "comments" ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}
                  >
                    <MessageSquareIcon size={14} />
                    {commentCount} comments
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection("attachments")}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-3 py-1.5 transition",
                      activeSection === "attachments"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <PaperclipIcon size={14} />
                    {attachmentCount} attachments
                  </button>
                </div>

                {(activeSection === "comments" || normalizedCommentItems.length > 0 || canAddComments) && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">Comments</p>
                      <span className="text-xs text-muted-foreground">{commentCount} total</span>
                    </div>

                    {activeSection === "comments" && canAddComments && (
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
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                          >
                            <PlusIcon size={14} />
                            {isSavingComment ? "Saving..." : "Add comment"}
                          </button>
                        </div>
                      </div>
                    )}

                    {normalizedCommentItems.length > 0 ? (
                      <div className="max-h-56 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
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
                  </div>
                )}

                {(activeSection === "attachments" ||
                  normalizedAttachmentItems.length > 0 ||
                  canAddAttachments) && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">Attachments</p>
                      <span className="text-xs text-muted-foreground">{attachmentCount} total</span>
                    </div>

                    {activeSection === "attachments" && canAddAttachments && (
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-3">
                        <input
                          ref={attachmentInputRef}
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
                      <div className="max-h-56 overflow-y-auto rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 pr-3 text-sm text-muted-foreground custom-scrollbar">
                        <div className="space-y-2">
                          {normalizedAttachmentItems.map((attachment) => (
                            <div
                              key={`${title}-${attachment.id}`}
                              className="rounded-xl border border-border/60 bg-background/80 px-3 py-2"
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
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                        No files attached to this task yet.
                      </div>
                    )}
                  </div>
                )}

                {canDeleteTask && onDeleteTask && (
                  <div className="mt-5 border-t border-border pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        void handleDeleteTask()
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                      <Trash2Icon size={14} />
                      Delete task
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
