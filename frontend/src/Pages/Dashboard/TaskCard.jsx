import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  CalendarIcon,
  FolderKanbanIcon,
  MessageSquareIcon,
  PaperclipIcon,
  UserIcon,
  XIcon,
} from "lucide-react"
import { cn } from "../../lib/utils"

export function TaskCard({
  title,
  description,
  priority,
  assignee,
  dueDate,
  comments = 0,
  attachments = 0,
  projectName,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const priorityColors = {
    high: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  }

  return (
    <>
      <motion.button
        layout
        type="button"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -2, rotate: 0.5, transition: { duration: 0.1 } }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="w-full text-left p-4 bg-card border border-border/60 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group space-y-3"
      >
        <div className="flex items-center justify-between">
          <span className={cn(
            "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border",
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
          <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
            <FolderKanbanIcon size={12} className="text-primary/70" />
            {projectName}
          </p>
        )}

        <p className="text-xs text-muted-foreground flex items-center gap-1.5 pb-1">
          <CalendarIcon size={12} className="text-primary/60" />
          Due: {dueDate}
        </p>

        <div className="pt-3 border-t border-border flex items-center justify-between text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="text-[10px] flex items-center gap-1 hover:text-foreground transition-colors">
              <MessageSquareIcon size={12} /> {comments}
            </span>
            <span className="text-[10px] flex items-center gap-1 hover:text-foreground transition-colors">
              <PaperclipIcon size={12} /> {attachments}
            </span>
          </div>
          <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
        </div>
      </motion.button>

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
                    "inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full border",
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
                  <span>Assignee: {assignee.join(", ")}</span>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <p className="text-sm font-semibold text-foreground">Description</p>
                <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm leading-7 text-muted-foreground">
                  {description || "No description provided for this task."}
                </div>
              </div>

              <div className="mt-5 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
                  <MessageSquareIcon size={14} />
                  {comments} comments
                </span>
                <span className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
                  <PaperclipIcon size={14} />
                  {attachments} attachments
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
