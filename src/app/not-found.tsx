"use client";

import Link from "next/link";
import { Home, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center bg-background">
      <Card className="max-w-[420px] w-full">
        <CardContent className="flex flex-col items-center gap-5 py-10">
          <h1 className="text-5xl font-black leading-none m-0 bg-gradient-to-br from-[#eb6651] to-[#f59e0b] bg-clip-text text-transparent">
            404
          </h1>
          <div className="w-12 h-[3px] rounded-sm bg-[#eb6651]" aria-hidden="true" />
          <h2 className="text-xl font-bold m-0 text-foreground">
            Page not found
          </h2>
          <p className="text-[15px] text-muted-foreground leading-relaxed m-0">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Let&apos;s get you back on track.
          </p>
          <div className="flex gap-3 mt-2 flex-wrap justify-center">
            <Button asChild>
              <Link href="/">
                <Home className="h-4 w-4" />
                Go home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <Briefcase className="h-4 w-4" />
                Browse jobs
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
