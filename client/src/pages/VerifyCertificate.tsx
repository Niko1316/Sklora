import { trpc } from "@/_core/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Shield,
  CheckCircle,
  XCircle,
  Search,
  Calendar,
  Clock,
  TrendingUp,
  Home,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function VerifyCertificate({ credentialId: urlCredentialId }: { credentialId?: string }) {
  const [credentialId, setCredentialId] = useState(urlCredentialId || "");
  const [searchedId, setSearchedId] = useState(urlCredentialId || "");

  const { data: certificate, isLoading, error } = trpc.certificate.getByCredentialId.useQuery(
    { credentialId: searchedId },
    { enabled: !!searchedId }
  );

  const handleSearch = () => {
    setSearchedId(credentialId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-background to-teal-50 dark:from-violet-950/30 dark:via-background dark:to-teal-950/30">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold font-['Lexend']">Sklora - Vérification de Certificat</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <Home className="h-4 w-4" />
              Accueil
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container max-w-4xl py-12 space-y-8">
        {/* Search Section */}
        <Card className="bento-card">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-['Lexend']">Vérifier un certificat</h1>
                <p className="text-muted-foreground">
                  Entrez l'ID de vérification pour valider l'authenticité d'un certificat Sklora
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: 1707843600000-abc123def"
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button
                onClick={handleSearch}
                disabled={!credentialId || isLoading}
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                Vérifier
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              L'ID de vérification se trouve en bas de chaque certificat officiel Sklora
            </p>
          </CardContent>
        </Card>

        {/* Results Section */}
        {isLoading && (
          <Card className="animate-pulse">
            <CardContent className="py-12">
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-1/2 mx-auto" />
                <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
              </div>
            </CardContent>
          </Card>
        )}

        {error && searchedId && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="py-12 text-center">
              <div className="inline-flex p-4 rounded-full bg-destructive/10 mb-4">
                <XCircle className="h-12 w-12 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Certificat non trouvé</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Aucun certificat ne correspond à cet ID de vérification.
                Vérifiez que l'ID est correct ou contactez l'émetteur du certificat.
              </p>
              <Badge variant="destructive">Non vérifié</Badge>
            </CardContent>
          </Card>
        )}

        {certificate && searchedId && (
          <Card className="border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20 overflow-hidden">
            {/* Success Banner */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white text-center">
              <div className="inline-flex p-3 rounded-full bg-white/20 mb-4">
                <CheckCircle className="h-12 w-12" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Certificat Vérifié ✓</h2>
              <p className="text-emerald-50">
                Ce certificat est authentique et a été émis par Sklora
              </p>
            </div>

            <CardContent className="p-8 space-y-6">
              {/* Certificate Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Étudiant(e)</p>
                    <p className="text-lg font-semibold">{certificate.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Parcours de formation</p>
                    <p className="text-lg font-semibold">{certificate.parcoursTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Numéro de certificat</p>
                    <p className="font-mono text-sm">{certificate.certificateNumber}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date de completion</p>
                      <p className="font-semibold">
                        {new Date(certificate.completionDate).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Durée totale</p>
                      <p className="font-semibold">{certificate.totalHoursCompleted} heures</p>
                    </div>
                  </div>

                  {certificate.finalScore && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-background">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Score moyen</p>
                        <p className="font-semibold">{certificate.finalScore}%</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Issuer Info */}
              <div className="pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-semibold">Émis par {certificate.issuer}</p>
                      <p className="text-sm text-muted-foreground">
                        Plateforme d'apprentissage certifiée
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500 hover:bg-emerald-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Vérifié
                  </Badge>
                </div>
              </div>

              {/* Verification Details */}
              <div className="p-4 rounded-lg bg-muted/50 text-sm">
                <p className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Détails de vérification
                </p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Certificat valide et non révoqué</li>
                  <li>• ID de vérification: {certificate.credentialId}</li>
                  <li>• Vérifié le {new Date().toLocaleDateString('fr-FR')}</li>
                  <li>• Vues: {certificate.viewCount}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        {!searchedId && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <Shield className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Comment vérifier un certificat</h3>
              <p className="text-muted-foreground max-w-md mx-auto text-sm">
                Chaque certificat Sklora contient un ID de vérification unique.
                Entrez cet ID dans le champ ci-dessus pour confirmer l'authenticité du certificat.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
