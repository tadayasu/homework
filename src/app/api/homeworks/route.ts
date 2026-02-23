import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getAllHomeworks, createHomework } from "@/lib/sheets"
import { HomeworkCreateInput } from "@/types/homework"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const homeworks = await getAllHomeworks()

    const filtered = status
      ? homeworks.filter((h) => h.status === status)
      : homeworks

    return NextResponse.json(filtered)
  } catch (error) {
    console.error("GET /api/homeworks error:", error)
    return NextResponse.json(
      { error: "宿題の取得に失敗しました" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (session.user.role !== "parent") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body: HomeworkCreateInput = await request.json()

    if (!body.subject || !body.content || !body.due_date) {
      return NextResponse.json(
        { error: "教科・内容・提出期限は必須です" },
        { status: 400 }
      )
    }

    const homework = await createHomework(body)
    return NextResponse.json(homework, { status: 201 })
  } catch (error) {
    console.error("POST /api/homeworks error:", error)
    return NextResponse.json(
      { error: "宿題の登録に失敗しました" },
      { status: 500 }
    )
  }
}
