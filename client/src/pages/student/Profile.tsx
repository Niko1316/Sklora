import StudentLayout from "@/components/layout/StudentLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  Flame,
  Trophy,
  Target,
  BookOpen,
  CheckCircle,
  Calendar,
  Award,
} from "lucide-react";

function calculateLevelProgress(totalXp: number, currentLevel: number): number {
  const xpForCurrentLevel = (currentLevel - 1) * 100;
  const xpForNextLevel = currentLevel * 100;
  const xpInCurrentLevel = totalXp - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  return Math.min(100, (xpInCurrentLevel / xpNeededForLevel) * 100);
}

export default function Profile() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = trpc.user.getStats.useQuery();
  const { data: badges, isLoading: badgesLoading } = trpc.user.getBadges.useQuery();
  const { data: progress, isLoading: progressLoading } = trpc.user.getProgress.useQuery();

  const levelProgress = user ? calculateLevelProgress(user.totalXp || 0, user.currentLevel || 1) : 0;
  const xpToNextLevel = user ? (user.currentLevel || 1) * 100 - (user.totalXp || 0) : 100;

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatarUrl || undefined} alt={user?.name || "User"} />
                <AvatarFallback className="text-2xl">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold">{user?.name || "Utilisateur"}</h1>
                <p className="text-muted-foreground">{user?.email}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Membre depuis {formatDate(user?.createdAt || null)}
                </p>
                
                {/* Level Progress */}
                <div className="mt-4 max-w-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-gold" />
                      <span className="font-semibold">Niveau {user?.currentLevel || 1}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {xpToNextLevel} XP pour le niveau suivant
                    </span>
                  </div>
                  <Progress value={levelProgress} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {user?.totalXp || 0} XP total
                  </p>
                </div>
              </div>

              {/* Streak */}
              <div className="flex flex-col items-center p-4 bg-orange-500/10 rounded-lg">
                <Flame className="h-10 w-10 text-orange-500 streak-flame" />
                <p className="text-2xl font-bold text-orange-500 mt-1">
                  {user?.currentStreak || 0}
                </p>
                <p className="text-sm text-muted-foreground">jours de suite</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Record : {user?.longestStreak || 0} jours
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats & Badges Tabs */}
        <Tabs defaultValue="stats">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="progress">Progression</TabsTrigger>
          </TabsList>

          {/* Stats Tab */}
          <TabsContent value="stats" className="mt-6">
            {statsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="dashboard-card">
                  <CardContent className="pt-6 text-center">
                    <BookOpen className="h-8 w-8 mx-auto text-primary mb-2" />
                    <p className="text-3xl font-bold">{stats?.completedLessons || 0}</p>
                    <p className="text-sm text-muted-foreground">Leçons terminées</p>
                  </CardContent>
                </Card>
                
                <Card className="dashboard-card">
                  <CardContent className="pt-6 text-center">
                    <CheckCircle className="h-8 w-8 mx-auto text-success mb-2" />
                    <p className="text-3xl font-bold">{stats?.completedModules || 0}</p>
                    <p className="text-sm text-muted-foreground">Modules terminés</p>
                  </CardContent>
                </Card>
                
                <Card className="dashboard-card">
                  <CardContent className="pt-6 text-center">
                    <Target className="h-8 w-8 mx-auto text-accent mb-2" />
                    <p className="text-3xl font-bold">{stats?.passedQuizzes || 0}</p>
                    <p className="text-sm text-muted-foreground">Quiz réussis</p>
                  </CardContent>
                </Card>
                
                <Card className="dashboard-card">
                  <CardContent className="pt-6 text-center">
                    <Award className="h-8 w-8 mx-auto text-gold mb-2" />
                    <p className="text-3xl font-bold">{stats?.badgesEarned || 0}</p>
                    <p className="text-sm text-muted-foreground">Badges obtenus</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="mt-6">
            {badgesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : badges && badges.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map((ub) => (
                  <Card
                    key={ub.badge.id}
                    className={`dashboard-card text-center badge-${ub.badge.rarity}`}
                  >
                    <CardContent className="pt-6">
                      {ub.badge.iconUrl ? (
                        <img
                          src={ub.badge.iconUrl}
                          alt={ub.badge.name}
                          className="w-16 h-16 mx-auto mb-2"
                        />
                      ) : (
                        <Trophy className="w-16 h-16 mx-auto mb-2 text-gold" />
                      )}
                      <h3 className="font-semibold">{ub.badge.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {ub.badge.description}
                      </p>
                      <Badge variant="outline" className="mt-2 capitalize">
                        {ub.badge.rarity}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        Obtenu le {formatDate(ub.earnedAt)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Aucun badge obtenu</h3>
                  <p className="text-muted-foreground">
                    Continuez à apprendre pour débloquer des badges !
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="mt-6">
            {progressLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : progress && progress.length > 0 ? (
              <div className="space-y-4">
                {progress
                  .filter((p) => p.parcoursId && !p.moduleId && !p.lessonId)
                  .map((p) => (
                    <Card key={p.id} className="dashboard-card">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">Parcours #{p.parcoursId}</h3>
                          <Badge
                            variant={p.status === "completed" ? "default" : "secondary"}
                            className="capitalize"
                          >
                            {p.status === "completed" ? "Terminé" :
                             p.status === "in_progress" ? "En cours" : "Non commencé"}
                          </Badge>
                        </div>
                        <Progress value={p.progressPercent} className="h-2" />
                        <div className="flex justify-between text-sm text-muted-foreground mt-2">
                          <span>{p.progressPercent}% complété</span>
                          <span>{p.xpEarned} XP gagnés</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Aucune progression</h3>
                  <p className="text-muted-foreground">
                    Commencez un parcours pour voir votre progression ici.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
}
