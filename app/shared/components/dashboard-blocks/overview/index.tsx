import { ChartBar } from "lucide-react";
import AnalyticsMetricBlock from "../analytics-block";
import { useDashboardWorkspace } from "@/app/feature/dashboard/model/workspace";

export default function OverviewAnalytics() {
    const workspace = useDashboardWorkspace();

    return (
        <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
                <ChartBar size={18} className="text-primary" />
                <h2 className="font-semibold text-lg tracking-tight">Дашборд</h2>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
                <AnalyticsMetricBlock
                    label="Активных задач"
                    value={workspace.activeTasks.length}
                    description="Всё, что ещё не переведено в готово"
                />
                <AnalyticsMetricBlock
                    label="Команд в работе"
                    value={workspace.teams.length}
                    description="Начните с первой команды, если список пуст"
                />
                <AnalyticsMetricBlock
                    label="Закрыто задач"
                    value={workspace.doneTasksCount}
                    description={`Высокий приоритет сейчас у ${workspace.highPriorityCount} задач`}
                    descriptionClassName="text-primary"
                />
            </div>
        </section>
    );
}