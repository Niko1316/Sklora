import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/_core/trpc";
import StudentLayout from "@/components/layout/StudentLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Download,
  Share2,
  Eye,
  Calendar,
  Clock,
  TrendingUp,
  ExternalLink,
  Lock
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Certificates() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: certificates, isLoading } = trpc.certificate.getMyCertificates.useQuery();
  const { data: subscription } = trpc.subscription.getMySubscription.useQuery();

  const generateCertificateMutation = trpc.certificate.generateForParcours.useMutation({
    onSuccess: (certificate) => {
      toast.success("Certificat généré avec succès!");
      setLocation(`/certificates/${certificate?.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleViewCertificate = (id: number) => {
    setLocation(`/certificates/${id}`);
  };

  const isProUser = subscription?.planId === 'pro';

  return (
    <StudentLayout>
      <div className="container max-w-6xl py-8 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold font-['Lexend'] mb-2">Mes Certificats</h1>
            <p className="text-muted-foreground">
              Consultez et partagez vos certificats de réussite
            </p>
          </div>
          {!isProUser && (
            <Button
              onClick={() => setLocation("/pricing")}
              className="gap-2 bg-gradient-to-r from-primary to-purple-600"
            >
              <Lock className="h-4 w-4" />
              Débloquer les certificats
            </Button>
          )}
        </div>

        {/* Pro Plan Notice */}
        {!isProUser && (
          <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-purple-500/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Obtenez vos certificats officiels</CardTitle>
                  <CardDescription className="mt-1">
                    Passez au plan Pro pour débloquer les certificats de réussite et valoriser vos compétences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Certificats officiels Sklora vérifiables
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Partage sur LinkedIn, CV et réseaux sociaux
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Téléchargement en PDF haute qualité
                </li>
              </ul>
              <Button
                onClick={() => setLocation("/pricing")}
                className="w-full gap-2 bg-gradient-to-r from-primary to-purple-600"
              >
                Voir les plans Pro
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Certificates Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-40 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : certificates && certificates.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <Card
                key={cert.id}
                className="bento-card hover:shadow-xl transition-all cursor-pointer group overflow-hidden"
                onClick={() => handleViewCertificate(cert.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-purple-600 group-hover:scale-110 transition-transform">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400">
                      Vérifié
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {cert.parcoursTitle}
                  </CardTitle>
                  <CardDescription className="text-xs font-mono">
                    {cert.certificateNumber}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Certificate Preview */}
                  <div className="relative aspect-[4/3] rounded-xl border-2 border-primary/20 bg-gradient-to-br from-background via-primary/5 to-purple-500/5 p-4 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
                    <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-2">
                      <Award className="h-12 w-12 text-primary/40 mb-2" />
                      <p className="font-['Lexend'] font-semibold text-sm line-clamp-2">
                        {cert.studentName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(cert.completionDate).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                      </div>
                      <p className="text-xs font-semibold">{cert.totalHoursCompleted}h</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                      </div>
                      <p className="text-xs font-semibold">{cert.finalScore || 0}%</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                      </div>
                      <p className="text-xs font-semibold">{cert.viewCount}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewCertificate(cert.id);
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Voir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isProUser ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Award className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun certificat pour le moment</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Terminez un parcours à 100% pour obtenir votre premier certificat officiel
              </p>
              <Button onClick={() => setLocation("/parcours")} className="gap-2">
                Voir les parcours
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </StudentLayout>
  );
}
