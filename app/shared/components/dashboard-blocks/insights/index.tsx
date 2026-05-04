import { ChartPie } from "lucide-react";
import AnalyticsMetricBlock from "../analytics-block";
import { useDashboardWorkspace } from "@/app/feature/dashboard/model/workspace";

export default function QuickInsightsAnalytics() {
    const workspace = useDashboardWorkspace();

    return (
        <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
                <ChartPie size={18} className="text-primary" />
                <h2 className="font-semibold text-lg tracking-tight">Быстрые инсайты</h2>
            </div>

            <div className="mt-4 space-y-4">
                <AnalyticsMetricBlock
                    label="На проверке сейчас"
                    value={`${workspace.reviewTasksCount} задач`}
                />
                <AnalyticsMetricBlock
                    label="Высокий приоритет"
                    value={`${workspace.highPriorityCount} задач`}
                />
                <AnalyticsMetricBlock
                    label="Уже закрыто"
                    value={`${workspace.doneTasksCount} задач`}
                />
            </div>
        </section>
    );
}