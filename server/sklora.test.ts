import { describe, expect, it } from "vitest";
import { PLANS, calculatePrice, formatPrice, canAccessContent, canUseChatbot } from "./products";

describe("Products and Pricing", () => {
  describe("PLANS configuration", () => {
    it("should have three plans defined", () => {
      expect(Object.keys(PLANS)).toHaveLength(3);
      expect(PLANS.free).toBeDefined();
      expect(PLANS.basic).toBeDefined();
      expect(PLANS.pro).toBeDefined();
    });

    it("should have correct pricing for free plan", () => {
      expect(PLANS.free.monthlyPrice).toBe(0);
      expect(PLANS.free.yearlyPrice).toBe(0);
    });

    it("should have correct pricing for basic plan", () => {
      expect(PLANS.basic.monthlyPrice).toBe(1499); // $14.99
      expect(PLANS.basic.yearlyPrice).toBe(14390); // $143.90 (20% off)
    });

    it("should have correct pricing for pro plan", () => {
      expect(PLANS.pro.monthlyPrice).toBe(2999); // $29.99
      expect(PLANS.pro.yearlyPrice).toBe(28790); // $287.90 (20% off)
    });
  });

  describe("calculatePrice", () => {
    it("should return 0 for free plan", () => {
      expect(calculatePrice("free", false, false)).toBe(0);
      expect(calculatePrice("free", true, false)).toBe(0);
      expect(calculatePrice("free", false, true)).toBe(0);
    });

    it("should return monthly price for basic plan", () => {
      expect(calculatePrice("basic", false, false)).toBe(1499);
    });

    it("should return yearly price for basic plan", () => {
      expect(calculatePrice("basic", true, false)).toBe(14390);
    });

    it("should apply 10% crypto discount", () => {
      const monthlyWithCrypto = calculatePrice("basic", false, true);
      expect(monthlyWithCrypto).toBe(Math.round(1499 * 0.9)); // 1349
    });

    it("should apply crypto discount on yearly price", () => {
      const yearlyWithCrypto = calculatePrice("basic", true, true);
      expect(yearlyWithCrypto).toBe(Math.round(14390 * 0.9)); // 12951
    });

    it("should return 0 for invalid plan", () => {
      expect(calculatePrice("invalid", false, false)).toBe(0);
    });
  });

  describe("formatPrice", () => {
    it("should return 'Gratuit' for 0", () => {
      expect(formatPrice(0)).toBe("Gratuit");
    });

    it("should format cents to dollars", () => {
      expect(formatPrice(1499)).toBe("$14.99");
      expect(formatPrice(2999)).toBe("$29.99");
      expect(formatPrice(100)).toBe("$1.00");
    });
  });

  describe("canAccessContent", () => {
    it("should allow free users up to 3 lessons", () => {
      expect(canAccessContent("free", 0)).toBe(true);
      expect(canAccessContent("free", 2)).toBe(true);
      expect(canAccessContent("free", 3)).toBe(false);
      expect(canAccessContent("free", 10)).toBe(false);
    });

    it("should allow unlimited access for basic users", () => {
      expect(canAccessContent("basic", 0)).toBe(true);
      expect(canAccessContent("basic", 100)).toBe(true);
      expect(canAccessContent("basic", 1000)).toBe(true);
    });

    it("should allow unlimited access for pro users", () => {
      expect(canAccessContent("pro", 0)).toBe(true);
      expect(canAccessContent("pro", 100)).toBe(true);
    });

    it("should return false for invalid plan", () => {
      expect(canAccessContent("invalid", 0)).toBe(false);
    });
  });

  describe("canUseChatbot", () => {
    it("should limit free users to 5 messages per day", () => {
      expect(canUseChatbot("free", 0)).toBe(true);
      expect(canUseChatbot("free", 4)).toBe(true);
      expect(canUseChatbot("free", 5)).toBe(false);
      expect(canUseChatbot("free", 10)).toBe(false);
    });

    it("should allow unlimited messages for basic users", () => {
      expect(canUseChatbot("basic", 0)).toBe(true);
      expect(canUseChatbot("basic", 100)).toBe(true);
    });

    it("should allow unlimited messages for pro users", () => {
      expect(canUseChatbot("pro", 0)).toBe(true);
      expect(canUseChatbot("pro", 1000)).toBe(true);
    });

    it("should return false for invalid plan", () => {
      expect(canUseChatbot("invalid", 0)).toBe(false);
    });
  });
});

describe("Plan Features", () => {
  it("should have ads only for free plan", () => {
    expect(PLANS.free.limitations.hasAds).toBe(true);
    expect(PLANS.basic.limitations.hasAds).toBe(false);
    expect(PLANS.pro.limitations.hasAds).toBe(false);
  });

  it("should have certifications only for pro plan", () => {
    expect(PLANS.free.limitations.hasCertifications).toBe(false);
    expect(PLANS.basic.limitations.hasCertifications).toBe(false);
    expect(PLANS.pro.limitations.hasCertifications).toBe(true);
  });

  it("should have AI tutor only for pro plan", () => {
    expect(PLANS.free.limitations.hasAiTutor).toBe(false);
    expect(PLANS.basic.limitations.hasAiTutor).toBe(false);
    expect(PLANS.pro.limitations.hasAiTutor).toBe(true);
  });
});
