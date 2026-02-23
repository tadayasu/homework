import { google } from "googleapis"

export async function GET() {
  const raw = process.env.GOOGLE_PRIVATE_KEY ?? ""

  // クォートや余分な文字を除去して正規化
  const normalized = raw
    .replace(/^"/, "")         // 先頭の " を除去
    .replace(/"$/, "")         // 末尾の " を除去
    .replace(/\\n/g, "\n")     // リテラル \n を改行に変換

  // 接続テスト
  let sheetsResult = ""
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: normalized,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })
    const sheets = google.sheets({ version: "v4", auth })
    const res = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
    })
    const names = res.data.sheets?.map((s) => s.properties?.title) ?? []
    sheetsResult = `✅ 成功 / シート: ${names.join(", ")}`
  } catch (e) {
    sheetsResult = `❌ ${e instanceof Error ? e.message : String(e)}`
  }

  return Response.json({
    末尾5文字_hex: Buffer.from(raw.slice(-5)).toString("hex"),
    末尾文字: raw.slice(-5).replace(/\n/g, "\\n"),
    Sheets接続: sheetsResult,
  })
}
