import StudentLayout from "@/components/layout/StudentLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  HelpCircle,
  Trophy,
  RotateCcw,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface QuizAnswer {
  questionId: number;
  answerId: number;
}

interface QuizResult {
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  xpEarned: number;
  feedback: Array<{
    questionId: number;
    correctAnswerId: number;
    explanation: string | null;
  }> | null;
  attemptNumber: number;
}

export default function QuizView({ quizId }: { quizId: number }) {
  const [, setLocation] = useLocation();
  const { data: quiz, isLoading, error, refetch } = trpc.quiz.get.useQuery({ id: quizId });
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitMutation = trpc.quiz.submit.useMutation({
    onSuccess: (data) => {
      setResult(data);
      if (data.passed) {
        toast.success(`Quiz réussi ! +${data.xpEarned} XP`);
      } else {
        toast.error("Quiz non réussi. Réessayez !");
      }
    },
    onError: () => {
      toast.error("Erreur lors de la soumission du quiz");
    },
  });

  // Timer
  useEffect(() => {
    if (!result && quiz) {
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [result, quiz]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (questionId: number, answerId: number) => {
    setAnswers((prev) => {
      const existing = prev.findIndex((a) => a.questionId === questionId);
      if (existing >= 0) {
        const newAnswers = [...prev];
        newAnswers[existing] = { questionId, answerId };
        return newAnswers;
      }
      return [...prev, { questionId, answerId }];
    });
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    
    if (answers.length < quiz.questions.length) {
      toast.error("Veuillez répondre à toutes les questions");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync({
        quizId,
        answers,
        timeTaken: timeElapsed,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setAnswers([]);
    setCurrentQuestion(0);
    setTimeElapsed(0);
    refetch();
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      </StudentLayout>
    );
  }

  if (error || !quiz) {
    return (
      <StudentLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive">Quiz non trouvé</h1>
          <p className="text-muted-foreground mt-2">Ce quiz n'existe pas ou n'est plus disponible.</p>
          <Link href="/parcours">
            <Button className="mt-4 gap-2">
              <ArrowLeft className="h-4 w-4" /> Retour aux parcours
            </Button>
          </Link>
        </div>
      </StudentLayout>
    );
  }

  if (!quiz.canAttempt && !result) {
    return (
      <StudentLayout>
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <XCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
              <h2 className="text-2xl font-bold mb-2">Tentatives épuisées</h2>
              <p className="text-muted-foreground mb-4">
                Vous avez atteint le nombre maximum de tentatives ({quiz.maxAttempts}) pour ce quiz.
              </p>
              {quiz.bestScore !== null && (
                <p className="text-lg">
                  Votre meilleur score : <span className="font-bold">{quiz.bestScore}%</span>
                </p>
              )}
              <Button className="mt-6" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Retour
              </Button>
            </CardContent>
          </Card>
        </div>
      </StudentLayout>
    );
  }

  // Show results
  if (result) {
    return (
      <StudentLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className={result.passed ? "border-success" : "border-destructive"}>
            <CardContent className="py-8 text-center">
              {result.passed ? (
                <Trophy className="h-20 w-20 mx-auto text-gold mb-4" />
              ) : (
                <XCircle className="h-20 w-20 mx-auto text-destructive mb-4" />
              )}
              <h2 className="text-3xl font-bold mb-2">
                {result.passed ? "Félicitations !" : "Pas encore..."}
              </h2>
              <p className="text-muted-foreground mb-6">
                {result.passed
                  ? "Vous avez réussi ce quiz !"
                  : `Score minimum requis : ${quiz.passingScore}%`}
              </p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold">{result.score}%</p>
                  <p className="text-sm text-muted-foreground">Score</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold">
                    {result.correctAnswers}/{result.totalQuestions}
                  </p>
                  <p className="text-sm text-muted-foreground">Bonnes réponses</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold flex items-center justify-center gap-1">
                    <Star className="h-6 w-6 text-gold" />
                    {result.xpEarned}
                  </p>
                  <p className="text-sm text-muted-foreground">XP gagnés</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                {!result.passed && quiz.attemptCount < quiz.maxAttempts && (
                  <Button onClick={handleRetry} className="gap-2">
                    <RotateCcw className="h-4 w-4" /> Réessayer
                  </Button>
                )}
                <Button variant="outline" onClick={() => window.history.back()}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Retour
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Feedback */}
          {result.feedback && quiz.showCorrectAnswers && (
            <Card>
              <CardHeader>
                <CardTitle>Correction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quiz.questions.map((question, index) => {
                  const userAnswer = answers.find((a) => a.questionId === question.id);
                  const feedback = result.feedback?.find((f) => f.questionId === question.id);
                  const isCorrect = userAnswer?.answerId === feedback?.correctAnswerId;

                  return (
                    <div
                      key={question.id}
                      className={`p-4 rounded-lg border ${
                        isCorrect ? "border-success bg-success/5" : "border-destructive bg-destructive/5"
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        )}
                        <p className="font-medium">
                          {index + 1}. {question.questionText}
                        </p>
                      </div>
                      {!isCorrect && (
                        <p className="text-sm text-muted-foreground ml-7">
                          Bonne réponse :{" "}
                          {question.answers.find((a) => a.id === feedback?.correctAnswerId)?.answerText}
                        </p>
                      )}
                      {feedback?.explanation && (
                        <p className="text-sm text-muted-foreground ml-7 mt-2 italic">
                          {feedback.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </StudentLayout>
    );
  }

  // Quiz in progress
  const question = quiz.questions[currentQuestion];
  const selectedAnswer = answers.find((a) => a.questionId === question.id)?.answerId;
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" /> Quitter
          </Button>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" /> {formatTime(timeElapsed)}
            </Badge>
            <Badge variant="secondary">
              {currentQuestion + 1} / {quiz.questions.length}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <Progress value={progress} className="h-2" />

        {/* Quiz Info */}
        <Card>
          <CardHeader>
            <CardTitle>{quiz.title}</CardTitle>
            <CardDescription>
              Score minimum : {quiz.passingScore}% • {quiz.xpReward} XP à gagner
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Question */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Question {currentQuestion + 1}
            </CardTitle>
            <p className="text-base mt-2">{question.questionText}</p>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedAnswer?.toString()}
              onValueChange={(value) => handleAnswerSelect(question.id, parseInt(value))}
            >
              {question.answers.map((answer) => (
                <div
                  key={answer.id}
                  className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedAnswer === answer.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleAnswerSelect(question.id, answer.id)}
                >
                  <RadioGroupItem value={answer.id.toString()} id={`answer-${answer.id}`} />
                  <Label htmlFor={`answer-${answer.id}`} className="flex-1 cursor-pointer">
                    {answer.answerText}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion((prev) => prev - 1)}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Précédent
          </Button>

          {currentQuestion < quiz.questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestion((prev) => prev + 1)}
              disabled={!selectedAnswer}
            >
              Suivant <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={answers.length < quiz.questions.length || isSubmitting}
            >
              {isSubmitting ? "Envoi..." : "Terminer le quiz"}
            </Button>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
