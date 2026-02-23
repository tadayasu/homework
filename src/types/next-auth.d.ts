import "next-auth"
import "next-auth/jwt"
import { UserRole } from "./homework"

declare module "next-auth" {
  interface Session {
    user: {
      email: string
      name?: string | null
      image?: string | null
      role: UserRole
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
  }
}
