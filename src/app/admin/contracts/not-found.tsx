import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h2 className="text-lg font-semibold">Contract not found</h2>
      <p className="text-sm text-muted-foreground">
        The contract you are looking for does not exist or has been deleted.
      </p>
      <Link href="/admin/contracts" className="text-sm underline text-foreground hover:text-muted-foreground">
        Back to contracts
      </Link>
    </div>
  );
}
