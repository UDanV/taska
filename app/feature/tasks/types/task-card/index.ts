import type { TaskItem } from "@/app/entities/task/model/types";

export type TaskCardActionMode = "inline" | "dropdown" | "hidden";

export interface TaskCardProps {
    task: TaskItem;
    compact?: boolean;
    actionMode?: TaskCardActionMode;
    draggable?: boolean;
    deletingTaskId: string | null;
    onOpenTask: (taskId: string) => void;
    onEditTask: (task: TaskItem) => void;
    onDeleteTask: (taskId: string) => void | Promise<void>;
    onDragStart?: (taskId: string) => void;
    onDragEnd?: () => void;
};