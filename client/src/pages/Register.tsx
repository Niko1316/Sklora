import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getLoginUrl } from "@/const";
import {
  Sparkles,
  Mail,
  Phone,
  Chrome,
  ArrowRight,
  Shield,
  Zap,
  Trophy,
  Star,
  Check
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Register() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!loading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  const handleEmailAuth = () => {
    if (!email) {
      toast.error("Veuillez entrer votre email");
      return;
    }
    // TODO: Implement email authentication
    toast.info("Authentification par email bientôt disponible");
  };

  const handlePhoneAuth = () => {
    if (!phone) {
      toast.error("Veuillez entrer votre numéro de téléphone");
      return;
    }
    // TODO: Implement phone authentication
    toast.info("Authentification par téléphone bientôt disponible");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-background to-purple-50 dark:from-slate-950 dark:via-background dark:to-purple-950">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Mesh Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-background to-teal-50 dark:from-violet-950/30 dark:via-background dark:to-teal-950/30" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-primary/20 via-purple-500/20 to-teal-500/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-teal-500/20 via-cyan-500/20 to-primary/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">

          {/* Left Side - Value Proposition */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Plateforme d'apprentissage IA</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold font-['Lexend'] leading-tight">
                Éclore dans<br />
                <span className="bg-gradient-to-r from-primary via-purple-500 to-teal-500 bg-clip-text text-transparent title-kinetic">
                  votre métier
                </span>
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed">
                Rejoignez des milliers d'apprenants qui transforment leur carrière avec l'intelligence artificielle.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {[
                { icon: Zap, text: "Accès instantané à tous les parcours", color: "text-amber-500" },
                { icon: Trophy, text: "Gamification et badges motivants", color: "text-purple-500" },
                { icon: Shield, text: "Tuteur IA disponible 24/7", color: "text-teal-500" },
                { icon: Star, text: "Certificats reconnus", color: "text-primary" },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all group">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-background to-muted group-hover:scale-110 transition-transform">
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <span className="font-medium">{feature.text}</span>
                  <Check className="h-5 w-5 ml-auto text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6 pt-4">
              <div className="text-center">
                <p className="text-3xl font-bold font-['Lexend'] bg-gradient-to-r from-primary to-teal-500 bg-clip-text text-transparent">10k+</p>
                <p className="text-sm text-muted-foreground">Étudiants actifs</p>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div className="text-center">
                <p className="text-3xl font-bold font-['Lexend'] bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">4.9</p>
                <p className="text-sm text-muted-foreground">Note moyenne</p>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div className="text-center">
                <p className="text-3xl font-bold font-['Lexend'] bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">500+</p>
                <p className="text-sm text-muted-foreground">Cours disponibles</p>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Card */}
          <div className="w-full max-w-md mx-auto">
            <Card className="bento-card bg-background/80 backdrop-blur-xl border-2 shadow-2xl">
              <div className="p-8 space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-teal-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
                      <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary to-teal-600">
                        <Sparkles className="h-10 w-10 text-white" />
                      </div>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold font-['Lexend']">
                    {activeTab === "signup" ? "Créer un compte" : "Se connecter"}
                  </h2>
                  <p className="text-muted-foreground">
                    {activeTab === "signup"
                      ? "Commencez votre parcours d'apprentissage gratuitement"
                      : "Bon retour parmi nous !"}
                  </p>
                </div>

                {/* Tab Switcher */}
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted">
                  <button
                    onClick={() => setActiveTab("signup")}
                    className={`px-4 py-2.5 rounded-lg font-medium transition-all ${
                      activeTab === "signup"
                        ? "bg-background shadow-sm text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Inscription
                  </button>
                  <button
                    onClick={() => setActiveTab("login")}
                    className={`px-4 py-2.5 rounded-lg font-medium transition-all ${
                      activeTab === "login"
                        ? "bg-background shadow-sm text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Connexion
                  </button>
                </div>

                {/* OAuth Buttons */}
                <div className="space-y-3">
                  <a href={getLoginUrl()} className="block">
                    <Button className="w-full gap-2 h-12 btn-squishy bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90 shadow-lg hover:shadow-xl transition-all" size="lg">
                      <Chrome className="h-5 w-5" />
                      Continuer avec Google
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </a>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-4 text-muted-foreground font-medium">
                      ou continuer avec
                    </span>
                  </div>
                </div>

                {/* Email Auth */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12"
                        onKeyPress={(e) => e.key === "Enter" && handleEmailAuth()}
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full h-12 btn-squishy gap-2"
                    onClick={handleEmailAuth}
                  >
                    <Mail className="h-4 w-4" />
                    {activeTab === "signup" ? "S'inscrire" : "Se connecter"} par email
                  </Button>
                </div>

                {/* Phone Auth */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+33 6 12 34 56 78"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 h-12"
                        onKeyPress={(e) => e.key === "Enter" && handlePhoneAuth()}
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full h-12 btn-squishy gap-2"
                    onClick={handlePhoneAuth}
                  >
                    <Phone className="h-4 w-4" />
                    {activeTab === "signup" ? "S'inscrire" : "Se connecter"} par SMS
                  </Button>
                </div>

                {/* Terms */}
                <p className="text-xs text-center text-muted-foreground">
                  En continuant, vous acceptez nos{" "}
                  <a href="#" className="underline hover:text-primary transition-colors">
                    conditions d'utilisation
                  </a>{" "}
                  et notre{" "}
                  <a href="#" className="underline hover:text-primary transition-colors">
                    politique de confidentialité
                  </a>
                  .
                </p>
              </div>
            </Card>

            {/* Trust Badges */}
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4" />
                <span>Sécurisé</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4" />
                <span>RGPD</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4" />
                <span>Instantané</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
