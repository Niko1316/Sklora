import { GraduationCap } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t py-10 px-4 bg-card/50 mt-auto">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold font-['Lexend'] text-lg">Sklora</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/">
              <a className="text-muted-foreground hover:text-foreground transition-colors">
                Accueil
              </a>
            </Link>
            <Link href="/pricing">
              <a className="text-muted-foreground hover:text-foreground transition-colors">
                Tarifs
              </a>
            </Link>
            <Link href="/dashboard">
              <a className="text-muted-foreground hover:text-foreground transition-colors">
                Tableau de bord
              </a>
            </Link>
          </nav>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Sklora. Éclore dans son métier. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
