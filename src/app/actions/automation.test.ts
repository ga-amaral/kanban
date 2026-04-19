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
  getAutomations,
  createAutomation,
  deleteAutomation,
  toggleAutomation,
  updateAutomation,
} from "@/app/actions/automation"

const mockSupabase = {
  from: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(createClient).mockReturnValue(mockSupabase as any)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("automation actions", () => {
  describe("getAutomations", () => {
    it("returns automations for workspace", async () => {
      const mockAutomations = [
        { id: "auto-1", name: "Notify on move", workspace_id: "ws-1", is_active: true },
        { id: "auto-2", name: "Send email", workspace_id: "ws-1", is_active: false },
      ]

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockAutomations, error: null }),
          }),
        }),
      } as any)

      const result = await getAutomations("ws-1")

      expect(result).toEqual(mockAutomations)
    })

    it("returns empty array on error", async () => {
      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: { message: "Fail" } }),
          }),
        }),
      } as any)

      const result = await getAutomations("ws-1")
      expect(result).toEqual([])
    })
  })

  describe("createAutomation", () => {
    it("creates automation successfully", async () => {
      const mockAutomation = {
        id: "auto-1",
        workspace_id: "ws-1",
        name: "Test Automation",
        trigger_config: { type: "column_move", to_column_id: "col-1" },
        action_config: { url: "https://example.com/webhook" },
        is_active: true,
      }

      vi.mocked(mockSupabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockAutomation, error: null }),
          }),
        }),
      } as any)

      const result = await createAutomation("ws-1", "Test Automation", {
        type: "column_move",
        to_column_id: "col-1",
      }, { url: "https://example.com/webhook" })

      expect(result).toHaveProperty("data")
      expect(result.data.name).toBe("Test Automation")
    })

    it("returns error on failure", async () => {
      vi.mocked(mockSupabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Workspace not found" },
            }),
          }),
        }),
      } as any)

      const result = await createAutomation("ws-1", "Test", {}, {})
      expect(result).toEqual({ error: "Workspace not found" })
    })
  })

  describe("deleteAutomation", () => {
    it("deletes automation successfully", async () => {
      vi.mocked(mockSupabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any)

      const result = await deleteAutomation("ws-1", "auto-1")
      expect(result).toEqual({ success: true })
      expect(revalidatePath).toHaveBeenCalledWith("/workspace/ws-1")
    })

    it("returns error on failure", async () => {
      vi.mocked(mockSupabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: "Not found" } }),
        }),
      } as any)

      const result = await deleteAutomation("ws-1", "auto-1")
      expect(result).toEqual({ error: "Not found" })
    })
  })

  describe("toggleAutomation", () => {
    it("toggles automation to inactive", async () => {
      vi.mocked(mockSupabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any)

      const result = await toggleAutomation("ws-1", "auto-1", false)
      expect(result).toEqual({ success: true })
    })

    it("toggles automation to active", async () => {
      vi.mocked(mockSupabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any)

      const result = await toggleAutomation("ws-1", "auto-1", true)
      expect(result).toEqual({ success: true })
    })

    it("returns error on failure", async () => {
      vi.mocked(mockSupabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: "Not found" } }),
        }),
      } as any)

      const result = await toggleAutomation("ws-1", "auto-1", true)
      expect(result).toEqual({ error: "Not found" })
    })
  })

  describe("updateAutomation", () => {
    it("updates automation successfully", async () => {
      const mockAutomation = {
        id: "auto-1",
        name: "Updated",
        trigger_config: { type: "column_move", to_column_id: "col-2" },
        action_config: { url: "https://new-url.com" },
      }

      vi.mocked(mockSupabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockAutomation, error: null }),
            }),
          }),
        }),
      } as any)

      const result = await updateAutomation("ws-1", "auto-1", "Updated", {
        type: "column_move",
        to_column_id: "col-2",
      }, { url: "https://new-url.com" })

      expect(result).toHaveProperty("data")
      expect(result.data.name).toBe("Updated")
    })

    it("returns error on failure", async () => {
      vi.mocked(mockSupabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Not found" },
              }),
            }),
          }),
        }),
      } as any)

      const result = await updateAutomation("ws-1", "auto-1", "Updated", {}, {})
      expect(result).toEqual({ error: "Not found" })
    })
  })
})
