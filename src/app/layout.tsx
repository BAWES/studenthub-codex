import type { Metadata } from "next";
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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
