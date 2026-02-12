// Sklora Subscription Plans - Creem Integration
// Products must be created in the Creem dashboard first
// Then reference their product IDs here

export const PLANS = {
  free: {
    id: "free",
    name: "Gratuit",
    description: "Découvrez Sklora avec 3 leçons gratuites",
    features: [
      "3 leçons gratuites",
      "Accès au chatbot IA (limité)",
      "Suivi de progression basique",
      "Publicités affichées",
    ],
    limitations: {
      maxLessons: 3,
      chatbotMessagesPerDay: 5,
      hasAds: true,
      hasCertifications: false,
      hasAiTutor: false,
    },
    monthlyPrice: 0,
    yearlyPrice: 0,
    creemProductIdMonthly: null as string | null,
    creemProductIdYearly: null as string | null,
  },
  basic: {
    id: "basic",
    name: "Basic",
    description: "Accès complet à tous les cours",
    features: [
      "Accès illimité aux leçons",
      "Tous les quiz disponibles",
      "Chatbot IA illimité",
      "Suivi de progression avancé",
      "Badges et gamification",
      "Sans publicité",
    ],
    limitations: {
      maxLessons: -1,
      chatbotMessagesPerDay: -1,
      hasAds: false,
      hasCertifications: false,
      hasAiTutor: false,
    },
    monthlyPrice: 1499,
    yearlyPrice: 14390,
    creemProductIdMonthly: process.env.CREEM_BASIC_MONTHLY_ID || "prod_basic_monthly",
    creemProductIdYearly: process.env.CREEM_BASIC_YEARLY_ID || "prod_basic_yearly",
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "L'expérience complète avec tuteur IA",
    features: [
      "Tout le plan Basic",
      "Certifications officielles",
      "Tuteur IA personnalisé",
      "Analyse détaillée des performances",
      "Contenu exclusif Pro",
      "Support prioritaire",
    ],
    limitations: {
      maxLessons: -1,
      chatbotMessagesPerDay: -1,
      hasAds: false,
      hasCertifications: true,
      hasAiTutor: true,
    },
    monthlyPrice: 2999,
    yearlyPrice: 28790,
    creemProductIdMonthly: process.env.CREEM_PRO_MONTHLY_ID || "prod_pro_monthly",
    creemProductIdYearly: process.env.CREEM_PRO_YEARLY_ID || "prod_pro_yearly",
  },
} as const;

export type PlanId = keyof typeof PLANS;
export type Plan = (typeof PLANS)[PlanId];

export const DISCOUNTS = {
  annual: 0.20,
  crypto: 0.10,
} as const;

export function calculatePrice(
  planId: string,
  isYearly: boolean,
  isCrypto: boolean
): number {
  const plan = PLANS[planId as PlanId];
  if (!plan) return 0;
  let price: number = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  if (isCrypto && price > 0) {
    price = Math.round(price * (1 - DISCOUNTS.crypto));
  }
  return price;
}

export function formatPrice(cents: number): string {
  if (cents === 0) return "Gratuit";
  return `$${(cents / 100).toFixed(2)}`;
}

export function getPlan(planId: string): Plan | null {
  return PLANS[planId as PlanId] || null;
}

export function canAccessContent(
  userPlanId: string,
  lessonsCompleted: number
): boolean {
  const plan = PLANS[userPlanId as PlanId];
  if (!plan) return false;
  if (plan.limitations.maxLessons === -1) return true;
  return lessonsCompleted < plan.limitations.maxLessons;
}

export function canUseChatbot(
  userPlanId: string,
  messagesUsedToday: number
): boolean {
  const plan = PLANS[userPlanId as PlanId];
  if (!plan) return false;
  if (plan.limitations.chatbotMessagesPerDay === -1) return true;
  return messagesUsedToday < plan.limitations.chatbotMessagesPerDay;
}

export function getCreemProductId(
  planId: string,
  isYearly: boolean
): string | null {
  const plan = PLANS[planId as PlanId];
  if (!plan) return null;
  return isYearly ? plan.creemProductIdYearly : plan.creemProductIdMonthly;
}
