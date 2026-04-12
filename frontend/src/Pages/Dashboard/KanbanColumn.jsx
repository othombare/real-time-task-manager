import { motion, AnimatePresence } from "framer-motion"
import { MoreHorizontalIcon, PlusIcon } from "lucide-react"
import { Draggable } from "react-beautiful-dnd"
import { TaskCard } from "./TaskCard"
import { StrictModeDroppable } from "./StrictModeDroppable"
import { cn } from "../../lib/utils"

export function KanbanColumn({
  title,
  tasks,
  color,
  droppableId,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  currentUserName,
  currentUserId,
}) {
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

      <StrictModeDroppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <motion.div
            ref={provided.innerRef}
            {...provided.droppableProps}
            layout
            className={cn(
              "flex min-h-[500px] flex-col gap-3.5 rounded-2xl transition-colors",
              snapshot.isDraggingOver && "bg-primary/5"
            )}
          >
            <AnimatePresence mode="popLayout">
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                  {(dragProvided, dragSnapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      className={cn(
                        "rounded-xl",
                        dragSnapshot.isDragging && "rotate-1 shadow-lg"
                      )}
                    >
                      <TaskCard
                        {...task}
                        status={task.status || title}
                        statusOptions={["To Do", "In Progress", "In Review", "Done"]}
                        onUpdateTask={onUpdateTask}
                        onDeleteTask={onDeleteTask}
                        currentUserName={currentUserName}
                        currentUserId={currentUserId}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
            </AnimatePresence>

            {provided.placeholder}

            {tasks.length === 0 && (
              <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-muted/20 text-xs italic text-muted-foreground">
                No tasks in this column
              </div>
            )}
          </motion.div>
        )}
      </StrictModeDroppable>
    </div>
  )
}
