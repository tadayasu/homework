import { google } from "googleapis"
import { v4 as uuidv4 } from "uuid"
import { Homework, HomeworkCreateInput, HomeworkUpdateInput, Subject } from "@/types/homework"
import { SHEET_NAME, SHEET_RANGE } from "./constants"

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })
}

function getSheetsClient() {
  return google.sheets({ version: "v4", auth: getAuth() })
}

function rowToHomework(row: string[]): Homework {
  return {
    id: row[0] ?? "",
    subject: (row[1] ?? "") as Subject,
    content: row[2] ?? "",
    page_number: row[3] ?? "",
    due_date: row[4] ?? "",
    memo: row[5] ?? "",
    status: row[6] === "done" ? "done" : "pending",
    created_at: row[7] ?? "",
    completed_at: row[8] ?? "",
  }
}

function homeworkToRow(homework: Homework): string[] {
  return [
    homework.id,
    homework.subject,
    homework.content,
    homework.page_number,
    homework.due_date,
    homework.memo,
    homework.status,
    homework.created_at,
    homework.completed_at,
  ]
}

export async function getAllHomeworks(): Promise<Homework[]> {
  const sheets = getSheetsClient()
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: SHEET_RANGE,
  })

  const rows = response.data.values ?? []
  // 1行目はヘッダー行なのでスキップ、id が空の行も除外
  return rows.slice(1).filter((row) => row[0]).map(rowToHomework)
}

export async function getHomework(id: string): Promise<Homework | null> {
  const homeworks = await getAllHomeworks()
  return homeworks.find((h) => h.id === id) ?? null
}

export async function createHomework(
  data: HomeworkCreateInput
): Promise<Homework> {
  const sheets = getSheetsClient()

  const homework: Homework = {
    ...data,
    id: uuidv4(),
    status: "pending",
    created_at: new Date().toISOString(),
    completed_at: "",
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: SHEET_RANGE,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [homeworkToRow(homework)],
    },
  })

  return homework
}

export async function updateHomework(
  id: string,
  data: HomeworkUpdateInput
): Promise<Homework> {
  const sheets = getSheetsClient()
  const allHomeworks = await getAllHomeworks()
  const index = allHomeworks.findIndex((h) => h.id === id)

  if (index === -1) {
    throw new Error(`Homework not found: ${id}`)
  }

  const updated: Homework = {
    ...allHomeworks[index],
    ...data,
  }

  // status を done に変更した場合は completed_at を設定
  if (data.status === "done" && !updated.completed_at) {
    updated.completed_at = new Date().toISOString()
  }
  // status を pending に戻した場合は completed_at をクリア
  if (data.status === "pending") {
    updated.completed_at = ""
  }

  // スプレッドシートの行番号（1始まり）: ヘッダー分 +1、データ index 分 +1
  const rowNumber = index + 2

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A${rowNumber}:I${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [homeworkToRow(updated)],
    },
  })

  return updated
}

export async function deleteHomework(id: string): Promise<void> {
  const sheets = getSheetsClient()
  const allHomeworks = await getAllHomeworks()
  const index = allHomeworks.findIndex((h) => h.id === id)

  if (index === -1) {
    throw new Error(`Homework not found: ${id}`)
  }

  // スプレッドシートのシートIDを取得
  const spreadsheetInfo = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  })
  const sheet = spreadsheetInfo.data.sheets?.find(
    (s) => s.properties?.title === SHEET_NAME
  )
  const sheetId = sheet?.properties?.sheetId
  if (sheetId === null || sheetId === undefined) {
    throw new Error(`Sheet "${SHEET_NAME}" not found`)
  }

  // 0始まりの行インデックス: ヘッダー = 0、データ = index + 1
  const startIndex = index + 1

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex,
              endIndex: startIndex + 1,
            },
          },
        },
      ],
    },
  })
}
