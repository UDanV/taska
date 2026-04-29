import type { TaskItem } from "@/app/entities/task/model/types";
import type { TaskCommentItem } from "@/app/entities/task/model/types";

export interface TaskDetailsDrawerProps {
    isOpen: boolean;
    selectedTask: TaskItem | null;
    commentsLoading: boolean;
    taskComments: TaskCommentItem[];
    commentDraft: string;
    postingComment: boolean;
    savingPhotos: boolean;
    onOpenChange: (open: boolean) => void;
    onCommentDraftChange: (value: string) => void;
    onAddComment: () => void | Promise<void>;
    onTaskPhotoUpload: (files: FileList | null) => void | Promise<void>;
    onRemoveTaskPhoto: (index: number) => void | Promise<void>;
};