import { eq, and, desc, asc, sql, like, or, inArray, isNull, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  parcours, InsertParcours, Parcours,
  modules, InsertModule, Module,
  lessons, InsertLesson, Lesson,
  quizzes, InsertQuiz, Quiz,
  quizQuestions, InsertQuizQuestion, QuizQuestion,
  quizAnswers, InsertQuizAnswer, QuizAnswer,
  userProgress, InsertUserProgress, UserProgress,
  userQuizAttempts, InsertUserQuizAttempt,
  badges, InsertBadge, Badge,
  userBadges, InsertUserBadge,
  lessonEmbeddings, InsertLessonEmbedding,
  chatbotMessages, InsertChatbotMessage,
  adminAlerts, InsertAdminAlert,
  auditLogs, InsertAuditLog
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USER HELPERS ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "avatarUrl", "bio"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserGamification(userId: number, data: {
  totalXp?: number;
  currentLevel?: number;
  currentStreak?: number;
  longestStreak?: number;
  lastActivityDate?: Date;
}) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

// Atomic XP increment to prevent race conditions
export async function incrementUserXp(userId: number, xpAmount: number) {
  const db = await getDb();
  if (!db) return;
  await db.execute(
    sql`UPDATE users SET totalXp = totalXp + ${xpAmount}, lastActivityDate = NOW() WHERE id = ${userId}`
  );
  // Auto-level calculation: level = floor(sqrt(totalXp / 100)) + 1
  await db.execute(
    sql`UPDATE users SET currentLevel = FLOOR(SQRT(totalXp / 100)) + 1 WHERE id = ${userId}`
  );
}

export async function updateUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

// ==================== PARCOURS HELPERS ====================

export async function createParcours(data: InsertParcours) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(parcours).values(data);
  return { id: result[0].insertId };
}

export async function updateParcours(id: number, data: Partial<InsertParcours>) {
  const db = await getDb();
  if (!db) return;
  await db.update(parcours).set(data).where(eq(parcours.id, id));
}

export async function deleteParcours(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(parcours).where(eq(parcours.id, id));
}

export async function getParcoursById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(parcours).where(eq(parcours.id, id)).limit(1);
  return result[0];
}

export async function getParcoursBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(parcours).where(eq(parcours.slug, slug)).limit(1);
  return result[0];
}

export async function getAllParcours(publishedOnly = false) {
  const db = await getDb();
  if (!db) return [];
  if (publishedOnly) {
    return db.select().from(parcours)
      .where(and(eq(parcours.isPublished, true), eq(parcours.isActive, true)))
      .orderBy(asc(parcours.displayOrder));
  }
  return db.select().from(parcours).orderBy(asc(parcours.displayOrder));
}

// ==================== MODULE HELPERS ====================

export async function createModule(data: InsertModule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(modules).values(data);
  // Update parcours total modules count
  await db.execute(sql`UPDATE parcours SET totalModules = totalModules + 1 WHERE id = ${data.parcoursId}`);
  return { id: result[0].insertId };
}

export async function updateModule(id: number, data: Partial<InsertModule>) {
  const db = await getDb();
  if (!db) return;
  await db.update(modules).set(data).where(eq(modules.id, id));
}

export async function deleteModule(id: number) {
  const db = await getDb();
  if (!db) return;
  const module = await getModuleById(id);
  if (module) {
    await db.delete(modules).where(eq(modules.id, id));
    await db.execute(sql`UPDATE parcours SET totalModules = totalModules - 1 WHERE id = ${module.parcoursId}`);
  }
}

export async function getModuleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(modules).where(eq(modules.id, id)).limit(1);
  return result[0];
}

export async function getModulesByParcoursId(parcoursId: number, publishedOnly = false) {
  const db = await getDb();
  if (!db) return [];
  if (publishedOnly) {
    return db.select().from(modules)
      .where(and(eq(modules.parcoursId, parcoursId), eq(modules.isPublished, true)))
      .orderBy(asc(modules.orderIndex));
  }
  return db.select().from(modules)
    .where(eq(modules.parcoursId, parcoursId))
    .orderBy(asc(modules.orderIndex));
}

export async function getAllModules() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(modules).orderBy(asc(modules.orderIndex));
}

// ==================== LESSON HELPERS ====================

export async function createLesson(data: InsertLesson) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(lessons).values(data);
  return { id: result[0].insertId };
}

export async function updateLesson(id: number, data: Partial<InsertLesson>) {
  const db = await getDb();
  if (!db) return;
  await db.update(lessons).set(data).where(eq(lessons.id, id));
}

export async function deleteLesson(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(lessons).where(eq(lessons.id, id));
}

export async function getLessonById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return result[0];
}

export async function getLessonsByModuleId(moduleId: number, publishedOnly = false) {
  const db = await getDb();
  if (!db) return [];
  if (publishedOnly) {
    return db.select().from(lessons)
      .where(and(eq(lessons.moduleId, moduleId), eq(lessons.isPublished, true)))
      .orderBy(asc(lessons.orderIndex));
  }
  return db.select().from(lessons)
    .where(eq(lessons.moduleId, moduleId))
    .orderBy(asc(lessons.orderIndex));
}

export async function getAllLessons() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lessons).orderBy(asc(lessons.orderIndex));
}

// ==================== QUIZ HELPERS ====================

export async function createQuiz(data: InsertQuiz) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(quizzes).values(data);
  return { id: result[0].insertId };
}

export async function updateQuiz(id: number, data: Partial<InsertQuiz>) {
  const db = await getDb();
  if (!db) return;
  await db.update(quizzes).set(data).where(eq(quizzes.id, id));
}

export async function deleteQuiz(id: number) {
  const db = await getDb();
  if (!db) return;
  // Delete questions and answers first
  const questions = await getQuestionsByQuizId(id);
  for (const q of questions) {
    await db.delete(quizAnswers).where(eq(quizAnswers.questionId, q.id));
  }
  await db.delete(quizQuestions).where(eq(quizQuestions.quizId, id));
  await db.delete(quizzes).where(eq(quizzes.id, id));
}

export async function getQuizById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(quizzes).where(eq(quizzes.id, id)).limit(1);
  return result[0];
}

export async function getQuizzesByModuleId(moduleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quizzes)
    .where(eq(quizzes.moduleId, moduleId))
    .orderBy(asc(quizzes.orderIndex));
}

export async function getQuizzesByLessonId(lessonId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quizzes)
    .where(eq(quizzes.lessonId, lessonId))
    .orderBy(asc(quizzes.orderIndex));
}

export async function getAllQuizzes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quizzes).orderBy(desc(quizzes.createdAt));
}

// ==================== QUIZ QUESTION HELPERS ====================

export async function createQuizQuestion(data: InsertQuizQuestion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(quizQuestions).values(data);
  return { id: result[0].insertId };
}

export async function updateQuizQuestion(id: number, data: Partial<InsertQuizQuestion>) {
  const db = await getDb();
  if (!db) return;
  await db.update(quizQuestions).set(data).where(eq(quizQuestions.id, id));
}

export async function deleteQuizQuestion(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(quizAnswers).where(eq(quizAnswers.questionId, id));
  await db.delete(quizQuestions).where(eq(quizQuestions.id, id));
}

export async function getQuestionsByQuizId(quizId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quizQuestions)
    .where(eq(quizQuestions.quizId, quizId))
    .orderBy(asc(quizQuestions.orderIndex));
}

// ==================== QUIZ ANSWER HELPERS ====================

export async function createQuizAnswer(data: InsertQuizAnswer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(quizAnswers).values(data);
  return { id: result[0].insertId };
}

export async function updateQuizAnswer(id: number, data: Partial<InsertQuizAnswer>) {
  const db = await getDb();
  if (!db) return;
  await db.update(quizAnswers).set(data).where(eq(quizAnswers.id, id));
}

export async function deleteQuizAnswer(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(quizAnswers).where(eq(quizAnswers.id, id));
}

export async function getAnswersByQuestionId(questionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quizAnswers)
    .where(eq(quizAnswers.questionId, questionId))
    .orderBy(asc(quizAnswers.orderIndex));
}

// ==================== USER PROGRESS HELPERS ====================

export async function createOrUpdateProgress(data: InsertUserProgress) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if progress exists
  let whereCondition = eq(userProgress.userId, data.userId!);
  if (data.lessonId) {
    whereCondition = and(whereCondition, eq(userProgress.lessonId, data.lessonId))!;
  } else if (data.moduleId) {
    whereCondition = and(whereCondition, eq(userProgress.moduleId, data.moduleId), isNull(userProgress.lessonId))!;
  } else if (data.parcoursId) {
    whereCondition = and(whereCondition, eq(userProgress.parcoursId, data.parcoursId), isNull(userProgress.moduleId), isNull(userProgress.lessonId))!;
  }
  
  const existing = await db.select().from(userProgress).where(whereCondition).limit(1);
  
  if (existing.length > 0) {
    await db.update(userProgress).set({
      ...data,
      lastAccessedAt: new Date()
    }).where(eq(userProgress.id, existing[0].id));
    return { id: existing[0].id };
  } else {
    const result = await db.insert(userProgress).values({
      ...data,
      startedAt: new Date(),
      lastAccessedAt: new Date()
    });
    return { id: result[0].insertId };
  }
}

export async function getUserProgressForParcours(userId: number, parcoursId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userProgress)
    .where(and(eq(userProgress.userId, userId), eq(userProgress.parcoursId, parcoursId)));
}

export async function getUserProgressForLesson(userId: number, lessonId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userProgress)
    .where(and(eq(userProgress.userId, userId), eq(userProgress.lessonId, lessonId)))
    .limit(1);
  return result[0];
}

export async function getUserAllProgress(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userProgress)
    .where(eq(userProgress.userId, userId));
}

export async function getCompletedLessonsCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(userProgress)
    .where(and(
      eq(userProgress.userId, userId),
      eq(userProgress.status, "completed"),
      sql`${userProgress.lessonId} IS NOT NULL`
    ));
  return result[0]?.count || 0;
}

// ==================== QUIZ ATTEMPT HELPERS ====================

export async function createQuizAttempt(data: InsertUserQuizAttempt) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get attempt number
  const attempts = await db.select({ count: sql<number>`count(*)` })
    .from(userQuizAttempts)
    .where(and(eq(userQuizAttempts.userId, data.userId!), eq(userQuizAttempts.quizId, data.quizId!)));
  
  const attemptNumber = (attempts[0]?.count || 0) + 1;
  
  const result = await db.insert(userQuizAttempts).values({
    ...data,
    attemptNumber
  });
  return { id: result[0].insertId, attemptNumber };
}

export async function getUserQuizAttempts(userId: number, quizId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userQuizAttempts)
    .where(and(eq(userQuizAttempts.userId, userId), eq(userQuizAttempts.quizId, quizId)))
    .orderBy(desc(userQuizAttempts.completedAt));
}

export async function getBestQuizAttempt(userId: number, quizId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userQuizAttempts)
    .where(and(eq(userQuizAttempts.userId, userId), eq(userQuizAttempts.quizId, quizId)))
    .orderBy(desc(userQuizAttempts.score))
    .limit(1);
  return result[0];
}

// ==================== BADGE HELPERS ====================

export async function createBadge(data: InsertBadge) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(badges).values(data);
  return { id: result[0].insertId };
}

export async function getAllBadges() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(badges).where(eq(badges.isActive, true));
}

export async function getUserBadges(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    badge: badges,
    earnedAt: userBadges.earnedAt
  })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, userId));
}

export async function awardBadge(userId: number, badgeId: number) {
  const db = await getDb();
  if (!db) return;
  
  // Check if already has badge
  const existing = await db.select().from(userBadges)
    .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)))
    .limit(1);
  
  if (existing.length === 0) {
    await db.insert(userBadges).values({ userId, badgeId });
    
    // Add XP bonus
    const badge = await db.select().from(badges).where(eq(badges.id, badgeId)).limit(1);
    if (badge[0]?.xpBonus) {
      await db.execute(sql`UPDATE users SET totalXp = totalXp + ${badge[0].xpBonus} WHERE id = ${userId}`);
    }
  }
}

// ==================== EMBEDDING HELPERS ====================

export async function createLessonEmbedding(data: InsertLessonEmbedding) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(lessonEmbeddings).values(data);
  return { id: result[0].insertId };
}

export async function deleteLessonEmbeddings(lessonId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(lessonEmbeddings).where(eq(lessonEmbeddings.lessonId, lessonId));
}

export async function getAllEmbeddings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lessonEmbeddings);
}

// ==================== CHATBOT MESSAGE HELPERS ====================

export async function createChatbotMessage(data: InsertChatbotMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(chatbotMessages).values(data);
  return { id: result[0].insertId };
}

export async function getUserChatHistory(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatbotMessages)
    .where(eq(chatbotMessages.userId, userId))
    .orderBy(desc(chatbotMessages.createdAt))
    .limit(limit);
}

export async function getTodayMessageCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(chatbotMessages)
    .where(and(
      eq(chatbotMessages.userId, userId),
      gte(chatbotMessages.createdAt, today)
    ));
  return result[0]?.count || 0;
}

// ==================== ADMIN ALERT HELPERS ====================

export async function createAdminAlert(data: InsertAdminAlert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(adminAlerts).values(data);
  return { id: result[0].insertId };
}

export async function getUnreadAlerts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adminAlerts)
    .where(eq(adminAlerts.isRead, false))
    .orderBy(desc(adminAlerts.createdAt));
}

export async function getAllAlerts(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adminAlerts)
    .orderBy(desc(adminAlerts.createdAt))
    .limit(limit);
}

export async function markAlertAsRead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(adminAlerts).set({ isRead: true }).where(eq(adminAlerts.id, id));
}

export async function markAllAlertsAsRead() {
  const db = await getDb();
  if (!db) return;
  await db.update(adminAlerts).set({ isRead: true }).where(eq(adminAlerts.isRead, false));
}

export async function deleteAlert(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(adminAlerts).where(eq(adminAlerts.id, id));
}

// ==================== AUDIT LOG HELPERS ====================

export async function createAuditLog(data: InsertAuditLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values(data);
}

export async function getAuditLogs(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

// ==================== STATISTICS HELPERS ====================

export async function getAdminStats() {
  const db = await getDb();
  if (!db) return null;
  
  const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [parcoursCount] = await db.select({ count: sql<number>`count(*)` }).from(parcours);
  const [modulesCount] = await db.select({ count: sql<number>`count(*)` }).from(modules);
  const [lessonsCount] = await db.select({ count: sql<number>`count(*)` }).from(lessons);
  const [quizzesCount] = await db.select({ count: sql<number>`count(*)` }).from(quizzes);
  const [completedLessons] = await db.select({ count: sql<number>`count(*)` })
    .from(userProgress)
    .where(eq(userProgress.status, "completed"));
  
  return {
    totalUsers: usersCount?.count || 0,
    totalParcours: parcoursCount?.count || 0,
    totalModules: modulesCount?.count || 0,
    totalLessons: lessonsCount?.count || 0,
    totalQuizzes: quizzesCount?.count || 0,
    totalCompletedLessons: completedLessons?.count || 0
  };
}

export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const user = await getUserById(userId);
  if (!user) return null;
  
  const [completedLessons] = await db.select({ count: sql<number>`count(*)` })
    .from(userProgress)
    .where(and(eq(userProgress.userId, userId), eq(userProgress.status, "completed"), sql`${userProgress.lessonId} IS NOT NULL`));
  
  const [completedModules] = await db.select({ count: sql<number>`count(*)` })
    .from(userProgress)
    .where(and(eq(userProgress.userId, userId), eq(userProgress.status, "completed"), sql`${userProgress.moduleId} IS NOT NULL`, isNull(userProgress.lessonId)));
  
  const [passedQuizzes] = await db.select({ count: sql<number>`count(*)` })
    .from(userQuizAttempts)
    .where(and(eq(userQuizAttempts.userId, userId), eq(userQuizAttempts.passed, true)));
  
  const userBadgesList = await getUserBadges(userId);
  
  return {
    totalXp: user.totalXp,
    currentLevel: user.currentLevel,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    completedLessons: completedLessons?.count || 0,
    completedModules: completedModules?.count || 0,
    passedQuizzes: passedQuizzes?.count || 0,
    badgesEarned: userBadgesList.length
  };
}


// ==================== SUBSCRIPTION HELPERS ====================

import { subscriptions, InsertSubscription, Subscription, aiGeneratedContent, InsertAiGeneratedContent } from "../drizzle/schema";

export async function getUserSubscription(userId: number): Promise<Subscription | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result[0] || null;
}

export async function createOrUpdateSubscription(data: InsertSubscription): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getUserSubscription(data.userId);
  
  if (existing) {
    await db.update(subscriptions).set(data).where(eq(subscriptions.userId, data.userId));
    return { id: existing.id };
  } else {
    const result = await db.insert(subscriptions).values(data);
    return { id: result[0].insertId };
  }
}

export async function updateSubscription(userId: number, data: Partial<InsertSubscription>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(subscriptions).set(data).where(eq(subscriptions.userId, userId));
}

export async function cancelSubscription(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(subscriptions).set({
    status: "canceled",
    canceledAt: new Date(),
  }).where(eq(subscriptions.userId, userId));
}

export async function getAllSubscriptions(): Promise<Subscription[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
}

// ==================== AI GENERATED CONTENT HELPERS ====================

export async function createAiGeneratedContent(data: InsertAiGeneratedContent): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(aiGeneratedContent).values(data);
  return { id: result[0].insertId };
}

export async function getAiGeneratedContent(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(aiGeneratedContent).where(eq(aiGeneratedContent.id, id)).limit(1);
  return result[0] || null;
}

export async function updateAiGeneratedContent(id: number, data: Partial<InsertAiGeneratedContent>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(aiGeneratedContent).set(data).where(eq(aiGeneratedContent.id, id));
}

export async function getPendingAiContent(): Promise<typeof aiGeneratedContent.$inferSelect[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiGeneratedContent)
    .where(eq(aiGeneratedContent.status, "pending"))
    .orderBy(desc(aiGeneratedContent.createdAt));
}

export async function getAiContentByModule(moduleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiGeneratedContent)
    .where(eq(aiGeneratedContent.moduleId, moduleId))
    .orderBy(desc(aiGeneratedContent.createdAt));
}

export async function getAiContentByLesson(lessonId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiGeneratedContent)
    .where(eq(aiGeneratedContent.lessonId, lessonId))
    .orderBy(desc(aiGeneratedContent.createdAt));
}


// ==================== DETAILED PROGRESS TRACKING ====================

export async function getDetailedParcoursProgress(userId: number, parcoursId: number) {
  const db = await getDb();
  if (!db) return null;
  
  // Get parcours info
  const parcoursData = await getParcoursById(parcoursId);
  if (!parcoursData) return null;
  
  // Get all modules for this parcours
  const parcoursModules = await getModulesByParcoursId(parcoursId, true);
  
  // Get user progress for all items in this parcours
  const progressData = await getUserProgressForParcours(userId, parcoursId);
  
  // Calculate module progress
  const modulesProgress = await Promise.all(parcoursModules.map(async (module) => {
    const moduleLessons = await getLessonsByModuleId(module.id, true);
    const moduleQuizzes = await getQuizzesByModuleId(module.id);
    
    const completedLessons = progressData.filter(p => 
      p.moduleId === module.id && 
      p.lessonId !== null && 
      p.status === "completed"
    ).length;
    
    const lessonProgress = moduleLessons.length > 0 
      ? Math.round((completedLessons / moduleLessons.length) * 100) 
      : 0;
    
    // Get quiz attempts for this module
    const quizAttempts = await Promise.all(moduleQuizzes.map(async (quiz) => {
      const best = await getBestQuizAttempt(userId, quiz.id);
      return {
        quizId: quiz.id,
        quizTitle: quiz.title,
        bestScore: best?.score || null,
        passed: best?.passed || false,
        attempts: best ? 1 : 0
      };
    }));
    
    const passedQuizzes = quizAttempts.filter(q => q.passed).length;
    const quizProgress = moduleQuizzes.length > 0 
      ? Math.round((passedQuizzes / moduleQuizzes.length) * 100) 
      : 100;
    
    const moduleProgress = progressData.find(p => 
      p.moduleId === module.id && 
      p.lessonId === null
    );
    
    return {
      moduleId: module.id,
      moduleTitle: module.title,
      totalLessons: moduleLessons.length,
      completedLessons,
      lessonProgress,
      totalQuizzes: moduleQuizzes.length,
      passedQuizzes,
      quizProgress,
      overallProgress: Math.round((lessonProgress + quizProgress) / 2),
      status: moduleProgress?.status || "not_started",
      startedAt: moduleProgress?.startedAt || null,
      completedAt: moduleProgress?.completedAt || null,
      timeSpentMinutes: moduleProgress?.timeSpentMinutes || 0,
      quizAttempts
    };
  }));
  
  // Calculate overall parcours progress
  const totalLessons = modulesProgress.reduce((sum, m) => sum + m.totalLessons, 0);
  const completedLessons = modulesProgress.reduce((sum, m) => sum + m.completedLessons, 0);
  const totalQuizzes = modulesProgress.reduce((sum, m) => sum + m.totalQuizzes, 0);
  const passedQuizzes = modulesProgress.reduce((sum, m) => sum + m.passedQuizzes, 0);
  const totalTimeSpent = modulesProgress.reduce((sum, m) => sum + m.timeSpentMinutes, 0);
  
  const parcoursProgress = progressData.find(p => 
    p.parcoursId === parcoursId && 
    p.moduleId === null && 
    p.lessonId === null
  );
  
  return {
    parcoursId,
    parcoursTitle: parcoursData.title,
    parcoursSlug: parcoursData.slug,
    totalModules: parcoursModules.length,
    completedModules: modulesProgress.filter(m => m.status === "completed").length,
    totalLessons,
    completedLessons,
    lessonProgress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    totalQuizzes,
    passedQuizzes,
    quizProgress: totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 100,
    overallProgress: totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100) 
      : 0,
    status: parcoursProgress?.status || "not_started",
    startedAt: parcoursProgress?.startedAt || null,
    completedAt: parcoursProgress?.completedAt || null,
    totalTimeSpentMinutes: totalTimeSpent,
    modules: modulesProgress
  };
}

export async function getAllUserProgressSummary(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Get all published parcours
  const allParcours = await getAllParcours(true);
  
  // Get progress for each parcours
  const progressSummary = await Promise.all(allParcours.map(async (p) => {
    const progress = await getDetailedParcoursProgress(userId, p.id);
    return progress;
  }));
  
  return progressSummary.filter(p => p !== null);
}

export async function getAdminUserProgressReport(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  // Get all users with their progress
  const allUsers = await db.select().from(users).limit(limit);
  
  const userProgressReport = await Promise.all(allUsers.map(async (user) => {
    const stats = await getUserStats(user.id);
    const progressData = await getUserAllProgress(user.id);
    
    // Get active parcours (started but not completed)
    const activeParcours = progressData.filter(p => 
      p.parcoursId !== null && 
      p.moduleId === null && 
      p.lessonId === null &&
      p.status !== "completed"
    ).length;
    
    // Get completed parcours
    const completedParcours = progressData.filter(p => 
      p.parcoursId !== null && 
      p.moduleId === null && 
      p.lessonId === null &&
      p.status === "completed"
    ).length;
    
    // Calculate total time spent
    const totalTimeSpent = progressData.reduce((sum, p) => sum + (p.timeSpentMinutes || 0), 0);
    
    return {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      role: user.role,
      totalXp: user.totalXp,
      currentLevel: user.currentLevel,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      activeParcours,
      completedParcours,
      completedLessons: stats?.completedLessons || 0,
      completedModules: stats?.completedModules || 0,
      passedQuizzes: stats?.passedQuizzes || 0,
      badgesEarned: stats?.badgesEarned || 0,
      totalTimeSpentMinutes: totalTimeSpent,
      lastActivity: user.lastSignedIn,
      createdAt: user.createdAt
    };
  }));
  
  return userProgressReport;
}

export async function getUserProgressTimeline(userId: number, days = 30) {
  const db = await getDb();
  if (!db) return [];
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Get all progress entries in the time range
  const progressEntries = await db.select().from(userProgress)
    .where(and(
      eq(userProgress.userId, userId),
      gte(userProgress.lastAccessedAt, startDate)
    ))
    .orderBy(asc(userProgress.lastAccessedAt));
  
  // Group by date
  const timeline: Record<string, { lessonsCompleted: number; timeSpent: number; xpEarned: number }> = {};
  
  for (const entry of progressEntries) {
    if (entry.lastAccessedAt) {
      const dateKey = entry.lastAccessedAt.toISOString().split('T')[0];
      if (!timeline[dateKey]) {
        timeline[dateKey] = { lessonsCompleted: 0, timeSpent: 0, xpEarned: 0 };
      }
      if (entry.status === "completed" && entry.lessonId) {
        timeline[dateKey].lessonsCompleted++;
        timeline[dateKey].xpEarned += entry.xpEarned || 0;
      }
      timeline[dateKey].timeSpent += entry.timeSpentMinutes || 0;
    }
  }
  
  return Object.entries(timeline).map(([date, data]) => ({
    date,
    ...data
  }));
}
