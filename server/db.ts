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
