import clsx from "clsx";

/**
 * LIFE AP ロゴ。公式アセットへの差し替えは /public/brand/ のファイルを
 * 置き換えるだけで完了します（コード変更不要）。SVG は背景透過です。
 */
export function Logo({
  variant = "full",
  className,
}: {
  variant?: "full" | "mark";
  className?: string;
}) {
  const src =
    variant === "mark" ? "/brand/lifeap-mark.svg" : "/brand/lifeap-logo.svg";
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
