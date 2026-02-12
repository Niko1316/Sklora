import StudentLayout from "@/components/layout/StudentLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Trophy,
  Flame,
  Star,
  Target,
  Clock,
  ArrowRight,
  CheckCircle,
  Award,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";

function StatCard({
  icon: Icon,
  label,
  value,
  colorClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  colorClass: string;
}) {
  return (
    <Card className="bento-card">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${colorClass}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold font-['Lexend']">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function calculateLevelProgress(totalXp: number, currentLevel: number): number {
  const xpForCurrentLevel = (currentLevel - 1) * 100;
  const xpForNextLevel = currentLevel * 100;
  const xpInCurrentLevel = totalXp - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  return Math.min(100, (xpInCurrentLevel / xpNeededForLevel) * 100);
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = trpc.user.getStats.useQuery();
  const { data: parcours, isLoading: parcoursLoading } = trpc.parcours.list.useQuery();
  const { data: badges } = trpc.user.getBadges.useQuery();

  const levelProgress = user ? calculateLevelProgress(user.totalXp || 0, user.currentLevel || 1) : 0;
  const xpToNextLevel = user ? (user.currentLevel || 1) * 100 - (user.totalXp || 0) : 100;

  return (
    <StudentLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-['Lexend']">
              Bonjour, {user?.name?.split(" ")[0] || "Apprenant"} ! 
              <span className="inline-block ml-2 title-kinetic">👋</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Continuez votre apprentissage et atteignez vos objectifs.
            </p>
          </div>
          <Link href="/parcours">
            <Button className="btn-squishy gap-2 bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90">
              Explorer les parcours <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Level Progress Card - Bento style */}
        <Card className="bento-card bg-gradient-to-br from-primary/5 via-background to-purple-500/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-teal-500/20 flex items-center justify-center">
                    <Star className="h-10 w-10 text-primary" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    Niv. {user?.currentLevel || 1}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg font-['Lexend']">Niveau {user?.currentLevel || 1}</h3>
                  <p className="text-sm text-muted-foreground">
                    {xpToNextLevel} XP pour le niveau suivant
                  </p>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">{user?.totalXp || 0} XP</span>
                  <span className="text-muted-foreground">{(user?.currentLevel || 1) * 100} XP</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-primary to-teal-500 transition-all duration-500"
                    style={{ width: `${levelProgress}%` }}
                  />
                </div>
              </div>
              {(user?.currentStreak || 0) > 0 && (
                <div className="flex items-center gap-3 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 px-5 py-3 rounded-xl border border-orange-200 dark:border-orange-800">
                  <Flame className="h-7 w-7 text-orange-500 streak-flame" />
                  <div>
                    <p className="font-bold text-orange-600 dark:text-orange-400 text-lg">{user?.currentStreak} jours</p>
                    <p className="text-xs text-orange-700 dark:text-orange-300">Série en cours</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid - Bento Grid 2.0 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="bento-card">
                  <CardContent className="pt-6">
                    <Skeleton className="h-16 w-full rounded-xl" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <StatCard
                icon={BookOpen}
                label="Leçons complétées"
                value={stats?.completedLessons || 0}
                colorClass="bg-primary/10 text-primary"
              />
              <StatCard
                icon={CheckCircle}
                label="Modules terminés"
                value={stats?.completedModules || 0}
                colorClass="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
              />
              <StatCard
                icon={Target}
                label="Quiz réussis"
                value={stats?.passedQuizzes || 0}
                colorClass="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
              />
              <StatCard
                icon={Award}
                label="Badges obtenus"
                value={stats?.badgesEarned || 0}
                colorClass="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
              />
            </>
          )}
        </div>

        {/* Parcours Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold font-['Lexend']">Parcours disponibles</h2>
            <Link href="/parcours">
              <Button variant="ghost" size="sm" className="gap-1 btn-squishy">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {parcoursLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bento-card">
                  <CardContent className="pt-6">
                    <Skeleton className="h-32 w-full rounded-xl mb-4" />
                    <Skeleton className="h-6 w-3/4 rounded-lg mb-2" />
                    <Skeleton className="h-4 w-full rounded-lg" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : parcours && parcours.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parcours.slice(0, 3).map((p) => (
                <Link key={p.id} href={`/parcours/${p.slug}`}>
                  <Card className="bento-card cursor-pointer h-full group">
                    {p.imageUrl && (
                      <div className="h-36 overflow-hidden rounded-t-xl -mx-5 -mt-5 mb-4">
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader className="p-0">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg font-['Lexend'] group-hover:text-primary transition-colors">{p.title}</CardTitle>
                        {p.isFree && (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                            Gratuit
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2 mt-2">
                        {p.description || "Découvrez ce parcours de formation."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 mt-4">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-lg">
                          <BookOpen className="h-3.5 w-3.5" />
                          {p.totalModules} modules
                        </span>
                        <span className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-lg">
                          <Clock className="h-3.5 w-3.5" />
                          {p.totalHours}h
                        </span>
                        <Badge variant="outline" className="capitalize text-xs">
                          {p.difficulty}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="bento-card">
              <CardContent className="py-16 text-center">
                <div className="p-4 rounded-2xl bg-muted w-fit mx-auto mb-4">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2 font-['Lexend']">Aucun parcours disponible</h3>
                <p className="text-muted-foreground">
                  Les parcours seront bientôt disponibles. Revenez plus tard !
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Progression Map - Visual Journey */}
        <Card className="bento-card overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-['Lexend']">Ma carte de progression</CardTitle>
              <Link href="/progress">
                <Button variant="ghost" size="sm" className="gap-1 btn-squishy">
                  Détails <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <CardDescription>Votre parcours d'apprentissage en un coup d'œil</CardDescription>
          </CardHeader>
          <CardContent>
            {parcoursLoading ? (
              <Skeleton className="h-32 w-full rounded-xl" />
            ) : parcours && parcours.length > 0 ? (
              <div className="space-y-4">
                {parcours.slice(0, 4).map((p, idx) => {
                  const progressPct = (p as any).userProgress || 0;
                  const isActive = progressPct > 0 && progressPct < 100;
                  const isCompleted = progressPct === 100;
                  return (
                    <Link key={p.id} href={`/parcours/${p.slug}`}>
                      <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                        isActive ? 'border-primary/50 bg-primary/5' : isCompleted ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/20' : 'border-border hover:border-primary/30'
                      }`}>
                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                          isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                          {isCompleted ? <CheckCircle className="h-5 w-5" /> : idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm truncate font-['Lexend'] ${
                            isActive ? 'text-primary' : isCompleted ? 'text-emerald-600 dark:text-emerald-400' : ''
                          }`}>{p.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary to-teal-500'
                                }`}
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground font-medium w-10 text-right">{progressPct}%</span>
                          </div>
                        </div>
                        {isActive && (
                          <Badge className="bg-primary/10 text-primary border-0 text-xs">En cours</Badge>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Commencez un parcours pour voir votre progression ici</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Badges Section */}
        {badges && badges.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-6 font-['Lexend']">Mes badges récents</h2>
            <div className="flex flex-wrap gap-4">
              {badges.slice(0, 6).map((ub) => (
                <div
                  key={ub.badge.id}
                  className={`bento-card p-5 text-center min-w-[120px] badge-${ub.badge.rarity}`}
                >
                  {ub.badge.iconUrl ? (
                    <img
                      src={ub.badge.iconUrl}
                      alt={ub.badge.name}
                      className="w-14 h-14 mx-auto mb-3"
                    />
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 w-fit mx-auto mb-3">
                      <Trophy className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                    </div>
                  )}
                  <p className="font-medium text-sm font-['Lexend']">{ub.badge.name}</p>
                  <Badge variant="outline" className="mt-2 text-xs capitalize">
                    {ub.badge.rarity}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Tutor Promo */}
        <Card className="bento-card bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="py-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                <Sparkles className="h-10 w-10" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold text-xl font-['Lexend'] text-purple-900 dark:text-purple-100 mb-1">
                  Besoin d'aide ?
                </h3>
                <p className="text-purple-700 dark:text-purple-300">
                  Notre tuteur IA est disponible 24/7 pour répondre à vos questions et vous guider dans votre apprentissage.
                </p>
              </div>
              <Link href="/chatbot">
                <Button className="btn-squishy bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg">
                  Discuter avec l'IA
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
