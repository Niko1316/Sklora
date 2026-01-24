import AdminLayout from "@/components/layout/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function AdminParcoursEdit({ parcoursId }: { parcoursId?: number }) {
  const [, setLocation] = useLocation();
  const isEditing = !!parcoursId;

  const { data: parcours, isLoading } = trpc.parcours.adminGet.useQuery(
    { id: parcoursId! },
    { enabled: isEditing }
  );

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    imageUrl: "",
    difficulty: "debutant" as "debutant" | "intermediaire" | "avance",
    isFree: false,
    isPublished: false,
    displayOrder: 0,
    xpReward: 100,
    totalHours: 0,
  });

  useEffect(() => {
    if (parcours) {
      setFormData({
        title: parcours.title,
        slug: parcours.slug,
        description: parcours.description || "",
        imageUrl: parcours.imageUrl || "",
        difficulty: parcours.difficulty,
        isFree: parcours.isFree,
        isPublished: parcours.isPublished,
        displayOrder: parcours.displayOrder,
        xpReward: parcours.xpReward,
        totalHours: parcours.totalHours,
      });
    }
  }, [parcours]);

  const createMutation = trpc.parcours.create.useMutation({
    onSuccess: (data) => {
      toast.success("Parcours créé avec succès");
      setLocation(`/admin/parcours/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la création");
    },
  });

  const updateMutation = trpc.parcours.update.useMutation({
    onSuccess: () => {
      toast.success("Parcours mis à jour");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.slug) {
      toast.error("Le titre et le slug sont requis");
      return;
    }

    if (isEditing) {
      await updateMutation.mutateAsync({ id: parcoursId!, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData((prev) => ({ ...prev, slug }));
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
            <Link href="/admin/parcours">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">
                {isEditing ? "Modifier le parcours" : "Nouveau parcours"}
              </h1>
              <p className="text-muted-foreground">
                {isEditing ? `ID: ${parcoursId}` : "Créez un nouveau parcours de formation"}
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
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Introduction au développement web"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                      placeholder="introduction-developpement-web"
                    />
                    <Button type="button" variant="outline" onClick={generateSlug}>
                      Générer
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    URL: /parcours/{formData.slug || "..."}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Décrivez ce parcours..."
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
                  {formData.imageUrl && (
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="mt-2 w-full max-w-md h-40 object-cover rounded-lg"
                    />
                  )}
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
                  <Label htmlFor="difficulty">Difficulté</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value: "debutant" | "intermediaire" | "avance") =>
                      setFormData((prev) => ({ ...prev, difficulty: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debutant">Débutant</SelectItem>
                      <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                      <SelectItem value="avance">Avancé</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="totalHours">Durée estimée (heures)</Label>
                  <Input
                    id="totalHours"
                    type="number"
                    value={formData.totalHours}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, totalHours: parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Ordre d'affichage</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {isEditing && parcours?.modules && (
              <Card>
                <CardHeader>
                  <CardTitle>Modules ({parcours.modules.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {parcours.modules.length > 0 ? (
                    <div className="space-y-2">
                      {parcours.modules.map((module, index) => (
                        <Link key={module.id} href={`/admin/modules/${module.id}`}>
                          <div className="p-2 rounded hover:bg-muted cursor-pointer">
                            <p className="text-sm font-medium">
                              {index + 1}. {module.title}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun module</p>
                  )}
                  <Link href={`/admin/modules/new?parcoursId=${parcoursId}`}>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      Ajouter un module
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
