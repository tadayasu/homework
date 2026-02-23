import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { getHomework } from "@/lib/sheets"
import HomeworkForm from "@/components/HomeworkForm"
import Link from "next/link"

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditHomeworkPage({ params }: EditPageProps) {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== "parent") {
    redirect("/")
  }

  const { id } = await params
  const homework = await getHomework(id)

  if (!homework) {
    notFound()
  }

  return (
    <div>
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm -mx-4 px-4 py-3 mb-6">
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
          <h1 className="text-lg font-bold text-gray-900">宿題を編集</h1>
        </div>
      </header>

      <HomeworkForm mode="edit" initialData={homework} />
    </div>
  )
}
