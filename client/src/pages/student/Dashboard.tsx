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
} from "lucide-react";
import { Link } from "wouter";

function StatCard({
  icon: Icon,
  label,
  value,
  color = "primary",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <Card className="dashboard-card">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg bg-${color}/10`}>
            <Icon className={`h-6 w-6 text-${color}`} />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
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
            <h1 className="text-3xl font-bold">
              Bonjour, {user?.name?.split(" ")[0] || "Apprenant"} ! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Continuez votre apprentissage et atteignez vos objectifs.
            </p>
          </div>
          <Link href="/parcours">
            <Button className="gap-2">
              Explorer les parcours <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Level Progress Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                    <Star className="h-10 w-10 text-primary" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-gold text-white text-xs font-bold px-2 py-1 rounded-full">
                    Niv. {user?.currentLevel || 1}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Niveau {user?.currentLevel || 1}</h3>
                  <p className="text-sm text-muted-foreground">
                    {xpToNextLevel} XP pour le niveau suivant
                  </p>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span>{user?.totalXp || 0} XP</span>
                  <span>{(user?.currentLevel || 1) * 100} XP</span>
                </div>
                <Progress value={levelProgress} className="h-3 xp-gradient" />
              </div>
              {(user?.currentStreak || 0) > 0 && (
                <div className="flex items-center gap-2 bg-orange-500/10 px-4 py-2 rounded-lg">
                  <Flame className="h-6 w-6 text-orange-500 streak-flame" />
                  <div>
                    <p className="font-bold text-orange-500">{user?.currentStreak} jours</p>
                    <p className="text-xs text-muted-foreground">Série en cours</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-16 w-full" />
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
                color="primary"
              />
              <StatCard
                icon={CheckCircle}
                label="Modules terminés"
                value={stats?.completedModules || 0}
                color="success"
              />
              <StatCard
                icon={Target}
                label="Quiz réussis"
                value={stats?.passedQuizzes || 0}
                color="accent"
              />
              <StatCard
                icon={Award}
                label="Badges obtenus"
                value={stats?.badgesEarned || 0}
                color="gold"
              />
            </>
          )}
        </div>

        {/* Parcours Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Parcours disponibles</h2>
            <Link href="/parcours">
              <Button variant="ghost" size="sm" className="gap-1">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {parcoursLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : parcours && parcours.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parcours.slice(0, 3).map((p) => (
                <Link key={p.id} href={`/parcours/${p.slug}`}>
                  <Card className="dashboard-card cursor-pointer h-full">
                    {p.imageUrl && (
                      <div className="h-32 overflow-hidden rounded-t-lg">
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{p.title}</CardTitle>
                        {p.isFree && (
                          <Badge variant="secondary">Gratuit</Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {p.description || "Découvrez ce parcours de formation."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {p.totalModules} modules
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {p.totalHours}h
                        </span>
                        <Badge variant="outline" className="capitalize">
                          {p.difficulty}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Aucun parcours disponible</h3>
                <p className="text-muted-foreground">
                  Les parcours seront bientôt disponibles. Revenez plus tard !
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Badges Section */}
        {badges && badges.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Mes badges récents</h2>
            <div className="flex flex-wrap gap-4">
              {badges.slice(0, 6).map((ub) => (
                <div
                  key={ub.badge.id}
                  className={`p-4 rounded-lg border text-center badge-${ub.badge.rarity}`}
                >
                  {ub.badge.iconUrl ? (
                    <img
                      src={ub.badge.iconUrl}
                      alt={ub.badge.name}
                      className="w-12 h-12 mx-auto mb-2"
                    />
                  ) : (
                    <Trophy className="w-12 h-12 mx-auto mb-2 text-gold" />
                  )}
                  <p className="font-medium text-sm">{ub.badge.name}</p>
                  <Badge variant="outline" className="mt-1 text-xs capitalize">
                    {ub.badge.rarity}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
