import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getAllHomeworks } from "@/lib/sheets"
import HomeworkList from "@/components/HomeworkList"
import Link from "next/link"
import { Homework } from "@/types/homework"

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const isParent = session?.user?.role === "parent"

  let homeworks: Homework[] = []
  try {
    homeworks = await getAllHomeworks()
  } catch (error) {
    console.error("Failed to fetch homeworks:", error)
  }

  return (
    <div>
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm -mx-4 px-4 py-3 mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">📚 宿題リスト</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/history"
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              履歴
            </Link>
            {isParent && (
              <Link
                href="/homework/new"
                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                ＋ 追加
              </Link>
            )}
          </div>
        </div>
      </header>

      <HomeworkList
        initialHomeworks={homeworks}
        isParent={isParent}
      />
    </div>
  )
}
