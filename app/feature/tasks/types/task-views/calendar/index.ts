import type { TaskItem } from "@/app/entities/task/model/types";

export interface CalendarDay {
    date: Date;
    key: string;
    inCurrentMonth: boolean;
    tasks: TaskItem[];
};

export interface CalendarViewProps {
    calendarDate: Date;
    calendarDays: CalendarDay[];
    onOpenTask: (taskId: string) => void;
    onPrevMonth: () => void;
    onToday: () => void;
    onNextMonth: () => void;
};  