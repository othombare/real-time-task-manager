import { AnimatePresence, motion } from "framer-motion"
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
  onAddTaskComment,
  onAddTaskAttachments,
  onUpdateTask,
  onDeleteTask,
  onAddTaskComment,
  onAddTaskAttachments,
  currentUserName,
  currentUserId,
}) {
  return (
    <div className="flex min-w-[300px] flex-1 flex-col gap-4 kanban-column">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className={cn("h-6 w-1.5 rounded-full", color)} />
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-tight">
            {title}
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              {tasks.length}
            </span>
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onAddTask?.(title)}
            className="group rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"
          >
            <PlusIcon size={16} className="group-hover:text-primary" />
          </button>
          <button className="group rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted">
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
                    <motion.div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      layout
                      className={cn(
                        "rounded-xl",
                        dragSnapshot.isDragging && "rotate-1 shadow-lg"
                      )}
                    >
                      <TaskCard
                        {...task}
                        status={task.status || title}
                        statusOptions={["To Do", "In Progress", "In Review", "Done"]}
                        onAddComment={onAddTaskComment}
                        onAddAttachments={onAddTaskAttachments}
                        onUpdateTask={onUpdateTask}
                        onAddComment={
                          onAddTaskComment && task.projectSlug
                            ? (taskId, text) => onAddTaskComment(taskId, text, task.projectSlug)
                            : undefined
                        }
                        onAddAttachments={
                          onAddTaskAttachments && task.projectSlug
                            ? (taskId, files) => onAddTaskAttachments(taskId, files, task.projectSlug)
                            : undefined
                        }
                        onDeleteTask={onDeleteTask}
                        currentUserName={currentUserName}
                        currentUserId={currentUserId}
                      />
                    </motion.div>
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
