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

export default function DashboardSettingsPage() {
  const {
    accentColor,
    visibleSections,
    hydrated,
    setAccentColor,
    toggleSection,
    resetPreferences,
  } = useDashboardPreferences();

  return (
    <div className="space-y-8 p-4 md:p-6 xl:p-8">
      <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
        <Button
          variant="flat"
          className="rounded-xl"
          startContent={<RotateCcw size={16} />}
          onPress={resetPreferences}
        >
          Сбросить настройки
        </Button>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-primary" />
            <h2 className="text-lg font-semibold">Блоки dashboard</h2>
          </div>

          <div className="mt-6 space-y-4">
            {dashboardSectionIds.map((sectionId) => {
              const section = dashboardSectionConfig[sectionId];

              return (
                <div
                  key={sectionId}
                  className="flex items-start justify-between gap-4 rounded-3xl bg-muted p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{section.title}</p>
                    <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                      {section.description}
                    </p>
                  </div>

                  <Switch
                    isSelected={visibleSections[sectionId]}
                    onValueChange={(enabled) => toggleSection(sectionId, enabled)}
                    aria-label={`Показать блок ${section.title}`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <SwatchBook size={18} className="text-primary" />
            <h2 className="text-lg font-semibold">Акцентный цвет</h2>
          </div>

          <div className="mt-6 space-y-5">
            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Текущий акцент</p>
              <div className="mt-3 flex items-center gap-3">
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
                    aria-label="Выбрать акцентный цвет"
                  />
                </label>

                <div>
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
                      aria-label={`Выбрать цвет ${color}`}
                      onClick={() => setAccentColor(color)}
                      className={`h-11 w-11 rounded-2xl border-2 transition-transform hover:scale-105 ${isActive
                          ? "border-foreground shadow-sm"
                          : "border-border"
                        }`}
                      style={{ backgroundColor: color }}
                    />
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Предпросмотр</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-background p-4 shadow-sm">
                  <span className="inline-flex rounded-xl bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                    Primary
                  </span>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Кнопки, активные состояния и ключевые акценты dashboard.
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
