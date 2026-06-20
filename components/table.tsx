"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";

export interface SortState {
  key: string;
  dir: "asc" | "desc";
}

/** 任意の配列を列キーで並び替えるフック（日本語ロケール対応） */
export function useSort<T>(rows: T[], initial?: SortState) {
  const [sort, setSort] = useState<SortState | null>(initial ?? null);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const { key, dir } = sort;
    const factor = dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = (a as any)[key];
      const bv = (b as any)[key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      let c: number;
      if (typeof av === "number" && typeof bv === "number") c = av - bv;
      else c = String(av).localeCompare(String(bv), "ja");
      return c * factor;
    });
  }, [rows, sort]);

  function toggle(key: string) {
    setSort((s) =>
      s && s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  }

  return { sorted, sort, toggle };
}

export function SortHeader({
  label,
  sortKey,
  sort,
  onSort,
  className,
  align = "left",
}: {
  label: string;
  sortKey: string;
  sort: SortState | null;
  onSort: (key: string) => void;
  className?: string;
  align?: "left" | "right";
}) {
  const active = sort?.key === sortKey;
  return (
    <th className={clsx("px-4 py-3 font-medium", align === "right" && "text-right", className)}>
      <button type="button" onClick={() => onSort(sortKey)} className="th-sort">
        {label}
        <span className={clsx("text-[10px]", active ? "text-brand-400" : "text-ink-600")}>
          {active ? (sort!.dir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}
