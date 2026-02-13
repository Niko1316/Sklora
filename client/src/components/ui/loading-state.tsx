import { Loader2 } from "lucide-react";
import { Card, CardContent } from "./card";

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export function LoadingState({
  message = "Chargement en cours...",
  fullScreen = false,
  className = "",
}: LoadingStateProps) {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <Card className={`bento-card ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-16 px-6">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
