import { Subject } from "@/types/homework"

export const SUBJECTS: Subject[] = ["国語", "算数", "理科", "社会", "英語"]

export const SUBJECT_COLORS: Record<Subject, string> = {
  国語: "bg-red-100 text-red-800",
  算数: "bg-blue-100 text-blue-800",
  理科: "bg-green-100 text-green-800",
  社会: "bg-yellow-100 text-yellow-800",
  英語: "bg-purple-100 text-purple-800",
}

export const SHEET_NAME = "homeworks"
export const SHEET_RANGE = `${SHEET_NAME}!A:I`

// 期限が何日以内なら警告表示するか
export const DEADLINE_WARNING_DAYS = 2
