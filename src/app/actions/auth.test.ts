import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}))

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { signIn, signUp, signOut, getCurrentUserRole } from "@/app/actions/auth"

const mockSupabase = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
  },
  from: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(createClient).mockReturnValue(mockSupabase as any)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("auth actions", () => {
  describe("signIn", () => {
    it("signs in user and redirects on success", async () => {
      vi.mocked(mockSupabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      } as any)

      const formData = new FormData()
      formData.set("email", "test@example.com")
      formData.set("password", "password123")

      await signIn(formData)

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      })
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout")
      expect(redirect).toHaveBeenCalledWith("/")
    })

    it("returns error on failed sign in", async () => {
      vi.mocked(mockSupabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null },
        error: { message: "Invalid credentials" },
      } as any)

      const formData = new FormData()
      formData.set("email", "wrong@example.com")
      formData.set("password", "wrong")

      const result = await signIn(formData)

      expect(result).toEqual({ error: "Invalid credentials" })
      expect(redirect).not.toHaveBeenCalled()
    })
  })

  describe("signUp", () => {
    it("creates user and returns success message", async () => {
      vi.mocked(mockSupabase.auth.signUp).mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      } as any)

      const formData = new FormData()
      formData.set("email", "new@example.com")
      formData.set("password", "secure123")
      formData.set("fullName", "New User")

      const result = await signUp(formData)

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: "new@example.com",
        password: "secure123",
        options: {
          emailRedirectTo: expect.stringContaining("/auth/callback"),
          data: { full_name: "New User", role: "usuario" },
        },
      })
      expect(result).toHaveProperty("success")
    })

    it("returns error on failed sign up", async () => {
      vi.mocked(mockSupabase.auth.signUp).mockResolvedValue({
        data: { user: null },
        error: { message: "Email already registered" },
      } as any)

      const formData = new FormData()
      formData.set("email", "existing@example.com")
      formData.set("password", "secure123")
      formData.set("fullName", "Existing")

      const result = await signUp(formData)

      expect(result).toEqual({ error: "Email already registered" })
    })
  })

  describe("signOut", () => {
    it("signs out user and redirects to login", async () => {
      vi.mocked(mockSupabase.auth.signOut).mockResolvedValue({ error: null } as any)

      await signOut()

      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout")
      expect(redirect).toHaveBeenCalledWith("/login")
    })
  })

  describe("getCurrentUserRole", () => {
    it("returns null for unauthenticated user", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any)

      const result = await getCurrentUserRole()
      expect(result).toBeNull()
    })

    it("returns user role from profile", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      } as any)

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { role: "admin" }, error: null }),
          }),
        }),
      } as any)

      const result = await getCurrentUserRole()
      expect(result).toBe("admin")
    })

    it("returns default role if profile not found", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      } as any)

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      } as any)

      const result = await getCurrentUserRole()
      expect(result).toBe("usuario")
    })
  })
})
