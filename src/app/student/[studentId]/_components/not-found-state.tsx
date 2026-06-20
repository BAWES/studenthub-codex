import { Card, CardContent, CardTitle } from "@/components/ui/card";

const CORAL = "#eb6651";

export function NotFoundState() {
  return (
    <div className="container mx-auto py-20">
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center gap-6 py-12 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold"
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
              <CardTitle>Profile not found</CardTitle>
              <p className="text-muted-foreground">
                No candidate found with the given ID.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
