// 公式画像の「背景だけ」を透過する処理スクリプト。
//
// 使い方:
//   1) public/brand/raw/ に画像を置く（白背景の PNG/JPG など）
//        - ロゴ        : logo.*           （例 logo.png）
//        - マークのみ   : mark.*           （任意）
//        - ライトくん   : light-kun.*       （例 light-kun.png）
//   2) `npm run brand:transparent`
//
// 仕組み: 画像の四辺から「白に近い色」の連結領域だけを透明化する
// フラッドフィル方式。キャラクター内部の白（目のハイライト等）は穴に
// ならず保持されます。処理後、lib/brand.ts のパスを自動で .png に更新します。

import sharp from "sharp";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const RAW_DIR = "public/brand/raw";
const OUT_DIR = "public/brand";

// darkMode: 黒テーマで見えるよう、暗い色（濃いグレーの文字等）を明色へ寄せる
// （オレンジのブランドカラーは保持）。ロゴ・マークに適用。
const ASSETS = [
  { match: /^(lifeap[-_]?logo|logo)\.(png|jpe?g|webp)$/i, out: "lifeap-logo.png", key: "logo", darkMode: true },
  { match: /^(lifeap[-_]?mark|mark)\.(png|jpe?g|webp)$/i, out: "lifeap-mark.png", key: "mark", darkMode: true },
  { match: /^(light[-_]?kun|lightkun|character|mascot|chara)\.(png|jpe?g|webp)$/i, out: "light-kun.png", key: "lightKun", darkMode: false },
];

// 白とみなす閾値（背景が純白に近いほど安全に除去）
const WHITE = 236;

// ブランドオレンジ判定（recolor時に保持する）
const isOrange = (r, g, b) => r > 165 && g > 55 && g < 190 && b < 115 && r - b > 70;

async function removeBackground(inputPath, outPath, opts = {}) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info; // channels === 4
  const at = (x, y) => (y * width + x) * channels;
  const nearWhite = (i) =>
    data[i] >= WHITE && data[i + 1] >= WHITE && data[i + 2] >= WHITE;

  const visited = new Uint8Array(width * height);
  const stack = [];
  for (let x = 0; x < width; x++) {
    stack.push(x, 0, x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    stack.push(0, y, width - 1, y);
  }

  // 四辺から白の連結領域をフラッドフィルして透明化
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const p = y * width + x;
    if (visited[p]) continue;
    const i = at(x, y);
    if (!nearWhite(i)) continue;
    visited[p] = 1;
    data[i + 3] = 0;
    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }

  // darkMode: 残った暗い画素（濃いグレーの文字・線）を明色へ。オレンジは保持。
  if (opts.darkMode) {
    for (let i = 0; i < data.length; i += channels) {
      if (data[i + 3] === 0) continue;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (isOrange(r, g, b)) continue;
      const lum = (r + g + b) / 3;
      if (lum < 205) {
        data[i] = 240;
        data[i + 1] = 240;
        data[i + 2] = 245;
      }
    }
  }

  // 境界の白いフチ（ハロー）を 1px 分やわらげる
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      if (visited[p]) continue;
      const i = at(x, y);
      if (data[i + 3] === 0) continue;
      let edge = false;
      if (x > 0 && visited[p - 1]) edge = true;
      else if (x < width - 1 && visited[p + 1]) edge = true;
      else if (y > 0 && visited[p - width]) edge = true;
      else if (y < height - 1 && visited[p + width]) edge = true;
      if (edge) {
        const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (lum > 205) data[i + 3] = Math.min(data[i + 3], 150);
      }
    }
  }

  let out = sharp(data, { raw: { width, height, channels } }).png();
  try {
    out = out.trim(); // 余白（透明部分）をトリム
  } catch {
    /* トリムできない場合はそのまま */
  }
  await out.toFile(outPath);
}

async function main() {
  if (!existsSync(RAW_DIR)) {
    console.log(`${RAW_DIR}/ がありません。ロゴ・キャラクター画像を置いてください。`);
    return;
  }
  const files = await readdir(RAW_DIR);
  const updated = {};

  for (const asset of ASSETS) {
    const file = files.find((n) => asset.match.test(n));
    if (!file) continue;
    await removeBackground(path.join(RAW_DIR, file), path.join(OUT_DIR, asset.out), {
      darkMode: asset.darkMode,
    });
    updated[asset.key] = `/brand/${asset.out}`;
    console.log(`✓ ${file} → ${asset.out}（背景を透過しました）`);
  }

  if (Object.keys(updated).length === 0) {
    console.log(
      "対象画像が見つかりませんでした。public/brand/raw/ に logo.png / light-kun.png を置いてください。"
    );
    return;
  }

  // lib/brand.ts のパスを自動更新
  const brandPath = "lib/brand.ts";
  let src = await readFile(brandPath, "utf8");
  for (const [key, value] of Object.entries(updated)) {
    src = src.replace(new RegExp(`(${key}:\\s*)"[^"]*"`), `$1"${value}"`);
  }
  await writeFile(brandPath, src);
  console.log("lib/brand.ts を更新しました。`npm run dev` で反映されます。");
}

main().catch((e) => {
  console.error("処理に失敗しました:", e.message);
  process.exit(1);
});
