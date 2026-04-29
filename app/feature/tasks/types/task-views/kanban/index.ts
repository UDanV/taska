import { TaskItem } from "@/app/entities/task/model/types";
import { TaskStatus } from "@prisma/client";

export interface KanbanColumn {
    id: TaskStatus;
    title: string;
    tasks: TaskItem[];
};

export interface KanbanViewProps {
    boardColumns: KanbanColumn[];
    canManageTasks: boolean;
    currentUserId: string | null;
    dragOverStatus: TaskStatus | null;
    draggingTaskId: string | null;
    deletingTaskId: string | null;
    onTaskStatusDrop: (taskId: string, status: TaskStatus) => void | Promise<void>;
    onSetDragOverStatus: (value: TaskStatus | null) => void;
    onSetDraggingTaskId: (value: string | null) => void;
    onOpenTask: (taskId: string) => void;
    onEditTask: (task: TaskItem) => void;
    onDeleteTask: (taskId: string) => void | Promise<void>;
};