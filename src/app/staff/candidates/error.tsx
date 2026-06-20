1|"use client";
2|
3|export default function Error({error, reset}: {error: Error & {digest?: string}; reset: () => void}) {
4|  return (
5|    <div className="flex flex-col items-center justify-center py-24 gap-4">
6|      <span className="text-4xl" aria-hidden="true">⚠️</span>
7|      <h2 className="text-xl font-bold" className="text-foreground">
8|        Something went wrong
9|      </h2>
10|      <p className="text-sm max-w-md text-center" className="text-muted-foreground">
11|        {error.message ?? "An unexpected error occurred while loading the candidates page."}
12|      </p>
13|      <button onClick={reset} className="mt-2 h-10 rounded-lg px-4 text-sm font-semibold"
14|        className="bg-blue-500 hover:bg-blue-600 text-white">
15|        Try again
16|      </button>
17|    </div>
18|  );
19|}
20|