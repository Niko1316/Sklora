import StudentLayout from "@/components/layout/StudentLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Trophy,
  Clock,
  Target,
  CheckCircle,
  ChevronRight,
  TrendingUp,
  Calendar,
  Flame,
  Star,
  BarChart3,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

function ProgressCard({
  title,
  value,
  total,
  icon: Icon,
  colorClass,
}: {
  title: string;
  value: number;
  total: number;
  icon: React.ElementType;
  colorClass: string;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  return (
    <Card className="bento-card">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${colorClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-2xl font-bold font-['Lexend']">{percentage}%</span>
        </div>
        <h3 className="font-medium text-sm text-muted-foreground mb-2">{title}</h3>
        <Progress value={percentage} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {value} / {total} complétés
        </p>
      </CardContent>
    </Card>
  );
}

function ParcoursProgressCard({ progress }: { progress: any }) {
  if (!progress) return null;
  
  return (
    <Card className="bento-card">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-['Lexend']">{progress.parcoursTitle}</CardTitle>
            <CardDescription className="mt-1">
              {progress.completedModules} / {progress.totalModules} modules complétés
            </CardDescription>
          </div>
          <Badge 
            variant={progress.status === "completed" ? "default" : "secondary"}
            className={progress.status === "completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : ""}
          >
            {progress.status === "completed" ? "Terminé" : progress.status === "in_progress" ? "En cours" : "Non commencé"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Overall Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progression globale</span>
              <span className="font-medium">{progress.overallProgress}%</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-primary to-teal-500 transition-all duration-500"
                style={{ width: `${progress.overallProgress}%` }}
              />
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <BookOpen className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{progress.completedLessons}</p>
              <p className="text-xs text-muted-foreground">Leçons</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <Target className="h-4 w-4 mx-auto mb-1 text-purple-500" />
              <p className="text-lg font-bold">{progress.passedQuizzes}</p>
              <p className="text-xs text-muted-foreground">Quiz réussis</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <Clock className="h-4 w-4 mx-auto mb-1 text-amber-500" />
              <p className="text-lg font-bold">{Math.round(progress.totalTimeSpentMinutes / 60)}h</p>
              <p className="text-xs text-muted-foreground">Temps passé</p>
            </div>
          </div>
          
          {/* Module Progress */}
          {progress.modules && progress.modules.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="font-medium text-sm">Modules</h4>
              {progress.modules.map((module: any) => (
                <div key={module.moduleId} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {module.status === "completed" ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      {module.moduleTitle}
                    </span>
                    <span className="text-muted-foreground">{module.overallProgress}%</span>
                  </div>
                  <Progress value={module.overallProgress} className="h-1.5" />
                </div>
              ))}
            </div>
          )}
          
          {/* Action Button */}
          <Link href={`/parcours/${progress.parcoursSlug}`}>
            <Button className="w-full btn-squishy gap-2 mt-2">
              {progress.status === "completed" ? "Revoir le parcours" : "Continuer"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Aucune activité récente</p>
      </div>
    );
  }
  
  const maxLessons = Math.max(...data.map(d => d.lessonsCompleted), 1);
  
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between h-32 gap-1">
        {data.slice(-14).map((day, index) => {
          const height = (day.lessonsCompleted / maxLessons) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className="w-full bg-gradient-to-t from-primary to-teal-500 rounded-t transition-all duration-300 hover:opacity-80"
                style={{ height: `${Math.max(height, 4)}%` }}
                title={`${day.lessonsCompleted} leçons - ${day.date}`}
              />
              <span className="text-[10px] text-muted-foreground">
                {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' }).charAt(0)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Il y a 14 jours</span>
        <span>Aujourd'hui</span>
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const { user } = useAuth();
  const { data: progressSummary, isLoading: summaryLoading } = trpc.user.getAllProgressSummary.useQuery();
  const { data: timeline, isLoading: timelineLoading } = trpc.user.getProgressTimeline.useQuery({ days: 30 });
  const { data: stats } = trpc.user.getStats.useQuery();
  
  // Calculate totals
  const totalLessons = progressSummary?.reduce((sum, p) => sum + (p?.totalLessons || 0), 0) || 0;
  const completedLessons = progressSummary?.reduce((sum, p) => sum + (p?.completedLessons || 0), 0) || 0;
  const totalQuizzes = progressSummary?.reduce((sum, p) => sum + (p?.totalQuizzes || 0), 0) || 0;
  const passedQuizzes = progressSummary?.reduce((sum, p) => sum + (p?.passedQuizzes || 0), 0) || 0;
  const totalModules = progressSummary?.reduce((sum, p) => sum + (p?.totalModules || 0), 0) || 0;
  const completedModules = progressSummary?.reduce((sum, p) => sum + (p?.completedModules || 0), 0) || 0;
  
  // Separate in progress and completed
  const inProgressParcours = progressSummary?.filter(p => p?.status === "in_progress") || [];
  const completedParcours = progressSummary?.filter(p => p?.status === "completed") || [];
  const notStartedParcours = progressSummary?.filter(p => p?.status === "not_started") || [];
  
  return (
    <StudentLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-['Lexend']">Ma progression</h1>
          <p className="text-muted-foreground mt-1">
            Suivez votre avancement dans vos parcours de formation
          </p>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summaryLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="bento-card">
                  <CardContent className="pt-6">
                    <Skeleton className="h-24 w-full rounded-xl" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <ProgressCard
                title="Leçons complétées"
                value={completedLessons}
                total={totalLessons}
                icon={BookOpen}
                colorClass="bg-primary/10 text-primary"
              />
              <ProgressCard
                title="Modules terminés"
                value={completedModules}
                total={totalModules}
                icon={CheckCircle}
                colorClass="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
              />
              <ProgressCard
                title="Quiz réussis"
                value={passedQuizzes}
                total={totalQuizzes}
                icon={Target}
                colorClass="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
              />
              <Card className="bento-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                      <Star className="h-5 w-5" />
                    </div>
                    <span className="text-2xl font-bold font-['Lexend']">{user?.totalXp || 0}</span>
                  </div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">XP total</h3>
                  <div className="flex items-center gap-2 text-xs">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span>{user?.currentStreak || 0} jours de série</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
        
        {/* Activity Timeline */}
        <Card className="bento-card">
          <CardHeader>
            <CardTitle className="text-lg font-['Lexend'] flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Activité récente
            </CardTitle>
            <CardDescription>
              Vos leçons complétées ces 14 derniers jours
            </CardDescription>
          </CardHeader>
          <CardContent>
            {timelineLoading ? (
              <Skeleton className="h-32 w-full rounded-xl" />
            ) : (
              <TimelineChart data={timeline || []} />
            )}
          </CardContent>
        </Card>
        
        {/* Parcours Progress Tabs */}
        <Tabs defaultValue="in_progress" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="in_progress" className="gap-2">
              <Clock className="h-4 w-4" />
              En cours ({inProgressParcours.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Terminés ({completedParcours.length})
            </TabsTrigger>
            <TabsTrigger value="not_started" className="gap-2">
              <BookOpen className="h-4 w-4" />
              À découvrir ({notStartedParcours.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="in_progress" className="space-y-4">
            {summaryLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <Card key={i} className="bento-card">
                    <CardContent className="pt-6">
                      <Skeleton className="h-64 w-full rounded-xl" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : inProgressParcours.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {inProgressParcours.map((progress) => (
                  <ParcoursProgressCard key={progress?.parcoursId} progress={progress} />
                ))}
              </div>
            ) : (
              <Card className="bento-card">
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2 font-['Lexend']">Aucun parcours en cours</h3>
                  <p className="text-muted-foreground mb-4">
                    Commencez un nouveau parcours pour suivre votre progression ici.
                  </p>
                  <Link href="/parcours">
                    <Button className="btn-squishy">Explorer les parcours</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {completedParcours.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {completedParcours.map((progress) => (
                  <ParcoursProgressCard key={progress?.parcoursId} progress={progress} />
                ))}
              </div>
            ) : (
              <Card className="bento-card">
                <CardContent className="py-12 text-center">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2 font-['Lexend']">Aucun parcours terminé</h3>
                  <p className="text-muted-foreground">
                    Continuez vos parcours en cours pour les voir ici une fois terminés.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="not_started" className="space-y-4">
            {notStartedParcours.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notStartedParcours.map((progress) => (
                  <Card key={progress?.parcoursId} className="bento-card">
                    <CardHeader>
                      <CardTitle className="text-lg font-['Lexend']">{progress?.parcoursTitle}</CardTitle>
                      <CardDescription>
                        {progress?.totalModules} modules · {progress?.totalLessons} leçons
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href={`/parcours/${progress?.parcoursSlug}`}>
                        <Button variant="outline" className="w-full btn-squishy gap-2">
                          Commencer
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bento-card">
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2 font-['Lexend']">Tous les parcours sont commencés</h3>
                  <p className="text-muted-foreground">
                    Vous avez déjà commencé tous les parcours disponibles.
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
