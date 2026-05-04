import TaskStatusChart from "@/app/feature/dashboard/ui/charts/task-status";
import AnalyticsMetricBlock from "../analytics-block";

export default function TaskBoardAnalytics({ workspace }: { workspace: DashboardWorkspace }) {
    return (
      <div className="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl border border-border bg-background p-4">
          <p className="text-sm font-medium text-foreground">Сводка задач</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <AnalyticsMetricBlock
              label="Всего задач"
              value={workspace.tasks.length}
              variant="muted"
            />
            <AnalyticsMetricBlock
              label="Активно сейчас"
              value={workspace.activeTasks.length}
              variant="muted"
            />
            <AnalyticsMetricBlock
              label="На проверке"
              value={workspace.reviewTasksCount}
              variant="muted"
            />
          </div>
        </section>
  
        <section className="rounded-3xl border border-border bg-background p-4">
          <p className="text-sm font-medium text-foreground">
            Распределение задач по статусам
          </p>
          <div className="mt-4 h-64">
            <TaskStatusChart counts={workspace.taskStatusCounts} />
          </div>
        </section>
      </div>
    );
  }