import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  BookOpen,
  Target,
  Zap,
  Trophy,
  MessageCircle,
  Star,
  Flame,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const STEPS = [
  {
    id: 1,
    title: "Bienvenue sur Sklora",
    description: "Votre plateforme d'apprentissage propulsée par l'IA",
    icon: Sparkles,
  },
  {
    id: 2,
    title: "Comment ça fonctionne",
    description: "Découvrez les fonctionnalités clés",
    icon: BookOpen,
  },
  {
    id: 3,
    title: "Vos objectifs",
    description: "Personnalisez votre expérience",
    icon: Target,
  },
  {
    id: 4,
    title: "Prêt à démarrer",
    description: "Commencez votre parcours d'apprentissage",
    icon: Zap,
  },
];

export default function Onboarding() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  const progress = (currentStep / STEPS.length) * 100;

  const goals = [
    { id: "career", label: "Développer ma carrière", icon: Trophy },
    { id: "skills", label: "Acquérir de nouvelles compétences", icon: Star },
    { id: "certification", label: "Obtenir une certification", icon: Badge },
    { id: "hobby", label: "Apprendre par passion", icon: Flame },
  ];

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };

  const handleComplete = () => {
    // TODO: Save onboarding preferences to backend
    toast.success("Configuration terminée !");
    setLocation("/dashboard");
  };

  const handleNext = () => {
    if (currentStep === 3 && selectedGoals.length === 0) {
      toast.error("Veuillez sélectionner au moins un objectif");
      return;
    }
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-background to-teal-50 dark:from-violet-950/30 dark:via-background dark:to-teal-950/30">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-background to-teal-50 dark:from-violet-950/30 dark:via-background dark:to-teal-950/30" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-primary/20 via-purple-500/20 to-teal-500/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-teal-500/20 via-cyan-500/20 to-primary/20 rounded-full blur-3xl animate-blob animation-delay-2000" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Étape {currentStep} sur {STEPS.length}
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Main Card */}
          <Card className="bento-card bg-background/80 backdrop-blur-xl border-2 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-teal-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary to-teal-600">
                    {(() => {
                      const CurrentIcon = STEPS[currentStep - 1].icon;
                      return <CurrentIcon className="h-10 w-10 text-white" />;
                    })()}
                  </div>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold font-['Lexend']">
                {STEPS[currentStep - 1].title}
              </CardTitle>
              <CardDescription className="text-base">
                {STEPS[currentStep - 1].description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Welcome */}
              {currentStep === 1 && (
                <div className="space-y-4 text-center">
                  <p className="text-lg">
                    Bonjour <span className="font-semibold text-primary">{user?.name}</span> ! 👋
                  </p>
                  <p className="text-muted-foreground">
                    Prenons quelques instants pour configurer votre espace d'apprentissage
                    et personnaliser votre expérience sur Sklora.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    {[
                      { icon: BookOpen, label: "Parcours structurés" },
                      { icon: Trophy, label: "Gamification" },
                      { icon: MessageCircle, label: "Tuteur IA 24/7" },
                      { icon: Star, label: "Badges & XP" },
                    ].map((feature, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50">
                        <feature.icon className="h-6 w-6 text-primary" />
                        <span className="text-xs text-center font-medium">{feature.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: How it works */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  {[
                    {
                      title: "Explorez les parcours",
                      description: "Choisissez parmi nos parcours de formation structurés et progressifs",
                      icon: BookOpen,
                      color: "bg-primary/10 text-primary",
                    },
                    {
                      title: "Apprenez à votre rythme",
                      description: "Suivez les leçons interactives et validez vos connaissances avec des quiz",
                      icon: Zap,
                      color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
                    },
                    {
                      title: "Progressez et gagnez des récompenses",
                      description: "Accumulez de l'XP, montez de niveau et débloquez des badges",
                      icon: Trophy,
                      color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
                    },
                    {
                      title: "Obtenez de l'aide 24/7",
                      description: "Notre assistant IA est toujours disponible pour répondre à vos questions",
                      icon: MessageCircle,
                      color: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400",
                    },
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl border hover:border-primary/50 transition-colors">
                      <div className={`p-2.5 rounded-xl ${step.color} shrink-0`}>
                        <step.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-1" />
                    </div>
                  ))}
                </div>
              )}

              {/* Step 3: Goals */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <p className="text-center text-muted-foreground">
                    Sélectionnez vos objectifs d'apprentissage (au moins 1)
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {goals.map(goal => {
                      const isSelected = selectedGoals.includes(goal.id);
                      return (
                        <button
                          key={goal.id}
                          onClick={() => toggleGoal(goal.id)}
                          className={`flex items-center gap-4 p-6 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className={`p-3 rounded-xl ${
                            isSelected ? "bg-primary text-white" : "bg-muted"
                          }`}>
                            <goal.icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{goal.label}</p>
                          </div>
                          {isSelected && (
                            <Check className="h-5 w-5 text-primary shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 4: Ready */}
              {currentStep === 4 && (
                <div className="space-y-6 text-center">
                  <div className="relative mx-auto w-32 h-32">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-2xl opacity-50 animate-pulse" />
                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <Check className="h-16 w-16 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Vous êtes prêt !</h3>
                    <p className="text-muted-foreground mb-6">
                      Votre espace d'apprentissage est configuré. Explorez les parcours et
                      commencez votre voyage vers l'excellence.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-left">
                    {[
                      { label: "Parcours disponibles", value: "15+", icon: BookOpen },
                      { label: "Leçons interactives", value: "200+", icon: Zap },
                      { label: "Apprenants actifs", value: "10k+", icon: Star },
                    ].map((stat, i) => (
                      <div key={i} className="p-4 rounded-xl bg-muted/50 text-center">
                        <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold font-['Lexend']">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </Button>
                <Button
                  onClick={handleNext}
                  className="gap-2 btn-squishy bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90"
                >
                  {currentStep === STEPS.length ? "Commencer" : "Suivant"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Skip Button */}
          <div className="text-center mt-4">
            <button
              onClick={handleComplete}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Passer l'introduction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
