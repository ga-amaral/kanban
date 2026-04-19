import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// Mock Supabase before importing the module
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

import {
  createColumn,
  getColumns,
  updateColumnOrder,
  updateColumn,
  deleteColumn,
} from "@/app/actions/column"

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

describe("column actions", () => {
  describe("createColumn", () => {
    it("creates a column with default board_id", async () => {
      const mockColumn = {
        id: "col-1",
        board_id: "00000000-0000-0000-0000-000000000001",
        workspace_id: "ws-1",
        title: "New Column",
        order_index: 0,
      }

      vi.mocked(mockSupabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockColumn, error: null }),
          }),
        }),
      } as any)

      const result = await createColumn("ws-1", "New Column", 0)

      expect(result).toHaveProperty("data")
      expect(result.data).toEqual(mockColumn)
      expect(mockSupabase.from).toHaveBeenCalledWith("columns")
    })

    it("returns error on failure", async () => {
      vi.mocked(mockSupabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Duplicate key" },
            }),
          }),
        }),
      } as any)

      const result = await createColumn("ws-1", "Duplicate", 0)

      expect(result).toEqual({ error: "Duplicate key" })
    })
  })

  describe("getColumns", () => {
    it("returns columns ordered by order_index", async () => {
      const mockColumns = [
        { id: "col-1", title: "First", order_index: 0 },
        { id: "col-2", title: "Second", order_index: 1 },
      ]

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockColumns, error: null }),
          }),
        }),
      } as any)

      const result = await getColumns("ws-1")

      expect(result).toEqual(mockColumns)
    })

    it("returns empty array on error", async () => {
      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: { message: "Fail" } }),
          }),
        }),
      } as any)

      const result = await getColumns("ws-1")

      expect(result).toEqual([])
    })
  })

  describe("updateColumnOrder", () => {
    it("updates order for each column", async () => {
      const updates = [
        { id: "col-1", order: 1 },
        { id: "col-2", order: 0 },
      ]

      vi.mocked(mockSupabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any)

      await updateColumnOrder("ws-1", updates)

      // Should be called once per column
      expect(mockSupabase.from).toHaveBeenCalledWith("columns")
      expect(revalidatePath).toHaveBeenCalledWith("/workspace/ws-1")
    })
  })

  describe("updateColumn", () => {
    it("updates column title and color", async () => {
      vi.mocked(mockSupabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any)

      const result = await updateColumn("ws-1", "col-1", {
        title: "Updated",
        color: "#ff0000",
      })

      expect(result).toEqual({ success: true })
    })

    it("returns error on failure", async () => {
      vi.mocked(mockSupabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: "Not found" } }),
        }),
      } as any)

      const result = await updateColumn("ws-1", "col-1", { title: "Updated" })

      expect(result).toEqual({ error: "Not found" })
    })
  })

  describe("deleteColumn", () => {
    it("deletes column successfully", async () => {
      vi.mocked(mockSupabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any)

      const result = await deleteColumn("ws-1", "col-1")

      expect(result).toEqual({ success: true })
      expect(revalidatePath).toHaveBeenCalledWith("/workspace/ws-1")
    })
  })
})
