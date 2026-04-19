import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils"

describe("cn utility", () => {
  it("merges class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("merges Tailwind classes with tailwind-merge", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4")
  })

  it("handles falsy values (false, null, undefined, 0)", () => {
    expect(cn("foo", false, null, undefined, 0)).toBe("foo")
  })

  it("handles conditional classes", () => {
    const isActive = true
    const isDisabled = false
    expect(
      cn("base", isActive && "active", isDisabled && "disabled")
    ).toBe("base active")
  })

  it("handles array of classes", () => {
    expect(cn(["a", "b"], ["c"])).toBe("a b c")
  })

  it("handles empty input", () => {
    expect(cn()).toBe("")
  })

  it("handles object-based conditional classes (clsx behavior)", () => {
    expect(cn({ active: true, disabled: false }, "base")).toBe("active base")
  })
})
