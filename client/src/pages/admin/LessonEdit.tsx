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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Loader2, Bold, Italic, List, Link as LinkIcon, Image, Code } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export default function AdminLessonEdit({ lessonId }: { lessonId?: number }) {
  const [, setLocation] = useLocation();
  const isEditing = !!lessonId;
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const { data: lesson, isLoading } = trpc.lesson.adminGet.useQuery(
    { id: lessonId! },
    { enabled: isEditing }
  );

  const { data: modulesList } = trpc.module.adminList.useQuery();

  const [formData, setFormData] = useState({
    moduleId: 0,
    title: "",
    contentHtml: "",
    contentMarkdown: "",
    videoUrl: "",
    duration: 10,
    xpReward: 20,
    orderIndex: 0,
    isFree: false,
    isPublished: false,
  });

  useEffect(() => {
    if (lesson) {
      setFormData({
        moduleId: lesson.moduleId,
        title: lesson.title,
        contentHtml: lesson.contentHtml || "",
        contentMarkdown: lesson.contentMarkdown || "",
        videoUrl: lesson.videoUrl || "",
        duration: lesson.duration,
        xpReward: lesson.xpReward,
        orderIndex: lesson.orderIndex,
        isFree: lesson.isFree,
        isPublished: lesson.isPublished,
      });
    }
  }, [lesson]);

  // Get moduleId from URL if creating new
  useEffect(() => {
    if (!isEditing) {
      const params = new URLSearchParams(window.location.search);
      const moduleId = params.get("moduleId");
      if (moduleId) {
        setFormData((prev) => ({ ...prev, moduleId: parseInt(moduleId) }));
      }
    }
  }, [isEditing]);

  const createMutation = trpc.lesson.create.useMutation({
    onSuccess: (data) => {
      toast.success("Leçon créée avec succès");
      setLocation(`/admin/lessons/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la création");
    },
  });

  const updateMutation = trpc.lesson.update.useMutation({
    onSuccess: () => {
      toast.success("Leçon mise à jour");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.moduleId) {
      toast.error("Le titre et le module sont requis");
      return;
    }

    if (isEditing) {
      await updateMutation.mutateAsync({ id: lessonId!, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  // Simple formatting helpers
  const insertFormat = (before: string, after: string = before) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.contentMarkdown.substring(start, end);
    const newText =
      formData.contentMarkdown.substring(0, start) +
      before +
      selectedText +
      after +
      formData.contentMarkdown.substring(end);

    setFormData((prev) => ({ ...prev, contentMarkdown: newText }));

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
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
            <Link href="/admin/lessons">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">
                {isEditing ? "Modifier la leçon" : "Nouvelle leçon"}
              </h1>
              <p className="text-muted-foreground">
                {isEditing ? `ID: ${lessonId}` : "Créez une nouvelle leçon"}
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
                  <Label htmlFor="moduleId">Module *</Label>
                  <Select
                    value={formData.moduleId.toString()}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, moduleId: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un module" />
                    </SelectTrigger>
                    <SelectContent>
                      {modulesList?.map((m) => (
                        <SelectItem key={m.id} value={m.id.toString()}>
                          {m.title}
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
                    placeholder="Ex: Introduction aux variables"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoUrl">URL de la vidéo (optionnel)</Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Contenu de la leçon</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="edit">
                  <TabsList className="mb-4">
                    <TabsTrigger value="edit">Éditer</TabsTrigger>
                    <TabsTrigger value="preview">Aperçu</TabsTrigger>
                  </TabsList>

                  <TabsContent value="edit">
                    {/* Toolbar */}
                    <div className="flex gap-1 mb-2 p-2 border rounded-t-lg bg-muted/50">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormat("**", "**")}
                        title="Gras"
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormat("*", "*")}
                        title="Italique"
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormat("\n- ")}
                        title="Liste"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormat("[", "](url)")}
                        title="Lien"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormat("![alt](", ")")}
                        title="Image"
                      >
                        <Image className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormat("`", "`")}
                        title="Code"
                      >
                        <Code className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      ref={contentRef}
                      value={formData.contentMarkdown}
                      onChange={(e) => setFormData((prev) => ({ ...prev, contentMarkdown: e.target.value }))}
                      placeholder="Écrivez le contenu de votre leçon en Markdown..."
                      className="min-h-[400px] font-mono text-sm rounded-t-none"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Utilisez la syntaxe Markdown pour formater votre contenu.
                    </p>
                  </TabsContent>

                  <TabsContent value="preview">
                    <div className="min-h-[400px] p-4 border rounded-lg prose prose-sm max-w-none dark:prose-invert">
                      {formData.contentMarkdown ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: formData.contentMarkdown
                              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                              .replace(/\*(.*?)\*/g, "<em>$1</em>")
                              .replace(/`(.*?)`/g, "<code>$1</code>")
                              .replace(/\n/g, "<br />"),
                          }}
                        />
                      ) : (
                        <p className="text-muted-foreground">Aucun contenu à afficher</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
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
                  <Label htmlFor="duration">Durée (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        duration: parseInt(e.target.value) || 0,
                      }))
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

            <Card>
              <CardHeader>
                <CardTitle>Quiz associé</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Associez un quiz à cette leçon pour évaluer les apprenants.
                </p>
                <Link href={`/admin/quizzes/new?lessonId=${lessonId}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Créer un quiz
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
