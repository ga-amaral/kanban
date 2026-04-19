import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

import { getAgents, isAdmin, createAgent, updateAgent, deleteAgent } from "@/app/actions/agent"

const mockSupabase = {
  auth: {
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

describe("agent actions", () => {
  describe("getAgents", () => {
    it("returns agents for authenticated user", async () => {
      const mockAgents = [
        { id: "agent-1", name: "Legal Assistant", owner_id: "user-1" },
        { id: "agent-2", name: "Doc Analyzer", owner_id: "user-1" },
      ]

      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      } as any)

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockAgents, error: null }),
        }),
      } as any)

      const result = await getAgents()
      expect(result).toEqual(mockAgents)
    })

    it("throws error for unauthenticated user", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any)

      await expect(getAgents()).rejects.toThrow("Não autorizado")
    })

    it("throws error on database failure", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      } as any)

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: { message: "DB error" } }),
        }),
      } as any)

      await expect(getAgents()).rejects.toThrow("Falha ao buscar agentes")
    })
  })

  describe("isAdmin", () => {
    it("returns false for unauthenticated user", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any)

      const result = await isAdmin()
      expect(result).toBe(false)
    })

    it("returns true for admin user", async () => {
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

      const result = await isAdmin()
      expect(result).toBe(true)
    })

    it("returns false for non-admin user", async () => {
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

      const result = await isAdmin()
      expect(result).toBe(false)
    })
  })

  describe("createAgent", () => {
    it("creates agent for admin user", async () => {
      const mockUser = { id: "user-1" }
      const mockAgent = { id: "agent-1", name: "New Agent", owner_id: "user-1" }

      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
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
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockAgent, error: null }),
            }),
          }),
        } as any)

      const result = await createAgent({
        name: "New Agent",
        description: "Test agent",
      } as any)

      expect(result).toHaveProperty("id")
      expect(revalidatePath).toHaveBeenCalledWith("/agents")
    })

    it("throws error for non-admin user", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      } as any)

      vi.mocked(mockSupabase.from)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { role: "user" }, error: null }),
            }),
          }),
        } as any)

      await expect(createAgent({ name: "New Agent" } as any)).rejects.toThrow(
        "Apenas administradores podem criar agentes",
      )
    })

    it("throws error for unauthenticated user", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any)

      await expect(createAgent({ name: "New Agent" } as any)).rejects.toThrow("Não autorizado")
    })
  })

  describe("updateAgent", () => {
    it("updates agent successfully", async () => {
      const mockUser = { id: "user-1" }
      const mockAgent = { id: "agent-1", name: "Updated Agent" }

      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any)

      vi.mocked(mockSupabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockAgent, error: null }),
            }),
          }),
        }),
      } as any)

      const result = await updateAgent("agent-1", { name: "Updated Agent" })
      expect(result).toHaveProperty("name")
      expect(result.name).toBe("Updated Agent")
    })

    it("throws error for unauthenticated user", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any)

      await expect(updateAgent("agent-1", { name: "Updated" })).rejects.toThrow("Não autorizado")
    })
  })

  describe("deleteAgent", () => {
    it("deletes agent successfully", async () => {
      const mockUser = { id: "user-1" }

      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any)

      vi.mocked(mockSupabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any)

      const result = await deleteAgent("agent-1")
      expect(result).toEqual({ success: true })
      expect(revalidatePath).toHaveBeenCalledWith("/agents")
    })

    it("throws error for unauthenticated user", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any)

      await expect(deleteAgent("agent-1")).rejects.toThrow("Não autorizado")
    })
  })
})
