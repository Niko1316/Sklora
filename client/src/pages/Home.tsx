import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { BookOpen, Trophy, MessageCircle, Sparkles, ArrowRight, CheckCircle, Users, Star } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Pépites Mondiales</span>
          </div>
          <nav className="flex items-center gap-4">
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
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Découvrez vos <span className="text-primary">Pépites</span> d'apprentissage
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Une plateforme d'apprentissage interactive avec gamification, quiz et assistant IA pour vous accompagner dans votre parcours de formation.
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
            <Link href="/parcours">
              <Button size="lg" variant="outline">
                Voir les parcours
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tout ce dont vous avez besoin pour apprendre
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <CheckCircle className="h-10 w-10 text-success mb-2" />
                <CardTitle>Quiz interactifs</CardTitle>
                <CardDescription>
                  Testez vos connaissances avec des quiz et recevez un feedback instantané.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="dashboard-card">
              <CardHeader>
                <MessageCircle className="h-10 w-10 text-accent mb-2" />
                <CardTitle>Assistant IA</CardTitle>
                <CardDescription>
                  Un tuteur virtuel disponible 24/7 pour répondre à vos questions.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">100+</div>
              <div className="text-muted-foreground">Leçons disponibles</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Quiz interactifs</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Assistant IA disponible</div>
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
                Prêt à commencer votre apprentissage ?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Rejoignez notre communauté d'apprenants et découvrez une nouvelle façon d'acquérir des compétences.
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
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-semibold">Pépites Mondiales</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Pépites Mondiales. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
