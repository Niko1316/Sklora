import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent } from "./card";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  fullScreen?: boolean;
  className?: string;
}

export function ErrorState({
  title = "Une erreur est survenue",
  message,
  onRetry,
  retryLabel = "Réessayer",
  fullScreen = false,
  className = "",
}: ErrorStateProps) {
  const content = (
    <div className="text-center space-y-4">
      <div className="p-4 rounded-2xl bg-destructive/10 w-fit mx-auto">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2 font-['Lexend']">{title}</h3>
        <p className="text-muted-foreground max-w-md mx-auto">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="btn-squishy gap-2">
          <RefreshCw className="h-4 w-4" />
          {retryLabel}
        </Button>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return (
    <Card className={`bento-card ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-16 px-6">
        {content}
      </CardContent>
    </Card>
  );
}
