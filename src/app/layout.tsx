import type { Metadata } from "next"
import "./globals.css"
import SessionProvider from "@/components/SessionProvider"

export const metadata: Metadata = {
  title: "塾の宿題管理",
  description: "塾の宿題を管理するアプリ",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50">
        <SessionProvider>
          <div className="max-w-lg mx-auto px-4 pb-8">{children}</div>
        </SessionProvider>
      </body>
    </html>
  )
}
