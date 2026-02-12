import AdminLayout from "@/components/layout/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Save, Loader2, Bold, Italic, List, Link as LinkIcon,
  Image, Code, Upload, FileJson, Trash2, Plus, BookOpen, Target,
  GraduationCap, Lightbulb, ClipboardPaste, CheckCircle2
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface VocabularyItem {
  terme: string;
  definition: string;
}

interface Section {
  titre: string;
  contenu_markdown: string;
  points_cles: string[];
  exemple_pratique: string;
  astuce_pro: string;
}

interface ExercicePratique {
  description: string;
  materiel_requis: string[];
  etapes: string[];
}

interface JsonLesson {
  titre: string;
  objectifs_apprentissage: string[];
  prerequis: string[];
  vocabulaire_cle: VocabularyItem[];
  contenu_principal: {
    introduction: string;
    sections: Section[];
  };
  resume: string;
  exercice_pratique: ExercicePratique;
  pour_aller_plus_loin: string[];
  xp_suggere?: number;
}

function jsonToMarkdown(data: JsonLesson): string {
  let md = `# ${data.titre}\n\n`;

  if (data.objectifs_apprentissage?.length) {
    md += `## 🎯 Objectifs d'apprentissage\n\n`;
    data.objectifs_apprentissage.forEach((o) => {
      md += `- ${o}\n`;
    });
    md += "\n";
  }

  if (data.prerequis?.length) {
    md += `## 📋 Prérequis\n\n`;
    data.prerequis.forEach((p) => {
      md += `- ${p}\n`;
    });
    md += "\n";
  }

  if (data.vocabulaire_cle?.length) {
    md += `## 📖 Vocabulaire clé\n\n`;
    data.vocabulaire_cle.forEach((v) => {
      md += `**${v.terme}** : ${v.definition}\n\n`;
    });
  }

  if (data.contenu_principal) {
    if (data.contenu_principal.introduction) {
      md += `## Introduction\n\n${data.contenu_principal.introduction}\n\n`;
    }
    if (data.contenu_principal.sections) {
      data.contenu_principal.sections.forEach((section) => {
        md += `## ${section.titre}\n\n`;
        md += `${section.contenu_markdown}\n\n`;
        if (section.points_cles?.length) {
          md += `### 📌 Points clés\n\n`;
          section.points_cles.forEach((p) => {
            md += `- ${p}\n`;
          });
          md += "\n";
        }
        if (section.exemple_pratique) {
          md += `### 💡 Exemple pratique\n\n${section.exemple_pratique}\n\n`;
        }
        if (section.astuce_pro) {
          md += `### ⭐ Astuce pro\n\n${section.astuce_pro}\n\n`;
        }
      });
    }
  }

  if (data.resume) {
    md += `## 📝 Résumé\n\n${data.resume}\n\n`;
  }

  if (data.exercice_pratique) {
    md += `## 🔧 Exercice pratique\n\n`;
    md += `**${data.exercice_pratique.description}**\n\n`;
    if (data.exercice_pratique.materiel_requis?.length) {
      md += `**Matériel requis :**\n`;
      data.exercice_pratique.materiel_requis.forEach((m) => {
        md += `- ${m}\n`;
      });
      md += "\n";
    }
    if (data.exercice_pratique.etapes?.length) {
      md += `**Étapes :**\n`;
      data.exercice_pratique.etapes.forEach((e, i) => {
        md += `${i + 1}. ${e}\n`;
      });
      md += "\n";
    }
  }

  if (data.pour_aller_plus_loin?.length) {
    md += `## 📚 Pour aller plus loin\n\n`;
    data.pour_aller_plus_loin.forEach((r) => {
      md += `- ${r}\n`;
    });
  }

  return md;
}

export default function AdminLessonEdit({ lessonId }: { lessonId?: number }) {
  const [, setLocation] = useLocation();
  const isEditing = !!lessonId;
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Structured JSON fields
  const [jsonData, setJsonData] = useState<JsonLesson | null>(null);
  const [objectifs, setObjectifs] = useState<string[]>([]);
  const [prerequis, setPrerequisList] = useState<string[]>([]);
  const [vocabulaire, setVocabulaire] = useState<VocabularyItem[]>([]);
  const [resume, setResume] = useState("");
  const [exercice, setExercice] = useState<ExercicePratique | null>(null);
  const [pourAllerPlusLoin, setPourAllerPlusLoin] = useState<string[]>([]);
  const [jsonImported, setJsonImported] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteContent, setPasteContent] = useState("");

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

      // Load structured data if available
      if (lesson.contentJson) {
        try {
          const parsed = typeof lesson.contentJson === "string"
            ? JSON.parse(lesson.contentJson)
            : lesson.contentJson;
          setJsonData(parsed);
          setJsonImported(true);
        } catch { /* ignore */ }
      }
      if (lesson.objectifsApprentissage) {
        const obj = typeof lesson.objectifsApprentissage === "string"
          ? JSON.parse(lesson.objectifsApprentissage)
          : lesson.objectifsApprentissage;
        setObjectifs(Array.isArray(obj) ? obj : []);
      }
      if (lesson.prerequis) {
        const pre = typeof lesson.prerequis === "string"
          ? JSON.parse(lesson.prerequis)
          : lesson.prerequis;
        setPrerequisList(Array.isArray(pre) ? pre : []);
      }
      if (lesson.vocabulaireCle) {
        const voc = typeof lesson.vocabulaireCle === "string"
          ? JSON.parse(lesson.vocabulaireCle)
          : lesson.vocabulaireCle;
        setVocabulaire(Array.isArray(voc) ? voc : []);
      }
      if (lesson.resume) setResume(lesson.resume);
      if (lesson.exercicePratique) {
        const ex = typeof lesson.exercicePratique === "string"
          ? JSON.parse(lesson.exercicePratique)
          : lesson.exercicePratique;
        setExercice(ex);
      }
      if (lesson.pourAllerPlusLoin) {
        const pal = typeof lesson.pourAllerPlusLoin === "string"
          ? JSON.parse(lesson.pourAllerPlusLoin)
          : lesson.pourAllerPlusLoin;
        setPourAllerPlusLoin(Array.isArray(pal) ? pal : []);
      }
    }
  }, [lesson]);

  useEffect(() => {
    if (!isEditing) {
      const params = new URLSearchParams(window.location.search);
      const moduleId = params.get("moduleId");
      if (moduleId) {
        setFormData((prev) => ({ ...prev, moduleId: parseInt(moduleId) }));
      }
    }
  }, [isEditing]);

  const processJsonImport = (jsonStr: string) => {
    try {
      const data: JsonLesson = JSON.parse(jsonStr);

      if (!data.titre && !data.contenu_principal) {
        toast.error("Le JSON ne semble pas être un format de leçon valide");
        return;
      }

      setJsonData(data);
      setJsonImported(true);

      // Populate form fields from JSON
      if (data.titre) {
        setFormData((prev) => ({ ...prev, title: data.titre }));
      }
      if (data.xp_suggere) {
        setFormData((prev) => ({ ...prev, xpReward: data.xp_suggere! }));
      }
      if (data.objectifs_apprentissage) {
        setObjectifs(data.objectifs_apprentissage);
      }
      if (data.prerequis) {
        setPrerequisList(data.prerequis);
      }
      if (data.vocabulaire_cle) {
        setVocabulaire(data.vocabulaire_cle);
      }
      if (data.resume) {
        setResume(data.resume);
      }
      if (data.exercice_pratique) {
        setExercice(data.exercice_pratique);
      }
      if (data.pour_aller_plus_loin) {
        setPourAllerPlusLoin(data.pour_aller_plus_loin);
      }

      // Generate Markdown from JSON
      const markdown = jsonToMarkdown(data);
      setFormData((prev) => ({ ...prev, contentMarkdown: markdown }));

      toast.success("JSON importé avec succès ! Le contenu a été généré automatiquement.");
    } catch (err) {
      toast.error("Erreur de parsing JSON. Vérifiez le format du fichier.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      toast.error("Seuls les fichiers .json sont acceptés");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processJsonImport(content);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handlePasteImport = () => {
    if (!pasteContent.trim()) {
      toast.error("Collez du contenu JSON d'abord");
      return;
    }
    processJsonImport(pasteContent);
    setPasteMode(false);
    setPasteContent("");
  };

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

    const payload = {
      ...formData,
      contentJson: jsonData ? JSON.stringify(jsonData) : undefined,
      objectifsApprentissage: objectifs.length ? JSON.stringify(objectifs) : undefined,
      prerequis: prerequis.length ? JSON.stringify(prerequis) : undefined,
      vocabulaireCle: vocabulaire.length ? JSON.stringify(vocabulaire) : undefined,
      contenuPrincipal: jsonData?.contenu_principal ? JSON.stringify(jsonData.contenu_principal) : undefined,
      resume: resume || undefined,
      exercicePratique: exercice ? JSON.stringify(exercice) : undefined,
      pourAllerPlusLoin: pourAllerPlusLoin.length ? JSON.stringify(pourAllerPlusLoin) : undefined,
    };

    if (isEditing) {
      await updateMutation.mutateAsync({ id: lessonId!, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const insertFormat = (before: string, after: string = before) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.contentMarkdown.substring(start, end);
    const newText =
      formData.contentMarkdown.substring(0, start) +
      before + selectedText + after +
      formData.contentMarkdown.substring(end);
    setFormData((prev) => ({ ...prev, contentMarkdown: newText }));
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
              <Button variant="ghost" size="icon" type="button">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold font-heading">
                {isEditing ? "Modifier la leçon" : "Nouvelle leçon"}
              </h1>
              <p className="text-muted-foreground">
                {isEditing ? `ID: ${lessonId}` : "Créez une nouvelle leçon ou importez un fichier JSON"}
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

        {/* JSON Import Section */}
        <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileJson className="h-5 w-5 text-primary" />
              Importer une leçon depuis un fichier JSON
            </CardTitle>
            <CardDescription>
              Chargez un fichier JSON structuré ou collez le contenu directement. Le contenu sera automatiquement converti en Markdown.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Charger un fichier .json
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasteMode(!pasteMode)}
                className="gap-2"
              >
                <ClipboardPaste className="h-4 w-4" />
                Coller du JSON
              </Button>
              {jsonImported && (
                <Badge variant="default" className="gap-1 py-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  JSON importé
                </Badge>
              )}
            </div>

            {pasteMode && (
              <div className="mt-4 space-y-3">
                <Textarea
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder='Collez votre JSON ici... { "titre": "...", "objectifs_apprentissage": [...], ... }'
                  className="min-h-[200px] font-mono text-xs"
                />
                <div className="flex gap-2">
                  <Button type="button" onClick={handlePasteImport} className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Importer
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => { setPasteMode(false); setPasteContent(""); }}>
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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
                    value={formData.moduleId ? formData.moduleId.toString() : undefined}
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

            {/* Content Editor with Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Contenu de la leçon</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="edit">
                  <TabsList className="mb-4">
                    <TabsTrigger value="edit">Éditer (Markdown)</TabsTrigger>
                    <TabsTrigger value="structured">Données structurées</TabsTrigger>
                    <TabsTrigger value="preview">Aperçu</TabsTrigger>
                  </TabsList>

                  <TabsContent value="edit">
                    {/* Toolbar */}
                    <div className="flex gap-1 mb-2 p-2 border rounded-t-lg bg-muted/50">
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertFormat("**", "**")} title="Gras">
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertFormat("*", "*")} title="Italique">
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertFormat("\n- ")} title="Liste">
                        <List className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertFormat("[", "](url)")} title="Lien">
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertFormat("![alt](", ")")} title="Image">
                        <Image className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertFormat("`", "`")} title="Code">
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
                      Supporte la syntaxe Markdown complète. Importez un JSON pour pré-remplir automatiquement.
                    </p>
                  </TabsContent>

                  <TabsContent value="structured" className="space-y-6">
                    {/* Objectifs */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        <Label className="text-base font-semibold">Objectifs d'apprentissage</Label>
                      </div>
                      {objectifs.map((obj, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            value={obj}
                            onChange={(e) => {
                              const newObj = [...objectifs];
                              newObj[i] = e.target.value;
                              setObjectifs(newObj);
                            }}
                            placeholder="Objectif d'apprentissage..."
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => setObjectifs(objectifs.filter((_, idx) => idx !== i))}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => setObjectifs([...objectifs, ""])} className="gap-1">
                        <Plus className="h-3 w-3" /> Ajouter un objectif
                      </Button>
                    </div>

                    <Separator />

                    {/* Prérequis */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <Label className="text-base font-semibold">Prérequis</Label>
                      </div>
                      {prerequis.map((pre, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            value={pre}
                            onChange={(e) => {
                              const newPre = [...prerequis];
                              newPre[i] = e.target.value;
                              setPrerequisList(newPre);
                            }}
                            placeholder="Prérequis..."
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => setPrerequisList(prerequis.filter((_, idx) => idx !== i))}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => setPrerequisList([...prerequis, ""])} className="gap-1">
                        <Plus className="h-3 w-3" /> Ajouter un prérequis
                      </Button>
                    </div>

                    <Separator />

                    {/* Vocabulaire clé */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <Label className="text-base font-semibold">Vocabulaire clé</Label>
                      </div>
                      {vocabulaire.map((v, i) => (
                        <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
                          <Input
                            value={v.terme}
                            onChange={(e) => {
                              const newVoc = [...vocabulaire];
                              newVoc[i] = { ...newVoc[i], terme: e.target.value };
                              setVocabulaire(newVoc);
                            }}
                            placeholder="Terme"
                          />
                          <Input
                            value={v.definition}
                            onChange={(e) => {
                              const newVoc = [...vocabulaire];
                              newVoc[i] = { ...newVoc[i], definition: e.target.value };
                              setVocabulaire(newVoc);
                            }}
                            placeholder="Définition"
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => setVocabulaire(vocabulaire.filter((_, idx) => idx !== i))}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => setVocabulaire([...vocabulaire, { terme: "", definition: "" }])} className="gap-1">
                        <Plus className="h-3 w-3" /> Ajouter un terme
                      </Button>
                    </div>

                    <Separator />

                    {/* Résumé */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        <Label className="text-base font-semibold">Résumé</Label>
                      </div>
                      <Textarea
                        value={resume}
                        onChange={(e) => setResume(e.target.value)}
                        placeholder="Résumé de la leçon..."
                        className="min-h-[100px]"
                      />
                    </div>

                    <Separator />

                    {/* Pour aller plus loin */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Pour aller plus loin</Label>
                      {pourAllerPlusLoin.map((r, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            value={r}
                            onChange={(e) => {
                              const newR = [...pourAllerPlusLoin];
                              newR[i] = e.target.value;
                              setPourAllerPlusLoin(newR);
                            }}
                            placeholder="Ressource complémentaire..."
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => setPourAllerPlusLoin(pourAllerPlusLoin.filter((_, idx) => idx !== i))}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => setPourAllerPlusLoin([...pourAllerPlusLoin, ""])} className="gap-1">
                        <Plus className="h-3 w-3" /> Ajouter une ressource
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="preview">
                    <div className="min-h-[400px] p-6 border rounded-lg prose prose-sm max-w-none dark:prose-invert">
                      {formData.contentMarkdown ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: formData.contentMarkdown
                              .replace(/^### (.*$)/gm, "<h3>$1</h3>")
                              .replace(/^## (.*$)/gm, "<h2>$1</h2>")
                              .replace(/^# (.*$)/gm, "<h1>$1</h1>")
                              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                              .replace(/\*(.*?)\*/g, "<em>$1</em>")
                              .replace(/`(.*?)`/g, "<code>$1</code>")
                              .replace(/^\d+\. (.*$)/gm, "<li>$1</li>")
                              .replace(/^- (.*$)/gm, "<li>$1</li>")
                              .replace(/\n\n/g, "</p><p>")
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
                <Link href={`/admin/quizzes/new?lessonId=${lessonId || ""}`}>
                  <Button variant="outline" size="sm" className="w-full" type="button">
                    Créer un quiz
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {jsonImported && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-700 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    JSON importé
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-green-600">
                    Le contenu a été importé depuis un fichier JSON structuré.
                    Vous pouvez modifier le Markdown généré ou les données structurées dans les onglets ci-dessus.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
