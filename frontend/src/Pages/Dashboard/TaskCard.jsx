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
import { cn } from "../../lib/utils"

const memberNameMap = {
  OJ: "Onkar J.",
  AK: "Aarav K.",
  SK: "Sakshi K.",
  AN: "Anika N.",
  RJ: "Riya J.",
  VK: "Vivek K.",
  MK: "Meera K.",
}

export function TaskCard({
  id,
  title,
  description,
  notes,
  priority,
  assignee,
  createdBy,
  createdByUserId,
  dueDate,
  comments = 0,
  commentsList = [],
  attachments = 0,
  attachmentFiles = [],
  projectName,
  onUpdateTask,
  onDeleteTask,
  currentUserName,
  currentUserId,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("details")
  const [commentDraft, setCommentDraft] = useState("")
  const attachmentInputRef = useRef(null)
  const priorityColors = {
    high: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  }
  const commentCount = Math.max(comments, commentsList.length)
  const attachmentCount = Math.max(attachments, attachmentFiles.length)
  const resolvedCreatorName = memberNameMap[createdBy] || createdBy || "Workspace"
  const canManageTask =
    (Boolean(currentUserId) && Boolean(createdByUserId) && currentUserId === createdByUserId) ||
    (Boolean(currentUserName) &&
      String(currentUserName).trim().toLowerCase() === String(createdBy || "").trim().toLowerCase())

  const openDetails = (section = "details") => {
    setActiveSection(section)
    setIsOpen(true)
  }

  const handleAddComment = () => {
    const nextComment = commentDraft.trim()

    if (!nextComment || !onUpdateTask || !canManageTask) {
      return
    }

    onUpdateTask(id, {
      comments: commentCount + 1,
      commentsList: [...commentsList, nextComment],
    })
    setCommentDraft("")
    setActiveSection("comments")
  }

  const handleAttachmentChange = (event) => {
    const selectedNames = Array.from(event.target.files || []).map((file) => file.name)

    if (selectedNames.length === 0 || !onUpdateTask || !canManageTask) {
      return
    }

    onUpdateTask(id, {
      attachments: attachmentCount + selectedNames.length,
      attachmentFiles: [...attachmentFiles, ...selectedNames],
    })

    event.target.value = ""
    setActiveSection("attachments")
  }

  const handleDeleteTask = () => {
    if (!onDeleteTask || !canManageTask) {
      return
    }

    const confirmed = window.confirm(`Delete "${title}"?`)
    if (!confirmed) {
      return
    }

    onDeleteTask(id)
    setIsOpen(false)
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
        className="w-full text-left p-4 bg-card border border-border/60 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group space-y-3"
      >
        <div className="flex items-center justify-between">
          <span className={cn(
            "text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border",
            priorityColors[priority.toLowerCase()]
          )}>
            {priority}
          </span>
          <div className="flex -space-x-2">
            {assignee.map((initial, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full bg-primary text-[10px] font-bold text-primary-foreground border-2 border-card flex items-center justify-center hover:z-10 transition-transform hover:-translate-y-1"
              >
                {initial}
              </div>
            ))}
          </div>
        </div>

        <h4 className="text-sm font-semibold leading-relaxed line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h4>

        {projectName && (
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <FolderKanbanIcon size={12} className="text-primary/70" />
            {projectName}
          </p>
        )}

        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <UserIcon size={12} className="text-primary/70" />
          Created by {resolvedCreatorName}
        </p>

        <p className="text-xs text-muted-foreground flex items-center gap-1.5 pb-1">
          <CalendarIcon size={12} className="text-primary/60" />
          Due: {dueDate}
        </p>

        <div className="pt-3 border-t border-border flex items-center justify-between text-muted-foreground">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                openDetails("comments")
              }}
              className="text-xs flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <MessageSquareIcon size={12} /> {commentCount}
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                openDetails("attachments")
              }}
              className="text-xs flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <PaperclipIcon size={12} /> {attachmentCount}
            </button>
          </div>
          <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
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
              className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <span className={cn(
                    "inline-flex text-xs uppercase font-bold tracking-wider px-2 py-1 rounded-full border",
                    priorityColors[priority.toLowerCase()]
                  )}>
                    {priority}
                  </span>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">
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
                    activeSection === "attachments" ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}
                >
                  <PaperclipIcon size={14} />
                  {attachmentCount} attachments
                </button>
              </div>

              {(activeSection === "comments" || commentsList.length > 0 || onUpdateTask) && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">Comments</p>
                    <span className="text-xs text-muted-foreground">{commentCount} total</span>
                  </div>

                  {activeSection === "comments" && onUpdateTask && canManageTask && (
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
                          className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                        >
                          <PlusIcon size={14} />
                          Add comment
                        </button>
                      </div>
                    </div>
                  )}
                  {activeSection === "comments" && onUpdateTask && !canManageTask && (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                      Only the person who added this task can update or delete it.
                    </div>
                  )}
                  {commentsList.length > 0 ? (
                    <div className="space-y-2">
                      {commentsList.map((comment, index) => (
                        <div
                          key={`${title}-comment-${index}`}
                          className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm leading-6 text-muted-foreground"
                        >
                          {comment}
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

              {(activeSection === "attachments" || attachmentFiles.length > 0 || onUpdateTask) && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">Attachments</p>
                    <span className="text-xs text-muted-foreground">{attachmentCount} total</span>
                  </div>

                  {activeSection === "attachments" && onUpdateTask && canManageTask && (
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-3">
                      <input
                        ref={attachmentInputRef}
                        type="file"
                        multiple
                        onChange={handleAttachmentChange}
                        className="block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-muted-foreground file:mr-4 file:rounded-xl file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary"
                      />
                    </div>
                  )}
                  {activeSection === "attachments" && onUpdateTask && !canManageTask && (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                      Only the person who added this task can update or delete it.
                    </div>
                  )}

                  {attachmentFiles.length > 0 ? (
                    <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                      {attachmentFiles.join(", ")}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                      No files attached to this task yet.
                    </div>
                  )}
                </div>
              )}

              {canManageTask && onDeleteTask && (
                <div className="mt-5 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={handleDeleteTask}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    <Trash2Icon size={14} />
                    Delete task
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
