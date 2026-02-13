import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Sparkles, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import Footer from "@/components/layout/Footer";

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-['Lexend']">Bienvenue sur Sklora</CardTitle>
            <CardDescription>
              Éclore dans son métier • Connectez-vous pour accéder à votre espace d'apprentissage personnalisé.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <a href={getLoginUrl()} className="block">
              <Button className="w-full gap-2" size="lg">
                Se connecter <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <p className="text-center text-sm text-muted-foreground">
              En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
