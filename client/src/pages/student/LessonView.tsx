import StudentLayout from "@/components/layout/StudentLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Star,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function LessonView({ lessonId }: { lessonId: number }) {
  const [, setLocation] = useLocation();
  const { data: lesson, isLoading, error } = trpc.lesson.get.useQuery({ id: lessonId });
  const completeMutation = trpc.lesson.complete.useMutation({
    onSuccess: (data) => {
      toast.success(`Leçon terminée ! +${data.xpEarned} XP`);
    },
    onError: () => {
      toast.error("Erreur lors de la validation de la leçon");
    },
  });

  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await completeMutation.mutateAsync({ lessonId });
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      </StudentLayout>
    );
  }

  if (error || !lesson) {
    return (
      <StudentLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive">Leçon non trouvée</h1>
          <p className="text-muted-foreground mt-2">Cette leçon n'existe pas ou n'est plus disponible.</p>
          <Link href="/parcours">
            <Button className="mt-4 gap-2">
              <ArrowLeft className="h-4 w-4" /> Retour aux parcours
            </Button>
          </Link>
        </div>
      </StudentLayout>
    );
  }

  const isCompleted = lesson.progress?.status === "completed";

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" /> Retour
          </Button>
          <div className="flex items-center gap-2">
            {isCompleted && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="h-3 w-3" /> Terminée
              </Badge>
            )}
          </div>
        </div>

        {/* Lesson Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{lesson.title}</CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {lesson.duration} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-gold" />
                    {lesson.xpReward} XP
                  </span>
                  <Badge variant="outline" className="capitalize">
                    {lesson.difficulty === "facile" ? "Facile" :
                     lesson.difficulty === "moyen" ? "Moyen" : "Difficile"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Lesson Content */}
        <Card>
          <CardContent className="py-6">
            {lesson.imageUrl && (
              <div className="mb-6 rounded-lg overflow-hidden">
                <img
                  src={lesson.imageUrl}
                  alt={lesson.title}
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>
            )}

            {lesson.videoUrl && (
              <div className="mb-6 aspect-video rounded-lg overflow-hidden bg-black">
                <video
                  src={lesson.videoUrl}
                  controls
                  className="w-full h-full"
                />
              </div>
            )}

            <div className="prose-editor">
              {lesson.contentHtml ? (
                <div dangerouslySetInnerHTML={{ __html: lesson.contentHtml }} />
              ) : lesson.contentMarkdown ? (
                <Streamdown>{lesson.contentMarkdown}</Streamdown>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Aucun contenu disponible pour cette leçon.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quiz Link if available */}
        {lesson.quizzes && lesson.quizzes.length > 0 && (
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <HelpCircle className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Quiz disponible</h3>
                    <p className="text-sm text-muted-foreground">
                      Testez vos connaissances sur cette leçon
                    </p>
                  </div>
                </div>
                <Link href={`/quiz/${lesson.quizzes[0].id}`}>
                  <Button className="gap-2">
                    Passer le quiz <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complete Button */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  {isCompleted ? "Leçon terminée !" : "Marquer comme terminée"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isCompleted
                    ? "Vous avez déjà complété cette leçon."
                    : `Gagnez ${lesson.xpReward} XP en terminant cette leçon.`}
                </p>
              </div>
              <Button
                onClick={handleComplete}
                disabled={isCompleted || isCompleting}
                className="gap-2"
              >
                {isCompleting ? (
                  "Validation..."
                ) : isCompleted ? (
                  <>
                    <CheckCircle className="h-4 w-4" /> Terminée
                  </>
                ) : (
                  <>
                    Terminer la leçon <CheckCircle className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
