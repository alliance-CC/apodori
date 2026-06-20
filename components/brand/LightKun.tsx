import clsx from "clsx";

/**
 * イメージキャラクター「ライトくん」。背景透過 SVG。
 * 公式イラストへの差し替えは /public/brand/light-kun.svg を置き換えるだけ。
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
      src="/brand/light-kun.svg"
      alt="案内人 ライトくん"
      className={clsx(float && "animate-float", "select-none", className)}
      draggable={false}
    />
  );
}
