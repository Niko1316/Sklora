import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getLoginUrl } from "@/const";
import { Check, X, Zap, Crown, Shield, GraduationCap, Bitcoin, ArrowRight } from "lucide-react";
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
  },
  {
    id: "basic",
    name: "Basic",
    icon: Crown,
    description: "Accès complet à la plateforme",
    monthlyPrice: 14.99,
    yearlyPrice: 143.90, // 20% discount
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
  },
  {
    id: "pro",
    name: "Pro",
    icon: Shield,
    description: "L'expérience complète",
    monthlyPrice: 29.99,
    yearlyPrice: 287.90, // 20% discount
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
  },
];

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
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
      price = price * 0.9; // 10% discount for crypto
    }
    return price;
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Gratuit";
    return `${price.toFixed(2)}$`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Sklora</span>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="ghost">Tableau de bord</Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button>Se connecter</Button>
              </a>
            )}
          </nav>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto py-16 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Choisissez votre plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Commencez gratuitement et évoluez selon vos besoins d'apprentissage.
          </p>
        </div>

        {/* Billing toggles */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
          <div className="flex items-center gap-3">
            <Label htmlFor="billing-toggle" className={!isYearly ? "font-semibold" : "text-muted-foreground"}>
              Mensuel
            </Label>
            <Switch
              id="billing-toggle"
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <Label htmlFor="billing-toggle" className={isYearly ? "font-semibold" : "text-muted-foreground"}>
              Annuel
            </Label>
            {isYearly && (
              <Badge variant="secondary" className="ml-2 bg-success/10 text-success">
                -20%
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Label htmlFor="crypto-toggle" className={!isCrypto ? "font-semibold" : "text-muted-foreground"}>
              Carte
            </Label>
            <Switch
              id="crypto-toggle"
              checked={isCrypto}
              onCheckedChange={setIsCrypto}
            />
            <Label htmlFor="crypto-toggle" className={isCrypto ? "font-semibold" : "text-muted-foreground"}>
              <span className="flex items-center gap-1">
                <Bitcoin className="h-4 w-4" />
                Crypto
              </span>
            </Label>
            {isCrypto && (
              <Badge variant="secondary" className="ml-2 bg-gold/10 text-gold">
                -10%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = calculatePrice(plan);
            
            return (
              <Card 
                key={plan.id} 
                className={`relative flex flex-col ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Le plus populaire
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-6 w-6 ${plan.popular ? "text-primary" : plan.id === "pro" ? "text-gold" : ""}`} />
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{formatPrice(price)}</span>
                    {price > 0 && (
                      <span className="text-muted-foreground">
                        /{isYearly ? "an" : "mois"}
                      </span>
                    )}
                  </div>
                  {isYearly && price > 0 && (
                    <p className="text-sm text-muted-foreground">
                      soit {formatPrice(price / 12)}/mois
                    </p>
                  )}
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        {feature.included ? (
                          <Check className={`h-5 w-5 mt-0.5 ${feature.note ? "text-muted-foreground" : "text-success"}`} />
                        ) : (
                          <X className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        )}
                        <span className={!feature.included ? "text-muted-foreground" : ""}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={createCheckoutMutation.isPending}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Crypto info */}
        {isCrypto && (
          <div className="mt-12 text-center">
            <Card className="max-w-2xl mx-auto bg-muted/50">
              <CardContent className="py-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Bitcoin className="h-6 w-6 text-gold" />
                  <h3 className="font-semibold">Paiement en crypto-monnaie</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Nous acceptons Bitcoin (BTC) et USDC. Bénéficiez de 10% de réduction sur tous les plans payants.
                  Le paiement sera traité via notre partenaire de paiement crypto sécurisé.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* FAQ or additional info */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Des questions ?</h2>
          <p className="text-muted-foreground mb-6">
            Contactez notre équipe pour toute question sur nos plans ou fonctionnalités.
          </p>
          <Button variant="outline" size="lg">
            Nous contacter
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-4 mt-16">
        <div className="container max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-semibold">Sklora</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Sklora. Éclore dans son métier. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
