1|"use client";
2|
3|export default function Error({
4|  error,
5|  reset,
6|}: {
7|  error: Error & { digest?: string };
8|  reset: () => void;
9|}) {
10|  return (
11|    <div className="flex flex-col items-center justify-center py-24 gap-4">
12|      <span className="text-4xl" aria-hidden="true">⚠️</span>
13|      <h2 className="text-xl font-bold" className="text-foreground">
14|        Something went wrong
15|      </h2>
16|      <p className="text-sm max-w-md text-center" className="text-muted-foreground">
17|        {error.message ?? "An unexpected error occurred while loading the page."}
18|      </p>
19|      {error.digest ? <small className="text-muted-foreground">Error ID: {error.digest}</small> : null}
20|      <button
21|        onClick={reset}
22|        className="mt-2 h-10 rounded-lg px-4 text-sm font-semibold"
23|        className="bg-blue-500 hover:bg-blue-600 text-white"
24|      >
25|        Try again
26|      </button>
27|    </div>
28|  );
29|}
30|