import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="errorPage">
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist or has been moved.</p>
      <Button asChild variant="secondary">
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
