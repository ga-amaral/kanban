import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// Mock must be self-contained due to hoisting
vi.mock("openai", () => {
  const mockCreate = vi.fn()
  const MockOpenAI = class {
    chat = {
      completions: { create: mockCreate },
    }
    static getMockCreate() {
      return mockCreate
    }
  }
  return { OpenAI: MockOpenAI }
})

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { OpenAI } from "openai"

// Type augmentation for our mock
interface MockOpenAI extends OpenAI {
  getMockCreate: () => ReturnType<typeof vi.fn>
}

import { uploadFile, createConversation, getMessages, sendMessage } from "@/app/actions/chat"

const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
  storage: {
    from: vi.fn().mockReturnValue({
      upload: vi.fn(),
      getPublicUrl: vi.fn(),
      download: vi.fn(),
    }),
  },
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(createClient).mockReturnValue(mockSupabase as any)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("chat actions", () => {
  describe("uploadFile", () => {
    it("uploads file to storage and returns public URL", async () => {
      const mockUser = { id: "user-1" }
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any)

      const mockFile = new File(["content"], "document.pdf", { type: "application/pdf" })

      vi.mocked(mockSupabase.storage.from).mockReturnValue({
        upload: vi.fn().mockResolvedValue({
          data: { path: "user-1/abc123.pdf" },
          error: null,
        }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: "https://storage.supabase.co/user-1/abc123.pdf" },
        }),
        download: vi.fn(),
      } as any)

      const formData = new FormData()
      formData.set("file", mockFile)

      const result = await uploadFile(formData)

      expect(result.url).toContain("https://storage.supabase.co")
      expect(result.name).toBe("document.pdf")
      expect(result.type).toBe("application/pdf")
    })

    it("throws error for unauthenticated user", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any)

      const formData = new FormData()
      formData.set("file", {} as File)

      await expect(uploadFile(formData)).rejects.toThrow("Não autorizado")
    })

    it("throws error on upload failure", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      } as any)

      vi.mocked(mockSupabase.storage.from).mockReturnValue({
        upload: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Bucket not found" },
        }),
        getPublicUrl: vi.fn(),
        download: vi.fn(),
      } as any)

      const formData = new FormData()
      formData.set("file", new File(["content"], "test.pdf", { type: "application/pdf" }))

      await expect(uploadFile(formData)).rejects.toThrow("Falha ao subir arquivo")
    })
  })

  describe("createConversation", () => {
    it("creates conversation for authenticated user", async () => {
      const mockUser = { id: "user-1" }
      const mockConversation = {
        id: "conv-1",
        agent_id: "agent-1",
        user_id: "user-1",
        title: "Nova Conversa",
      } as const

      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any)

      vi.mocked(mockSupabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockConversation, error: null }),
          }),
        }),
      } as any)

      const result = await createConversation("agent-1")

      expect(result).toHaveProperty("id")
      expect((result as any).id).toBe("conv-1")
      expect(revalidatePath).toHaveBeenCalledWith("/agents")
    })

    it("throws error for unauthenticated user", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any)

      await expect(createConversation("agent-1")).rejects.toThrow("Não autorizado")
    })

    it("throws error on database failure", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      } as any)

      vi.mocked(mockSupabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Agent not found" },
            }),
          }),
        }),
      } as any)

      await expect(createConversation("agent-1")).rejects.toThrow("Falha ao iniciar conversa")
    })
  })

  describe("getMessages", () => {
    it("returns message history for conversation", async () => {
      const mockUser = { id: "user-1" }
      const mockMessages = [
        { id: "msg-1", role: "user", content: "Hello", conversation_id: "conv-1" },
        { id: "msg-2", role: "assistant", content: "Hi there!", conversation_id: "conv-1" },
      ]

      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any)

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockMessages, error: null }),
          }),
        }),
      } as any)

      const result = await getMessages("conv-1")

      expect(result).toEqual(mockMessages)
    })

    it("throws error for unauthenticated user", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any)

      await expect(getMessages("conv-1")).rejects.toThrow("Não autorizado")
    })

    it("throws error on database failure", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      } as any)

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: { message: "DB error" } }),
          }),
        }),
      } as any)

      await expect(getMessages("conv-1")).rejects.toThrow("Falha ao buscar histórico")
    })
  })

  describe("sendMessage", () => {
    it("sends message and returns AI response", async () => {
      const mockUser = { id: "user-1" }

      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any)

      // Mock chain: save user message
      const mockUserMessage = { id: "msg-1", role: "user", content: "Hello" }
      const mockConversation = { agent_id: "agent-1", ai_agents: { system_prompt: "You are helpful", model_name: "gpt-4o" } }
      const mockHistory: any[] = []
      const mockAssistantMessage = { id: "msg-2", role: "assistant", content: "Hello! How can I help?" }

      vi.mocked(mockSupabase.from)
        // save user message
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockUserMessage, error: null }),
            }),
          }),
        } as any)
        // get conversation
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockConversation, error: null }),
            }),
          }),
        } as any)
        // get history
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: mockHistory, error: null }),
              }),
            }),
          }),
        } as any)
        // save assistant message
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockAssistantMessage, error: null }),
            }),
          }),
        } as any)

      // Mock OpenAI response
      ;(OpenAI as unknown as MockOpenAI).getMockCreate().mockResolvedValue({
        choices: [{ message: { content: "Hello! How can I help?" } }],
      } as any)

      const result = await sendMessage("conv-1", "Hello", [])

      expect(result).toHaveProperty("userMessage")
      expect(result).toHaveProperty("assistantMessage")
      expect(result.userMessage).toEqual(mockUserMessage)
      expect(result.assistantMessage).toEqual(mockAssistantMessage)
    })

    it("throws error for unauthenticated user", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any)

      await expect(sendMessage("conv-1", "Hello")).rejects.toThrow("Não autorizado")
    })

    it("throws error when user message fails to save", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      } as any)

      vi.mocked(mockSupabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "DB error" },
            }),
          }),
        }),
      } as any)

      await expect(sendMessage("conv-1", "Hello")).rejects.toThrow(
        "Erro ao enviar mensagem para o banco de dados",
      )
    })

    it("throws error when conversation not found", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      } as any)

      vi.mocked(mockSupabase.from)
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: "msg-1" }, error: null }),
            }),
          }),
        } as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
            }),
          }),
        } as any)

      await expect(sendMessage("conv-1", "Hello")).rejects.toThrow("Conversa não encontrada")
    })

    it("handles OpenAI API errors gracefully", async () => {
      const mockUser = { id: "user-1" }

      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any)

      const mockUserMessage = { id: "msg-1", role: "user", content: "Hello" }
      const mockConversation = { agent_id: "agent-1", ai_agents: { system_prompt: "Helpful", model_name: "gpt-4o" } }

      vi.mocked(mockSupabase.from)
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockUserMessage, error: null }),
            }),
          }),
        } as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockConversation, error: null }),
            }),
          }),
        } as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          }),
        } as any)

      ;(OpenAI as unknown as MockOpenAI).getMockCreate().mockRejectedValue(
        new Error("Rate limit exceeded"),
      )

      await expect(sendMessage("conv-1", "Hello")).rejects.toThrow(
        "Falha na comunicação com a IA: Rate limit exceeded",
      )
    })
  })
})
