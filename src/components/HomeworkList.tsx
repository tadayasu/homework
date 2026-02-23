"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Homework } from "@/types/homework"
import HomeworkCard from "./HomeworkCard"
import ProgressBar from "./ProgressBar"

interface HomeworkListProps {
  initialHomeworks: Homework[]
  isParent: boolean
  showAll?: boolean
}

export default function HomeworkList({
  initialHomeworks,
  isParent,
  showAll = false,
}: HomeworkListProps) {
  const router = useRouter()
  const [homeworks, setHomeworks] = useState<Homework[]>(initialHomeworks)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const pendingHomeworks = homeworks.filter((h) => h.status === "pending")
  const doneHomeworks = homeworks.filter((h) => h.status === "done")
  const displayHomeworks = showAll ? homeworks : pendingHomeworks

  async function handleToggle(id: string, currentStatus: Homework["status"]) {
    const newStatus = currentStatus === "done" ? "pending" : "done"

    // 楽観的更新
    setHomeworks((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              status: newStatus,
              completed_at: newStatus === "done" ? new Date().toISOString() : "",
            }
          : h
      )
    )
    setPendingIds((prev) => new Set(prev).add(id))
    setError(null)

    try {
      const res = await fetch(`/api/homeworks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        throw new Error("更新に失敗しました")
      }

      // サーバー側のデータと同期
      startTransition(() => {
        router.refresh()
      })
    } catch (err) {
      // エラー時は元に戻す
      setHomeworks((prev) =>
        prev.map((h) =>
          h.id === id ? { ...h, status: currentStatus } : h
        )
      )
      setError(err instanceof Error ? err.message : "エラーが発生しました")
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("この宿題を削除しますか？")) return

    try {
      const res = await fetch(`/api/homeworks/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("削除に失敗しました")

      setHomeworks((prev) => prev.filter((h) => h.id !== id))
      startTransition(() => {
        router.refresh()
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました")
    }
  }

  function handleEdit(id: string) {
    router.push(`/homework/${id}/edit`)
  }

  if (homeworks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">宿題はありません</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!showAll && (
        <ProgressBar done={doneHomeworks.length} total={homeworks.length} />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {displayHomeworks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-green-600 font-bold text-lg">全部終わった！🎉</p>
          <p className="text-gray-400 text-sm mt-1">
            完了した宿題は下の「完了済み」で確認できるよ
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayHomeworks.map((hw) => (
            <HomeworkCard
              key={hw.id}
              homework={hw}
              onToggle={handleToggle}
              onEdit={isParent ? () => handleEdit(hw.id) : undefined}
              onDelete={isParent ? () => handleDelete(hw.id) : undefined}
              isParent={isParent}
              isPending={pendingIds.has(hw.id)}
            />
          ))}
        </div>
      )}

      {/* 完了済み一覧（ホーム画面で表示） */}
      {!showAll && doneHomeworks.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">
            ✅ 完了済み ({doneHomeworks.length})
          </h2>
          <div className="space-y-2">
            {doneHomeworks.map((hw) => (
              <HomeworkCard
                key={hw.id}
                homework={hw}
                onToggle={handleToggle}
                onEdit={isParent ? () => handleEdit(hw.id) : undefined}
                onDelete={isParent ? () => handleDelete(hw.id) : undefined}
                isParent={isParent}
                isPending={pendingIds.has(hw.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
