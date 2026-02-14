import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getLoginUrl } from "@/const";
import { Check, X, Zap, Crown, Shield, GraduationCap, Bitcoin, ArrowRight, Sparkles, Gift, Calculator, TrendingUp } from "lucide-react";
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
  const [hoursPerWeek, setHoursPerWeek] = useState([5]);

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

        {/* ROI Calculator */}
        <div className="mt-20">
          <Card className="bento-card max-w-4xl mx-auto bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border-teal-200 dark:border-teal-800">
            <CardHeader className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 text-sm font-medium mb-4 mx-auto w-fit">
                <Calculator className="h-4 w-4" />
                Calculateur d'économies
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold font-['Lexend']">
                Calculez votre retour sur investissement
              </CardTitle>
              <CardDescription className="text-base">
                Découvrez combien vous économisez avec Sklora par rapport aux formations traditionnelles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-medium">Heures d'apprentissage par semaine</Label>
                  <span className="text-2xl font-bold text-primary">{hoursPerWeek[0]}h</span>
                </div>
                <Slider
                  value={hoursPerWeek}
                  onValueChange={setHoursPerWeek}
                  min={1}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-4">
                <div className="p-6 rounded-2xl bg-background border-2 border-border">
                  <p className="text-sm text-muted-foreground mb-2">Formation traditionnelle</p>
                  <p className="text-3xl font-bold text-destructive mb-1">
                    {(hoursPerWeek[0] * 50 * 12).toLocaleString()}$
                  </p>
                  <p className="text-xs text-muted-foreground">par an (50$/heure × {hoursPerWeek[0]}h/sem × 52 sem)</p>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-primary to-teal-600 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4" />
                    <p className="text-sm">Sklora Pro (annuel)</p>
                  </div>
                  <p className="text-3xl font-bold mb-1">
                    {isCrypto ? "259$" : "288$"}
                  </p>
                  <p className="text-xs opacity-80">par an (accès illimité + certifications)</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-500 text-center">
                <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-2 font-medium">
                  💰 Vous économisez
                </p>
                <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                  {((hoursPerWeek[0] * 50 * 52) - (isCrypto ? 259 : 288)).toLocaleString()}$
                </p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  soit {Math.round(((hoursPerWeek[0] * 50 * 52) - (isCrypto ? 259 : 288)) / (hoursPerWeek[0] * 50 * 52) * 100)}% d'économies par an
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 font-['Lexend']">Questions fréquentes sur les tarifs</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tout ce que vous devez savoir pour choisir le bon plan
            </p>
          </div>

          <Accordion type="single" collapsible className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: "Quelle est la différence entre l'abonnement mensuel et annuel ?",
                answer: "L'abonnement annuel vous fait économiser 20% par rapport au mensuel. De plus, en payant en crypto, vous bénéficiez d'une réduction supplémentaire de 10%, soit 30% d'économies au total."
              },
              {
                question: "Puis-je changer de plan à tout moment ?",
                answer: "Oui ! Vous pouvez passer du plan Basic au Pro à tout moment. La différence de prix sera calculée au prorata pour la période restante. Le passage du Pro au Basic prendra effet à la fin de votre période de facturation en cours."
              },
              {
                question: "Comment fonctionne la garantie de remboursement ?",
                answer: "Nous offrons une garantie satisfait ou remboursé de 30 jours sur tous nos plans. Si Sklora ne répond pas à vos attentes, contactez-nous pour un remboursement complet, sans questions posées."
              },
              {
                question: "Les certifications Pro sont-elles vraiment reconnues ?",
                answer: "Absolument. Nos certifications sont reconnues par nos partenaires industriels et peuvent être vérifiées via notre plateforme. Elles apparaissent sur votre profil LinkedIn avec un badge officiel et sont prisées par les recruteurs."
              },
              {
                question: "Que se passe-t-il si j'annule mon abonnement ?",
                answer: "Vous conservez l'accès à tous les contenus jusqu'à la fin de votre période payée. Après annulation, votre compte passe automatiquement en mode gratuit avec accès aux 3 leçons gratuites. Vous pouvez réactiver à tout moment."
              },
              {
                question: "Y a-t-il des frais cachés ?",
                answer: "Aucun. Le prix affiché est le prix final. Pas de frais de setup, pas de frais par cours, pas de frais de certificat supplémentaires (inclus dans Pro). Total transparence."
              },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bento-card px-6 border-0">
                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
