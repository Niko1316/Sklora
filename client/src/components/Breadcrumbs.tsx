import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4 flex-wrap">
      <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1">
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Accueil</span>
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          {item.href ? (
            <Link href={item.href} className="hover:text-primary transition-colors truncate max-w-[200px]">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium truncate max-w-[250px]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
