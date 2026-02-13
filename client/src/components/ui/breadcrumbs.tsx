import { ChevronRight, Home } from "lucide-react";
import { Link } from "wouter";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-2 text-sm ${className}`}>
      <Link href="/dashboard">
        <a className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
          <Home className="h-4 w-4" />
          <span className="sr-only">Accueil</span>
        </a>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {item.href && !isLast ? (
              <Link href={item.href}>
                <a className="text-muted-foreground hover:text-foreground transition-colors">
                  {item.label}
                </a>
              </Link>
            ) : (
              <span
                className={isLast ? "text-foreground font-medium" : "text-muted-foreground"}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
