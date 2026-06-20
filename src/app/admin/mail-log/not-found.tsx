import Link from "next/link";
import type { Route } from "next";
import { Button } from "@/components/ui/button";

export default function MailLogNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-8">
      <h2 className="text-lg font-semibold text-destructive">
        Mail log entry not found
      </h2>
      <p className="text-sm text-muted-foreground">
        The email you are looking for does not exist or may have been deleted.
      </p>
      <Link href={"/admin/mail-log" as Route}>
        <Button variant="outline">Back to Mail Log</Button>
      </Link>
    </div>
  );
}
