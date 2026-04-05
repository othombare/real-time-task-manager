import { motion, AnimatePresence } from "framer-motion"
import { MoreHorizontalIcon, PlusIcon } from "lucide-react"
import { TaskCard } from "./TaskCard"
import { cn } from "../../lib/utils"

export function KanbanColumn({ title, tasks, color, onAddTask, onUpdateTask }) {
  return (
    <div className="flex flex-col gap-4 kanban-column flex-1 min-w-[300px]">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className={cn("w-1.5 h-6 rounded-full", color)} />
          <h3 className="text-sm font-bold tracking-tight uppercase flex items-center gap-2">
            {title}
            <span className="text-xs font-semibold px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
              {tasks.length}
            </span>
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onAddTask?.(title)}
            className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors group"
          >
            <PlusIcon size={16} className="group-hover:text-primary" />
          </button>
          <button className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors group">
            <MoreHorizontalIcon size={16} />
          </button>
        </div>
      </div>
      
      <motion.div 
        layout
        className="flex flex-col gap-3.5 min-h-[500px]"
      >
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <TaskCard key={task.id} {...task} onUpdateTask={onUpdateTask} />
          ))}
        </AnimatePresence>
        
        {tasks.length === 0 && (
          <div className="h-24 border-2 border-dashed border-border/60 rounded-xl flex items-center justify-center text-xs text-muted-foreground italic bg-muted/20">
            No tasks in this column
          </div>
        )}
      </motion.div>
    </div>
  )
}
