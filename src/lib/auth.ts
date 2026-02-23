import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      const allowedEmails =
        process.env.ALLOWED_EMAILS?.split(",").map((e) => e.trim()) ?? []
      return allowedEmails.includes(user.email ?? "")
    },
    async jwt({ token, user }) {
      if (user) {
        const parentEmails =
          process.env.PARENT_EMAILS?.split(",").map((e) => e.trim()) ?? []
        token.role = parentEmails.includes(user.email ?? "")
          ? "parent"
          : "child"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
      }
      return session
    },
  },
}
