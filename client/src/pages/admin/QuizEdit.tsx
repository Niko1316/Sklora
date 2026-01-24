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
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { ArrowLeft, Save, Loader2, Plus, Trash2, GripVertical, CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface QuestionForm {
  id?: number;
  questionText: string;
  explanation: string;
  orderIndex: number;
  answers: {
    id?: number;
    answerText: string;
    isCorrect: boolean;
    orderIndex: number;
  }[];
}

export default function AdminQuizEdit({ quizId }: { quizId?: number }) {
  const [, setLocation] = useLocation();
  const isEditing = !!quizId;

  const { data: quiz, isLoading, refetch } = trpc.quiz.adminGet.useQuery(
    { id: quizId! },
    { enabled: isEditing }
  );

  const { data: modulesList } = trpc.module.adminList.useQuery();

  const [formData, setFormData] = useState({
    moduleId: 0,
    title: "",
    description: "",
    passingScore: 70,
    maxAttempts: 3,
    timeLimitMinutes: 0,
    xpReward: 30,
    showCorrectAnswers: true,
    shuffleQuestions: false,
    isPublished: false,
  });

  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [deleteQuestionId, setDeleteQuestionId] = useState<number | null>(null);

  useEffect(() => {
    if (quiz) {
      setFormData({
        moduleId: quiz.moduleId || 0,
        title: quiz.title,
        description: quiz.description || "",
        passingScore: quiz.passingScore,
        maxAttempts: quiz.maxAttempts,
        timeLimitMinutes: quiz.timeLimit || 0,
        xpReward: quiz.xpReward,
        showCorrectAnswers: quiz.showCorrectAnswers,
        shuffleQuestions: quiz.shuffleQuestions,
        isPublished: quiz.isPublished,
      });

      if (quiz.questions) {
        setQuestions(
          quiz.questions.map((q) => ({
            id: q.id,
            questionText: q.questionText,
            explanation: q.explanation || "",
            orderIndex: q.orderIndex,
            answers: q.answers.map((a) => ({
              id: a.id,
              answerText: a.answerText,
              isCorrect: a.isCorrect,
              orderIndex: a.orderIndex,
            })),
          }))
        );
      }
    }
  }, [quiz]);

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

  const createMutation = trpc.quiz.create.useMutation({
    onSuccess: (data) => {
      toast.success("Quiz créé avec succès");
      setLocation(`/admin/quizzes/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la création");
    },
  });

  const updateMutation = trpc.quiz.update.useMutation({
    onSuccess: () => {
      toast.success("Quiz mis à jour");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  const addQuestionMutation = trpc.quiz.addQuestion.useMutation({
    onSuccess: () => {
      toast.success("Question ajoutée");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de l'ajout");
    },
  });

  const updateQuestionMutation = trpc.quiz.updateQuestion.useMutation({
    onSuccess: () => {
      toast.success("Question mise à jour");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  const deleteQuestionMutation = trpc.quiz.deleteQuestion.useMutation({
    onSuccess: () => {
      toast.success("Question supprimée");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.moduleId) {
      toast.error("Le titre et le module sont requis");
      return;
    }

    if (isEditing) {
      await updateMutation.mutateAsync({ id: quizId!, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: "",
        explanation: "",
        orderIndex: prev.length,
        answers: [
          { answerText: "", isCorrect: true, orderIndex: 0 },
          { answerText: "", isCorrect: false, orderIndex: 1 },
          { answerText: "", isCorrect: false, orderIndex: 2 },
          { answerText: "", isCorrect: false, orderIndex: 3 },
        ],
      },
    ]);
  };

  const updateQuestion = (index: number, field: keyof QuestionForm, value: string | number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const updateAnswer = (
    qIndex: number,
    aIndex: number,
    field: "answerText" | "isCorrect",
    value: string | boolean
  ) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const question = { ...updated[qIndex] };
      const answers = [...question.answers];

      if (field === "isCorrect" && value === true) {
        // Reset all other answers to false
        answers.forEach((a, i) => {
          answers[i] = { ...a, isCorrect: i === aIndex };
        });
      } else {
        answers[aIndex] = { ...answers[aIndex], [field]: value };
      }

      question.answers = answers;
      updated[qIndex] = question;
      return updated;
    });
  };

  const saveQuestion = async (index: number) => {
    const question = questions[index];
    
    if (!question.questionText) {
      toast.error("Le texte de la question est requis");
      return;
    }

    if (!question.answers.some((a) => a.isCorrect)) {
      toast.error("Une réponse correcte est requise");
      return;
    }

    if (question.id) {
      await updateQuestionMutation.mutateAsync({
        id: question.id,
        questionText: question.questionText,
        explanation: question.explanation || undefined,
        orderIndex: question.orderIndex,
        answers: question.answers.map((a) => ({
          id: a.id,
          answerText: a.answerText,
          isCorrect: a.isCorrect,
          orderIndex: a.orderIndex,
        })),
      });
    } else if (quizId) {
      await addQuestionMutation.mutateAsync({
        quizId,
        questionText: question.questionText,
        explanation: question.explanation || undefined,
        orderIndex: question.orderIndex,
        answers: question.answers.map((a) => ({
          answerText: a.answerText,
          isCorrect: a.isCorrect,
          orderIndex: a.orderIndex,
        })),
      });
    }
  };

  const removeQuestion = (index: number) => {
    const question = questions[index];
    if (question.id) {
      setDeleteQuestionId(question.id);
    } else {
      setQuestions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const confirmDeleteQuestion = async () => {
    if (deleteQuestionId) {
      await deleteQuestionMutation.mutateAsync({ id: deleteQuestionId });
      setDeleteQuestionId(null);
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/quizzes">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">
                {isEditing ? "Modifier le quiz" : "Nouveau quiz"}
              </h1>
              <p className="text-muted-foreground">
                {isEditing ? `ID: ${quizId}` : "Créez un nouveau quiz"}
              </p>
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
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
                    placeholder="Ex: Quiz - Les bases du HTML"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Décrivez ce quiz..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Questions */}
            {isEditing && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Questions ({questions.length})</CardTitle>
                  <Button onClick={addQuestion} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Ajouter
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {questions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Aucune question. Cliquez sur "Ajouter" pour commencer.</p>
                    </div>
                  ) : (
                    questions.map((question, qIndex) => (
                      <div key={qIndex} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                            <Badge variant="outline">Q{qIndex + 1}</Badge>
                            {question.id && (
                              <Badge variant="secondary" className="text-xs">
                                Enregistré
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeQuestion(qIndex)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label>Question</Label>
                          <Textarea
                            value={question.questionText}
                            onChange={(e) =>
                              updateQuestion(qIndex, "questionText", e.target.value)
                            }
                            placeholder="Entrez la question..."
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Réponses (sélectionnez la bonne réponse)</Label>
                          <RadioGroup
                            value={question.answers.findIndex((a) => a.isCorrect).toString()}
                            onValueChange={(value) =>
                              updateAnswer(qIndex, parseInt(value), "isCorrect", true)
                            }
                          >
                            {question.answers.map((answer, aIndex) => (
                              <div
                                key={aIndex}
                                className={`flex items-center gap-3 p-3 rounded-lg border ${
                                  answer.isCorrect ? "border-success bg-success/5" : ""
                                }`}
                              >
                                <RadioGroupItem value={aIndex.toString()} />
                                <Input
                                  value={answer.answerText}
                                  onChange={(e) =>
                                    updateAnswer(qIndex, aIndex, "answerText", e.target.value)
                                  }
                                  placeholder={`Réponse ${aIndex + 1}`}
                                  className="flex-1"
                                />
                                {answer.isCorrect && (
                                  <CheckCircle className="h-5 w-5 text-success" />
                                )}
                              </div>
                            ))}
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label>Explication (optionnel)</Label>
                          <Textarea
                            value={question.explanation}
                            onChange={(e) =>
                              updateQuestion(qIndex, "explanation", e.target.value)
                            }
                            placeholder="Explication affichée après la réponse..."
                            rows={2}
                          />
                        </div>

                        <Button
                          onClick={() => saveQuestion(qIndex)}
                          disabled={
                            addQuestionMutation.isPending || updateQuestionMutation.isPending
                          }
                          size="sm"
                          className="gap-2"
                        >
                          <Save className="h-4 w-4" />
                          {question.id ? "Mettre à jour" : "Enregistrer"}
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Paramètres</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="passingScore">Score minimum (%)</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passingScore}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        passingScore: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">Tentatives max.</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    min="1"
                    value={formData.maxAttempts}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxAttempts: parseInt(e.target.value) || 1,
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
                  <Label htmlFor="timeLimitMinutes">Limite de temps (min, 0 = illimité)</Label>
                  <Input
                    id="timeLimitMinutes"
                    type="number"
                    min="0"
                    value={formData.timeLimitMinutes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        timeLimitMinutes: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showCorrectAnswers">Afficher les corrections</Label>
                  <Switch
                    id="showCorrectAnswers"
                    checked={formData.showCorrectAnswers}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, showCorrectAnswers: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="shuffleQuestions">Mélanger les questions</Label>
                  <Switch
                    id="shuffleQuestions"
                    checked={formData.shuffleQuestions}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, shuffleQuestions: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delete Question Dialog */}
        <AlertDialog open={!!deleteQuestionId} onOpenChange={() => setDeleteQuestionId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cette question ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteQuestion}
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
