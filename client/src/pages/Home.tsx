import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { BookOpen, Trophy, MessageCircle, Sparkles, ArrowRight, CheckCircle, GraduationCap, Zap, Crown, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Sklora</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/pricing">
              <Button variant="ghost">Tarifs</Button>
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Tableau de bord</Button>
                </Link>
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="ghost">Administration</Button>
                  </Link>
                )}
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button>Se connecter</Button>
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            <span className="text-primary">Sklora</span>
          </h1>
          <p className="text-2xl md:text-3xl font-medium text-foreground/80 mb-6">
            Éclore dans son métier
          </p>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Une plateforme d'apprentissage interactive avec génération de contenu par IA, gamification et assistant virtuel pour vous accompagner dans votre parcours professionnel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Accéder à mon espace <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="lg" className="gap-2">
                  Commencer gratuitement <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            )}
            <Link href="/pricing">
              <Button size="lg" variant="outline">
                Voir les tarifs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tout ce dont vous avez besoin pour éclore
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="dashboard-card">
              <CardHeader>
                <Sparkles className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Contenu généré par IA</CardTitle>
                <CardDescription>
                  Des leçons et quiz créés automatiquement par intelligence artificielle, personnalisés pour votre apprentissage.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="dashboard-card">
              <CardHeader>
                <BookOpen className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Parcours structurés</CardTitle>
                <CardDescription>
                  Des modules et leçons organisés pour un apprentissage progressif et efficace.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="dashboard-card">
              <CardHeader>
                <Trophy className="h-10 w-10 text-gold mb-2" />
                <CardTitle>Gamification</CardTitle>
                <CardDescription>
                  Gagnez des XP, montez de niveau et débloquez des badges pour rester motivé.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="dashboard-card">
              <CardHeader>
                <MessageCircle className="h-10 w-10 text-accent mb-2" />
                <CardTitle>Tuteur IA 24/7</CardTitle>
                <CardDescription>
                  Un assistant virtuel disponible à tout moment pour répondre à vos questions.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Des tarifs adaptés à vos besoins
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Commencez gratuitement et évoluez selon vos besoins. 20% de réduction sur les abonnements annuels, 10% supplémentaire en payant en crypto.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Tier */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Free
                </CardTitle>
                <div className="text-3xl font-bold">0$</div>
                <CardDescription>Pour découvrir la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    3 leçons gratuites
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Quiz de base
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-4 w-4">•</span>
                    Avec publicités
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Basic Tier */}
            <Card className="relative border-primary">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Populaire
                </span>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Basic
                </CardTitle>
                <div className="text-3xl font-bold">14.99$/mois</div>
                <CardDescription>Accès complet à la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Tous les parcours
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Quiz illimités
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Sans publicités
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Progression sauvegardée
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Pro Tier */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-gold" />
                  Pro
                </CardTitle>
                <div className="text-3xl font-bold">29.99$/mois</div>
                <CardDescription>L'expérience complète</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Tout de Basic +
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Certifications officielles
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Tuteur IA illimité
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Support prioritaire
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-8">
            <Link href="/pricing">
              <Button size="lg">
                Voir tous les détails <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">IA</div>
              <div className="text-muted-foreground">Génération de contenu</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Tuteur IA disponible</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10%</div>
              <div className="text-muted-foreground">Réduction crypto</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4">
                Prêt à éclore dans votre métier ?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Rejoignez Sklora et découvrez une nouvelle façon d'acquérir des compétences avec l'aide de l'intelligence artificielle.
              </p>
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" variant="secondary" className="gap-2">
                    Accéder à mon tableau de bord <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg" variant="secondary" className="gap-2">
                    Créer mon compte gratuit <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
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
