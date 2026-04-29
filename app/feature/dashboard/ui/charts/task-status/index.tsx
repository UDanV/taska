"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { ApexOptions } from "apexcharts";
import { TASK_STATUSES, TASK_STATUS_LABELS } from "@/app/lib/workspace/constants";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type TaskStatusChartProps = {
  counts: number[];
};

function toRgba(hexColor: string, alpha: number) {
  const normalized = hexColor.replace("#", "");

  if (normalized.length !== 6) {
    return `rgba(183, 122, 255, ${alpha})`;
  }

  const value = Number.parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getCssVariable(name: string, fallback: string) {
  if (typeof window === "undefined") {
    return fallback;
  }

  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export default function TaskStatusChart({ counts }: TaskStatusChartProps) {
  const labels = useMemo(() => TASK_STATUSES.map((status) => TASK_STATUS_LABELS[status]), []);

  const primary = getCssVariable("--primary", "#b77aff");
  const foreground = getCssVariable("--foreground", "#1a1a1a");
  const mutedForeground = getCssVariable("--muted-foreground", "#707070");
  const border = getCssVariable("--border", "#e6e6e6");

  const series = useMemo(
    () => [
      {
        name: "Количество задач",
        data: counts,
      },
    ],
    [counts],
  );

  const options = useMemo<ApexOptions>(
    () => ({
      chart: {
        type: "bar",
        background: "transparent",
        foreColor: mutedForeground,
        toolbar: { show: false },
        fontFamily: "inherit",
      },
      theme: { mode: "light" },
      plotOptions: {
        bar: {
          borderRadius: 10,
          borderRadiusApplication: "end",
          columnWidth: "52%",
          distributed: true,
        },
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      colors: [
        toRgba(primary, 0.95),
        toRgba(primary, 0.8),
        toRgba(primary, 0.65),
        toRgba(primary, 0.5),
      ],
      xaxis: {
        categories: labels,
        labels: { style: { colors: mutedForeground } },
        axisBorder: { show: true, color: border },
        axisTicks: { show: false },
      },
      yaxis: {
        min: 0,
        tickAmount: 4,
        forceNiceScale: true,
        labels: {
          style: { colors: mutedForeground },
          formatter: (value) => String(Math.round(value)),
        },
      },
      grid: {
        borderColor: border,
        strokeDashArray: 3,
        padding: {
          top: 0,
          right: 8,
          bottom: 0,
          left: 8,
        },
      },
      tooltip: {
        theme: "dark",
        style: { fontSize: "12px" },
        y: {
          formatter: (value) => `${value} задач`,
        },
      },
      states: {
        hover: { filter: { type: "lighten", value: 0.08 } },
        active: { filter: { type: "none", value: 0 } },
      },
      fill: {
        opacity: 1,
      },
      markers: {
        strokeColors: foreground,
      },
    }),
    [border, foreground, labels, mutedForeground, primary],
  );

  return <ApexChart type="bar" options={options} series={series} height="100%" />;
}
