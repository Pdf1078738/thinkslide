import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThinkSlide · 想法进，演讲出",
  description: "输入想法或大纲，生成并编辑配套幻灯片与逐页讲稿。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
