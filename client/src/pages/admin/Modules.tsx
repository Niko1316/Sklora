import AdminLayout from "@/components/layout/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Layers, Plus, Search, MoreHorizontal, Edit, Trash2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminModules() {
  const utils = trpc.useUtils();
  const { data: modules, isLoading } = trpc.module.adminList.useQuery();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const deleteMutation = trpc.module.delete.useMutation({
    onSuccess: () => {
      toast.success("Module supprimé");
      utils.module.adminList.invalidate();
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  const updateMutation = trpc.module.update.useMutation({
    onSuccess: () => {
      toast.success("Module mis à jour");
      utils.module.adminList.invalidate();
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });

  const filteredModules = modules?.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleTogglePublish = async (id: number, isPublished: boolean) => {
    await updateMutation.mutateAsync({ id, isPublished: !isPublished });
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync({ id: deleteId });
      setDeleteId(null);
    }
  };

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
              <h1 className="text-3xl font-bold font-heading">Modules</h1>
              <p className="text-muted-foreground mt-1">
                Gérez les modules de vos parcours
              </p>
            </div>
          </div>
          <Link href="/admin/modules/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Nouveau module
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un module..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredModules && filteredModules.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Parcours</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead>XP</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModules.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                            <Layers className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{m.title}</p>
                            {m.code && (
                              <p className="text-xs text-muted-foreground">{m.code}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        Parcours #{m.parcoursId}
                      </TableCell>
                      <TableCell>{m.hours}h</TableCell>
                      <TableCell>{m.xpReward} XP</TableCell>
                      <TableCell>
                        <Badge variant={m.isPublished ? "default" : "secondary"}>
                          {m.isPublished ? "Publié" : "Brouillon"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/modules/${m.id}`}>
                                <Edit className="h-4 w-4 mr-2" /> Modifier
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleTogglePublish(m.id, m.isPublished)}
                            >
                              {m.isPublished ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-2" /> Dépublier
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" /> Publier
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(m.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center">
                <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Aucun module</h3>
                <p className="text-muted-foreground mb-4">
                  Créez votre premier module.
                </p>
                <Link href="/admin/modules/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Créer un module
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce module ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Toutes les leçons associées seront également supprimées.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
