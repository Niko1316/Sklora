import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";

// Admin procedure - only allows admin users
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Accès réservé aux administrateurs' });
  }
  return next({ ctx });
});

// ==================== AUTH ROUTER ====================
const authRouter = router({
  me: publicProcedure.query(opts => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});

// ==================== USER ROUTER ====================
const userRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),
  
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      bio: z.string().optional(),
      avatarUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      
      // Update user profile logic would go here
      return { success: true };
    }),
  
  getStats: protectedProcedure.query(async ({ ctx }) => {
    return db.getUserStats(ctx.user.id);
  }),
  
  getBadges: protectedProcedure.query(async ({ ctx }) => {
    return db.getUserBadges(ctx.user.id);
  }),
  
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    return db.getUserAllProgress(ctx.user.id);
  }),
  
  // Get detailed progress for a specific parcours
  getParcoursProgress: protectedProcedure
    .input(z.object({ parcoursId: z.number() }))
    .query(async ({ ctx, input }) => {
      return db.getDetailedParcoursProgress(ctx.user.id, input.parcoursId);
    }),
  
  // Get progress summary for all parcours
  getAllProgressSummary: protectedProcedure.query(async ({ ctx }) => {
    return db.getAllUserProgressSummary(ctx.user.id);
  }),
  
  // Get progress timeline for charts
  getProgressTimeline: protectedProcedure
    .input(z.object({ days: z.number().optional().default(30) }))
    .query(async ({ ctx, input }) => {
      return db.getUserProgressTimeline(ctx.user.id, input.days);
    }),
});

// ==================== PARCOURS ROUTER ====================
const parcoursRouter = router({
  // Public - get all published parcours
  list: publicProcedure.query(async () => {
    return db.getAllParcours(true);
  }),
  
  // Public - get single parcours by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const parcours = await db.getParcoursBySlug(input.slug);
      if (!parcours || !parcours.isPublished) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Parcours non trouvé' });
      }
      const modules = await db.getModulesByParcoursId(parcours.id, true);
      return { ...parcours, modules };
    }),
  
  // Admin - get all parcours including unpublished
  adminList: adminProcedure.query(async () => {
    return db.getAllParcours(false);
  }),
  
  // Admin - get single parcours by id
  adminGet: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const parcours = await db.getParcoursById(input.id);
      if (!parcours) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      const modules = await db.getModulesByParcoursId(parcours.id, false);
      return { ...parcours, modules };
    }),
  
  // Admin - create parcours
  create: adminProcedure
    .input(z.object({
      title: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
      difficulty: z.enum(["debutant", "intermediaire", "avance"]).default("debutant"),
      isFree: z.boolean().default(false),
      isPublished: z.boolean().default(false),
      displayOrder: z.number().default(0),
      xpReward: z.number().default(100),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await db.createParcours({
        ...input,
        createdBy: ctx.user.id,
      });
      
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'create',
        entityType: 'parcours',
        entityId: result.id,
        changes: { after: input },
      });
      
      return result;
    }),
  
  // Admin - update parcours
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      slug: z.string().min(1).optional(),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
      difficulty: z.enum(["debutant", "intermediaire", "avance"]).optional(),
      isFree: z.boolean().optional(),
      isPublished: z.boolean().optional(),
      isActive: z.boolean().optional(),
      displayOrder: z.number().optional(),
      xpReward: z.number().optional(),
      totalHours: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateParcours(id, data);
      
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'update',
        entityType: 'parcours',
        entityId: id,
        changes: { after: data },
      });
      
      return { success: true };
    }),
  
  // Admin - delete parcours
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.deleteParcours(input.id);
      
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'delete',
        entityType: 'parcours',
        entityId: input.id,
      });
      
      return { success: true };
    }),
});

// ==================== MODULE ROUTER ====================
const moduleRouter = router({
  // Get modules for a parcours
  getByParcours: publicProcedure
    .input(z.object({ parcoursId: z.number() }))
    .query(async ({ input }) => {
      return db.getModulesByParcoursId(input.parcoursId, true);
    }),
  
  // Admin - get all modules
  adminList: adminProcedure.query(async () => {
    return db.getAllModules();
  }),
  
  // Admin - get single module
  adminGet: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const module = await db.getModuleById(input.id);
      if (!module) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      const lessons = await db.getLessonsByModuleId(module.id, false);
      const quizzes = await db.getQuizzesByModuleId(module.id);
      return { ...module, lessons, quizzes };
    }),
  
  // Admin - create module
  create: adminProcedure
    .input(z.object({
      parcoursId: z.number(),
      title: z.string().min(1),
      code: z.string().optional(),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
      hours: z.number().default(0),
      xpReward: z.number().default(50),
      orderIndex: z.number().default(0),
      prerequisiteModuleId: z.number().optional(),
      isFree: z.boolean().default(false),
      isPublished: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await db.createModule(input);
      
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'create',
        entityType: 'module',
        entityId: result.id,
        changes: { after: input },
      });
      
      return result;
    }),
  
  // Admin - update module
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      code: z.string().optional(),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
      hours: z.number().optional(),
      xpReward: z.number().optional(),
      orderIndex: z.number().optional(),
      prerequisiteModuleId: z.number().nullable().optional(),
      isFree: z.boolean().optional(),
      isPublished: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateModule(id, data);
      
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'update',
        entityType: 'module',
        entityId: id,
        changes: { after: data },
      });
      
      return { success: true };
    }),
  
  // Admin - delete module
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.deleteModule(input.id);
      
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'delete',
        entityType: 'module',
        entityId: input.id,
      });
      
      return { success: true };
    }),
});

// ==================== LESSON ROUTER ====================
const lessonRouter = router({
  // Get lessons for a module
  getByModule: protectedProcedure
    .input(z.object({ moduleId: z.number() }))
    .query(async ({ input }) => {
      return db.getLessonsByModuleId(input.moduleId, true);
    }),
  
  // Get single lesson with progress
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const lesson = await db.getLessonById(input.id);
      if (!lesson || !lesson.isPublished) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      const progress = await db.getUserProgressForLesson(ctx.user.id, input.id);
      const quizzes = await db.getQuizzesByLessonId(input.id);
      return { ...lesson, progress, quizzes };
    }),
  
  // Mark lesson as complete
  complete: protectedProcedure
    .input(z.object({ lessonId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const lesson = await db.getLessonById(input.lessonId);
      if (!lesson) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      
      const module = await db.getModuleById(lesson.moduleId);
      const parcours = module ? await db.getParcoursById(module.parcoursId) : null;
      
      // Create/update progress
      await db.createOrUpdateProgress({
        userId: ctx.user.id,
        lessonId: input.lessonId,
        moduleId: lesson.moduleId,
        parcoursId: module?.parcoursId,
        status: "completed",
        progressPercent: 100,
        xpEarned: lesson.xpReward,
        completedAt: new Date(),
      });
      
      // Update user XP
      await db.updateUserGamification(ctx.user.id, {
        totalXp: ctx.user.totalXp + lesson.xpReward,
        lastActivityDate: new Date(),
      });
      
      // Update streak
      await updateUserStreak(ctx.user.id);
      
      // Check for badges
      await checkAndAwardBadges(ctx.user.id);
      
      return { success: true, xpEarned: lesson.xpReward };
    }),
  
  // Admin - get all lessons
  adminList: adminProcedure.query(async () => {
    return db.getAllLessons();
  }),
  
  // Admin - get single lesson
  adminGet: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const lesson = await db.getLessonById(input.id);
      if (!lesson) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      return lesson;
    }),
  
  // Admin - create lesson
  create: adminProcedure
    .input(z.object({
      moduleId: z.number(),
      title: z.string().min(1),
      contentHtml: z.string().optional(),
      contentMarkdown: z.string().optional(),
      contentJson: z.string().optional(),
      objectifsApprentissage: z.string().optional(),
      prerequis: z.string().optional(),
      vocabulaireCle: z.string().optional(),
      contenuPrincipal: z.string().optional(),
      resume: z.string().optional(),
      exercicePratique: z.string().optional(),
      pourAllerPlusLoin: z.string().optional(),
      videoUrl: z.string().optional(),
      imageUrl: z.string().optional(),
      duration: z.number().default(5),
      xpReward: z.number().default(10),
      difficulty: z.enum(["facile", "moyen", "difficile"]).default("facile"),
      orderIndex: z.number().default(0),
      prerequisiteLessonId: z.number().optional(),
      isFree: z.boolean().default(false),
      isPublished: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await db.createLesson(input);
      
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'create',
        entityType: 'lesson',
        entityId: result.id,
        changes: { after: input },
      });
      
      // Generate embeddings for RAG if content exists
      if (input.contentHtml || input.contentMarkdown) {
        await generateLessonEmbeddings(result.id, input.contentHtml || input.contentMarkdown || '');
      }
      
      return result;
    }),
  
  // Admin - update lesson
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      contentHtml: z.string().optional(),
      contentMarkdown: z.string().optional(),
      contentJson: z.string().optional(),
      objectifsApprentissage: z.string().optional(),
      prerequis: z.string().optional(),
      vocabulaireCle: z.string().optional(),
      contenuPrincipal: z.string().optional(),
      resume: z.string().optional(),
      exercicePratique: z.string().optional(),
      pourAllerPlusLoin: z.string().optional(),
      videoUrl: z.string().optional(),
      imageUrl: z.string().optional(),
      duration: z.number().optional(),
      xpReward: z.number().optional(),
      difficulty: z.enum(["facile", "moyen", "difficile"]).optional(),
      orderIndex: z.number().optional(),
      prerequisiteLessonId: z.number().nullable().optional(),
      isFree: z.boolean().optional(),
      isPublished: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateLesson(id, data);
      
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'update',
        entityType: 'lesson',
        entityId: id,
        changes: { after: data },
      });
      
      // Regenerate embeddings if content changed
      if (data.contentHtml || data.contentMarkdown) {
        await db.deleteLessonEmbeddings(id);
        await generateLessonEmbeddings(id, data.contentHtml || data.contentMarkdown || '');
      }
      
      return { success: true };
    }),
  
  // Admin - delete lesson
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.deleteLessonEmbeddings(input.id);
      await db.deleteLesson(input.id);
      
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'delete',
        entityType: 'lesson',
        entityId: input.id,
      });
      
      return { success: true };
    }),
});

// ==================== QUIZ ROUTER ====================
const quizRouter = router({
  // Get quiz with questions
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const quiz = await db.getQuizById(input.id);
      if (!quiz || !quiz.isPublished) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      
      const questions = await db.getQuestionsByQuizId(quiz.id);
      const questionsWithAnswers = await Promise.all(
        questions.map(async (q) => {
          const answers = await db.getAnswersByQuestionId(q.id);
          // Don't send isCorrect to client
          return {
            ...q,
            answers: answers.map(a => ({ id: a.id, answerText: a.answerText, orderIndex: a.orderIndex }))
          };
        })
      );
      
      const attempts = await db.getUserQuizAttempts(ctx.user.id, input.id);
      const bestAttempt = await db.getBestQuizAttempt(ctx.user.id, input.id);
      
      return {
        ...quiz,
        questions: questionsWithAnswers,
        attemptCount: attempts.length,
        bestScore: bestAttempt?.score || null,
        canAttempt: attempts.length < quiz.maxAttempts,
      };
    }),
  
  // Submit quiz answers
  submit: protectedProcedure
    .input(z.object({
      quizId: z.number(),
      answers: z.array(z.object({
        questionId: z.number(),
        answerId: z.number(),
      })),
      timeTaken: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const quiz = await db.getQuizById(input.quizId);
      if (!quiz) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      
      // Check max attempts
      const attempts = await db.getUserQuizAttempts(ctx.user.id, input.quizId);
      if (attempts.length >= quiz.maxAttempts) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Nombre maximum de tentatives atteint' });
      }
      
      // Grade the quiz
      const questions = await db.getQuestionsByQuizId(input.quizId);
      let correctAnswers = 0;
      const gradedAnswers = [];
      
      for (const answer of input.answers) {
        const correctAnswer = await db.getAnswersByQuestionId(answer.questionId);
        const isCorrect = correctAnswer.some(a => a.id === answer.answerId && a.isCorrect);
        if (isCorrect) correctAnswers++;
        gradedAnswers.push({
          questionId: answer.questionId,
          answerId: answer.answerId,
          isCorrect,
        });
      }
      
      const score = Math.round((correctAnswers / questions.length) * 100);
      const passed = score >= quiz.passingScore;
      const xpEarned = passed ? quiz.xpReward : Math.round(quiz.xpReward * 0.25);
      
      // Save attempt
      const attemptResult = await db.createQuizAttempt({
        userId: ctx.user.id,
        quizId: input.quizId,
        score,
        correctAnswers,
        totalQuestions: questions.length,
        passed,
        xpEarned,
        answers: gradedAnswers,
        timeTaken: input.timeTaken,
      });
      
      // Update user XP
      await db.updateUserGamification(ctx.user.id, {
        totalXp: ctx.user.totalXp + xpEarned,
        lastActivityDate: new Date(),
      });
      
      // Update streak
      await updateUserStreak(ctx.user.id);
      
      // Check for badges
      await checkAndAwardBadges(ctx.user.id);
      
      // Get correct answers for feedback if quiz allows
      let feedback: Array<{ questionId: number; correctAnswerId: number; explanation: string | null }> | null = null;
      if (quiz.showCorrectAnswers) {
        const feedbackResults = await Promise.all(
          questions.map(async (q) => {
            const answers = await db.getAnswersByQuestionId(q.id);
            const correctAnswer = answers.find(a => a.isCorrect);
            return {
              questionId: q.id,
              correctAnswerId: correctAnswer?.id ?? 0,
              explanation: q.explanation,
            };
          })
        );
        feedback = feedbackResults;
      }
      
      return {
        score,
        passed,
        correctAnswers,
        totalQuestions: questions.length,
        xpEarned,
        feedback,
        attemptNumber: attemptResult.attemptNumber,
      };
    }),
  
  // Admin - get all quizzes
  adminList: adminProcedure.query(async () => {
    return db.getAllQuizzes();
  }),
  
  // Admin - get single quiz with all details
  adminGet: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const quiz = await db.getQuizById(input.id);
      if (!quiz) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      
      const questions = await db.getQuestionsByQuizId(quiz.id);
      const questionsWithAnswers = await Promise.all(
        questions.map(async (q) => {
          const answers = await db.getAnswersByQuestionId(q.id);
          return { ...q, answers };
        })
      );
      
      return { ...quiz, questions: questionsWithAnswers };
    }),
  
  // Admin - create quiz
  create: adminProcedure
    .input(z.object({
      moduleId: z.number().optional(),
      lessonId: z.number().optional(),
      title: z.string().min(1),
      description: z.string().optional(),
      passingScore: z.number().default(70),
      timeLimit: z.number().optional(),
      maxAttempts: z.number().default(3),
      shuffleQuestions: z.boolean().default(false),
      showCorrectAnswers: z.boolean().default(true),
      xpReward: z.number().default(25),
      orderIndex: z.number().default(0),
      isPublished: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await db.createQuiz(input);
      
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'create',
        entityType: 'quiz',
        entityId: result.id,
        changes: { after: input },
      });
      
      return result;
    }),
  
  // Admin - update quiz
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      moduleId: z.number().nullable().optional(),
      lessonId: z.number().nullable().optional(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      passingScore: z.number().optional(),
      timeLimit: z.number().nullable().optional(),
      maxAttempts: z.number().optional(),
      shuffleQuestions: z.boolean().optional(),
      showCorrectAnswers: z.boolean().optional(),
      xpReward: z.number().optional(),
      orderIndex: z.number().optional(),
      isPublished: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateQuiz(id, data);
      
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'update',
        entityType: 'quiz',
        entityId: id,
        changes: { after: data },
      });
      
      return { success: true };
    }),
  
  // Admin - delete quiz
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.deleteQuiz(input.id);
      
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'delete',
        entityType: 'quiz',
        entityId: input.id,
      });
      
      return { success: true };
    }),
  
  // Admin - add question to quiz
  addQuestion: adminProcedure
    .input(z.object({
      quizId: z.number(),
      questionText: z.string().min(1),
      questionType: z.enum(["multiple_choice", "true_false", "multiple_select"]).default("multiple_choice"),
      explanation: z.string().optional(),
      points: z.number().default(1),
      orderIndex: z.number().default(0),
      answers: z.array(z.object({
        answerText: z.string().min(1),
        isCorrect: z.boolean(),
        orderIndex: z.number().default(0),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const { answers, ...questionData } = input;
      const questionResult = await db.createQuizQuestion(questionData);
      
      // Add answers
      for (const answer of answers) {
        await db.createQuizAnswer({
          questionId: questionResult.id,
          ...answer,
        });
      }
      
      return questionResult;
    }),
  
  // Admin - update question
  updateQuestion: adminProcedure
    .input(z.object({
      id: z.number(),
      questionText: z.string().min(1).optional(),
      questionType: z.enum(["multiple_choice", "true_false", "multiple_select"]).optional(),
      explanation: z.string().optional(),
      points: z.number().optional(),
      orderIndex: z.number().optional(),
      answers: z.array(z.object({
        id: z.number().optional(),
        answerText: z.string().min(1),
        isCorrect: z.boolean(),
        orderIndex: z.number().default(0),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, answers, ...data } = input;
      await db.updateQuizQuestion(id, data);
      
      // Update answers if provided
      if (answers) {
        for (const answer of answers) {
          if (answer.id) {
            await db.updateQuizAnswer(answer.id, {
              answerText: answer.answerText,
              isCorrect: answer.isCorrect,
              orderIndex: answer.orderIndex,
            });
          }
        }
      }
      
      return { success: true };
    }),
  
  // Admin - delete question
  deleteQuestion: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.deleteQuizQuestion(input.id);
      return { success: true };
    }),
  
  // Admin - update answer
  updateAnswer: adminProcedure
    .input(z.object({
      id: z.number(),
      answerText: z.string().min(1).optional(),
      isCorrect: z.boolean().optional(),
      orderIndex: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateQuizAnswer(id, data);
      return { success: true };
    }),
  
  // Admin - add answer to question
  addAnswer: adminProcedure
    .input(z.object({
      questionId: z.number(),
      answerText: z.string().min(1),
      isCorrect: z.boolean(),
      orderIndex: z.number().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.createQuizAnswer(input);
    }),
  
  // Admin - delete answer
  deleteAnswer: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.deleteQuizAnswer(input.id);
      return { success: true };
    }),
});

// ==================== CHATBOT ROUTER ====================
const chatbotRouter = router({
  sendMessage: protectedProcedure
    .input(z.object({
      message: z.string().min(1).max(1000),
    }))
    .mutation(async ({ ctx, input }) => {
      // Rate limiting - 20 messages per day for regular users, unlimited for admins
      if (ctx.user.role !== 'admin') {
        const todayCount = await db.getTodayMessageCount(ctx.user.id);
        if (todayCount >= 20) {
          throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: 'Limite de messages atteinte pour aujourd\'hui (20/jour)',
          });
        }
      }
      
      // Search for relevant content using embeddings
      const relevantContent = await searchRelevantContent(input.message);
      
      // Build context for LLM
      const systemPrompt = `Tu es un tuteur pédagogique expert pour la plateforme Pépites Mondiales.

TON RÔLE:
- Répondre aux questions sur le contenu des cours
- Encourager et motiver les apprenants
- Donner des conseils pratiques pour l'apprentissage
- Expliquer les concepts difficiles de manière simple

DIRECTIVES:
- Sois professionnel mais chaleureux
- Utilise un langage adapté au niveau de l'apprenant (niveau ${ctx.user.currentLevel})
- Réponds en français
- Si tu ne connais pas une réponse, dis-le honnêtement et suggère de consulter le cours
- Limite tes réponses à 2-3 paragraphes maximum

CONTEXTE APPRENANT:
- Niveau: ${ctx.user.currentLevel}
- XP Total: ${ctx.user.totalXp}
- Streak actuel: ${ctx.user.currentStreak} jours

${relevantContent.length > 0 ? `CONTENU PERTINENT DES COURS:\n${relevantContent.join('\n\n')}` : ''}`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input.message },
          ],
        });
        
        const messageContent = response.choices[0]?.message?.content;
        const assistantMessage = typeof messageContent === 'string' ? messageContent : "Désolé, je n'ai pas pu générer une réponse.";
        
        // Save message to history
        await db.createChatbotMessage({
          userId: ctx.user.id,
          message: input.message,
          response: assistantMessage,
          contextUsed: relevantContent.length > 0,
        });
        
        return { response: assistantMessage };
      } catch (error) {
        console.error('Chatbot error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la génération de la réponse',
        });
      }
    }),
  
  getHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      return db.getUserChatHistory(ctx.user.id, input.limit);
    }),
});

// ==================== ADMIN ROUTER ====================
const adminRouter = router({
  // Dashboard stats
  getStats: adminProcedure.query(async () => {
    return db.getAdminStats();
  }),
  
  // Users management
  getUsers: adminProcedure.query(async () => {
    return db.getAllUsers();
  }),
  
  updateUserRole: adminProcedure
    .input(z.object({
      userId: z.number(),
      role: z.enum(["user", "admin"]),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.updateUserRole(input.userId, input.role);
      
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'update_role',
        entityType: 'user',
        entityId: input.userId,
        changes: { role: input.role },
      });
      
      return { success: true };
    }),
  
  // Alerts
  getAlerts: adminProcedure.query(async () => {
    return db.getAllAlerts();
  }),
  
  getUnreadAlerts: adminProcedure.query(async () => {
    return db.getUnreadAlerts();
  }),
  
  markAlertRead: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.markAlertAsRead(input.id);
      return { success: true };
    }),
  
  markAllAlertsRead: adminProcedure.mutation(async () => {
    await db.markAllAlertsAsRead();
    return { success: true };
  }),
  
  deleteAlert: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteAlert(input.id);
      return { success: true };
    }),
  
  // User Progress Report
  getUserProgressReport: adminProcedure
    .input(z.object({ limit: z.number().optional().default(50) }))
    .query(async ({ input }) => {
      return db.getAdminUserProgressReport(input.limit);
    }),
  
  // Get detailed progress for a specific user
  getUserDetailedProgress: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return db.getAllUserProgressSummary(input.userId);
    }),
  
  // Audit logs
  getAuditLogs: adminProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ input }) => {
      return db.getAuditLogs(input.limit);
    }),
  
  // Badges management
  getBadges: adminProcedure.query(async () => {
    return db.getAllBadges();
  }),
  
  createBadge: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      iconUrl: z.string().optional(),
      criteriaType: z.enum([
        "xp_threshold",
        "streak_days",
        "parcours_completed",
        "modules_completed",
        "lessons_completed",
        "quizzes_passed",
        "perfect_quiz"
      ]),
      criteriaValue: z.number(),
      rarity: z.enum(["common", "rare", "epic", "legendary"]).default("common"),
      xpBonus: z.number().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await db.createBadge(input);
      return result;
    }),
  
  // ==================== AI CONTENT GENERATION ====================
  
  // Generate lesson content with AI
  generateLessonContent: adminProcedure
    .input(z.object({
      moduleId: z.number(),
      title: z.string().min(1),
      topic: z.string().min(1),
      difficulty: z.enum(["facile", "moyen", "difficile"]).default("facile"),
      duration: z.number().default(10), // minutes
    }))
    .mutation(async ({ ctx, input }) => {
      const module = await db.getModuleById(input.moduleId);
      if (!module) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Module non trouvé' });
      }
      
      const prompt = `Tu es un expert en création de contenu pédagogique. Crée une leçon complète sur le sujet suivant:

Titre: ${input.title}
Sujet: ${input.topic}
Niveau de difficulté: ${input.difficulty}
Durée estimée: ${input.duration} minutes
Module: ${module.title}

Génère un contenu de leçon en format Markdown avec:
1. Une introduction engageante
2. Les objectifs d'apprentissage
3. Le contenu principal structuré avec des sous-sections
4. Des exemples pratiques
5. Des points clés à retenir
6. Une conclusion

Le contenu doit être professionnel, clair et adapté au niveau ${input.difficulty}.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Tu es un expert en pédagogie et création de contenu éducatif. Tu crées des leçons engageantes et structurées." },
          { role: "user", content: prompt }
        ],
      });

      const messageContent = response.choices[0]?.message?.content;
      const generatedContent = typeof messageContent === 'string' ? messageContent : "";

      // Save the generated content for review
      const aiContent = await db.createAiGeneratedContent({
        contentType: "lesson",
        moduleId: input.moduleId,
        prompt,
        generatedContent,
        status: "pending",
        generatedBy: ctx.user.id,
      });

      return {
        id: aiContent.id,
        content: generatedContent,
        title: input.title,
        moduleId: input.moduleId,
      };
    }),

  // Generate quiz from lesson content
  generateQuizFromLesson: adminProcedure
    .input(z.object({
      lessonId: z.number(),
      questionCount: z.number().min(3).max(20).default(5),
    }))
    .mutation(async ({ ctx, input }) => {
      const lesson = await db.getLessonById(input.lessonId);
      if (!lesson) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Leçon non trouvée' });
      }

      const lessonContent = lesson.contentMarkdown || lesson.contentHtml || "";
      
      const prompt = `Basé sur le contenu de la leçon suivante, crée un quiz de ${input.questionCount} questions.

Titre de la leçon: ${lesson.title}
Contenu:
${lessonContent}

Génère un quiz au format JSON avec la structure suivante:
{
  "title": "Quiz - ${lesson.title}",
  "description": "Testez vos connaissances sur ${lesson.title}",
  "questions": [
    {
      "questionText": "La question",
      "questionType": "multiple_choice",
      "explanation": "Explication de la réponse correcte",
      "points": 1,
      "answers": [
        { "text": "Réponse A", "isCorrect": false },
        { "text": "Réponse B", "isCorrect": true },
        { "text": "Réponse C", "isCorrect": false },
        { "text": "Réponse D", "isCorrect": false }
      ]
    }
  ]
}

Assure-toi que:
- Chaque question a exactement une réponse correcte
- Les questions couvrent les points clés de la leçon
- Les explications sont pédagogiques
- Les réponses incorrectes sont plausibles

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Tu es un expert en création de quiz pédagogiques. Tu génères des questions pertinentes et bien formulées. Tu réponds uniquement en JSON valide." },
          { role: "user", content: prompt }
        ],
      });

      const quizMessageContent = response.choices[0]?.message?.content;
      const generatedContent = typeof quizMessageContent === 'string' ? quizMessageContent : "{}";

      // Save the generated content for review
      const aiContent = await db.createAiGeneratedContent({
        contentType: "quiz",
        lessonId: input.lessonId,
        moduleId: lesson.moduleId,
        prompt,
        generatedContent,
        status: "pending",
        generatedBy: ctx.user.id,
      });

      // Try to parse the JSON
      let parsedQuiz = null;
      try {
        // Extract JSON from the response (in case there's extra text)
        const jsonMatch = String(generatedContent).match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedQuiz = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error("Failed to parse quiz JSON:", e);
      }

      return {
        id: aiContent.id,
        content: generatedContent,
        parsedQuiz,
        lessonId: input.lessonId,
      };
    }),

  // Apply generated lesson content
  applyGeneratedLesson: adminProcedure
    .input(z.object({
      aiContentId: z.number(),
      title: z.string().min(1),
      content: z.string().min(1),
      moduleId: z.number(),
      duration: z.number().default(10),
      difficulty: z.enum(["facile", "moyen", "difficile"]).default("facile"),
      orderIndex: z.number().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      // Create the lesson
      const lesson = await db.createLesson({
        moduleId: input.moduleId,
        title: input.title,
        contentMarkdown: input.content,
        contentHtml: input.content, // Could convert MD to HTML here
        duration: input.duration,
        difficulty: input.difficulty,
        orderIndex: input.orderIndex,
        isPublished: false, // Start as draft
      });

      // Update AI content status
      await db.updateAiGeneratedContent(input.aiContentId, {
        status: "approved",
        lessonId: lesson.id,
        reviewedBy: ctx.user.id,
        reviewedAt: new Date(),
      });

      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'create_from_ai',
        entityType: 'lesson',
        entityId: lesson.id,
        changes: { aiContentId: input.aiContentId },
      });

      return lesson;
    }),

  // Apply generated quiz
  applyGeneratedQuiz: adminProcedure
    .input(z.object({
      aiContentId: z.number(),
      lessonId: z.number(),
      quizData: z.object({
        title: z.string(),
        description: z.string().optional(),
        questions: z.array(z.object({
          questionText: z.string(),
          questionType: z.enum(["multiple_choice", "true_false", "multiple_select"]).default("multiple_choice"),
          explanation: z.string().optional(),
          points: z.number().default(1),
          answers: z.array(z.object({
            text: z.string(),
            isCorrect: z.boolean(),
          })),
        })),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const lesson = await db.getLessonById(input.lessonId);
      if (!lesson) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Leçon non trouvée' });
      }

      // Create the quiz
      const quiz = await db.createQuiz({
        lessonId: input.lessonId,
        moduleId: lesson.moduleId,
        title: input.quizData.title,
        description: input.quizData.description,
        passingScore: 70,
        xpReward: input.quizData.questions.length * 5,
        isPublished: false,
      });

      // Create questions and answers
      for (let i = 0; i < input.quizData.questions.length; i++) {
        const q = input.quizData.questions[i];
        const question = await db.createQuizQuestion({
          quizId: quiz.id,
          questionText: q.questionText,
          questionType: q.questionType,
          explanation: q.explanation,
          points: q.points,
          orderIndex: i,
        });

        for (let j = 0; j < q.answers.length; j++) {
          const a = q.answers[j];
          await db.createQuizAnswer({
            questionId: question.id,
            answerText: a.text,
            isCorrect: a.isCorrect,
            orderIndex: j,
          });
        }
      }

      // Update AI content status
      await db.updateAiGeneratedContent(input.aiContentId, {
        status: "approved",
        quizId: quiz.id,
        reviewedBy: ctx.user.id,
        reviewedAt: new Date(),
      });

      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'create_from_ai',
        entityType: 'quiz',
        entityId: quiz.id,
        changes: { aiContentId: input.aiContentId },
      });

      return quiz;
    }),

  // Get pending AI generated content
  getPendingAiContent: adminProcedure.query(async () => {
    return db.getPendingAiContent();
  }),

  // Reject AI generated content
  rejectAiContent: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.updateAiGeneratedContent(input.id, {
        status: "rejected",
        reviewedBy: ctx.user.id,
        reviewedAt: new Date(),
      });
      return { success: true };
    }),
});

// ==================== HELPER FUNCTIONS ====================

async function updateUserStreak(userId: number) {
  const user = await db.getUserById(userId);
  if (!user) return;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActivity = user.lastActivityDate ? new Date(user.lastActivityDate) : null;
  if (lastActivity) {
    lastActivity.setHours(0, 0, 0, 0);
  }
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  let newStreak = user.currentStreak;
  
  if (!lastActivity || lastActivity.getTime() < yesterday.getTime()) {
    // Streak broken or first activity
    newStreak = 1;
  } else if (lastActivity.getTime() === yesterday.getTime()) {
    // Consecutive day
    newStreak = user.currentStreak + 1;
  }
  // If same day, don't change streak
  
  const longestStreak = Math.max(newStreak, user.longestStreak);
  
  await db.updateUserGamification(userId, {
    currentStreak: newStreak,
    longestStreak,
    lastActivityDate: new Date(),
  });
}

async function checkAndAwardBadges(userId: number) {
  const user = await db.getUserById(userId);
  if (!user) return;
  
  const allBadges = await db.getAllBadges();
  const userBadges = await db.getUserBadges(userId);
  const earnedBadgeIds = userBadges.map(ub => ub.badge.id);
  
  const stats = await db.getUserStats(userId);
  if (!stats) return;
  
  for (const badge of allBadges) {
    if (earnedBadgeIds.includes(badge.id)) continue;
    
    let shouldAward = false;
    
    switch (badge.criteriaType) {
      case 'xp_threshold':
        shouldAward = stats.totalXp >= badge.criteriaValue;
        break;
      case 'streak_days':
        shouldAward = stats.currentStreak >= badge.criteriaValue;
        break;
      case 'lessons_completed':
        shouldAward = stats.completedLessons >= badge.criteriaValue;
        break;
      case 'modules_completed':
        shouldAward = stats.completedModules >= badge.criteriaValue;
        break;
      case 'quizzes_passed':
        shouldAward = stats.passedQuizzes >= badge.criteriaValue;
        break;
    }
    
    if (shouldAward) {
      await db.awardBadge(userId, badge.id);
      
      // Create alert for admin
      await db.createAdminAlert({
        alertType: 'milestone_reached',
        title: 'Badge obtenu',
        message: `${user.name || 'Un utilisateur'} a obtenu le badge "${badge.name}"`,
        userId,
        priority: 'low',
      });
    }
  }
}

async function generateLessonEmbeddings(lessonId: number, content: string) {
  // Simple chunking - split by paragraphs
  const chunks = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .split(/\n\n+/)
    .filter(chunk => chunk.trim().length > 50);
  
  for (const chunk of chunks) {
    // For now, we'll store the chunks without actual embeddings
    // In production, you would call an embedding API here
    await db.createLessonEmbedding({
      lessonId,
      contentChunk: chunk.trim(),
      embedding: null, // Would be actual embedding vector
      metadata: { lessonId },
    });
  }
}

async function searchRelevantContent(query: string): Promise<string[]> {
  // Simple keyword search for now
  // In production, you would use vector similarity search
  const embeddings = await db.getAllEmbeddings();
  
  const queryWords = query.toLowerCase().split(/\s+/);
  const relevantChunks = embeddings
    .filter(e => {
      const chunkLower = e.contentChunk.toLowerCase();
      return queryWords.some(word => chunkLower.includes(word));
    })
    .slice(0, 3)
    .map(e => e.contentChunk);
  
  return relevantChunks;
}

// ==================== SUBSCRIPTION ROUTER ====================
const subscriptionRouter = router({
  // Get current user's subscription
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await db.getUserSubscription(ctx.user.id);
    return subscription || { planId: 'free', status: 'active' };
  }),

  // Create checkout session for subscription
  createCheckout: protectedProcedure
    .input(z.object({
      planId: z.enum(['basic', 'pro']),
      billingPeriod: z.enum(['monthly', 'yearly']),
      paymentMethod: z.enum(['card', 'crypto']).default('card'),
    }))
    .mutation(async ({ ctx, input }) => {
      const { getStripe, isStripeConfigured } = await import('./stripe');
      const { PLANS, calculatePrice } = await import('./products');
      
      if (!isStripeConfigured()) {
        throw new TRPCError({ 
          code: 'PRECONDITION_FAILED', 
          message: 'Le système de paiement n\'est pas configuré' 
        });
      }

      const stripe = getStripe();
      const plan = PLANS[input.planId];
      const isCrypto = input.paymentMethod === 'crypto';
      const isYearly = input.billingPeriod === 'yearly';
      const priceInCents = calculatePrice(input.planId, isYearly, isCrypto);

      // Get or create Stripe customer
      let subscription = await db.getUserSubscription(ctx.user.id);
      let customerId = subscription?.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: ctx.user.email || undefined,
          name: ctx.user.name || undefined,
          metadata: {
            userId: ctx.user.id.toString(),
          },
        });
        customerId = customer.id;
      }

      // Create checkout session
      const origin = ctx.req.headers.origin || 'http://localhost:3000';
      
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        client_reference_id: ctx.user.id.toString(),
        mode: 'subscription',
        allow_promotion_codes: true,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Sklora ${plan.name} - ${isYearly ? 'Annuel' : 'Mensuel'}`,
                description: plan.description,
              },
              unit_amount: priceInCents,
              recurring: {
                interval: isYearly ? 'year' : 'month',
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          user_id: ctx.user.id.toString(),
          customer_email: ctx.user.email || '',
          customer_name: ctx.user.name || '',
          plan_id: input.planId,
          billing_period: input.billingPeriod,
          payment_method: input.paymentMethod,
          crypto_discount: isCrypto ? 'true' : 'false',
        },
        success_url: `${origin}/dashboard?subscription=success`,
        cancel_url: `${origin}/pricing?subscription=canceled`,
      });

      return { checkoutUrl: session.url };
    }),

  // Cancel subscription
  cancel: protectedProcedure.mutation(async ({ ctx }) => {
    const subscription = await db.getUserSubscription(ctx.user.id);
    if (!subscription?.stripeSubscriptionId) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Aucun abonnement actif' });
    }

    const { getStripe, isStripeConfigured } = await import('./stripe');
    if (!isStripeConfigured()) {
      throw new TRPCError({ code: 'PRECONDITION_FAILED' });
    }

    const stripe = getStripe();
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await db.updateSubscription(ctx.user.id, {
      cancelAtPeriodEnd: true,
    });

    return { success: true };
  }),

  // Get billing portal URL
  getBillingPortal: protectedProcedure.mutation(async ({ ctx }) => {
    const subscription = await db.getUserSubscription(ctx.user.id);
    if (!subscription?.stripeCustomerId) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Aucun compte de facturation' });
    }

    const { getStripe, isStripeConfigured } = await import('./stripe');
    if (!isStripeConfigured()) {
      throw new TRPCError({ code: 'PRECONDITION_FAILED' });
    }

    const stripe = getStripe();
    const origin = ctx.req.headers.origin || 'http://localhost:3000';
    
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${origin}/dashboard`,
    });

    return { portalUrl: session.url };
  }),
});

// ==================== MAIN ROUTER ====================
export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  user: userRouter,
  parcours: parcoursRouter,
  module: moduleRouter,
  lesson: lessonRouter,
  quiz: quizRouter,
  chatbot: chatbotRouter,
  admin: adminRouter,
  subscription: subscriptionRouter,
});

export type AppRouter = typeof appRouter;
