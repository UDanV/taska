import TaskCard from "../../task-card";
import { ListViewProps } from "@/app/feature/tasks/types/task-views/list";

export function TaskListView(props: ListViewProps) {
    return (
        <div className="space-y-3">
            {props.filteredTasks.map((task) => (
                <TaskCard
                    key={task.id}
                    task={task}
                    deletingTaskId={props.deletingTaskId}
                    onOpenTask={props.onOpenTask}
                    onEditTask={props.onEditTask}
                    onDeleteTask={props.onDeleteTask}
                />
            ))}
        </div>
    );
}