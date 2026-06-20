import clsx from "clsx";
import { BRAND } from "@/lib/brand";

/**
 * イメージキャラクター「ライトくん」。背景透過。
 * 公式イラストへの差し替えは public/brand/raw/ に画像を置いて
 * `npm run brand:transparent` を実行するだけ。
 */
export function LightKun({
  className,
  float = false,
}: {
  className?: string;
  float?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={BRAND.lightKun}
      alt="案内人 ライトくん"
      className={clsx(float && "animate-float", "select-none", className)}
      draggable={false}
    />
  );
}
