import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: [
            "radial-gradient(ellipse 90% 50% at 50% -10%, rgba(31, 115, 183, 0.08), transparent)",
            "radial-gradient(ellipse 50% 40% at 80% 100%, rgba(235, 102, 81, 0.06), transparent)",
          ].join(", "),
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center max-w-md">
        {/* 404 mark */}
        <span
          className="select-none text-[clamp(6rem,15vw,10rem)] font-black leading-none tracking-tight"
          style={{
            background: "linear-gradient(135deg, #1f73b7 30%, #eb6651 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </span>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-[var(--ink)]">
            Page not found
          </h1>
          <p className="text-sm leading-relaxed text-[var(--muted)] max-w-xs mx-auto">
            The page you are looking for does not exist or has been moved. If
            you followed a link, it may be outdated.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button asChild variant="secondary">
            <Link href="/">
              <ArrowLeft className="size-3.5 mr-1" />
              Go home
            </Link>
          </Button>
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
