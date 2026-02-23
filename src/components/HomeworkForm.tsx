"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Homework, HomeworkCreateInput, Subject } from "@/types/homework"
import { SUBJECTS } from "@/lib/constants"
import { format } from "date-fns"

interface HomeworkFormProps {
  initialData?: Homework
  mode: "new" | "edit"
}

export default function HomeworkForm({ initialData, mode }: HomeworkFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    subject: initialData?.subject ?? SUBJECTS[0],
    content: initialData?.content ?? "",
    page_number: initialData?.page_number ?? "",
    due_date: initialData?.due_date ?? format(new Date(), "yyyy-MM-dd"),
    memo: initialData?.memo ?? "",
  })

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const body: HomeworkCreateInput = {
        subject: form.subject as Subject,
        content: form.content,
        page_number: form.page_number,
        due_date: form.due_date,
        memo: form.memo,
      }

      const url =
        mode === "new" ? "/api/homeworks" : `/api/homeworks/${initialData!.id}`
      const method = mode === "new" ? "POST" : "PUT"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "エラーが発生しました")
      }

      router.push("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {/* 教科 */}
      <div>
        <label
          htmlFor="subject"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          教科 <span className="text-red-500">*</span>
        </label>
        <select
          id="subject"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          required
        >
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* 宿題の内容 */}
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          宿題の内容 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          name="content"
          value={form.content}
          onChange={handleChange}
          rows={3}
          placeholder="例：テキスト p.10〜12"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          required
        />
      </div>

      {/* ページ・問題番号 */}
      <div>
        <label
          htmlFor="page_number"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          ページ・問題番号
        </label>
        <input
          type="text"
          id="page_number"
          name="page_number"
          value={form.page_number}
          onChange={handleChange}
          placeholder="例：p.10-12, 問1〜5"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 提出期限 */}
      <div>
        <label
          htmlFor="due_date"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          提出期限 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="due_date"
          name="due_date"
          value={form.due_date}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* メモ */}
      <div>
        <label
          htmlFor="memo"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          メモ・備考
        </label>
        <textarea
          id="memo"
          name="memo"
          value={form.memo}
          onChange={handleChange}
          rows={2}
          placeholder="例：丸つけも必要"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* ボタン */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "保存中..." : mode === "new" ? "登録する" : "更新する"}
        </button>
      </div>
    </form>
  )
}
