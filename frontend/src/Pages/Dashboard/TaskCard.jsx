import { motion } from "framer-motion"
import { CalendarIcon, MessageSquareIcon, PaperclipIcon } from "lucide-react"
import { cn } from "../../lib/utils"

export function TaskCard({ title, priority, assignee, dueDate, comments = 0, attachments = 0 }) {
  const priorityColors = {
    high: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2, rotate: 0.5, transition: { duration: 0.1 } }}
      whileTap={{ scale: 0.98 }}
      className="p-4 bg-card border border-border/60 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group space-y-3"
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
              className="w-7 h-7 rounded-full bg-primary text-[10px] font-bold text-primary-foreground border-2 border-card flex items-center justify-center hover:z-10 cursor-pointer transition-transform hover:-translate-y-1"
            >
              {initial}
            </div>
          ))}
        </div>
      </div>
      
      <h4 className="text-sm font-semibold leading-relaxed line-clamp-2 group-hover:text-primary transition-colors">
        {title}
      </h4>
      
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
    </motion.div>
  )
}
