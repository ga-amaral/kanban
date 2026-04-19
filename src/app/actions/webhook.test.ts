import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

import { testWebhook } from "@/app/actions/webhook"

describe("webhook actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("testWebhook", () => {
    it("returns success when webhook responds with 200", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue(JSON.stringify({ received: true })),
      }

      vi.spyOn(global, "fetch").mockResolvedValue(mockResponse as any)

      const result = await testWebhook("https://example.com/webhook", { key: "value" })

      expect(result).toEqual({
        success: true,
        status: 200,
        data: JSON.stringify({ received: true }),
      })
    })

    it("returns failure for non-200 response", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        text: vi.fn().mockResolvedValue("Not Found"),
      }

      vi.spyOn(global, "fetch").mockResolvedValue(mockResponse as any)

      const result = await testWebhook("https://example.com/webhook", {})

      expect(result).toEqual({
        success: false,
        status: 404,
        data: "Not Found",
      })
    })

    it("returns error when fetch throws", async () => {
      vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network error"))

      const result = await testWebhook("https://invalid-url/webhook", {})

      expect(result).toEqual({
        success: false,
        error: "Network error",
      })
    })
  })
})
