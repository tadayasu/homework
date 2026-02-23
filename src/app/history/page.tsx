export const dynamic = "force-dynamic"

import { getAllHomeworks } from "@/lib/sheets"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { ja } from "date-fns/locale"
import SubjectBadge from "@/components/SubjectBadge"
import { Homework } from "@/types/homework"

export default async function HistoryPage() {
  let homeworks: Homework[] = []
  try {
    homeworks = await getAllHomeworks()
  } catch (error) {
    console.error("Failed to fetch homeworks:", error)
  }

  const doneHomeworks = homeworks
    .filter((h) => h.status === "done")
    .sort((a, b) => {
      if (!a.completed_at) return 1
      if (!b.completed_at) return -1
      return b.completed_at.localeCompare(a.completed_at)
    })

  return (
    <div>
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm -mx-4 px-4 py-3 mb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="戻る"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">✅ 完了履歴</h1>
        </div>
      </header>

      {doneHomeworks.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">まだ完了した宿題はありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {doneHomeworks.map((hw) => (
            <div key={hw.id} className="bg-gray-50 border border-gray-200 opacity-70 rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                {/* 完了アイコン */}
                <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center bg-green-500 border-green-500 text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <SubjectBadge subject={hw.subject} />
                  </div>

                  <p className="text-base font-medium leading-snug line-through text-gray-400">
                    {hw.content}
                  </p>

                  {hw.page_number && (
                    <p className="text-sm text-gray-400 mt-0.5">📄 {hw.page_number}</p>
                  )}

                  {hw.completed_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      {format(parseISO(hw.completed_at), "M月d日(E) HH:mm 完了", { locale: ja })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
