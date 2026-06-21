"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CandidateDetailLoading() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="h-3 w-24 mb-2 rounded bg-muted animate-pulse" />
        <div className="h-7 w-48 rounded bg-muted animate-pulse" />
      </div>
      <div className="flex gap-3">
        <div className="h-12 w-32 rounded-lg bg-muted animate-pulse" />
        <div className="h-12 w-32 rounded-lg bg-muted animate-pulse" />
        <div className="h-12 w-32 rounded-lg bg-muted animate-pulse" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="h-5 w-40 rounded bg-muted animate-pulse">&nbsp;</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                <div className="h-3 w-32 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
