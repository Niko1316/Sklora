import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/_core/trpc";
import StudentLayout from "@/components/layout/StudentLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Award,
  Download,
  Share2,
  Printer,
  Check,
  Copy,
  Calendar,
  Clock,
  TrendingUp,
  Shield,
  ArrowLeft,
  Linkedin,
  Twitter,
  Facebook
} from "lucide-react";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { useLocation } from "wouter";

interface CertificateViewProps {
  certificateId: number;
}

export default function CertificateView({ certificateId }: CertificateViewProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const { data: certificate, isLoading } = trpc.certificate.getById.useQuery(
    { id: certificateId },
    { enabled: !!certificateId }
  );

  const incrementShareMutation = trpc.certificate.incrementShare.useMutation();

  const verificationUrl = `${window.location.origin}/verify-certificate/${certificate?.credentialId}`;

  const handlePrint = () => {
    window.print();
    toast.success("Prêt à imprimer");
  };

  const handleDownloadPDF = async () => {
    // For a real PDF generation, you'd use a library like jsPDF or html2pdf
    // For now, we'll trigger print which allows "Save as PDF"
    toast.info("Utilisez 'Imprimer' puis 'Enregistrer au format PDF' dans votre navigateur");
    window.print();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Lien copié dans le presse-papier");
      incrementShareMutation.mutate({ certificateId });
    } catch (err) {
      toast.error("Impossible de copier le lien");
    }
  };

  const handleShare = (platform: string) => {
    const text = `J'ai obtenu ma certification "${certificate?.parcoursTitle}" sur Sklora ! 🎓`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(verificationUrl);

    let shareUrl = '';
    switch (platform) {
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      incrementShareMutation.mutate({ certificateId });
      toast.success(`Partagé sur ${platform}`);
    }
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="container max-w-5xl py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-96 bg-muted rounded" />
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!certificate) {
    return (
      <StudentLayout>
        <div className="container max-w-5xl py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Certificat non trouvé</h1>
          <Button onClick={() => setLocation("/certificates")}>
            Retour aux certificats
          </Button>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="container max-w-5xl py-8 space-y-6">
        {/* Header Actions - Hidden when printing */}
        <div className="flex items-center justify-between print:hidden">
          <Button
            variant="ghost"
            onClick={() => setLocation("/certificates")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimer
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Télécharger PDF
            </Button>
          </div>
        </div>

        {/* Certificate Display */}
        <Card
          ref={certificateRef}
          className="relative overflow-hidden border-4 border-primary/20 bg-white dark:bg-background print:border-primary print:shadow-none"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-x-20 -translate-y-20" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-purple-500/10 to-transparent rounded-full translate-x-20 translate-y-20" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4wNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30 print:opacity-10" />

          {/* Certificate Content */}
          <div className="relative z-10 p-12 md:p-16 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-lg">
                <Award className="h-16 w-16 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-['Lexend'] font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
                  Certificat de Réussite
                </h1>
                <p className="text-muted-foreground text-lg">
                  Délivré par {certificate.issuer}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="text-center space-y-6 py-8">
              <p className="text-lg text-muted-foreground">
                Ce certificat atteste que
              </p>
              <h2 className="text-3xl md:text-4xl font-['Lexend'] font-bold">
                {certificate.studentName}
              </h2>
              <p className="text-lg text-muted-foreground">
                a complété avec succès le parcours de formation
              </p>
              <h3 className="text-2xl md:text-3xl font-semibold text-primary px-8">
                {certificate.parcoursTitle}
              </h3>

              {/* Stats */}
              <div className="flex justify-center gap-8 pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Complété le</span>
                  </div>
                  <p className="font-semibold">
                    {new Date(certificate.completionDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Durée</span>
                  </div>
                  <p className="font-semibold">{certificate.totalHoursCompleted} heures</p>
                </div>
                {certificate.finalScore && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">Score moyen</span>
                    </div>
                    <p className="font-semibold">{certificate.finalScore}%</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Certificat N° {certificate.certificateNumber}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
                <span>ID de vérification: {certificate.credentialId}</span>
              </div>
              <div className="text-center text-xs text-muted-foreground">
                Vérifiez l'authenticité de ce certificat sur sklora.com/verify
              </div>
            </div>
          </div>
        </Card>

        {/* Share Section - Hidden when printing */}
        <Card className="p-6 print:hidden">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Share2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Partagez votre réussite</h3>
                <p className="text-sm text-muted-foreground">
                  Faites connaître vos nouvelles compétences
                </p>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                onClick={() => handleShare('linkedin')}
                className="gap-2 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-colors"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare('twitter')}
                className="gap-2 hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-colors"
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare('facebook')}
                className="gap-2 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-colors"
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="gap-2"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copié!" : "Copier le lien"}
              </Button>
            </div>

            {/* Verification Link */}
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-xs text-muted-foreground mb-2">Lien de vérification:</p>
              <code className="text-xs break-all font-mono bg-background p-2 rounded block">
                {verificationUrl}
              </code>
            </div>
          </div>
        </Card>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          ${certificateRef.current ? `#${certificateRef.current.id}` : '.certificate'},
          ${certificateRef.current ? `#${certificateRef.current.id}` : '.certificate'} * {
            visibility: visible;
          }
          ${certificateRef.current ? `#${certificateRef.current.id}` : '.certificate'} {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none;
            border: 4px solid #8b5cf6;
          }
          @page {
            margin: 1cm;
            size: A4 landscape;
          }
        }
      `}</style>
    </StudentLayout>
  );
}
