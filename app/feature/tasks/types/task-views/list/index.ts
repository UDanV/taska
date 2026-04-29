import type { TaskItem } from "@/app/entities/task/model/types";

export interface ListViewProps {
    filteredTasks: TaskItem[];
    deletingTaskId: string | null;
    onOpenTask: (taskId: string) => void;
    onEditTask: (task: TaskItem) => void;
    onDeleteTask: (taskId: string) => void | Promise<void>;
};