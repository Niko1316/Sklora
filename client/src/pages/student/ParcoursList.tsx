import StudentLayout from "@/components/layout/StudentLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Clock, Search, Filter, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useState, useMemo } from "react";

export default function ParcoursList() {
  const { data: parcours, isLoading } = trpc.parcours.list.useQuery();
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const filteredParcours = useMemo(() => {
    if (!parcours) return [];
    return parcours.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchesDifficulty = difficultyFilter === "all" || p.difficulty === difficultyFilter;
      return matchesSearch && matchesDifficulty;
    });
  }, [parcours, search, difficultyFilter]);

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-['Lexend']">Parcours de formation</h1>
          <p className="text-muted-foreground mt-1">
            Explorez nos parcours et commencez votre apprentissage.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un parcours..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Difficulté" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les difficultés</SelectItem>
              <SelectItem value="debutant">Débutant</SelectItem>
              <SelectItem value="intermediaire">Intermédiaire</SelectItem>
              <SelectItem value="avance">Avancé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Parcours Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <Skeleton className="h-40 rounded-t-lg" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredParcours.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredParcours.map((p) => (
              <Link key={p.id} href={`/parcours/${p.slug}`}>
                <Card className="bento-card cursor-pointer h-full flex flex-col overflow-hidden group">
                  {p.imageUrl ? (
                    <div className="h-40 overflow-hidden">
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-primary/20 to-teal-500/20 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-primary/50" />
                    </div>
                  )}
                  <CardHeader className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2 font-['Lexend'] group-hover:text-primary transition-colors">{p.title}</CardTitle>
                      {p.isFree && (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 shrink-0">Gratuit</Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-3 mt-2">
                      {p.description || "Découvrez ce parcours de formation complet."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1.5 rounded-lg">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span className="whitespace-nowrap">{p.totalModules} modules</span>
                      </span>
                      <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1.5 rounded-lg">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="whitespace-nowrap">{p.totalHours}h</span>
                      </span>
                      <Badge variant="outline" className="capitalize text-xs">
                        {p.difficulty === "debutant" ? "Débutant" :
                         p.difficulty === "intermediaire" ? "Intermédiaire" : "Avancé"}
                      </Badge>
                    </div>
                    <Button className="w-full gap-2 btn-squishy" variant="outline">
                      Voir le parcours <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Aucun parcours trouvé</h3>
              <p className="text-muted-foreground">
                {search || difficultyFilter !== "all"
                  ? "Essayez de modifier vos critères de recherche."
                  : "Les parcours seront bientôt disponibles."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
}
