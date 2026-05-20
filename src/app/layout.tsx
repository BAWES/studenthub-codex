import { Suspense } from "react";
import type { Metadata } from "next";
import { ThemeScript } from "@/modules/theme/ThemeScript";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { NoticeToast } from "@/modules/workspace/NoticeToast";
import "./styles.css";

export const metadata: Metadata = {
  title: "StudentHub",
  description: "A modern StudentHub workspace"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeScript />
        <TooltipProvider>
          {children}
          <Suspense>
            <NoticeToast />
          </Suspense>
        </TooltipProvider>
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
