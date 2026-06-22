"use client";

import { Loader2 } from "lucide-react";

export default function LoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4 p-8 text-center bg-background">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-14 w-14 rounded-full border-2 border-muted" />
        <div className="h-14 w-14 rounded-full border-2 border-[#eb6651] border-t-transparent animate-spin" />
      </div>
      <p className="text-[15px] text-muted-foreground">Loading…</p>
    </div>
  );
}
