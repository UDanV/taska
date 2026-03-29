"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Calendar,
  ChartBar,
  ChartPie,
  CheckCircle2,
  Clock3,
  Flag,
  Plus,
  SlidersHorizontal,
  Table,
} from "lucide-react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { useDashboardPreferences } from "@/app/shared/providers/dashboard-preferences";

const boardColumns = [
  {
    title: "Сегодня",
    count: 4,
    tasks: [
      {
        title: "Подготовить онбординг для новых пользователей",
        description: "Финализировать welcome flow и блок с частыми вопросами.",
        priority: "High",
        priorityColor: "danger" as const,
      },
      {
        title: "Созвон с дизайнером по мобильному приложению",
        description: "Согласовать упрощенный nav и карточку задачи.",
        priority: "Medium",
        priorityColor: "secondary" as const,
      },
    ],
  },
  {
    title: "В работе",
    count: 3,
    tasks: [
      {
        title: "Перенести авторизацию на production-конфиг",
        description: "Проверить cookies, callbacks и logout flow.",
        priority: "High",
        priorityColor: "danger" as const,
      },
      {
        title: "Собрать вид dashboard для команды",
        description: "Добавить метрики, доску задач и рабочий sidebar.",
        priority: "Low",
        priorityColor: "success" as const,
      },
    ],
  },
  {
    title: "На проверке",
    count: 2,
    tasks: [
      {
        title: "Обновить лендинг под новую офферную модель",
        description: "Поменять CTA и блок с преимуществами.",
        priority: "Medium",
        priorityColor: "secondary" as const,
      },
      {
        title: "Почистить dark theme после гидрации",
        description: "Проверить переключение темы на ключевых страницах.",
        priority: "Low",
        priorityColor: "success" as const,
      },
    ],
  },
];

const focusTasks = [
  {
    title: "Сделать board view для личных задач",
    time: "09:30 - 11:00",
    status: "В фокусе",
  },
  {
    title: "Согласовать приоритеты спринта",
    time: "12:00 - 13:00",
    status: "Встреча",
  },
  {
    title: "Разобрать входящие идеи из inbox",
    time: "16:00 - 17:00",
    status: "Планирование",
  },
];

const projects = [
  { name: "Taska Web", progress: 78, tasks: 18 },
  { name: "Mobile MVP", progress: 46, tasks: 9 },
  { name: "Growth Experiments", progress: 63, tasks: 14 },
];

export default function DashboardPage() {
  const { visibleSections } = useDashboardPreferences();
  const hasVisibleSections = Object.values(visibleSections).some(Boolean);

  return (
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
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex items-center gap-2">
                  <ChartBar size={18} className="text-primary" />
                  <h2 className="font-semibold text-lg tracking-tight">
                    Дашборд
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <div className="rounded-3xl bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Активных задач</p>
                  <p className="mt-2 text-3xl font-semibold">14</p>
                  <p className="mt-2 text-sm text-emerald-500">+4 за эту неделю</p>
                </div>
                <div className="rounded-3xl bg-muted p-4">
                  <p className="text-sm text-muted-foreground">В дедлайне сегодня</p>
                  <p className="mt-2 text-3xl font-semibold">3</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Самое важное в первой половине дня
                  </p>
                </div>
                <div className="rounded-3xl bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Прогресс недели</p>
                  <p className="mt-2 text-3xl font-semibold">81%</p>
                  <p className="mt-2 text-sm text-primary">
                    Лучший темп за последние 30 дней
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {visibleSections.focus ? (
            <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-primary" />
                  <h2 className="font-semibold text-lg tracking-tight">План на сегодня</h2>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {focusTasks.map((task) => (
                  <div key={task.title} className="rounded-3xl bg-muted p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {task.time}
                        </p>
                      </div>
                      <Chip
                        variant="flat"
                        color="secondary"
                        className="rounded-xl"
                      >
                        {task.status}
                      </Chip>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      )
      }

      {
        (visibleSections.board ||
          visibleSections.projects ||
          visibleSections.insights) && (
          <section className="grid gap-4 2xl:grid-cols-[1.6fr_0.8fr]">
            {visibleSections.board ? (
              <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Table size={18} className="text-primary" />
                    <h2 className="font-semibold text-lg tracking-tight">
                      Текущие задачи команды
                    </h2>
                  </div>
                  <Button variant="light" endContent={<ArrowUpRight size={16} />}>
                    Полный board
                  </Button>
                </div>

                <div className="mt-6 grid gap-4 xl:grid-cols-3">
                  {boardColumns.map((column) => (
                    <div key={column.title} className="rounded-[26px] bg-muted p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{column.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {column.count} карточки
                          </p>
                        </div>
                        <Chip variant="flat" className="rounded-xl">
                          {column.count}
                        </Chip>
                      </div>

                      <div className="mt-4 space-y-3">
                        {column.tasks.map((task) => (
                          <article
                            key={task.title}
                            className="rounded-3xl border border-border bg-background p-4 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium">{task.title}</p>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                  {task.description}
                                </p>
                              </div>
                              <Flag
                                size={16}
                                className="mt-1 text-muted-foreground"
                              />
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                              <Chip
                                color={task.priorityColor}
                                variant="flat"
                                className="rounded-xl"
                              >
                                {task.priority}
                              </Chip>
                              <span className="text-xs text-muted-foreground">
                                Обновлено 12 мин назад
                              </span>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {(visibleSections.projects || visibleSections.insights) && (
              <div className="space-y-4">
                {visibleSections.projects ? (
                  <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-primary" />
                      <h2 className="text-lg font-semibold">Проекты</h2>
                    </div>

                    <div className="mt-5 space-y-4">
                      {projects.map((project) => (
                        <div key={project.name} className="rounded-3xl bg-muted p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium">{project.name}</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {project.tasks} задач в работе
                              </p>
                            </div>
                            <span className="text-sm font-semibold">
                              {project.progress}%
                            </span>
                          </div>
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                {visibleSections.insights ? (
                  <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2">
                      <ChartPie size={18} className="text-primary" />
                      <h2 className="font-semibold text-lg tracking-tight">Быстрые инсайты</h2>
                    </div>
                    <div className="mt-4 space-y-4">
                      <div className="rounded-3xl bg-muted p-4">
                        <p className="text-sm text-muted-foreground">
                          Лучшее время фокуса
                        </p>
                        <p className="mt-1 text-lg font-semibold">10:00 - 13:00</p>
                      </div>
                      <div className="rounded-3xl bg-muted p-4">
                        <p className="text-sm text-muted-foreground">
                          Среднее закрытие
                        </p>
                        <p className="mt-1 text-lg font-semibold">6 задач в день</p>
                      </div>
                      <div className="rounded-3xl bg-muted p-4">
                        <p className="text-sm text-muted-foreground">
                          Следующий дедлайн
                        </p>
                        <p className="mt-1 text-lg font-semibold">Сегодня, 18:00</p>
                      </div>
                    </div>
                  </section>
                ) : null}
              </div>
            )}
          </section>
        )
      }
    </div >
  );
}