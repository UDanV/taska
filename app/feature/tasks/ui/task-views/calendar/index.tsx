import { Chip } from "@heroui/chip";
import { CALENDAR_WEEK_DAYS, TASKS_MESSAGES } from "../../../model/constants";
import { Button } from "@heroui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMonthLabel } from "../../../lib/date";
import { CalendarViewProps } from "../../../types/task-views/calendar";

export function TaskCalendarView({
    calendarDate,
    calendarDays,
    onOpenTask,
    onPrevMonth,
    onToday,
    onNextMonth,
}: CalendarViewProps) {
    return (
        <div className="rounded-[26px] border border-border bg-muted/30 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="text-lg font-semibold capitalize">{getMonthLabel(calendarDate)}</h3>
                    <p className="text-sm text-muted-foreground">{TASKS_MESSAGES.monthBuiltByUpdatedAt}</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button isIconOnly variant="light" className="rounded-xl" onPress={onPrevMonth}>
                        <ChevronLeft size={16} />
                    </Button>
                    <Button variant="light" className="rounded-xl" onPress={onToday}>
                        {TASKS_MESSAGES.today}
                    </Button>
                    <Button isIconOnly variant="light" className="rounded-xl" onPress={onNextMonth}>
                        <ChevronRight size={16} />
                    </Button>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {CALENDAR_WEEK_DAYS.map((day) => (
                    <div key={day} className="rounded-2xl px-2 py-2">
                        {day}
                    </div>
                ))}
            </div>

            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-7">
                {calendarDays.map((day) => (
                    <div
                        key={day.key}
                        className={`rounded-3xl border p-3 ${day.inCurrentMonth ? "border-border bg-background" : "border-transparent bg-background/50"}`}
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span
                                className={`text-sm font-medium ${day.inCurrentMonth ? "text-foreground" : "text-muted-foreground"}`}
                            >
                                {day.date.getDate()}
                            </span>
                            {day.tasks.length > 0 ? (
                                <Chip size="sm" variant="flat" className="rounded-xl">
                                    {day.tasks.length}
                                </Chip>
                            ) : null}
                        </div>

                        <div className="mt-3 space-y-2">
                            {day.tasks.slice(0, 3).map((task) => (
                                <button
                                    key={task.id}
                                    type="button"
                                    onClick={() => onOpenTask(task.id)}
                                    className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-left text-xs font-medium text-foreground transition hover:bg-muted"
                                >
                                    <span className="block truncate">{task.title}</span>
                                </button>
                            ))}
                            {day.tasks.length > 3 ? (
                                <div className="rounded-2xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                                    {TASKS_MESSAGES.moreTasks} {day.tasks.length - 3} задач
                                </div>
                            ) : null}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
