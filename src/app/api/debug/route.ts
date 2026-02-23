export function GET() {
  return Response.json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "未設定",
    NEXTAUTH_URL_set: !!process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID_set: !!process.env.GOOGLE_CLIENT_ID,
    NEXTAUTH_SECRET_set: !!process.env.NEXTAUTH_SECRET,
  })
}
