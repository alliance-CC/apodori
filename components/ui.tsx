import clsx from "clsx";
import { LightKun } from "@/components/brand/LightKun";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "brand" | "green" | "red" | "yellow" | "blue";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-ink-800 text-ink-200 border border-ink-700",
    brand: "bg-brand-500/15 text-brand-300 border border-brand-500/30",
    green: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    red: "bg-red-500/15 text-red-300 border border-red-500/30",
    yellow: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    blue: "bg-sky-500/15 text-sky-300 border border-sky-500/30",
  };
  return <span className={clsx("badge", tones[tone], className)}>{children}</span>;
}

export function StatCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="stat-card">
      {accent && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-brand-gradient" />
      )}
      <p className="text-xs font-medium text-ink-400">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-ink-50 sm:text-3xl">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-ink-400">{sub}</p>}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-ink-50 sm:text-2xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-ink-400">{description}</p>
        )}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

/** ライトくん付きの案内バナー（各ページ上部の説明に使用） */
export function GuideBanner({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "warn";
}) {
  return (
    <div
      className={clsx(
        "mb-6 flex items-start gap-3 rounded-2xl border p-4",
        tone === "warn"
          ? "border-brand-500/30 bg-brand-500/[0.06]"
          : "border-ink-800 bg-ink-900/50"
      )}
    >
      <LightKun className="h-14 w-auto shrink-0" />
      <div className="text-sm leading-relaxed text-ink-200">{children}</div>
    </div>
  );
}

export function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-700 bg-ink-900/30 px-6 py-12 text-center">
      <LightKun className="h-20 w-auto opacity-90" />
      <p className="text-sm font-medium text-ink-200">{title}</p>
      {hint && <p className="max-w-sm text-xs text-ink-400">{hint}</p>}
    </div>
  );
}
