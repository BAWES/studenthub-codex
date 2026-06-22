export default function Loading() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-border border-t-[#eb6651]" />
        <p className="text-sm text-muted-foreground">
          Loading applications...
        </p>
      </div>
    </div>
  );
}
