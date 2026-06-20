const CORAL = "#eb6651";

export function NotFoundState() {
  return (
    <div className="container mx-auto py-20">
      <div className="max-w-md mx-auto text-center space-y-6">
        {/* Icon */}
        <div
          className="mx-auto w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold"
          style={{
            backgroundColor: "var(--surface)",
            color: CORAL,
            borderColor: "var(--border)",
            borderWidth: 2,
          }}
        >
          !
        </div>

        <div className="space-y-2">
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--ink)" }}
          >
            Profile not found
          </h1>
          <p style={{ color: "var(--muted)" }}>
            No candidate found with the given ID.
          </p>
        </div>
      </div>
    </div>
  );
}
