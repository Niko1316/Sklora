import AdminLayout from "@/components/layout/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function AdminModuleEdit({ moduleId }: { moduleId?: number }) {
  const [, setLocation] = useLocation();
  const isEditing = !!moduleId;

  const { data: module, isLoading } = trpc.module.adminGet.useQuery(
    { id: moduleId! },
    { enabled: isEditing }
  );

  const { data: parcoursList } = trpc.parcours.adminList.useQuery();

  const [formData, setFormData] = useState({
    parcoursId: 0,
    title: "",
    code: "",
    description: "",
    imageUrl: "",
    hours: 0,
    xpReward: 50,
    orderIndex: 0,
    prerequisiteModuleId: undefined as number | undefined,
    isFree: false,
    isPublished: false,
  });

  useEffect(() => {
    if (module) {
      setFormData({
        parcoursId: module.parcoursId,
        title: module.title,
        code: module.code || "",
        description: module.description || "",
        imageUrl: module.imageUrl || "",
        hours: module.hours,
        xpReward: module.xpReward,
        orderIndex: module.orderIndex,
        prerequisiteModuleId: module.prerequisiteModuleId ?? undefined,
        isFree: module.isFree,
        isPublished: module.isPublished,
      });
    }
  }, [module]);

  // Get parcoursId from URL if creating new
  useEffect(() => {
    if (!isEditing) {
      const params = new URLSearchParams(window.location.search);
      const parcoursId = params.get("parcoursId");
      if (parcoursId) {
        setFormData((prev) => ({ ...prev, parcoursId: parseInt(parcoursId) }));
      }
    }
  }, [isEditing]);

  const createMutation = trpc.module.create.useMutation({
    onSuccess: (data) => {
      toast.success("Module créé avec succès");
      setLocation(`/admin/modules/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la création");
    },
  });

  const updateMutation = trpc.module.update.useMutation({
    onSuccess: () => {
      toast.success("Module mis à jour");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.parcoursId) {
      toast.error("Le titre et le parcours sont requis");
      return;
    }

    if (isEditing) {
      await updateMutation.mutateAsync({ id: moduleId!, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEditing && isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/modules">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">
                {isEditing ? "Modifier le module" : "Nouveau module"}
              </h1>
              <p className="text-muted-foreground">
                {isEditing ? `ID: ${moduleId}` : "Créez un nouveau module"}
              </p>
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEditing ? "Enregistrer" : "Créer"}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="parcoursId">Parcours *</Label>
                  <Select
                    value={formData.parcoursId.toString()}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, parcoursId: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un parcours" />
                    </SelectTrigger>
                    <SelectContent>
                      {parcoursList?.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Les bases du HTML"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">Code (optionnel)</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                    placeholder="Ex: MOD-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Décrivez ce module..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL de l'image</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isPublished">Publié</Label>
                  <Switch
                    id="isPublished"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isPublished: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="isFree">Gratuit</Label>
                  <Switch
                    id="isFree"
                    checked={formData.isFree}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isFree: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Paramètres</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hours">Durée (heures)</Label>
                  <Input
                    id="hours"
                    type="number"
                    value={formData.hours}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, hours: parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="xpReward">XP à gagner</Label>
                  <Input
                    id="xpReward"
                    type="number"
                    value={formData.xpReward}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, xpReward: parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orderIndex">Ordre d'affichage</Label>
                  <Input
                    id="orderIndex"
                    type="number"
                    value={formData.orderIndex}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, orderIndex: parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {isEditing && module?.lessons && (
              <Card>
                <CardHeader>
                  <CardTitle>Leçons ({module.lessons.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {module.lessons.length > 0 ? (
                    <div className="space-y-2">
                      {module.lessons.map((lesson, index) => (
                        <Link key={lesson.id} href={`/admin/lessons/${lesson.id}`}>
                          <div className="p-2 rounded hover:bg-muted cursor-pointer">
                            <p className="text-sm font-medium">
                              {index + 1}. {lesson.title}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucune leçon</p>
                  )}
                  <Link href={`/admin/lessons/new?moduleId=${moduleId}`}>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      Ajouter une leçon
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
