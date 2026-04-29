import { TaskPriority, TaskStatus, UserSpecialization } from "@prisma/client";

export type TaskModalAssigneeItem = {
    id: string;
    name: string | null;
    email: string | null;
    specialization: UserSpecialization;
    teamIds: string[];
};

export type TaskModalTeamItem = {
    id: string;
    name: string;
};

export type TaskModalFormState = {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    specialization: UserSpecialization | "";
    teamId: string;
    assigneeId: string;
    photos: string[];
};

export interface TaskEditorModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    isEditing: boolean;
    taskForm: TaskModalFormState;
    setTaskForm: React.Dispatch<React.SetStateAction<TaskModalFormState>>;
    teams: TaskModalTeamItem[];
    taskAssignees: TaskModalAssigneeItem[];
    isSaving: boolean;
    onSubmit: () => void | Promise<void>;
};

export function createEmptyTaskForm(teamId?: string): TaskModalFormState {
    return {
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        specialization: "",
        teamId: teamId ?? "",
        assigneeId: "",
        photos: [],
    };
}