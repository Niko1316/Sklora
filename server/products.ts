// Sklora Subscription Plans
// Prices are in cents (USD)

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
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
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
      maxLessons: -1, // unlimited
      chatbotMessagesPerDay: -1, // unlimited
      hasAds: false,
      hasCertifications: false,
      hasAiTutor: false,
    },
    monthlyPrice: 1499, // $14.99
    yearlyPrice: 14390, // $143.90 (20% discount from $179.88)
    stripePriceIdMonthly: "price_basic_monthly", // To be created in Stripe
    stripePriceIdYearly: "price_basic_yearly",
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
    monthlyPrice: 2999, // $29.99
    yearlyPrice: 28790, // $287.90 (20% discount from $359.88)
    stripePriceIdMonthly: "price_pro_monthly",
    stripePriceIdYearly: "price_pro_yearly",
  },
} as const;

export type PlanId = keyof typeof PLANS;
export type Plan = typeof PLANS[PlanId];

// Discount rates
export const DISCOUNTS = {
  annual: 0.20, // 20% off for yearly billing
  crypto: 0.10, // 10% off for crypto payments
} as const;

// Calculate final price with discounts
export function calculatePrice(
  planId: string,
  isYearly: boolean,
  isCrypto: boolean
): number {
  const plan = PLANS[planId as PlanId];
  if (!plan) return 0;

  let price: number = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  
  // Apply crypto discount (annual discount already applied in yearlyPrice)
  if (isCrypto && price > 0) {
    price = Math.round(price * (1 - DISCOUNTS.crypto));
  }

  return price;
}

// Format price for display
export function formatPrice(cents: number): string {
  if (cents === 0) return "Gratuit";
  return `$${(cents / 100).toFixed(2)}`;
}

// Get plan by ID
export function getPlan(planId: string): Plan | null {
  return PLANS[planId as PlanId] || null;
}

// Check if user can access content based on plan
export function canAccessContent(
  userPlanId: string,
  lessonsCompleted: number
): boolean {
  const plan = PLANS[userPlanId as PlanId];
  if (!plan) return false;
  
  if (plan.limitations.maxLessons === -1) return true;
  return lessonsCompleted < plan.limitations.maxLessons;
}

// Check if user can use chatbot
export function canUseChatbot(
  userPlanId: string,
  messagesUsedToday: number
): boolean {
  const plan = PLANS[userPlanId as PlanId];
  if (!plan) return false;
  
  if (plan.limitations.chatbotMessagesPerDay === -1) return true;
  return messagesUsedToday < plan.limitations.chatbotMessagesPerDay;
}
