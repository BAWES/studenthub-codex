import type { Metadata } from "next";
import PingPongGame from "./PingPongGame";

export const metadata: Metadata = {
  title: "Ping Pong — StudentHub",
  description: "Play a classic game of ping pong right in your browser",
};

export default function PingPongPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[832px]">
        <h1 className="mb-2 text-center text-2xl font-bold tracking-tight">Ping Pong</h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          A quick break never hurt anyone. Beat the AI if you can.
        </p>
        <PingPongGame />
      </div>
    </main>
  );
}
