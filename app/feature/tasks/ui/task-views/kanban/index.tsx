import { KanbanViewProps } from "@/app/feature/tasks/types/task-views/kanban";
import { TASKS_MESSAGES } from "@/app/feature/tasks/model/constants";
import { Chip } from "@heroui/react";
import TaskCard from "../../task-card";

export function TaskKanbanView({
    boardColumns,
    canManageTasks,
    currentUserId,
    dragOverStatus,
    draggingTaskId,
    deletingTaskId,
    onTaskStatusDrop,
    onSetDragOverStatus,
    onSetDraggingTaskId,
    onOpenTask,
    onEditTask,
    onDeleteTask,
  }: KanbanViewProps) {
    return (
      <div className="grid gap-4 xl:grid-cols-4">
        {boardColumns.map((column) => (
          <div
            key={column.id}
            className={`rounded-[26px] p-4 transition ${dragOverStatus === column.id ? "bg-primary/10 ring-1 ring-primary/40" : "bg-muted"}`}
            onDragOver={(event) => {
              event.preventDefault();
              onSetDragOverStatus(column.id);
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                onSetDragOverStatus(null);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              const taskId = event.dataTransfer.getData("text/plain");
              onSetDragOverStatus(null);
  
              if (taskId) {
                void onTaskStatusDrop(taskId, column.id);
              }
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">{column.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {column.tasks.length} {TASKS_MESSAGES.cardsCountSuffix}
                </p>
              </div>
              <Chip variant="flat" className="rounded-xl">
                {column.tasks.length}
              </Chip>
            </div>
  
            <div className="mt-4 space-y-3">
              {column.tasks.length > 0 ? (
                column.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    actionMode="dropdown"
                    draggable={canManageTasks || task.assignee?.id === currentUserId}
                    deletingTaskId={deletingTaskId}
                    onOpenTask={onOpenTask}
                    onEditTask={onEditTask}
                    onDeleteTask={onDeleteTask}
                    onDragStart={(taskId) => onSetDraggingTaskId(taskId)}
                    onDragEnd={() => {
                      onSetDraggingTaskId(null);
                      onSetDragOverStatus(null);
                    }}
                  />
                ))
              ) : (
                <div
                  className={`rounded-3xl border border-dashed p-4 text-sm text-muted-foreground ${draggingTaskId ? "border-primary/40 bg-primary/5" : "border-border bg-background/70"}`}
                >
                  {draggingTaskId ? TASKS_MESSAGES.dropHere : TASKS_MESSAGES.columnEmpty}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }