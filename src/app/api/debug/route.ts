import { google } from "googleapis"

export async function GET() {
  const results: Record<string, string> = {
    SPREADSHEET_ID: process.env.GOOGLE_SPREADSHEET_ID ? "✅ 設定済み" : "❌ 未設定",
    SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? "✅ 設定済み" : "❌ 未設定",
    PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY ? "✅ 設定済み" : "❌ 未設定",
  }

  // Google Sheets API 接続テスト
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })
    const sheets = google.sheets({ version: "v4", auth })
    const res = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
    })
    const sheetNames = res.data.sheets?.map((s) => s.properties?.title) ?? []
    results["Sheets接続"] = "✅ 成功"
    results["シート一覧"] = sheetNames.join(", ")
    results["homeworksシート"] = sheetNames.includes("homeworks") ? "✅ あり" : "❌ なし（要確認）"
  } catch (e) {
    results["Sheets接続"] = `❌ 失敗: ${e instanceof Error ? e.message : String(e)}`
  }

  return Response.json(results)
}
