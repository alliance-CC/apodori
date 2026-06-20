import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { Mascot } from "@/components/brand/Mascot";

export const metadata: Metadata = {
  title: "appointment AP｜営業AIエージェント（株式会社ライフアップ）",
  description:
    "ターゲットリストを渡すだけで、AIエージェントが専属インサイドセールスとして商談獲得まで自律実行。株式会社ライフアップの営業AIエージェント。",
  applicationName: "営業AIエージェント",
  authors: [{ name: "株式会社ライフアップ" }],
};

export const viewport: Viewport = {
  themeColor: "#0B0B0E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased">
        <StoreProvider>
          <AppShell>{children}</AppShell>
          <Mascot />
        </StoreProvider>
      </body>
    </html>
  );
}
