"use client";

import Link from "next/link";
import {
  Calendar,
  ChartBar,
  ChartPie,
  CheckCircle2,
  Flag,
  LoaderCircle,
  Plus,
  SlidersHorizontal,
  Table,
  Users,
} from "lucide-react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/react";
import { useDashboardPreferences } from "@/app/shared/providers/dashboard-preferences";
import {
  TASK_PRIORITY_COLORS,
  TASK_PRIORITY_LABELS,
} from "@/app/lib/workspace/constants";
import CreateTeamModal from "@/app/feature/tasks/ui/modals/create-team";
import TaskEditorModal from "@/app/feature/tasks/ui/modals/task-editor";
import { useDashboardWorkspace } from "@/app/feature/dashboard/model/workspace";
import TaskStatusChart from "@/app/feature/dashboard/ui/charts/task-status";

export default function DashboardPage() {
  const { visibleSections } = useDashboardPreferences();
  const hasVisibleSections = Object.values(visibleSections).some(Boolean);
  const workspace = useDashboardWorkspace();

  return (
    <>
      <div className="space-y-8 p-4 md:p-6 xl:p-8">
        {!hasVisibleSections ? (
          <section className="rounded-[28px] border border-dashed border-border bg-card p-10 text-center shadow-sm">
            <div className="mx-auto max-w-xl">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <SlidersHorizontal size={22} />
              </div>
              <h1 className="mt-5 text-2xl font-semibold">
                Все блоки dashboard скрыты
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Включи нужные секции заново на странице настроек, чтобы собрать
                рабочее пространство под свой формат работы.
              </p>
              <Button
                as={Link}
                href="/dashboard/settings"
                color="primary"
                className="mt-6 rounded-xl"
              >
                Открыть настройки
              </Button>
            </div>
          </section>
        ) : null}

        {(visibleSections.overview || visibleSections.focus) && (
          <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            {visibleSections.overview ? (
              <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <ChartBar size={18} className="text-primary" />
                  <h2 className="font-semibold text-lg tracking-tight">Дашборд</h2>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <div className="rounded-3xl bg-muted p-4">
                    <p className="text-sm text-muted-foreground">Активных задач</p>
                    <p className="mt-2 text-3xl font-semibold">{workspace.activeTasks.length}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Всё, что ещё не переведено в готово
                    </p>
                  </div>
                  <div className="rounded-3xl bg-muted p-4">
                    <p className="text-sm text-muted-foreground">Команд в работе</p>
                    <p className="mt-2 text-3xl font-semibold">{workspace.teams.length}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Начните с первой команды, если список пуст
                    </p>
                  </div>
                  <div className="rounded-3xl bg-muted p-4">
                    <p className="text-sm text-muted-foreground">Закрыто задач</p>
                    <p className="mt-2 text-3xl font-semibold">{workspace.doneTasksCount}</p>
                    <p className="mt-2 text-sm text-primary">
                      Высокий приоритет сейчас у {workspace.highPriorityCount} задач
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {visibleSections.focus ? (
              <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-primary" />
                  <h2 className="font-semibold text-lg tracking-tight">
                    Фокус на сегодня
                  </h2>
                </div>

                <div className="mt-5 space-y-3">
                  {workspace.focusTasks.length > 0 ? (
                    workspace.focusTasks.map((task) => (
                      <div key={task.id} className="rounded-3xl bg-muted p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Команда: {task.team.name}
                            </p>
                          </div>
                          <Chip
                            variant="flat"
                            color={TASK_PRIORITY_COLORS[task.priority]}
                            className="rounded-xl"
                          >
                            {TASK_PRIORITY_LABELS[task.priority]}
                          </Chip>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl bg-muted p-4">
                      <p className="font-medium">Фокус появится после создания задач</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Добавьте первую команду и задачу, чтобы собрать рабочий
                        день прямо на дашборде.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </section>
        )}

        {(visibleSections.board ||
          visibleSections.projects ||
          visibleSections.insights) && (
          <section className="grid gap-4 2xl:grid-cols-[1.6fr_0.8fr]">
            {visibleSections.board ? (
              <div
                id="task-board"
                className="rounded-[28px] border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2">
                    <Table size={18} className="text-primary" />
                    <h2 className="font-semibold text-lg tracking-tight">
                      Рабочее пространство задач
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      as={Link}
                      href="/dashboard/tasks"
                      variant="light"
                      className="rounded-xl"
                      startContent={<Table size={16} />}
                    >
                      Список задач
                    </Button>
                    <Button
                      color="primary"
                      className="rounded-xl"
                      startContent={<Plus size={16} />}
                      onPress={workspace.openTaskCreateModal}
                    >
                      Новая задача
                    </Button>
                  </div>
                </div>

                {workspace.loading ? (
                  <div className="mt-6 rounded-[26px] border border-dashed border-border bg-muted/30 p-8 text-center">
                    <LoaderCircle className="mx-auto animate-spin text-primary" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      Загружаем команды и задачи...
                    </p>
                  </div>
                ) : workspace.error ? (
                  <div className="mt-6 rounded-[26px] border border-dashed border-danger/30 bg-danger/5 p-8 text-center">
                    <p className="text-base font-medium">{workspace.error}</p>
                    <Button
                      variant="light"
                      className="mt-4 rounded-xl"
                      onPress={() => void workspace.loadWorkspace()}
                    >
                      Повторить загрузку
                    </Button>
                  </div>
                ) : workspace.teams.length === 0 ? (
                  <div className="mt-6 rounded-[26px] border border-dashed border-border bg-muted/30 p-8 text-center">
                    <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Users size={22} />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold">
                      Пока здесь пусто
                    </h3>
                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                      Создайте свою первую команду, чтобы открыть отдельное
                      пространство задач и собирать аналитику на dashboard.
                    </p>
                    <Button
                      color="primary"
                      className="mt-5 rounded-xl"
                      startContent={<Plus size={16} />}
                      onPress={() => workspace.setIsCreateTeamOpen(true)}
                    >
                      Создать первую команду
                    </Button>
                  </div>
                ) : workspace.tasks.length === 0 ? (
                  <div className="mt-6 rounded-[26px] border border-dashed border-border bg-muted/30 p-8 text-center">
                    <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Flag size={22} />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold">
                      Задач пока нет
                    </h3>
                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                      Команда уже готова. Добавьте первую задачу, а дальше
                      работайте с ней в отдельной странице `Задачи`.
                    </p>
                    <Button
                      color="primary"
                      className="mt-5 rounded-xl" 
                      startContent={<Plus size={16} />}
                      onPress={workspace.openTaskCreateModal}
                    >
                      Создать первую задачу
                    </Button>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-3xl bg-muted p-4">
                        <p className="text-sm text-muted-foreground">Всего задач</p>
                        <p className="mt-2 text-3xl font-semibold">{workspace.tasks.length}</p>
                      </div>
                      <div className="rounded-3xl bg-muted p-4">
                        <p className="text-sm text-muted-foreground">Активно сейчас</p>
                        <p className="mt-2 text-3xl font-semibold">{workspace.activeTasks.length}</p>
                      </div>
                      <div className="rounded-3xl bg-muted p-4">
                        <p className="text-sm text-muted-foreground">На проверке</p>
                        <p className="mt-2 text-3xl font-semibold">{workspace.reviewTasksCount}</p>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-border bg-background p-4">
                      <p className="text-sm font-medium text-foreground">
                        Распределение задач по статусам
                      </p>
                      <div className="mt-4 h-64">
                        <TaskStatusChart counts={workspace.taskStatusCounts} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {(visibleSections.projects || visibleSections.insights) && (
              <div className="space-y-4">
                {visibleSections.projects ? (
                  <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-primary" />
                      <h2 className="text-lg font-semibold">Команды</h2>
                    </div>

                    <div className="mt-5 space-y-4">
                      {workspace.teams.length > 0 ? (
                        workspace.teams.map((team) => (
                          <div key={team.id} className="rounded-3xl bg-muted p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <span
                                  className="h-3 w-3 rounded-full"
                                  style={{ backgroundColor: team.color }}
                                />
                                <div>
                                  <p className="font-medium">{team.name}</p>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {team.tasksCount} задач, {team.membersCount}{" "}
                                    участников
                                  </p>
                                </div>
                              </div>
                              <span className="text-sm font-semibold">
                                {team.tasksCount}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-3xl bg-muted p-4">
                          <p className="font-medium">Команд пока нет</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Создайте первую команду, чтобы начать распределять
                            задачи и доступы.
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                ) : null}

                {visibleSections.insights ? (
                  <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2">
                      <ChartPie size={18} className="text-primary" />
                      <h2 className="font-semibold text-lg tracking-tight">
                        Быстрые инсайты
                      </h2>
                    </div>
                    <div className="mt-4 space-y-4">
                      <div className="rounded-3xl bg-muted p-4">
                        <p className="text-sm text-muted-foreground">
                          На проверке сейчас
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                          {workspace.reviewTasksCount} задач
                        </p>
                      </div>
                      <div className="rounded-3xl bg-muted p-4">
                        <p className="text-sm text-muted-foreground">
                          Высокий приоритет
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                          {workspace.highPriorityCount} задач
                        </p>
                      </div>
                      <div className="rounded-3xl bg-muted p-4">
                        <p className="text-sm text-muted-foreground">
                          Уже закрыто
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                          {workspace.doneTasksCount} задач
                        </p>
                      </div>
                    </div>
                  </section>
                ) : null}
              </div>
            )}
          </section>
        )}
      </div>

      <CreateTeamModal
        isOpen={workspace.isCreateTeamOpen}
        onOpenChange={workspace.setIsCreateTeamOpen}
        teamForm={workspace.teamForm}
        teamManagers={workspace.teamManagers}
        savingTeam={workspace.savingTeam}
        onTeamFormChange={workspace.setTeamForm}
        onCreateTeam={workspace.handleCreateTeam}
      />

      <TaskEditorModal
        isOpen={workspace.isTaskModalOpen}
        onOpenChange={workspace.setIsTaskModalOpen}
        isEditing={Boolean(workspace.editingTask)}
        taskForm={workspace.taskForm}
        setTaskForm={workspace.setTaskForm}
        teams={workspace.teams.map((team) => ({ id: team.id, name: team.name }))}
        taskAssignees={workspace.taskAssignees}
        isSaving={workspace.savingTask}
        onSubmit={workspace.handleCreateTask}
      />
    </>
  );
}