import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { updateHomework, deleteHomework } from "@/lib/sheets"
import { HomeworkUpdateInput } from "@/types/homework"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const body: HomeworkUpdateInput = await request.json()

    // 子供は status の変更のみ許可
    if (session.user.role !== "parent") {
      const allowedKeys = ["status"] as const
      const bodyKeys = Object.keys(body)
      const hasDisallowedKeys = bodyKeys.some(
        (k) => !allowedKeys.includes(k as (typeof allowedKeys)[number])
      )
      if (hasDisallowedKeys) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const homework = await updateHomework(id, body)
    return NextResponse.json(homework)
  } catch (error) {
    console.error(`PUT /api/homeworks/${id} error:`, error)
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({ error: "宿題が見つかりません" }, { status: 404 })
    }
    return NextResponse.json(
      { error: "宿題の更新に失敗しました" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (session.user.role !== "parent") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  try {
    await deleteHomework(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`DELETE /api/homeworks/${id} error:`, error)
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({ error: "宿題が見つかりません" }, { status: 404 })
    }
    return NextResponse.json(
      { error: "宿題の削除に失敗しました" },
      { status: 500 }
    )
  }
}
