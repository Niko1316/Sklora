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
import { HelpCircle, Plus, Search, MoreHorizontal, Edit, Trash2, Eye, EyeOff, ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Label } from "@/components/ui/label";

export default function AdminQuizzes() {
  const utils = trpc.useUtils();
  const { data: quizzes, isLoading } = trpc.quiz.adminList.useQuery();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("moyen");

  const { data: lessons } = trpc.lesson.adminList.useQuery();

  const deleteMutation = trpc.quiz.delete.useMutation({
    onSuccess: () => {
      toast.success("Quiz supprimé");
      utils.quiz.adminList.invalidate();
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  const updateMutation = trpc.quiz.update.useMutation({
    onSuccess: () => {
      toast.success("Quiz mis à jour");
      utils.quiz.adminList.invalidate();
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });

  const generateQuizMutation = trpc.quiz.generateAuto.useMutation({
    onSuccess: () => {
      toast.success("Quiz généré automatiquement avec succès!");
      utils.quiz.adminList.invalidate();
      setGenerateDialogOpen(false);
      setSelectedLesson("");
      setSelectedDifficulty("moyen");
    },
    onError: (error) => {
      toast.error(`Erreur lors de la génération: ${error.message}`);
    },
  });

  const filteredQuizzes = quizzes?.filter((q) =>
    q.title.toLowerCase().includes(search.toLowerCase())
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

  const handleGenerateQuiz = async () => {
    if (!selectedLesson) {
      toast.error("Veuillez sélectionner une leçon");
      return;
    }
    await generateQuizMutation.mutateAsync({
      lessonId: parseInt(selectedLesson),
      difficulty: selectedDifficulty as "facile" | "moyen" | "difficile",
    });
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
              <h1 className="text-3xl font-bold font-heading">Quiz</h1>
              <p className="text-muted-foreground mt-1">
                Gérez les quiz de vos leçons
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setGenerateDialogOpen(true)}
            >
              <Sparkles className="h-4 w-4" /> Générer avec IA
            </Button>
            <Link href="/admin/quizzes/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Nouveau quiz
              </Button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un quiz..."
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
            ) : filteredQuizzes && filteredQuizzes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Score min.</TableHead>
                    <TableHead>XP</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuizzes.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                            <HelpCircle className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <p className="font-medium">{q.title}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        Module #{q.moduleId}
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>{q.passingScore}%</TableCell>
                      <TableCell>{q.xpReward} XP</TableCell>
                      <TableCell>
                        <Badge variant={q.isPublished ? "default" : "secondary"}>
                          {q.isPublished ? "Publié" : "Brouillon"}
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
                              <Link href={`/admin/quizzes/${q.id}`}>
                                <Edit className="h-4 w-4 mr-2" /> Modifier
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleTogglePublish(q.id, q.isPublished)}
                            >
                              {q.isPublished ? (
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
                              onClick={() => setDeleteId(q.id)}
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
                <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Aucun quiz</h3>
                <p className="text-muted-foreground mb-4">
                  Créez votre premier quiz.
                </p>
                <Link href="/admin/quizzes/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Créer un quiz
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generate Quiz Dialog */}
        <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Générer un quiz automatiquement</DialogTitle>
              <DialogDescription>
                L'IA créera automatiquement des questions basées sur le contenu de la leçon sélectionnée.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="lesson">Leçon</Label>
                <Select value={selectedLesson} onValueChange={setSelectedLesson}>
                  <SelectTrigger id="lesson">
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
              <div className="grid gap-2">
                <Label htmlFor="difficulty">Difficulté</Label>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facile">Facile</SelectItem>
                    <SelectItem value="moyen">Moyen</SelectItem>
                    <SelectItem value="difficile">Difficile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setGenerateDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={handleGenerateQuiz}
                disabled={generateQuizMutation.isPending || !selectedLesson}
                className="gap-2"
              >
                {generateQuizMutation.isPending ? (
                  <>Génération en cours...</>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Générer le quiz
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce quiz ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Toutes les questions associées seront également supprimées.
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
