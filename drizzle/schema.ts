import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, float, index, uniqueIndex } from "drizzle-orm/mysql-core";

// ==================== USERS & AUTH ====================

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Gamification fields
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  totalXp: int("totalXp").default(0).notNull(),
  currentLevel: int("currentLevel").default(1).notNull(),
  lastActivityDate: timestamp("lastActivityDate"),
  
  // Profile
  avatarUrl: text("avatarUrl"),
  bio: text("bio"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ==================== PARCOURS (Learning Paths) ====================

export const parcours = mysqlTable("parcours", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  
  // Metadata
  totalModules: int("totalModules").default(0).notNull(),
  totalHours: int("totalHours").default(0).notNull(),
  difficulty: mysqlEnum("difficulty", ["debutant", "intermediaire", "avance"]).default("debutant").notNull(),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  isPublished: boolean("isPublished").default(false).notNull(),
  isFree: boolean("isFree").default(false).notNull(),
  
  // Display
  displayOrder: int("displayOrder").default(0).notNull(),
  
  // XP reward for completing
  xpReward: int("xpReward").default(100).notNull(),
  
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Parcours = typeof parcours.$inferSelect;
export type InsertParcours = typeof parcours.$inferInsert;

// ==================== MODULES ====================

export const modules = mysqlTable("modules", {
  id: int("id").autoincrement().primaryKey(),
  parcoursId: int("parcoursId").notNull(),
  
  code: varchar("code", { length: 50 }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  
  // Metadata
  hours: int("hours").default(0).notNull(),
  xpReward: int("xpReward").default(50).notNull(),
  
  // Order and prerequisites
  orderIndex: int("orderIndex").default(0).notNull(),
  prerequisiteModuleId: int("prerequisiteModuleId"),
  
  // Accessibility
  isFree: boolean("isFree").default(false).notNull(),
  isPublished: boolean("isPublished").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Module = typeof modules.$inferSelect;
export type InsertModule = typeof modules.$inferInsert;

// ==================== LESSONS ====================

export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  moduleId: int("moduleId").notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  contentHtml: text("contentHtml"),
  contentMarkdown: text("contentMarkdown"),
  
  // Structured JSON content (from imported JSON)
  contentJson: json("contentJson"), // Full structured lesson data
  objectifsApprentissage: json("objectifsApprentissage"), // Learning objectives array
  objectifs: json("objectifs"), // Learning objectives (alt)
  prerequis: json("prerequis"), // Prerequisites array
  vocabulaireCle: json("vocabulaireCle"), // Key vocabulary [{terme, definition}]
  contenuPrincipal: json("contenuPrincipal"), // Main content sections
  resume: text("resume"), // Summary
  exercicePratique: json("exercicePratique"), // Practical exercise
  pourAllerPlusLoin: json("pourAllerPlusLoin"), // Further reading
  
  // Media
  videoUrl: text("videoUrl"),
  imageUrl: text("imageUrl"),
  
  // Metadata
  duration: int("duration").default(5).notNull(), // minutes
  xpReward: int("xpReward").default(10).notNull(),
  difficulty: mysqlEnum("difficulty", ["facile", "moyen", "difficile"]).default("facile").notNull(),
  
  // Order and prerequisites
  orderIndex: int("orderIndex").default(0).notNull(),
  prerequisiteLessonId: int("prerequisiteLessonId"),
  
  // Status
  isFree: boolean("isFree").default(false).notNull(),
  isPublished: boolean("isPublished").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

// ==================== QUIZZES ====================

export const quizzes = mysqlTable("quizzes", {
  id: int("id").autoincrement().primaryKey(),
  moduleId: int("moduleId"),
  lessonId: int("lessonId"),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Settings
  passingScore: int("passingScore").default(70).notNull(), // percentage
  timeLimit: int("timeLimit"), // minutes, null = no limit
  maxAttempts: int("maxAttempts").default(3).notNull(),
  shuffleQuestions: boolean("shuffleQuestions").default(false).notNull(),
  showCorrectAnswers: boolean("showCorrectAnswers").default(true).notNull(),
  
  // Rewards
  xpReward: int("xpReward").default(25).notNull(),
  
  // Order
  orderIndex: int("orderIndex").default(0).notNull(),
  
  // Status
  isPublished: boolean("isPublished").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;

// ==================== QUIZ QUESTIONS ====================

export const quizQuestions = mysqlTable("quiz_questions", {
  id: int("id").autoincrement().primaryKey(),
  quizId: int("quizId").notNull(),
  
  questionText: text("questionText").notNull(),
  questionType: mysqlEnum("questionType", ["multiple_choice", "true_false", "multiple_select"]).default("multiple_choice").notNull(),
  
  // For explanation after answer
  explanation: text("explanation"),
  
  // Points for this question
  points: int("points").default(1).notNull(),
  
  // Order
  orderIndex: int("orderIndex").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = typeof quizQuestions.$inferInsert;

// ==================== QUIZ ANSWERS ====================

export const quizAnswers = mysqlTable("quiz_answers", {
  id: int("id").autoincrement().primaryKey(),
  questionId: int("questionId").notNull(),
  
  answerText: text("answerText").notNull(),
  isCorrect: boolean("isCorrect").default(false).notNull(),
  
  // Order
  orderIndex: int("orderIndex").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuizAnswer = typeof quizAnswers.$inferSelect;
export type InsertQuizAnswer = typeof quizAnswers.$inferInsert;

// ==================== USER PROGRESS ====================

export const userProgress = mysqlTable("user_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // What was completed
  parcoursId: int("parcoursId"),
  moduleId: int("moduleId"),
  lessonId: int("lessonId"),
  
  // Progress status
  status: mysqlEnum("status", ["not_started", "in_progress", "completed"]).default("not_started").notNull(),
  progressPercent: int("progressPercent").default(0).notNull(),
  
  // XP earned for this item
  xpEarned: int("xpEarned").default(0).notNull(),
  
  // Time tracking
  timeSpentMinutes: int("timeSpentMinutes").default(0).notNull(),
  
  // Timestamps
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  lastAccessedAt: timestamp("lastAccessedAt").defaultNow().notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

// ==================== QUIZ ATTEMPTS ====================

export const userQuizAttempts = mysqlTable("user_quiz_attempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  quizId: int("quizId").notNull(),
  
  // Results
  score: int("score").default(0).notNull(), // percentage
  correctAnswers: int("correctAnswers").default(0).notNull(),
  totalQuestions: int("totalQuestions").default(0).notNull(),
  passed: boolean("passed").default(false).notNull(),
  
  // XP earned
  xpEarned: int("xpEarned").default(0).notNull(),
  
  // Answers given (JSON array of {questionId, answerId, isCorrect})
  answers: json("answers"),
  
  // Time taken in seconds
  timeTaken: int("timeTaken"),
  
  attemptNumber: int("attemptNumber").default(1).notNull(),
  
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserQuizAttempt = typeof userQuizAttempts.$inferSelect;
export type InsertUserQuizAttempt = typeof userQuizAttempts.$inferInsert;

// ==================== BADGES ====================

export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  iconUrl: text("iconUrl"),
  
  // Criteria
  criteriaType: mysqlEnum("criteriaType", [
    "xp_threshold",
    "streak_days",
    "parcours_completed",
    "modules_completed",
    "lessons_completed",
    "quizzes_passed",
    "perfect_quiz"
  ]).notNull(),
  criteriaValue: int("criteriaValue").notNull(), // threshold value
  
  // Rarity
  rarity: mysqlEnum("rarity", ["common", "rare", "epic", "legendary"]).default("common").notNull(),
  
  // XP bonus for earning this badge
  xpBonus: int("xpBonus").default(0).notNull(),
  
  isActive: boolean("isActive").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

// ==================== USER BADGES ====================

export const userBadges = mysqlTable("user_badges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  badgeId: int("badgeId").notNull(),
  
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;

// ==================== LESSON EMBEDDINGS (for RAG) ====================

export const lessonEmbeddings = mysqlTable("lesson_embeddings", {
  id: int("id").autoincrement().primaryKey(),
  lessonId: int("lessonId").notNull(),
  
  contentChunk: text("contentChunk").notNull(),
  embedding: json("embedding"), // Vector stored as JSON array
  
  // Metadata for filtering
  metadata: json("metadata"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LessonEmbedding = typeof lessonEmbeddings.$inferSelect;
export type InsertLessonEmbedding = typeof lessonEmbeddings.$inferInsert;

// ==================== CHATBOT MESSAGES ====================

export const chatbotMessages = mysqlTable("chatbot_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  message: text("message").notNull(),
  response: text("response").notNull(),
  
  // Context used
  contextUsed: boolean("contextUsed").default(false).notNull(),
  lessonIdsReferenced: json("lessonIdsReferenced"), // Array of lesson IDs
  
  // Feedback
  helpful: boolean("helpful"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatbotMessage = typeof chatbotMessages.$inferSelect;
export type InsertChatbotMessage = typeof chatbotMessages.$inferInsert;

// ==================== ADMIN ALERTS ====================

export const adminAlerts = mysqlTable("admin_alerts", {
  id: int("id").autoincrement().primaryKey(),
  
  alertType: mysqlEnum("alertType", [
    "new_registration",
    "parcours_completed",
    "quiz_failed_multiple",
    "technical_error",
    "milestone_reached",
    "feedback_received"
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  
  // Related entities
  userId: int("userId"),
  parcoursId: int("parcoursId"),
  
  // Status
  isRead: boolean("isRead").default(false).notNull(),
  isNotified: boolean("isNotified").default(false).notNull(),
  
  // Priority
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminAlert = typeof adminAlerts.$inferSelect;
export type InsertAdminAlert = typeof adminAlerts.$inferInsert;

// ==================== AUDIT LOGS ====================

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(),
  entityId: int("entityId"),
  
  // Changes made (JSON with before/after)
  changes: json("changes"),
  
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;


// ==================== SUBSCRIPTIONS ====================

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Plan info
  planId: mysqlEnum("planId", ["free", "basic", "pro"]).default("free").notNull(),
  billingPeriod: mysqlEnum("billingPeriod", ["monthly", "yearly"]).default("monthly").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["card", "crypto"]).default("card").notNull(),
  
  // Creem info
  creemCustomerId: varchar("creemCustomerId", { length: 255 }),
  creemSubscriptionId: varchar("creemSubscriptionId", { length: 255 }),
  creemProductId: varchar("creemProductId", { length: 255 }),
  
  // Crypto payment info
  cryptoWalletAddress: varchar("cryptoWalletAddress", { length: 255 }),
  cryptoCurrency: mysqlEnum("cryptoCurrency", ["btc", "usdc"]),
  
  // Status
  status: mysqlEnum("status", ["active", "canceled", "past_due", "trialing", "incomplete"]).default("active").notNull(),
  
  // Dates
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false).notNull(),
  canceledAt: timestamp("canceledAt"),
  
  // Discounts applied
  cryptoDiscount: boolean("cryptoDiscount").default(false).notNull(),
  annualDiscount: boolean("annualDiscount").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ==================== AI GENERATED CONTENT ====================

export const aiGeneratedContent = mysqlTable("ai_generated_content", {
  id: int("id").autoincrement().primaryKey(),
  
  // What was generated
  contentType: mysqlEnum("contentType", ["lesson", "quiz", "question"]).notNull(),
  
  // Related entities
  moduleId: int("moduleId"),
  lessonId: int("lessonId"),
  quizId: int("quizId"),
  
  // Generation prompt and result
  prompt: text("prompt").notNull(),
  generatedContent: text("generatedContent").notNull(),
  
  // Status
  status: mysqlEnum("status", ["pending", "approved", "rejected", "modified"]).default("pending").notNull(),
  
  // Who generated and reviewed
  generatedBy: int("generatedBy"),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  
  // Modifications made
  modifications: text("modifications"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiGeneratedContent = typeof aiGeneratedContent.$inferSelect;
export type InsertAiGeneratedContent = typeof aiGeneratedContent.$inferInsert;

// ==================== CERTIFICATES ====================

export const certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  parcoursId: int("parcoursId").notNull(),

  // Certificate details
  certificateNumber: varchar("certificateNumber", { length: 50 }).notNull().unique(), // e.g., SKL-2026-001234
  studentName: varchar("studentName", { length: 255 }).notNull(),
  parcoursTitle: varchar("parcoursTitle", { length: 255 }).notNull(),

  // Completion info
  completionDate: timestamp("completionDate").notNull(),
  totalHoursCompleted: int("totalHoursCompleted").default(0).notNull(),
  finalScore: int("finalScore"), // Average quiz score percentage

  // Metadata
  issuer: varchar("issuer", { length: 255 }).default("Sklora").notNull(),
  credentialId: varchar("credentialId", { length: 100 }).notNull().unique(), // UUID for verification

  // Status
  isValid: boolean("isValid").default(true).notNull(),
  revokedAt: timestamp("revokedAt"),
  revokedReason: text("revokedReason"),

  // Share tracking
  sharedCount: int("sharedCount").default(0).notNull(),
  viewCount: int("viewCount").default(0).notNull(),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;
