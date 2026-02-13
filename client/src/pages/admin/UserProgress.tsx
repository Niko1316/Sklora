import AdminLayout from "@/components/layout/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  TrendingUp,
  Clock,
  BookOpen,
  Target,
  Trophy,
  Search,
  Eye,
  Download,
  Filter,
  ChevronRight,
  Star,
  Flame,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { Link } from "wouter";
import { useState, useMemo } from "react";

function StatCard({
  title,
  value,
  icon: Icon,
  colorClass,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
  description?: string;
}) {
  return (
    <Card className="bento-card">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold font-['Lexend'] mt-1">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colorClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UserDetailDialog({ 
  userId, 
  userName, 
  open, 
  onClose 
}: { 
  userId: number; 
  userName: string;
  open: boolean; 
  onClose: () => void;
}) {
  const { data: userProgress, isLoading } = trpc.admin.getUserDetailedProgress.useQuery(
    { userId },
    { enabled: open }
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-['Lexend']">Progression de {userName}</DialogTitle>
          <DialogDescription>
            Détails de la progression dans tous les parcours
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : userProgress && userProgress.length > 0 ? (
          <div className="space-y-6">
            {userProgress.map((progress: any) => (
              <Card key={progress?.parcoursId} className="bento-card">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{progress?.parcoursTitle}</CardTitle>
                      <CardDescription>
                        {progress?.completedModules} / {progress?.totalModules} modules
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={progress?.status === "completed" ? "default" : "secondary"}
                      className={progress?.status === "completed" ? "bg-emerald-100 text-emerald-700" : ""}
                    >
                      {progress?.status === "completed" ? "Terminé" : progress?.status === "in_progress" ? "En cours" : "Non commencé"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progression globale</span>
                        <span className="font-medium">{progress?.overallProgress}%</span>
                      </div>
                      <Progress value={progress?.overallProgress || 0} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-lg font-bold">{progress?.completedLessons}</p>
                        <p className="text-xs text-muted-foreground">Leçons</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-lg font-bold">{progress?.passedQuizzes}</p>
                        <p className="text-xs text-muted-foreground">Quiz réussis</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-lg font-bold">{Math.round((progress?.totalTimeSpentMinutes || 0) / 60)}h</p>
                        <p className="text-xs text-muted-foreground">Temps passé</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-lg font-bold">{progress?.quizProgress}%</p>
                        <p className="text-xs text-muted-foreground">Quiz</p>
                      </div>
                    </div>
                    
                    {progress?.modules && progress.modules.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <h4 className="font-medium text-sm">Modules</h4>
                        {progress.modules.map((module: any) => (
                          <div key={module.moduleId} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                            <span className="flex items-center gap-2">
                              {module.status === "completed" ? (
                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                              )}
                              {module.moduleTitle}
                            </span>
                            <div className="flex items-center gap-4">
                              <span className="text-muted-foreground">{module.overallProgress}%</span>
                              <Progress value={module.overallProgress} className="w-20 h-1.5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Aucune progression enregistrée</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AdminUserProgress() {
  const { data: progressReport, isLoading } = trpc.admin.getUserProgressReport.useQuery({ limit: 100 });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("activity");
  const [selectedUser, setSelectedUser] = useState<{ id: number; name: string } | null>(null);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    if (!progressReport) return [];
    
    let filtered = progressReport.filter((user: any) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        user.userName?.toLowerCase().includes(searchLower) ||
        user.userEmail?.toLowerCase().includes(searchLower)
      );
    });
    
    // Sort
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case "activity":
          return new Date(b.lastActivity || 0).getTime() - new Date(a.lastActivity || 0).getTime();
        case "xp":
          return (b.totalXp || 0) - (a.totalXp || 0);
        case "lessons":
          return (b.completedLessons || 0) - (a.completedLessons || 0);
        case "time":
          return (b.totalTimeSpentMinutes || 0) - (a.totalTimeSpentMinutes || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [progressReport, searchQuery, sortBy]);

  // Calculate aggregated stats
  const stats = useMemo(() => {
    if (!progressReport) return null;
    
    const totalUsers = progressReport.length;
    const activeUsers = progressReport.filter((u: any) => {
      const lastActivity = new Date(u.lastActivity || 0);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return lastActivity > weekAgo;
    }).length;
    const totalLessonsCompleted = progressReport.reduce((sum: number, u: any) => sum + (u.completedLessons || 0), 0);
    const totalTimeSpent = progressReport.reduce((sum: number, u: any) => sum + (u.totalTimeSpentMinutes || 0), 0);
    const avgCompletion = totalUsers > 0 
      ? Math.round(progressReport.reduce((sum: number, u: any) => sum + (u.completedLessons || 0), 0) / totalUsers)
      : 0;
    
    return {
      totalUsers,
      activeUsers,
      totalLessonsCompleted,
      totalTimeSpent,
      avgCompletion,
    };
  }, [progressReport]);

  const exportToCSV = () => {
    if (!progressReport) return;
    
    const headers = ["Nom", "Email", "Rôle", "XP Total", "Niveau", "Série", "Parcours actifs", "Parcours terminés", "Leçons complétées", "Quiz réussis", "Temps passé (min)", "Dernière activité"];
    const rows = progressReport.map((user: any) => [
      user.userName || "",
      user.userEmail || "",
      user.role || "",
      user.totalXp || 0,
      user.currentLevel || 1,
      user.currentStreak || 0,
      user.activeParcours || 0,
      user.completedParcours || 0,
      user.completedLessons || 0,
      user.passedQuizzes || 0,
      user.totalTimeSpentMinutes || 0,
      user.lastActivity ? new Date(user.lastActivity).toLocaleDateString('fr-FR') : "",
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `progression-utilisateurs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold font-heading">Suivi de progression</h1>
              <p className="text-muted-foreground mt-1">
                Analysez la progression de tous les utilisateurs
              </p>
            </div>
          </div>
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exporter CSV
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {isLoading ? (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="bento-card">
                  <CardContent className="pt-6">
                    <Skeleton className="h-16 w-full rounded-xl" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : stats && (
            <>
              <StatCard
                title="Total utilisateurs"
                value={stats.totalUsers}
                icon={Users}
                colorClass="bg-primary/10 text-primary"
              />
              <StatCard
                title="Actifs (7j)"
                value={stats.activeUsers}
                icon={TrendingUp}
                colorClass="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                description={`${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% du total`}
              />
              <StatCard
                title="Leçons complétées"
                value={stats.totalLessonsCompleted}
                icon={BookOpen}
                colorClass="bg-purple-100 dark:bg-purple-900/30 text-purple-600"
              />
              <StatCard
                title="Temps total"
                value={`${Math.round(stats.totalTimeSpent / 60)}h`}
                icon={Clock}
                colorClass="bg-amber-100 dark:bg-amber-900/30 text-amber-600"
              />
              <StatCard
                title="Moy. leçons/user"
                value={stats.avgCompletion}
                icon={Target}
                colorClass="bg-blue-100 dark:bg-blue-900/30 text-blue-600"
              />
            </>
          )}
        </div>

        {/* Filters */}
        <Card className="bento-card">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activity">Dernière activité</SelectItem>
                  <SelectItem value="xp">XP total</SelectItem>
                  <SelectItem value="lessons">Leçons complétées</SelectItem>
                  <SelectItem value="time">Temps passé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bento-card">
          <CardHeader>
            <CardTitle className="font-['Lexend']">Progression des utilisateurs</CardTitle>
            <CardDescription>
              {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? "s" : ""} trouvé{filteredUsers.length > 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead className="text-center hidden sm:table-cell">Niveau</TableHead>
                      <TableHead className="text-center hidden md:table-cell">XP</TableHead>
                      <TableHead className="text-center hidden lg:table-cell">Série</TableHead>
                      <TableHead className="text-center hidden lg:table-cell">Parcours</TableHead>
                      <TableHead className="text-center">Leçons</TableHead>
                      <TableHead className="text-center hidden md:table-cell">Quiz</TableHead>
                      <TableHead className="text-center hidden lg:table-cell">Temps</TableHead>
                      <TableHead className="text-center hidden md:table-cell">Dernière activité</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user: any) => (
                      <TableRow key={user.userId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-medium text-primary">
                                {user.userName?.charAt(0)?.toUpperCase() || "?"}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{user.userName || "Sans nom"}</p>
                              <p className="text-xs text-muted-foreground truncate">{user.userEmail}</p>
                            </div>
                            {user.role === "admin" && (
                              <Badge variant="secondary" className="text-xs hidden sm:inline-flex">Admin</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center hidden sm:table-cell">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="h-4 w-4 text-amber-500" />
                            <span className="font-medium">{user.currentLevel || 1}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium hidden md:table-cell">{user.totalXp || 0}</TableCell>
                        <TableCell className="text-center hidden lg:table-cell">
                          {(user.currentStreak || 0) > 0 ? (
                            <div className="flex items-center justify-center gap-1">
                              <Flame className="h-4 w-4 text-orange-500" />
                              <span>{user.currentStreak}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center hidden lg:table-cell">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-emerald-600">{user.completedParcours || 0}</span>
                            <span className="text-muted-foreground">/</span>
                            <span>{(user.completedParcours || 0) + (user.activeParcours || 0)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{user.completedLessons || 0}</TableCell>
                        <TableCell className="text-center hidden md:table-cell">{user.passedQuizzes || 0}</TableCell>
                        <TableCell className="text-center hidden lg:table-cell">
                          {Math.round((user.totalTimeSpentMinutes || 0) / 60)}h
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground hidden md:table-cell">
                          {user.lastActivity
                            ? new Date(user.lastActivity).toLocaleDateString('fr-FR')
                            : "-"
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedUser({ id: user.userId, name: user.userName || "Utilisateur" })}
                            className="gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline">Détails</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Detail Dialog */}
      {selectedUser && (
        <UserDetailDialog
          userId={selectedUser.id}
          userName={selectedUser.name}
          open={!!selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </AdminLayout>
  );
}
