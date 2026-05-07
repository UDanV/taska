"use client";

import { Button, Switch } from "@heroui/react";
import { RotateCcw, SlidersHorizontal, SwatchBook } from "lucide-react";
import {
  dashboardSectionConfig,
  dashboardSectionIds,
} from "@/app/shared/lib/dashboard-preferences";
import { useDashboardPreferences } from "@/app/shared/providers/dashboard-preferences";

const presetAccentColors = [
  "#b77aff",
  "#8b5cf6",
  "#3b82f6",
  "#14b8a6",
  "#22c55e",
  "#f97316",
  "#ef4444",
  "#ec4899",
];

export default function DashboardSettingsPageClient() {
  const {
    accentColor,
    visibleSections,
    hydrated,
    setAccentColor,
    toggleSection,
    resetPreferences,
  } = useDashboardPreferences();

  return (
    <div className="space-y-6 p-3 sm:p-4 md:p-6 xl:space-y-8 xl:p-8">
      <section className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5 lg:p-6">
        <Button
          variant="flat"
          className="w-full rounded-xl sm:w-auto"
          startContent={<RotateCcw size={16} />}
          onPress={resetPreferences}
        >
          Сбросить настройки
        </Button>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr] xl:gap-6">
        <div className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-primary" />
            <h2 className="text-lg font-semibold">Блоки dashboard</h2>
          </div>

          <div className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
            {dashboardSectionIds.map((sectionId) => {
              const section = dashboardSectionConfig[sectionId];

              return (
                <div
                  key={sectionId}
                  className="flex flex-col gap-3 rounded-3xl bg-muted p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium">{section.title}</p>
                    <p className="text-sm leading-6 text-muted-foreground sm:max-w-xl">
                      {section.description}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Switch
                      isSelected={visibleSections[sectionId]}
                      onValueChange={(enabled) => toggleSection(sectionId, enabled)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="flex items-center gap-2">
            <SwatchBook size={18} className="text-primary" />
            <h2 className="text-lg font-semibold">Акцентный цвет</h2>
          </div>

          <div className="mt-5 space-y-4 sm:mt-6 sm:space-y-5">
            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Текущий акцент</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label
                  htmlFor="accent-color-picker"
                  className="relative h-14 w-14 cursor-pointer overflow-hidden rounded-2xl border border-border"
                  style={{ backgroundColor: accentColor }}
                >
                  <input
                    id="accent-color-picker"
                    type="color"
                    value={accentColor}
                    onChange={(event) => setAccentColor(event.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </label>

                <div className="min-w-0">
                  <p className="font-medium">{accentColor}</p>
                  <p className="text-sm text-muted-foreground">
                    Изменения применяются сразу во всем интерфейсе
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm text-muted-foreground">Быстрый выбор</p>
              <div className="flex flex-wrap gap-3">
                {presetAccentColors.map((color) => {
                  const isActive = accentColor === color;

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAccentColor(color)}
                      className={`h-11 w-11 rounded-2xl border-2 transition-transform hover:scale-105 ${
                        isActive ? "border-foreground shadow-sm" : "border-border"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Предпросмотр</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-3xl bg-background p-4 shadow-sm">
                  <span className="inline-flex rounded-xl bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                    Primary
                  </span>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Кнопки, активные состояния и ключевые акценты дашборда.
                  </p>
                </div>
                <div className="rounded-3xl bg-background p-4 shadow-sm">
                  <span className="inline-flex rounded-xl bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                    Secondary
                  </span>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Вторичные бейджи, фоновые плашки и подсказки интерфейса.
                  </p>
                </div>
              </div>
            </div>

            {!hydrated ? (
              <p className="text-sm text-muted-foreground">
                Сохраняю настройки после загрузки браузерного хранилища...
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
