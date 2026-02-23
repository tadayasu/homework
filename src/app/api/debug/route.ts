export async function GET() {
  const key = process.env.GOOGLE_PRIVATE_KEY ?? ""

  return Response.json({
    先頭3文字: key.substring(0, 3),
    BEGINで始まるか: key.startsWith("-----BEGIN") || key.startsWith('"-----BEGIN'),
    クォートで始まるか: key.startsWith('"'),
    literal_nの数: (key.match(/\\n/g) ?? []).length,
    実際の改行数: (key.match(/\n/g) ?? []).length,
    文字数: key.length,
  })
}
