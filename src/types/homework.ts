export type HomeworkStatus = "pending" | "done"

export type UserRole = "parent" | "child"

export type Subject = "国語" | "算数" | "理科" | "社会" | "英語"

export interface Homework {
  id: string
  subject: Subject
  content: string
  page_number: string
  due_date: string // YYYY-MM-DD
  memo: string
  status: HomeworkStatus
  created_at: string // ISO 8601
  completed_at: string // ISO 8601 or ""
}

export type HomeworkCreateInput = Omit<
  Homework,
  "id" | "status" | "created_at" | "completed_at"
>

export type HomeworkUpdateInput = Partial<
  Omit<Homework, "id" | "created_at">
>
