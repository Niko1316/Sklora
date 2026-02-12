import AdminLayout from "@/components/layout/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  UserPlus,
  Trophy,
  AlertCircle,
  Check,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function AdminAlerts() {
  const utils = trpc.useUtils();
  const { data: alerts, isLoading } = trpc.admin.getAlerts.useQuery();

  const markReadMutation = trpc.admin.markAlertRead.useMutation({
    onSuccess: () => {
      utils.admin.getAlerts.invalidate();
      utils.admin.getUnreadAlerts.invalidate();
    },
  });

  const markAllReadMutation = trpc.admin.markAllAlertsRead.useMutation({
    onSuccess: () => {
      toast.success("Toutes les alertes marquées comme lues");
      utils.admin.getAlerts.invalidate();
      utils.admin.getUnreadAlerts.invalidate();
    },
  });

  const deleteAlertMutation = trpc.admin.deleteAlert.useMutation({
    onSuccess: () => {
      toast.success("Alerte supprimée");
      utils.admin.getAlerts.invalidate();
      utils.admin.getUnreadAlerts.invalidate();
    },
  });

  const handleMarkRead = async (id: number) => {
    await markReadMutation.mutateAsync({ id });
  };

  const handleDelete = async (id: number) => {
    await deleteAlertMutation.mutateAsync({ id });
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "new_user":
        return <UserPlus className="h-5 w-5 text-primary" />;
      case "parcours_completed":
        return <Trophy className="h-5 w-5 text-gold" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      default:
        return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">Urgent</Badge>;
      case "medium":
        return <Badge variant="default">Important</Badge>;
      default:
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return d.toLocaleDateString("fr-FR");
  };

  const unreadAlerts = alerts?.filter((a) => !a.isRead) || [];
  const readAlerts = alerts?.filter((a) => a.isRead) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold font-heading">Alertes</h1>
            <p className="text-muted-foreground mt-1">
              {unreadAlerts.length} alertes non lues
            </p>
          </div>
          </div>
          {unreadAlerts.length > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="unread">
          <TabsList>
            <TabsTrigger value="unread" className="gap-2">
              Non lues
              {unreadAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {unreadAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">Toutes</TabsTrigger>
          </TabsList>

          <TabsContent value="unread" className="mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : unreadAlerts.length > 0 ? (
              <div className="space-y-4">
                {unreadAlerts.map((alert) => (
                  <Card key={alert.id} className="border-l-4 border-l-primary">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-muted">
                          {getAlertIcon(alert.alertType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{alert.title}</h3>
                            {getPriorityBadge(alert.priority)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {alert.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(alert.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkRead(alert.id)}
                            title="Marquer comme lu"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(alert.id)}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Aucune alerte non lue</h3>
                  <p className="text-muted-foreground">
                    Vous êtes à jour !
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : alerts && alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <Card
                    key={alert.id}
                    className={`${
                      !alert.isRead ? "border-l-4 border-l-primary" : "opacity-75"
                    }`}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-muted">
                          {getAlertIcon(alert.alertType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{alert.title}</h3>
                            {getPriorityBadge(alert.priority)}
                            {alert.isRead && (
                              <Badge variant="outline" className="text-xs">
                                Lu
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {alert.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(alert.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {!alert.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMarkRead(alert.id)}
                              title="Marquer comme lu"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(alert.id)}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Aucune alerte</h3>
                  <p className="text-muted-foreground">
                    Les alertes apparaîtront ici.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
