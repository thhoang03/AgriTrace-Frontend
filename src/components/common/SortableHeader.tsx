import { useState } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

export type SortDir = "asc" | "desc";

export interface SortState {
  key: string;
  dir: SortDir;
}

export function useColumnSort(): {
  sort: SortState | null;
  toggle: (key: string) => void;
} {
  const [sort, setSort] = useState<SortState | null>(null);

  const toggle = (key: string) => {
    setSort((prev) =>
      prev?.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  };

  return { sort, toggle };
}

export function sortRows<T>(
  rows: T[],
  sort: SortState | null,
  getValue: (row: T) => string | number | boolean | null | undefined,
): T[] {
  if (!sort) return rows;
  const dir = sort.dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const va = getValue(a);
    const vb = getValue(b);
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    const res =
      typeof va === "number" && typeof vb === "number"
        ? va - vb
        : String(va).localeCompare(String(vb), undefined, {
            numeric: true,
            sensitivity: "base",
          });
    return res * dir;
  });
}

export function SortHeader({
  label,
  sortKey,
  sort,
  onSort,
  align = "left",
  className,
}: {
  label: string;
  sortKey: string;
  sort: SortState | null;
  onSort: (key: string) => void;
  align?: "left" | "right";
  className?: string;
}) {
  const active = sort?.key === sortKey;
  return (
    <th
      className={`${align === "right" ? "text-right" : "text-left"} ${className ?? ""}`}
    >
      <button
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1 hover:text-gray-800 transition-colors group font-inherit text-inherit uppercase tracking-inherit"
        title={`Sort by ${label}`}
      >
        {label}
        {active ? (
          sort!.dir === "asc" ? (
            <ChevronUp className="w-3.5 h-3.5 text-green-700" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-green-700" />
          )
        ) : (
          <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400" />
        )}
      </button>
    </th>
  );
}
