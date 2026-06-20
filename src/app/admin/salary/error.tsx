1|"use client";
2|
3|<<<<<<< HEAD
4|export default function AdminSalaryListError({
5|=======
6|import { useEffect } from "react";
7|
8|export default function Error({
9|>>>>>>> 772524a9 (feat(admin): add admin/salary page — module-level CRUD with DataTable [STU-4044])
10|  error,
11|  reset,
12|}: {
13|  error: Error & { digest?: string };
14|  reset: () => void;
15|}) {
16|<<<<<<< HEAD
17|  return (
18|    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
19|      <div className="text-sm text-destructive">
20|        Failed to load salaries: {error.message}
21|      </div>
22|      <button
23|        type="button"
24|        onClick={() => reset()}
25|        className="rounded-lg px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
26|      >
27|        Try again
28|      </button>
29|=======
30|  useEffect(() => {
31|    console.error(error);
32|  }, [error]);
33|
34|  return (
35|    <div className="flex h-[50vh] items-center justify-center">
36|      <div className="text-center">
37|        <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
38|        <p className="text-sm text-muted-foreground mb-4">Failed to load salary records.</p>
39|        <button
40|          onClick={() => reset()}
41|          className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-primary text-primary-foreground"
42|        >
43|          Try again
44|        </button>
45|      </div>
46|>>>>>>> 772524a9 (feat(admin): add admin/salary page — module-level CRUD with DataTable [STU-4044])
47|    </div>
48|  );
49|}
50|