import type { Metadata } from "next";
import { ThemeScript } from "@/modules/theme/ThemeScript";
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
        {children}
      </body>
    </html>
  );
}
