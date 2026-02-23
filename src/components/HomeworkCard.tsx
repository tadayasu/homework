"use client"

import { Homework } from "@/types/homework"
import SubjectBadge from "./SubjectBadge"
import { format, parseISO, differenceInDays, isAfter, startOfDay } from "date-fns"
import { ja } from "date-fns/locale"

interface HomeworkCardProps {
  homework: Homework
  onToggle?: (id: string, currentStatus: Homework["status"]) => void
  onEdit?: () => void
  onDelete?: () => void
  isParent: boolean
  isPending?: boolean
}

function getDeadlineStyle(dueDate: string, status: Homework["status"]) {
  if (status === "done") return "bg-gray-50 border-gray-200 opacity-60"

  const today = startOfDay(new Date())
  const due = startOfDay(parseISO(dueDate))
  const daysLeft = differenceInDays(due, today)

  if (daysLeft < 0) return "bg-red-50 border-red-400"
  if (daysLeft <= 2) return "bg-orange-50 border-orange-400"
  return "bg-white border-gray-200"
}

function getDeadlineLabel(dueDate: string, status: Homework["status"]) {
  if (status === "done") return null

  const today = startOfDay(new Date())
  const due = startOfDay(parseISO(dueDate))
  const daysLeft = differenceInDays(due, today)

  if (daysLeft < 0) return <span className="text-xs text-red-600 font-bold">期限切れ</span>
  if (daysLeft === 0) return <span className="text-xs text-orange-600 font-bold">今日まで！</span>
  if (daysLeft <= 2) return <span className="text-xs text-orange-500 font-semibold">あと{daysLeft}日</span>
  return null
}

export default function HomeworkCard({
  homework,
  onToggle,
  onEdit,
  onDelete,
  isParent,
  isPending = false,
}: HomeworkCardProps) {
  const deadlineStyle = getDeadlineStyle(homework.due_date, homework.status)
  const deadlineLabel = getDeadlineLabel(homework.due_date, homework.status)

  const formattedDue = homework.due_date
    ? format(parseISO(homework.due_date), "M月d日(E)", { locale: ja })
    : ""

  return (
    <div
      className={`rounded-xl border-2 p-4 shadow-sm transition-all ${deadlineStyle}`}
    >
      <div className="flex items-start gap-3">
        {/* 完了ボタン */}
        {onToggle ? (
          <button
            onClick={() => onToggle(homework.id, homework.status)}
            disabled={isPending}
            className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
              homework.status === "done"
                ? "bg-green-500 border-green-500 text-white"
                : "border-gray-300 hover:border-green-400 bg-white"
            } ${isPending ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
            aria-label={homework.status === "done" ? "完了を取り消す" : "完了にする"}
          >
            {homework.status === "done" && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        ) : (
          <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center bg-green-500 border-green-500 text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <SubjectBadge subject={homework.subject} />
            {deadlineLabel}
          </div>

          <p
            className={`text-base font-medium leading-snug ${
              homework.status === "done" ? "line-through text-gray-400" : "text-gray-900"
            }`}
          >
            {homework.content}
          </p>

          {homework.page_number && (
            <p className="text-sm text-gray-500 mt-0.5">📄 {homework.page_number}</p>
          )}

          {homework.memo && (
            <p className="text-sm text-gray-500 mt-0.5">📝 {homework.memo}</p>
          )}

          <p className="text-xs text-gray-400 mt-1">
            期限: {formattedDue}
          </p>
        </div>

        {/* 親のみ: 編集・削除 */}
        {isParent && (
          <div className="flex gap-1 flex-shrink-0">
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-gray-400 hover:text-blue-500 p-1 rounded transition-colors"
                aria-label="編集"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                aria-label="削除"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
