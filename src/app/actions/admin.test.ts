import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

import {
  getUsers,
  updateUserStatus,
  updateUserProfile,
  deleteUserAccount,
} from "@/app/actions/admin"

const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
  rpc: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(createClient).mockReturnValue(mockSupabase as any)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("admin actions", () => {
  describe("getUsers", () => {
    it("returns users for admin", async () => {
      const mockUsers = [
        { id: "user-1", email: "admin@test.com", role: "admin" },
        { id: "user-2", email: "user@test.com", role: "user" },
      ]

      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      } as any)

      vi.mocked(mockSupabase.from)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { role: "admin" }, error: null }),
            }),
          }),
        } as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockUsers, error: null }),
          }),
        } as any)

      const result = await getUsers()
      expect(result).toHaveProperty("data")
      expect(result.data).toEqual(mockUsers)
    })

    it("returns error for non-admin", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      } as any)

      vi.mocked(mockSupabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { role: "user" }, error: null }),
          }),
        }),
      } as any)

      const result = await getUsers()
      expect(result).toHaveProperty("error")
      expect(result.error).toBe("Acesso negado")
    })

    it("returns error for unauthenticated user", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any)

      const result = await getUsers()
      expect(result).toHaveProperty("error")
    })
  })

  describe("updateUserStatus", () => {
    it("updates user status to blocked", async () => {
      const adminUser = { id: "admin-1" }
      const targetUser = { id: "user-2", email: "user@test.com" }

      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: adminUser },
        error: null,
      } as any)

      vi.mocked(mockSupabase.from)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { role: "admin" }, error: null }),
            }),
          }),
        } as any)
        .mockReturnValueOnce({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        } as any)

      const result = await updateUserStatus("user-2", "blocked")
      expect(result).toEqual({ success: true })
      expect(revalidatePath).toHaveBeenCalledWith("/admin")
    })

    it("prevents admin from blocking themselves", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: { id: "admin-1" } },
        error: null,
      } as any)

      vi.mocked(mockSupabase.from)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { role: "admin" }, error: null }),
            }),
          }),
        } as any)
        .mockReturnValueOnce({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        } as any)

      const result = await updateUserStatus("admin-1", "blocked")
      expect(result).toHaveProperty("error")
      expect(result.error).toBe("Você não pode alterar seu próprio status.")
    })



    it("returns error for non-admin", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      } as any)

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { role: "user" }, error: null }),
          }),
        }),
      } as any)

      const result = await updateUserStatus("user-2", "blocked")
      expect(result).toHaveProperty("error")
    })
  })

  describe("updateUserProfile", () => {
    it("updates user profile data", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: { id: "admin-1" } },
        error: null,
      } as any)

      vi.mocked(mockSupabase.from)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { role: "admin" }, error: null }),
            }),
          }),
        } as any)
        .mockReturnValueOnce({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        } as any)

      const result = await updateUserProfile("user-1", {
        full_name: "New Name",
        role: "admin",
      })
      expect(result).toEqual({ success: true })
    })

    it("returns error on failure", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: { id: "admin-1" } },
        error: null,
      } as any)

      vi.mocked(mockSupabase.from)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { role: "admin" }, error: null }),
            }),
          }),
        } as any)
        .mockReturnValueOnce({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: { message: "Not found" } }),
          }),
        } as any)

      const result = await updateUserProfile("user-1", { full_name: "New Name" })
      expect(result).toEqual({ error: "Not found" })
    })
  })

  describe("deleteUserAccount", () => {
    it("deletes user account via RPC", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: { id: "admin-1" } },
        error: null,
      } as any)

      vi.mocked(mockSupabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { role: "admin" }, error: null }),
          }),
        }),
      } as any)

      vi.mocked(mockSupabase.rpc).mockResolvedValue({
        data: { success: true },
        error: null,
      } as any)

      const result = await deleteUserAccount("user-1")
      expect(result).toEqual({ success: true })
      expect(revalidatePath).toHaveBeenCalledWith("/admin")
    })

    it("returns error when RPC fails", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: { id: "admin-1" } },
        error: null,
      } as any)

      vi.mocked(mockSupabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { role: "admin" }, error: null }),
          }),
        }),
      } as any)

      vi.mocked(mockSupabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "RPC function not found" },
      } as any)

      const result = await deleteUserAccount("user-1")
      expect(result).toEqual({ error: "RPC function not found" })
    })
  })
})
