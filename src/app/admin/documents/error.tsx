"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function AdminDocumentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-5" />
            Error Loading Documents Page
          </CardTitle>
          <CardDescription>
            {error.message ?? "An unexpected error occurred while loading this page."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
              <ArrowLeft className="size-4" />
              Go Back
            </Button>
            <Button onClick={reset} className="gap-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
