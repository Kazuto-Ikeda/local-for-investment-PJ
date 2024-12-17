// app/layout.tsx

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { QueryParamsProvider } from "./QueryParamsContext";

// ローカルフォント設定
const notoSansJP = localFont({
  src: "./fonts/NotoSansJP-Light.ttf",
  variable: "--font-noto-sans-jp",
  weight: "300",
});

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

// メタデータ設定
export const metadata: Metadata = {
  title: "A3 AI Reconnoiter",
  description: "投資の初期フェーズにおける分析を生成AIでサポートするプロダクトです。",
};

// RootLayoutコンポーネント
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${notoSansJP.variable} ${notoSansJP.variable} antialiased`}
      >
        <QueryParamsProvider>
          {children}
        </QueryParamsProvider>
      </body>
    </html>
  );
}


