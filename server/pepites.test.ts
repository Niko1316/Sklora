import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// Mock user for testing
function createUserContext(role: "user" | "admin" = "user"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    currentStreak: 5,
    longestStreak: 10,
    totalXp: 500,
    currentLevel: 3,
    lastActivityDate: new Date(),
    avatarUrl: null,
    bio: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user data for authenticated users", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.email).toBe("test@example.com");
    expect(result?.name).toBe("Test User");
  });
});

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(ctx.res.clearCookie).toHaveBeenCalled();
  });
});

describe("user.getProfile", () => {
  it("returns the current user profile for authenticated users", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.user.getProfile();
    expect(result).not.toBeNull();
    expect(result.id).toBe(1);
    expect(result.totalXp).toBe(500);
    expect(result.currentLevel).toBe(3);
  });

  it("throws for unauthenticated users", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.user.getProfile()).rejects.toThrow();
  });
});

describe("parcours.list (public)", () => {
  it("is accessible without authentication", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    // Should not throw - just verify the procedure is callable
    await expect(caller.parcours.list()).resolves.toBeDefined();
  });
});

describe("admin procedures", () => {
  it("admin.getStats requires admin role", async () => {
    const { ctx: userCtx } = createUserContext("user");
    const userCaller = appRouter.createCaller(userCtx);
    await expect(userCaller.admin.getStats()).rejects.toThrow(/admin/i);
  });

  it("admin.getStats is accessible to admins", async () => {
    const { ctx: adminCtx } = createUserContext("admin");
    const adminCaller = appRouter.createCaller(adminCtx);
    // Should not throw for admin users
    await expect(adminCaller.admin.getStats()).resolves.toBeDefined();
  });

  it("parcours.adminList requires admin role", async () => {
    const { ctx: userCtx } = createUserContext("user");
    const userCaller = appRouter.createCaller(userCtx);
    await expect(userCaller.parcours.adminList()).rejects.toThrow(/admin/i);
  });

  it("module.adminList requires admin role", async () => {
    const { ctx: userCtx } = createUserContext("user");
    const userCaller = appRouter.createCaller(userCtx);
    await expect(userCaller.module.adminList()).rejects.toThrow(/admin/i);
  });

  it("lesson.adminList requires admin role", async () => {
    const { ctx: userCtx } = createUserContext("user");
    const userCaller = appRouter.createCaller(userCtx);
    await expect(userCaller.lesson.adminList()).rejects.toThrow(/admin/i);
  });

  it("quiz.adminList requires admin role", async () => {
    const { ctx: userCtx } = createUserContext("user");
    const userCaller = appRouter.createCaller(userCtx);
    await expect(userCaller.quiz.adminList()).rejects.toThrow(/admin/i);
  });
});

describe("chatbot.sendMessage", () => {
  it("requires authentication", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.chatbot.sendMessage({ message: "Hello" })
    ).rejects.toThrow();
  });

  it("validates message length", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    // Empty message should fail validation
    await expect(
      caller.chatbot.sendMessage({ message: "" })
    ).rejects.toThrow();
  });
});

describe("progress.completeLesson", () => {
  it("requires authentication", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.progress.completeLesson({ lessonId: 1 })
    ).rejects.toThrow();
  });
});

describe("quiz.submit", () => {
  it("requires authentication", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.quiz.submit({
        quizId: 1,
        answers: [{ questionId: 1, answerId: 1 }],
      })
    ).rejects.toThrow();
  });
});
