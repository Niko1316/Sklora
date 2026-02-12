import AdminLayout from "@/components/layout/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  Layers,
  FileText,
  HelpCircle,
  TrendingUp,
  Bell,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Link } from "wouter";

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color = "primary",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: string;
  color?: string;
}) {
  return (
    <Card className="dashboard-card">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {trend && (
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-${color}/10`}>
            <Icon className={`h-6 w-6 text-${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = trpc.admin.getStats.useQuery();
  const { data: alerts } = trpc.admin.getUnreadAlerts.useQuery();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading">Tableau de bord</h1>
            <p className="text-muted-foreground mt-1">
              Vue d'ensemble de votre plateforme d'apprentissage
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/parcours/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Nouveau parcours
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              label="Utilisateurs"
              value={stats?.totalUsers || 0}
              trend="+12% ce mois"
              color="primary"
            />
            <StatCard
              icon={BookOpen}
              label="Parcours"
              value={stats?.totalParcours || 0}
              color="accent"
            />
            <StatCard
              icon={FileText}
              label="Leçons"
              value={stats?.totalLessons || 0}
              color="success"
            />
            <StatCard
              icon={HelpCircle}
              label="Quiz"
              value={stats?.totalQuizzes || 0}
              color="warning"
            />
          </div>
        )}

        {/* Quick Actions & Alerts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>Gérez votre contenu facilement</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Link href="/admin/parcours/new">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <BookOpen className="h-6 w-6" />
                  <span>Nouveau parcours</span>
                </Button>
              </Link>
              <Link href="/admin/modules/new">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <Layers className="h-6 w-6" />
                  <span>Nouveau module</span>
                </Button>
              </Link>
              <Link href="/admin/lessons/new">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <FileText className="h-6 w-6" />
                  <span>Nouvelle leçon</span>
                </Button>
              </Link>
              <Link href="/admin/quizzes/new">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <HelpCircle className="h-6 w-6" />
                  <span>Nouveau quiz</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alertes récentes
                </CardTitle>
                <CardDescription>
                  {alerts?.length || 0} alertes non lues
                </CardDescription>
              </div>
              <Link href="/admin/alerts">
                <Button variant="ghost" size="sm" className="gap-1">
                  Voir tout <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {alerts && alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <Badge
                        variant={
                          alert.priority === "high"
                            ? "destructive"
                            : alert.priority === "medium"
                            ? "default"
                            : "secondary"
                        }
                        className="shrink-0"
                      >
                        {alert.priority === "high" ? "Urgent" :
                         alert.priority === "medium" ? "Important" : "Info"}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{alert.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Aucune alerte récente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Content Overview */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Parcours */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Parcours</CardTitle>
              <Link href="/admin/parcours">
                <Button variant="ghost" size="sm">Gérer</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Publiés</span>
                  <span className="font-medium">{stats?.totalParcours || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Brouillons</span>
                  <span className="font-medium">
                    0
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modules */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Modules</CardTitle>
              <Link href="/admin/modules">
                <Button variant="ghost" size="sm">Gérer</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium">{stats?.totalModules || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Publiés</span>
                  <span className="font-medium">{stats?.totalModules || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Utilisateurs</CardTitle>
              <Link href="/admin/users">
                <Button variant="ghost" size="sm">Gérer</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Étudiants</span>
                  <span className="font-medium">{stats?.totalUsers || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Admins</span>
                  <span className="font-medium">-</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
