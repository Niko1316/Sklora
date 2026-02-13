import { LucideIcon } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent } from "./card";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <Card className={`bento-card ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="p-4 rounded-2xl bg-muted/50 mb-6">
          <Icon className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2 font-['Lexend']">{title}</h3>
        <p className="text-muted-foreground max-w-md mb-6">{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction} className="btn-squishy">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
