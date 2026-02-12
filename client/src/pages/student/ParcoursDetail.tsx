import StudentLayout from "@/components/layout/StudentLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  BookOpen,
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Lock,
  Play,
  FileText,
  HelpCircle,
  Star,
} from "lucide-react";
import { Link } from "wouter";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function ParcoursDetail({ slug }: { slug: string }) {
  const { data: parcours, isLoading, error } = trpc.parcours.getBySlug.useQuery({ slug });
  const { data: userProgress } = trpc.user.getProgress.useQuery();

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </StudentLayout>
    );
  }

  if (error || !parcours) {
    return (
      <StudentLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive">Parcours non trouvé</h1>
          <p className="text-muted-foreground mt-2">Ce parcours n'existe pas ou n'est plus disponible.</p>
          <Link href="/parcours">
            <Button className="mt-4 gap-2">
              <ArrowLeft className="h-4 w-4" /> Retour aux parcours
            </Button>
          </Link>
        </div>
      </StudentLayout>
    );
  }

  // Calculate progress
  const completedLessons = userProgress?.filter(
    (p) => p.parcoursId === parcours.id && p.lessonId && p.status === "completed"
  ).length || 0;
  
  const totalLessons = parcours.modules?.reduce((acc, m) => acc + (m as any).lessonCount || 0, 0) || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: "Parcours", href: "/parcours" },
          { label: parcours.title },
        ]} />

        {/* Back Button */}
        <Link href="/parcours">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Retour aux parcours
          </Button>
        </Link>

        {/* Header */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {parcours.imageUrl && (
              <div className="h-64 overflow-hidden rounded-lg">
                <img
                  src={parcours.imageUrl}
                  alt={parcours.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <div className="flex items-start gap-3 mb-2">
                <h1 className="text-3xl font-bold">{parcours.title}</h1>
                {parcours.isFree && <Badge variant="secondary">Gratuit</Badge>}
              </div>
              <p className="text-muted-foreground">{parcours.description}</p>
            </div>
          </div>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Modules</span>
                <span className="font-semibold">{parcours.totalModules}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Durée estimée</span>
                <span className="font-semibold">{parcours.totalHours}h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Difficulté</span>
                <Badge variant="outline" className="capitalize">
                  {parcours.difficulty === "debutant" ? "Débutant" : 
                   parcours.difficulty === "intermediaire" ? "Intermédiaire" : "Avancé"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">XP à gagner</span>
                <span className="font-semibold flex items-center gap-1">
                  <Star className="h-4 w-4 text-gold" />
                  {parcours.xpReward} XP
                </span>
              </div>
              
              {/* Progress */}
              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progression</span>
                  <span>{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {completedLessons} / {totalLessons} leçons complétées
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modules */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Contenu du parcours</h2>
          
          {parcours.modules && parcours.modules.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-4">
              {parcours.modules.map((module, index) => {
                const isLocked = !module.isFree && !parcours.isFree;
                const moduleProgress = userProgress?.find(
                  (p) => p.moduleId === module.id && !p.lessonId
                );
                const isCompleted = moduleProgress?.status === "completed";

                return (
                  <AccordionItem
                    key={module.id}
                    value={`module-${module.id}`}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-4 text-left">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted ? "bg-success/20 text-success" :
                          isLocked ? "bg-muted text-muted-foreground" :
                          "bg-primary/20 text-primary"
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : isLocked ? (
                            <Lock className="h-5 w-5" />
                          ) : (
                            <span className="font-semibold">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{module.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {module.hours}h • {module.xpReward} XP
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-14 space-y-2 pb-4">
                        {module.description && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {module.description}
                          </p>
                        )}
                        
                        {/* Placeholder for lessons - would need separate query */}
                        <div className="text-sm text-muted-foreground">
                          <p>Les leçons de ce module seront affichées ici.</p>
                          {!isLocked && (
                            <Link href={`/parcours/${slug}`}>
                              <Button size="sm" className="mt-2 gap-2">
                                <Play className="h-4 w-4" /> Commencer
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Aucun module disponible</h3>
                <p className="text-muted-foreground">
                  Le contenu de ce parcours est en cours de préparation.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
