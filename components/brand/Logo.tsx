import clsx from "clsx";
import { BRAND } from "@/lib/brand";

/**
 * ロゴ。
 * - "full"（既定）: テキストのワードマーク「appointment AP」（A はオレンジ）。
 *   画像ではなくテキストなので、どのサイズでも常にくっきり表示されます。
 *   サイズは className のフォントサイズ（例: text-xl / text-2xl）で指定します。
 * - "mark": マーク画像（ファビコン等のアイコン用途）。
 */
export function Logo({
  variant = "full",
  className,
}: {
  variant?: "full" | "mark";
  className?: string;
}) {
  if (variant === "mark") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={BRAND.mark}
        alt="Appointment AP"
        className={clsx("select-none", className)}
        draggable={false}
      />
    );
  }

  return (
    <span
      aria-label="Appointment AP"
      className={clsx(
        "select-none whitespace-nowrap font-extrabold leading-none tracking-tight",
        className
      )}
    >
      <span className="text-brand-500">A</span>
      <span className="text-ink-50">ppointment</span>
      <span className="text-brand-500">&nbsp;A</span>
      <span className="text-ink-50">P</span>
    </span>
  );
}
