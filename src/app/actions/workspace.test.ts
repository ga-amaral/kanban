import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// Mock Supabase before importing the module
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

// Import server actions after mocks are set up
import {
  createWorkspace,
  getWorkspaces,
  updateWorkspace,
  deleteWorkspace,
} from "@/app/actions/workspace"

const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
}

function mockTableChain() {
  return {
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }),
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      order: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }),
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(createClient).mockReturnValue(mockSupabase as any)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("workspace actions", () => {
  describe("createWorkspace", () => {
    it("creates a workspace for authenticated user", async () => {
      const mockUser = { id: "test-user-id", email: "test@example.com" }
      const mockWorkspace = { id: "ws-1", name: "Test Workspace", owner_id: "test-user-id" }

      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any)

      const tableMock = mockTableChain()
      vi.mocked(mockSupabase.from).mockReturnValue(tableMock as any)
      tableMock.insert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockWorkspace, error: null }),
        }),
      })

      const formData = new FormData()
      formData.set("name", "Test Workspace")

      const result = await createWorkspace(formData)

      expect(result).toHaveProperty("data")
      expect(mockSupabase.auth.getUser).toHaveBeenCalled()
      expect(mockSupabase.from).toHaveBeenCalledWith("workspaces")
    })

    it("throws error for unauthenticated user", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any)

      const formData = new FormData()
      formData.set("name", "Test Workspace")

      await expect(createWorkspace(formData)).rejects.toThrow("Não autorizado")
    })

    it("returns validation error for short name", async () => {
      const mockUser = { id: "test-user-id", email: "test@example.com" }
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any)

      const formData = new FormData()
      formData.set("name", "ab")

      const result = await createWorkspace(formData)

      expect(result).toHaveProperty("error")
    })
  })

  describe("getWorkspaces", () => {
    it("returns empty array for unauthenticated user", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any)

      const result = await getWorkspaces()

      expect(result).toEqual([])
    })

    it("returns workspaces for authenticated user", async () => {
      const mockUser = { id: "test-user-id" }
      const mockWorkspaces = [
        { id: "ws-1", name: "Workspace 1", owner_id: "test-user-id" },
        { id: "ws-2", name: "Workspace 2", owner_id: "test-user-id" },
      ]

      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any)

      const tableMock = mockTableChain()
      vi.mocked(mockSupabase.from).mockReturnValue(tableMock as any)
      tableMock.select.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockWorkspaces, error: null }),
        }),
      })

      const result = await getWorkspaces()

      expect(result).toEqual(mockWorkspaces)
    })
  })

  describe("updateWorkspace", () => {
    it("updates workspace name successfully", async () => {
      const tableMock = mockTableChain()
      vi.mocked(mockSupabase.from).mockReturnValue(tableMock as any)

      const result = await updateWorkspace("ws-1", "New Name")

      expect(result).toEqual({ success: true })
    })

    it("returns error on failure", async () => {
      const tableMock = mockTableChain()
      vi.mocked(mockSupabase.from).mockReturnValue(tableMock as any)
      tableMock.update.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: "Not found" } }),
      })

      const result = await updateWorkspace("ws-1", "New Name")

      expect(result).toEqual({ error: "Not found" })
    })
  })

  describe("deleteWorkspace", () => {
    it("deletes workspace successfully", async () => {
      const tableMock = mockTableChain()
      vi.mocked(mockSupabase.from).mockReturnValue(tableMock as any)

      const result = await deleteWorkspace("ws-1")

      expect(result).toEqual({ success: true })
    })
  })
})
