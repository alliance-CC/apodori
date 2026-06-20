import clsx from "clsx";
import { BRAND } from "@/lib/brand";

/**
 * LIFE AP ロゴ。公式アセットへの差し替えは public/brand/raw/ に画像を置いて
 * `npm run brand:transparent` を実行するだけ（背景透過＋自動配線）。
 */
export function Logo({
  variant = "full",
  className,
}: {
  variant?: "full" | "mark";
  className?: string;
}) {
  const src = variant === "mark" ? BRAND.mark : BRAND.logo;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="株式会社ライフアップ｜LIFE AP"
      className={clsx("select-none", className)}
      draggable={false}
    />
  );
}
