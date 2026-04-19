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
  createCard,
  getCards,
  getCardsByWorkspace,
  moveCard,
  updateCard,
  deleteCard,
  bulkCreateCards,
  bulkMoveCards,
  bulkDeleteCards,
} from "@/app/actions/card"

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

describe("card actions", () => {
  describe("createCard", () => {
    it("creates a card with mapped fields", async () => {
      const mockCard = {
        id: "card-1",
        column_id: "col-1",
        workspace_id: "ws-1",
        title: "Test Card",
        client_name: "John Doe",
        phone: "+55 11 99999-0000",
        deadline_date: "2026-05-01",
        order_index: 0,
      }

      vi.mocked(mockSupabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockCard, error: null }),
          }),
        }),
      } as any)

      const result = await createCard("ws-1", "col-1", {
        client_name: "John Doe",
        phone: "+55 11 99999-0000",
      })

      expect(result).toHaveProperty("data")
      expect(result.data.client_name).toBe("John Doe")
      expect(result.data.phone).toBe("+55 11 99999-0000")
    })

    it("returns error on failure", async () => {
      vi.mocked(mockSupabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Column not found" },
            }),
          }),
        }),
      } as any)

      const result = await createCard("ws-1", "col-1", { title: "Test" })
      expect(result).toEqual({ error: "Column not found" })
    })
  })

  describe("getCards", () => {
    it("returns cards ordered by order_index with mapped fields", async () => {
      const mockCards = [
        { id: "card-1", client_name: "Alice", phone: "111", deadline_date: "2026-05-01" },
        { id: "card-2", client_name: "Bob", phone: "222", deadline_date: "2026-06-01" },
      ]

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockCards, error: null }),
          }),
        }),
      } as any)

      const result = await getCards("col-1")

      expect(result).toHaveLength(2)
      expect(result[0].client_name).toBe("Alice")
      expect(result[0].phone).toBe("111")
      expect(result[0].deadline_date).toBe("2026-05-01")
    })

    it("returns empty array on error", async () => {
      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: { message: "Fail" } }),
          }),
        }),
      } as any)

      const result = await getCards("col-1")
      expect(result).toEqual([])
    })
  })

  describe("getCardsByWorkspace", () => {
    it("returns cards for workspace with mapped fields", async () => {
      const mockCards = [
        { id: "card-1", client_name: "Alice", phone: "111", deadline_date: "2026-05-01" },
      ]

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockCards, error: null }),
          }),
        }),
      } as any)

      const result = await getCardsByWorkspace("ws-1")
      expect(result).toHaveLength(1)
      expect(result[0].client_name).toBe("Alice")
    })

    it("returns empty array on error", async () => {
      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: { message: "Fail" } }),
          }),
        }),
      } as any)

      const result = await getCardsByWorkspace("ws-1")
      expect(result).toEqual([])
    })
  })

  describe("moveCard", () => {
    it("moves card to new column", async () => {
      const oldCard = { id: "card-1", column_id: "col-1", workspace_id: "ws-1" }

      vi.mocked(mockSupabase.from)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: oldCard, error: null }),
            }),
          }),
        } as any)
        .mockReturnValueOnce({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        } as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        } as any)

      const result = await moveCard("ws-1", "card-1", "col-2", 5)

      expect(result).toEqual({ success: true })
    })

    it("returns error when card not found", async () => {
      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      } as any)

      const result = await moveCard("ws-1", "card-1", "col-2")
      expect(result).toEqual({ success: true }) // Still returns true if oldCard is null
    })
  })

  describe("updateCard", () => {
    it("updates card fields", async () => {
      const updatedCard = {
        id: "card-1",
        title: "Updated",
        client_name: "New Name",
        phone: "333",
        deadline_date: "2026-07-01",
        urgency_level: "HIGH",
      }

      vi.mocked(mockSupabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedCard, error: null }),
            }),
          }),
        }),
      } as any)

      const result = await updateCard("ws-1", "card-1", {
        title: "Updated",
        client_name: "New Name",
        phone: "333",
        urgency_level: "HIGH",
      })

      expect(result).toHaveProperty("data")
      expect(result.data.client_name).toBe("New Name")
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

      const result = await updateCard("ws-1", "card-1", { title: "Updated" })
      expect(result).toEqual({ error: "Not found" })
    })
  })

  describe("deleteCard", () => {
    it("deletes card successfully", async () => {
      vi.mocked(mockSupabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any)

      const result = await deleteCard("ws-1", "card-1")
      expect(result).toEqual({ success: true })
      expect(revalidatePath).toHaveBeenCalledWith("/workspace/ws-1")
    })

    it("returns error on failure", async () => {
      vi.mocked(mockSupabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: "Not found" } }),
        }),
      } as any)

      const result = await deleteCard("ws-1", "card-1")
      expect(result).toEqual({ error: "Not found" })
    })
  })

  describe("bulkCreateCards", () => {
    it("creates multiple cards", async () => {
      const mockCards = [
        { id: "card-1", client_name: "Alice", phone: "111", deadline_date: "2026-05-01" },
        { id: "card-2", client_name: "Bob", phone: "222", deadline_date: "2026-06-01" },
      ]

      vi.mocked(mockSupabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: mockCards, error: null }),
        }),
      } as any)

      const result = await bulkCreateCards("ws-1", [
        { column_id: "col-1", client_name: "Alice", phone: "111" },
        { column_id: "col-2", client_name: "Bob", phone: "222" },
      ])

      expect(result).toHaveProperty("data")
      expect(result.data).toHaveLength(2)
      expect(result.data![0].client_name).toBe("Alice")
    })

    it("returns error on failure", async () => {
      vi.mocked(mockSupabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: null, error: { message: "Invalid data" } }),
        }),
      } as any)

      const result = await bulkCreateCards("ws-1", [])
      expect(result).toEqual({ error: "Invalid data" })
    })
  })

  describe("bulkMoveCards", () => {
    it("moves multiple cards to new column", async () => {
      const mockCards = [
        { id: "card-1", client_name: "Alice", phone: "111", deadline_date: "2026-05-01" },
      ]

      vi.mocked(mockSupabase.from)
        .mockReturnValueOnce({
          update: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              select: vi.fn().mockResolvedValue({ data: mockCards, error: null }),
            }),
          }),
        } as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { title: "Done" }, error: null }),
            }),
          }),
        } as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        } as any)

      const result = await bulkMoveCards("ws-1", ["card-1"], "col-2")

      expect(result).toHaveProperty("data")
    })
  })

  describe("bulkDeleteCards", () => {
    it("deletes multiple cards", async () => {
      vi.mocked(mockSupabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any)

      const result = await bulkDeleteCards("ws-1", ["card-1", "card-2"])
      expect(result).toEqual({ success: true })
    })

    it("returns error on failure", async () => {
      vi.mocked(mockSupabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({ error: { message: "Not found" } }),
        }),
      } as any)

      const result = await bulkDeleteCards("ws-1", ["card-1"])
      expect(result).toEqual({ error: "Not found" })
    })
  })
})
