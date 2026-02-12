import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getLoginUrl } from "@/const";
import { Check, X, Zap, Crown, Shield, GraduationCap, Bitcoin, ArrowRight, Sparkles, Gift } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const plans = [
  {
    id: "free",
    name: "Free",
    icon: Zap,
    description: "Pour découvrir la plateforme",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { text: "3 leçons gratuites", included: true },
      { text: "Quiz de base", included: true },
      { text: "Progression sauvegardée", included: true },
      { text: "Avec publicités", included: true, note: true },
      { text: "Accès complet aux parcours", included: false },
      { text: "Tuteur IA", included: false },
      { text: "Certifications", included: false },
    ],
    popular: false,
    cta: "Commencer gratuitement",
    color: "teal",
  },
  {
    id: "basic",
    name: "Basic",
    icon: Crown,
    description: "Accès complet à la plateforme",
    monthlyPrice: 14.99,
    yearlyPrice: 143.90,
    features: [
      { text: "Tous les parcours", included: true },
      { text: "Quiz illimités", included: true },
      { text: "Sans publicités", included: true },
      { text: "Progression détaillée", included: true },
      { text: "Badges et gamification", included: true },
      { text: "Tuteur IA (limité)", included: true },
      { text: "Certifications", included: false },
    ],
    popular: true,
    cta: "Choisir Basic",
    color: "primary",
  },
  {
    id: "pro",
    name: "Pro",
    icon: Shield,
    description: "L'expérience complète",
    monthlyPrice: 29.99,
    yearlyPrice: 287.90,
    features: [
      { text: "Tout de Basic +", included: true },
      { text: "Tuteur IA illimité", included: true },
      { text: "Certifications officielles", included: true },
      { text: "Support prioritaire", included: true },
      { text: "Accès anticipé aux nouveautés", included: true },
      { text: "Contenu exclusif", included: true },
      { text: "Mentorat personnalisé", included: true },
    ],
    popular: false,
    cta: "Choisir Pro",
    color: "lavender",
  },
];

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [isYearly, setIsYearly] = useState(false);
  const [isCrypto, setIsCrypto] = useState(false);

  const createCheckoutMutation = trpc.subscription.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.info("Redirection vers le paiement...");
        window.open(data.checkoutUrl, '_blank');
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la création du paiement");
    },
  });

  const handleSubscribe = (planId: string) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (planId === "free") {
      toast.info("Vous utilisez déjà le plan gratuit !");
      return;
    }

    createCheckoutMutation.mutate({
      planId: planId as 'basic' | 'pro',
      billingPeriod: isYearly ? 'yearly' : 'monthly',
      paymentMethod: isCrypto ? 'crypto' : 'card',
    });
  };

  const calculatePrice = (plan: typeof plans[0]) => {
    let price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    if (isCrypto && price > 0) {
      price = price * 0.9;
    }
    return price;
  };

  const getOriginalPrice = (plan: typeof plans[0]) => {
    return isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Gratuit";
    return `$${price.toFixed(2)}`;
  };

  const totalDiscount = (isYearly ? 20 : 0) + (isCrypto ? 10 : 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold font-['Lexend']">Sklora</span>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="ghost" className="btn-squishy">Tableau de bord</Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button className="btn-squishy">Se connecter</Button>
              </a>
            )}
          </nav>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto py-16 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Lexend'] title-kinetic">
            Investissez dans votre avenir
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Commencez gratuitement et évoluez selon vos besoins d'apprentissage.
          </p>
        </div>

        {/* Crypto Discount Banner */}
        <div className="mb-10 relative">
          <div className="bento-card bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800 p-6 text-center">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                  <Bitcoin className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg font-['Lexend'] text-amber-900 dark:text-amber-100">
                    Payez en Crypto, Économisez 10%
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Bitcoin (BTC) & USDC acceptés via Creem
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-amber-600" />
                <span className="text-amber-800 dark:text-amber-200 font-medium">
                  Cumulable avec -20% annuel = <span className="font-bold text-lg">-30% total</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Billing toggles */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
          {/* Annual toggle */}
          <div className="bento-card flex items-center gap-4 px-6 py-3">
            <Label htmlFor="billing-toggle" className={`font-medium ${!isYearly ? "text-primary" : "text-muted-foreground"}`}>
              Mensuel
            </Label>
            <Switch
              id="billing-toggle"
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="billing-toggle" className={`font-medium ${isYearly ? "text-primary" : "text-muted-foreground"}`}>
              Annuel
            </Label>
            {isYearly && (
              <span className="crypto-badge bg-gradient-to-r from-emerald-500 to-teal-500">
                -20%
              </span>
            )}
          </div>

          {/* Crypto toggle */}
          <div className="bento-card flex items-center gap-4 px-6 py-3 border-amber-200 dark:border-amber-800">
            <Label htmlFor="crypto-toggle" className={`font-medium ${!isCrypto ? "text-foreground" : "text-muted-foreground"}`}>
              Carte
            </Label>
            <Switch
              id="crypto-toggle"
              checked={isCrypto}
              onCheckedChange={setIsCrypto}
              className="data-[state=checked]:bg-amber-500"
            />
            <Label htmlFor="crypto-toggle" className={`font-medium flex items-center gap-1.5 ${isCrypto ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
              <Bitcoin className="h-4 w-4" />
              Crypto
            </Label>
            {isCrypto && (
              <span className="crypto-badge">
                -10%
              </span>
            )}
          </div>
        </div>

        {/* Total discount indicator */}
        {totalDiscount > 0 && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-200 dark:border-emerald-800">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                Économie totale : {totalDiscount}% de réduction
              </span>
            </div>
          </div>
        )}

        {/* Pricing cards - Bento Grid 2.0 */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = calculatePrice(plan);
            const originalPrice = getOriginalPrice(plan);
            const hasDiscount = isCrypto && price > 0;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative flex flex-col bento-card transition-all duration-300 ${
                  plan.popular 
                    ? "pricing-popular border-2 border-primary md:scale-105 z-10" 
                    : "hover:border-primary/30"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-teal-600 text-white px-4 py-1 text-sm font-semibold shadow-lg">
                      Le plus populaire
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2.5 rounded-xl ${
                      plan.id === "free" ? "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" :
                      plan.id === "basic" ? "bg-primary/10 text-primary" :
                      "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-['Lexend']">{plan.name}</CardTitle>
                  </div>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  
                  <div className="mt-6 space-y-1">
                    {hasDiscount && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg text-muted-foreground line-through">
                          {formatPrice(originalPrice)}
                        </span>
                        <span className="crypto-badge text-xs">
                          -10% crypto
                        </span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold font-['Lexend']">{formatPrice(price)}</span>
                      {price > 0 && (
                        <span className="text-muted-foreground text-lg">
                          /{isYearly ? "an" : "mois"}
                        </span>
                      )}
                    </div>
                    {isYearly && price > 0 && (
                      <p className="text-sm text-muted-foreground">
                        soit {formatPrice(price / 12)}/mois
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 pt-0">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        {feature.included ? (
                          <div className={`mt-0.5 p-0.5 rounded-full ${feature.note ? "bg-muted" : "bg-emerald-100 dark:bg-emerald-900/30"}`}>
                            <Check className={`h-4 w-4 ${feature.note ? "text-muted-foreground" : "text-emerald-600 dark:text-emerald-400"}`} />
                          </div>
                        ) : (
                          <div className="mt-0.5 p-0.5 rounded-full bg-muted">
                            <X className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className={`text-sm ${!feature.included ? "text-muted-foreground" : ""}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4">
                  <Button 
                    className={`w-full btn-squishy text-base py-6 ${
                      plan.popular 
                        ? "bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90 shadow-lg" 
                        : plan.id === "pro"
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                        : ""
                    }`}
                    variant={plan.popular || plan.id === "pro" ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={createCheckoutMutation.isPending}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Crypto payment info */}
        <div className="mt-16">
          <div className="bento-card max-w-3xl mx-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
                  <Bitcoin className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-bold text-xl font-['Lexend'] mb-1">Paiement Crypto Sécurisé</h3>
                  <p className="text-muted-foreground">
                    Payez avec Bitcoin ou USDC directement via Stripe
                  </p>
                </div>
              </div>
              <div className="flex-1 text-center md:text-right">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">10%</span>
                  <span className="text-amber-700 dark:text-amber-300 font-medium">de réduction</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-4 font-['Lexend']">Des questions ?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Notre équipe est là pour vous aider à choisir le plan qui correspond le mieux à vos objectifs d'apprentissage.
          </p>
          <Button variant="outline" size="lg" className="btn-squishy">
            Nous contacter
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-10 px-4 mt-20 bg-card/50">
        <div className="container max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold font-['Lexend']">Sklora</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Sklora. Éclore dans son métier. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
