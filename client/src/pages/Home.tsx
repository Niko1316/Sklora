import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getLoginUrl } from "@/const";
import { BookOpen, Trophy, MessageCircle, Sparkles, ArrowRight, CheckCircle, GraduationCap, Zap, Crown, Shield, Bitcoin, Star, Users, Target, HelpCircle } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-['Lexend']">Sklora</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/pricing">
              <Button variant="ghost" className="btn-squishy">Tarifs</Button>
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="btn-squishy">Tableau de bord</Button>
                </Link>
                {(user as any)?.isOwner && (
                  <Link href="/admin">
                    <Button variant="ghost" className="btn-squishy">Administration</Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/register">
                  <Button variant="ghost" className="btn-squishy">Inscription</Button>
                </Link>
                <a href={getLoginUrl()}>
                  <Button className="btn-squishy">Se connecter</Button>
                </a>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section - Calm UI with Cloud Dancer background */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-500/5" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="container max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Propulsé par l'Intelligence Artificielle
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 font-['Lexend'] title-kinetic">
            <span className="bg-gradient-to-r from-primary via-teal-500 to-primary bg-clip-text text-transparent">
              Sklora
            </span>
          </h1>
          <p className="text-2xl md:text-3xl font-medium text-foreground/80 mb-6 font-['Lexend']">
            Éclore dans son métier
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Une plateforme d'apprentissage interactive avec génération de contenu par IA, 
            gamification et assistant virtuel pour vous accompagner dans votre parcours professionnel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="btn-squishy gap-2 px-8 py-6 text-lg bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90 shadow-lg">
                  Accéder à mon espace <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="lg" className="btn-squishy gap-2 px-8 py-6 text-lg bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90 shadow-lg">
                  Commencer gratuitement <ArrowRight className="h-5 w-5" />
                </Button>
              </a>
            )}
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="btn-squishy px-8 py-6 text-lg">
                Voir les tarifs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Bento Grid 2.0 */}
      <section className="py-24 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Lexend']">
              Tout ce dont vous avez besoin pour éclore
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Des outils modernes et intelligents pour un apprentissage efficace et engageant.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bento-card group">
              <CardHeader>
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-['Lexend']">Contenu généré par IA</CardTitle>
                <CardDescription className="text-base">
                  Des leçons et quiz créés automatiquement par intelligence artificielle, personnalisés pour votre apprentissage.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bento-card group">
              <CardHeader>
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 w-fit mb-4 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                  <BookOpen className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle className="font-['Lexend']">Parcours structurés</CardTitle>
                <CardDescription className="text-base">
                  Des modules et leçons organisés pour un apprentissage progressif et efficace.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bento-card group">
              <CardHeader>
                <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 w-fit mb-4 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
                  <Trophy className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle className="font-['Lexend']">Gamification</CardTitle>
                <CardDescription className="text-base">
                  Gagnez des XP, montez de niveau et débloquez des badges pour rester motivé.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bento-card group">
              <CardHeader>
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 w-fit mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                  <MessageCircle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="font-['Lexend']">Tuteur IA 24/7</CardTitle>
                <CardDescription className="text-base">
                  Un assistant virtuel disponible à tout moment pour répondre à vos questions.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Crypto Discount Banner */}
      <section className="py-12 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="bento-card bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800 p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
                  <Bitcoin className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-bold text-xl font-['Lexend'] text-amber-900 dark:text-amber-100">
                    Payez en Crypto, Économisez 10%
                  </h3>
                  <p className="text-amber-700 dark:text-amber-300">
                    Bitcoin (BTC) & USDC acceptés • Cumulable avec -20% annuel
                  </p>
                </div>
              </div>
              <Link href="/pricing">
                <Button className="btn-squishy bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg">
                  Voir les offres
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-muted/30 to-background">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Lexend']">
              Des tarifs adaptés à vos besoins
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Commencez gratuitement et évoluez selon vos besoins. 
              <span className="font-semibold text-primary"> 20% de réduction</span> sur les abonnements annuels, 
              <span className="font-semibold text-amber-600"> 10% supplémentaire</span> en payant en crypto.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Free Tier */}
            <Card className="bento-card relative">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/30">
                    <Zap className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <CardTitle className="font-['Lexend']">Free</CardTitle>
                </div>
                <div className="text-4xl font-bold font-['Lexend']">$0</div>
                <CardDescription className="text-base">Pour découvrir la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="p-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    3 leçons gratuites
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="p-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Quiz de base
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <div className="p-0.5 rounded-full bg-muted">
                      <span className="block h-4 w-4 text-center text-xs">•</span>
                    </div>
                    Avec publicités
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Basic Tier */}
            <Card className="bento-card relative pricing-popular md:scale-105 z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-primary to-teal-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-lg">
                  Populaire
                </span>
              </div>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Crown className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="font-['Lexend']">Basic</CardTitle>
                </div>
                <div className="text-4xl font-bold font-['Lexend']">$14.99<span className="text-lg font-normal text-muted-foreground">/mois</span></div>
                <CardDescription className="text-base">Accès complet à la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="p-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Tous les parcours
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="p-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Quiz illimités
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="p-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Sans publicités
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="p-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Badges et gamification
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Pro Tier */}
            <Card className="bento-card relative">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                    <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="font-['Lexend']">Pro</CardTitle>
                </div>
                <div className="text-4xl font-bold font-['Lexend']">$29.99<span className="text-lg font-normal text-muted-foreground">/mois</span></div>
                <CardDescription className="text-base">L'expérience complète</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="p-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Tout de Basic +
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="p-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Certifications officielles
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="p-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Tuteur IA illimité
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="p-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Support prioritaire
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/pricing">
              <Button size="lg" className="btn-squishy gap-2 px-8">
                Voir tous les détails <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section - Bento style */}
      <section className="py-24 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bento-card text-center py-8">
              <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold font-['Lexend'] text-primary mb-1">IA</div>
              <div className="text-muted-foreground">Génération de contenu</div>
            </div>
            <div className="bento-card text-center py-8">
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 w-fit mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-3xl font-bold font-['Lexend'] text-purple-600 dark:text-purple-400 mb-1">24/7</div>
              <div className="text-muted-foreground">Tuteur IA disponible</div>
            </div>
            <div className="bento-card text-center py-8">
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 w-fit mx-auto mb-4">
                <Bitcoin className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-3xl font-bold font-['Lexend'] text-amber-600 dark:text-amber-400 mb-1">10%</div>
              <div className="text-muted-foreground">Réduction crypto</div>
            </div>
            <div className="bento-card text-center py-8">
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 w-fit mx-auto mb-4">
                <Target className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-3xl font-bold font-['Lexend'] text-emerald-600 dark:text-emerald-400 mb-1">100%</div>
              <div className="text-muted-foreground">Personnalisé</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Lexend']">
              Ce que disent nos apprenants
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Rejoignez des milliers de professionnels qui transforment leur carrière avec Sklora.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Marie Dubois",
                role: "Développeuse Web",
                avatar: "MD",
                quote: "Sklora m'a permis de passer de débutante à développeuse confirmée en 6 mois. L'IA m'a aidée à débloquer chaque difficulté.",
                rating: 5,
              },
              {
                name: "Jean Tremblay",
                role: "Chef de Projet",
                avatar: "JT",
                quote: "La gamification rend l'apprentissage addictif ! J'ai complété 3 parcours en 4 mois tout en travaillant à temps plein.",
                rating: 5,
              },
              {
                name: "Sophie Laurent",
                role: "Designer UX",
                avatar: "SL",
                quote: "Le tuteur IA 24/7 est incroyable. C'est comme avoir un mentor personnel disponible à toute heure.",
                rating: 5,
              },
            ].map((testimonial, i) => (
              <Card key={i} className="bento-card group hover:shadow-xl transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    "{testimonial.quote}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="bento-card bg-gradient-to-br from-primary via-primary to-teal-600 text-white p-12 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Lexend']">
                Prêt à éclore dans votre métier ?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto text-lg">
                Rejoignez Sklora et découvrez une nouvelle façon d'acquérir des compétences avec l'aide de l'intelligence artificielle.
              </p>
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" variant="secondary" className="btn-squishy gap-2 px-8 py-6 text-lg">
                    Accéder à mon tableau de bord <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="btn-squishy gap-2 px-8 py-6 text-lg">
                    Créer mon compte gratuit <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4">
        <div className="container max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <HelpCircle className="h-4 w-4" />
              Questions fréquentes
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Lexend']">
              Vous avez des questions ?
            </h2>
            <p className="text-muted-foreground">
              Nous avons les réponses. Découvrez tout ce que vous devez savoir sur Sklora.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {[
              {
                question: "Comment fonctionne la génération de contenu par IA ?",
                answer: "Notre IA analyse vos besoins d'apprentissage et génère automatiquement des leçons personnalisées, des quiz adaptés à votre niveau, et des exercices pratiques. Le contenu est constamment mis à jour pour rester pertinent."
              },
              {
                question: "Puis-je accéder aux cours depuis mon mobile ?",
                answer: "Absolument ! Sklora est 100% responsive et fonctionne parfaitement sur mobile, tablette et ordinateur. Apprenez où vous voulez, quand vous voulez, sur l'appareil de votre choix."
              },
              {
                question: "Quelle est la différence entre les plans Basic et Pro ?",
                answer: "Le plan Basic donne accès à tous les parcours et la gamification. Le plan Pro ajoute le tuteur IA illimité, les certifications officielles reconnues, et un support prioritaire avec mentorat personnalisé."
              },
              {
                question: "Les certifications sont-elles reconnues professionnellement ?",
                answer: "Oui, nos certifications Pro sont reconnues par nos partenaires industriels et peuvent être ajoutées à votre CV ou profil LinkedIn. Elles démontrent une maîtrise vérifiée des compétences."
              },
              {
                question: "Comment fonctionne le paiement en crypto ?",
                answer: "Nous acceptons Bitcoin (BTC) et USDC via notre processeur de paiement sécurisé. Vous bénéficiez automatiquement de 10% de réduction sur tous les plans en payant en crypto, cumulable avec la réduction annuelle de 20%."
              },
              {
                question: "Puis-je annuler mon abonnement à tout moment ?",
                answer: "Oui, absolument. Aucun engagement. Vous pouvez annuler votre abonnement à tout moment depuis votre profil. Vous conserverez l'accès jusqu'à la fin de votre période de facturation en cours."
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

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Vous ne trouvez pas la réponse à votre question ?
            </p>
            <Link href="/register">
              <Button variant="outline" className="btn-squishy">
                Contactez notre équipe
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10 px-4 bg-card/50">
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
