"use client";

import { MoreHorizontal, PenSquare, Trash2 } from "lucide-react";
import { Button } from "@heroui/button";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { Chip } from "@heroui/react";
import { getUserSpecializationLabel } from "@/app/lib/auth/roles";
import {
  TASK_PRIORITY_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from "@/app/lib/workspace/constants";
import { TASKS_MESSAGES } from "@/app/feature/tasks/model/constants";
import { TaskCardProps } from "../../types/task-card";
import { formatTaskUpdatedAt } from "../../lib/date";

export default function TaskCard({
  task,
  compact = false,
  actionMode = "inline",
  draggable = false,
  deletingTaskId,
  onOpenTask,
  onEditTask,
  onDeleteTask,
  onDragStart,
  onDragEnd,
}: TaskCardProps) {
  return (
    <article
      key={task.id}
      className={`rounded-3xl border border-border bg-background shadow-sm transition hover:border-primary/40 hover:shadow-md ${compact ? "p-3" : "p-4"} ${draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
      onClick={() => onOpenTask(task.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenTask(task.id);
        }
      }}
      role="button"
      tabIndex={0}
      draggable={draggable}
      onDragStart={(event) => {
        if (!draggable) {
          return;
        }

        event.dataTransfer.setData("text/plain", task.id);
        event.dataTransfer.effectAllowed = "move";
        onDragStart?.(task.id);
      }}
      onDragEnd={() => {
        onDragEnd?.();
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: task.team.color }}
            />
            <p className="truncate text-sm text-muted-foreground">{task.team.name}</p>
          </div>

          <p className={`mt-2 font-medium ${compact ? "text-sm" : ""}`}>{task.title}</p>

          {task.description ? (
            <p
              className={`mt-2 text-muted-foreground ${compact ? "line-clamp-2 text-xs" : "text-sm leading-6"}`}
            >
              {task.description}
            </p>
          ) : null}
        </div>

        {actionMode === "inline" ? (
          <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="rounded-xl"
              onPress={() => onEditTask(task)}
            >
              <PenSquare size={16} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              className="rounded-xl"
              isLoading={deletingTaskId === task.id}
              onPress={() => void onDeleteTask(task.id)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ) : null}

        {actionMode === "dropdown" ? (
          <div onClick={(event) => event.stopPropagation()}>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light" className="rounded-xl">
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label={`Действия для задачи ${task.title}`}>
                <DropdownItem
                  key="edit"
                  startContent={<PenSquare size={16} />}
                  onPress={() => onEditTask(task)}
                >
                  Редактировать
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  className="text-danger"
                  startContent={<Trash2 size={16} />}
                  onPress={() => void onDeleteTask(task.id)}
                >
                  Удалить
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        ) : null}
      </div>

      <div className={`mt-4 flex flex-wrap items-center gap-2 ${compact ? "" : "justify-between"}`}>
        <Chip color={TASK_PRIORITY_COLORS[task.priority]} variant="flat" className="rounded-xl">
          {TASK_PRIORITY_LABELS[task.priority]}
        </Chip>
        <Chip variant="flat" className="rounded-xl">
          {TASK_STATUS_LABELS[task.status]}
        </Chip>
        <Chip variant="flat" className="rounded-xl">
          {getUserSpecializationLabel(task.specialization) ?? TASKS_MESSAGES.noTag}
        </Chip>
        {task.assignee?.name ? (
          <span className="text-xs text-muted-foreground">Исполнитель: {task.assignee.name}</span>
        ) : null}
        <span className="text-xs text-muted-foreground">
          Обновлено {formatTaskUpdatedAt(task.updatedAt)}
        </span>
      </div>
    </article>
  );
}
