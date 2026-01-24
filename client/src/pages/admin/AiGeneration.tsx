import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Sparkles, BookOpen, FileQuestion, Loader2, Check, X, Eye, Wand2 } from "lucide-react";
import { Streamdown } from "streamdown";

export default function AiGeneration() {
  const [activeTab, setActiveTab] = useState("generate-lesson");
  
  // Lesson generation state
  const [lessonForm, setLessonForm] = useState({
    moduleId: "",
    title: "",
    topic: "",
    difficulty: "facile" as "facile" | "moyen" | "difficile",
    duration: 10,
  });
  const [generatedLesson, setGeneratedLesson] = useState<{
    id: number;
    content: string;
    title: string;
    moduleId: number;
  } | null>(null);

  // Quiz generation state
  const [quizForm, setQuizForm] = useState({
    lessonId: "",
    questionCount: 5,
  });
  const [generatedQuiz, setGeneratedQuiz] = useState<{
    id: number;
    content: string;
    parsedQuiz: any;
    lessonId: number;
  } | null>(null);

  // Queries
  const { data: modules } = trpc.module.adminList.useQuery();
  const { data: lessons } = trpc.lesson.adminList.useQuery();
  const { data: pendingContent, refetch: refetchPending } = trpc.admin.getPendingAiContent.useQuery();

  // Mutations
  const generateLessonMutation = trpc.admin.generateLessonContent.useMutation({
    onSuccess: (data) => {
      setGeneratedLesson(data);
      toast.success("Leçon générée avec succès !");
      refetchPending();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la génération");
    },
  });

  const generateQuizMutation = trpc.admin.generateQuizFromLesson.useMutation({
    onSuccess: (data) => {
      setGeneratedQuiz(data);
      toast.success("Quiz généré avec succès !");
      refetchPending();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la génération");
    },
  });

  const applyLessonMutation = trpc.admin.applyGeneratedLesson.useMutation({
    onSuccess: () => {
      toast.success("Leçon créée avec succès !");
      setGeneratedLesson(null);
      setLessonForm({ moduleId: "", title: "", topic: "", difficulty: "facile", duration: 10 });
      refetchPending();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la création");
    },
  });

  const applyQuizMutation = trpc.admin.applyGeneratedQuiz.useMutation({
    onSuccess: () => {
      toast.success("Quiz créé avec succès !");
      setGeneratedQuiz(null);
      setQuizForm({ lessonId: "", questionCount: 5 });
      refetchPending();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la création");
    },
  });

  const rejectMutation = trpc.admin.rejectAiContent.useMutation({
    onSuccess: () => {
      toast.success("Contenu rejeté");
      setGeneratedLesson(null);
      setGeneratedQuiz(null);
      refetchPending();
    },
  });

  const handleGenerateLesson = () => {
    if (!lessonForm.moduleId || !lessonForm.title || !lessonForm.topic) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    generateLessonMutation.mutate({
      moduleId: parseInt(lessonForm.moduleId),
      title: lessonForm.title,
      topic: lessonForm.topic,
      difficulty: lessonForm.difficulty,
      duration: lessonForm.duration,
    });
  };

  const handleGenerateQuiz = () => {
    if (!quizForm.lessonId) {
      toast.error("Veuillez sélectionner une leçon");
      return;
    }
    generateQuizMutation.mutate({
      lessonId: parseInt(quizForm.lessonId),
      questionCount: quizForm.questionCount,
    });
  };

  const handleApplyLesson = () => {
    if (!generatedLesson) return;
    applyLessonMutation.mutate({
      aiContentId: generatedLesson.id,
      title: lessonForm.title,
      content: generatedLesson.content,
      moduleId: generatedLesson.moduleId,
      duration: lessonForm.duration,
      difficulty: lessonForm.difficulty,
    });
  };

  const handleApplyQuiz = () => {
    if (!generatedQuiz || !generatedQuiz.parsedQuiz) {
      toast.error("Le quiz n'a pas pu être analysé correctement");
      return;
    }
    applyQuizMutation.mutate({
      aiContentId: generatedQuiz.id,
      lessonId: generatedQuiz.lessonId,
      quizData: generatedQuiz.parsedQuiz,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Génération IA de contenu
          </h1>
          <p className="text-muted-foreground mt-2">
            Utilisez l'intelligence artificielle pour générer automatiquement des leçons et des quiz.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate-lesson" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Générer une leçon
            </TabsTrigger>
            <TabsTrigger value="generate-quiz" className="gap-2">
              <FileQuestion className="h-4 w-4" />
              Générer un quiz
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              <Eye className="h-4 w-4" />
              En attente ({pendingContent?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Generate Lesson Tab */}
          <TabsContent value="generate-lesson" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres de la leçon</CardTitle>
                  <CardDescription>
                    Définissez les paramètres pour générer une nouvelle leçon
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="module">Module *</Label>
                    <Select
                      value={lessonForm.moduleId}
                      onValueChange={(value) => setLessonForm({ ...lessonForm, moduleId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un module" />
                      </SelectTrigger>
                      <SelectContent>
                        {modules?.map((module) => (
                          <SelectItem key={module.id} value={module.id.toString()}>
                            {module.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Titre de la leçon *</Label>
                    <Input
                      id="title"
                      value={lessonForm.title}
                      onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                      placeholder="Ex: Introduction au marketing digital"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topic">Sujet / Description *</Label>
                    <Textarea
                      id="topic"
                      value={lessonForm.topic}
                      onChange={(e) => setLessonForm({ ...lessonForm, topic: e.target.value })}
                      placeholder="Décrivez le sujet de la leçon en détail..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulté</Label>
                      <Select
                        value={lessonForm.difficulty}
                        onValueChange={(value: "facile" | "moyen" | "difficile") => 
                          setLessonForm({ ...lessonForm, difficulty: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="facile">Facile</SelectItem>
                          <SelectItem value="moyen">Moyen</SelectItem>
                          <SelectItem value="difficile">Difficile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Durée (min)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min={5}
                        max={60}
                        value={lessonForm.duration}
                        onChange={(e) => setLessonForm({ ...lessonForm, duration: parseInt(e.target.value) || 10 })}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateLesson}
                    disabled={generateLessonMutation.isPending}
                    className="w-full"
                  >
                    {generateLessonMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Générer la leçon
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Aperçu du contenu généré</CardTitle>
                  <CardDescription>
                    Vérifiez et modifiez le contenu avant de l'appliquer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedLesson ? (
                    <div className="space-y-4">
                      <ScrollArea className="h-[400px] rounded-md border p-4">
                        <Streamdown>{generatedLesson.content}</Streamdown>
                      </ScrollArea>
                      <div className="flex gap-2">
                        <Button onClick={handleApplyLesson} disabled={applyLessonMutation.isPending} className="flex-1">
                          <Check className="mr-2 h-4 w-4" />
                          Créer la leçon
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => rejectMutation.mutate({ id: generatedLesson.id })}
                          disabled={rejectMutation.isPending}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Le contenu généré apparaîtra ici</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Generate Quiz Tab */}
          <TabsContent value="generate-quiz" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres du quiz</CardTitle>
                  <CardDescription>
                    Générez un quiz basé sur le contenu d'une leçon existante
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lesson">Leçon source *</Label>
                    <Select
                      value={quizForm.lessonId}
                      onValueChange={(value) => setQuizForm({ ...quizForm, lessonId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une leçon" />
                      </SelectTrigger>
                      <SelectContent>
                        {lessons?.map((lesson) => (
                          <SelectItem key={lesson.id} value={lesson.id.toString()}>
                            {lesson.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="questionCount">Nombre de questions</Label>
                    <Input
                      id="questionCount"
                      type="number"
                      min={3}
                      max={20}
                      value={quizForm.questionCount}
                      onChange={(e) => setQuizForm({ ...quizForm, questionCount: parseInt(e.target.value) || 5 })}
                    />
                    <p className="text-xs text-muted-foreground">Entre 3 et 20 questions</p>
                  </div>

                  <Button
                    onClick={handleGenerateQuiz}
                    disabled={generateQuizMutation.isPending}
                    className="w-full"
                  >
                    {generateQuizMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Générer le quiz
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Aperçu du quiz généré</CardTitle>
                  <CardDescription>
                    Vérifiez les questions avant de créer le quiz
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedQuiz ? (
                    <div className="space-y-4">
                      <ScrollArea className="h-[400px] rounded-md border p-4">
                        {generatedQuiz.parsedQuiz ? (
                          <div className="space-y-4">
                            <h3 className="font-semibold">{generatedQuiz.parsedQuiz.title}</h3>
                            <p className="text-sm text-muted-foreground">{generatedQuiz.parsedQuiz.description}</p>
                            <Separator />
                            {generatedQuiz.parsedQuiz.questions?.map((q: any, i: number) => (
                              <div key={i} className="space-y-2 p-3 bg-muted/50 rounded-lg">
                                <p className="font-medium">Q{i + 1}: {q.questionText}</p>
                                <ul className="space-y-1 ml-4">
                                  {q.answers?.map((a: any, j: number) => (
                                    <li key={j} className={`text-sm ${a.isCorrect ? "text-success font-medium" : ""}`}>
                                      {a.isCorrect ? "✓" : "○"} {a.text}
                                    </li>
                                  ))}
                                </ul>
                                {q.explanation && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    💡 {q.explanation}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-muted-foreground">
                            <p>Impossible d'analyser le quiz. Contenu brut :</p>
                            <pre className="text-xs mt-2 whitespace-pre-wrap">{generatedQuiz.content}</pre>
                          </div>
                        )}
                      </ScrollArea>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleApplyQuiz}
                          disabled={applyQuizMutation.isPending || !generatedQuiz.parsedQuiz}
                          className="flex-1"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Créer le quiz
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => rejectMutation.mutate({ id: generatedQuiz.id })}
                          disabled={rejectMutation.isPending}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <FileQuestion className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Le quiz généré apparaîtra ici</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pending Content Tab */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Contenu en attente de validation</CardTitle>
                <CardDescription>
                  Contenu généré par l'IA en attente d'approbation ou de rejet
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingContent && pendingContent.length > 0 ? (
                  <div className="space-y-4">
                    {pendingContent.map((content) => (
                      <Card key={content.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant={content.contentType === "lesson" ? "default" : "secondary"}>
                                {content.contentType === "lesson" ? "Leçon" : "Quiz"}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(content.createdAt).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                            <p className="text-sm mt-2 line-clamp-2">{content.prompt.slice(0, 200)}...</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectMutation.mutate({ id: content.id })}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Check className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun contenu en attente</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
