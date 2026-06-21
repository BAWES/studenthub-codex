"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, IdCard } from "lucide-react";
import { idCardDownloadSchema, buildIdCardDownloadUrl } from "../schemas";
import { ZodError } from "zod";

export function AdminDocumentsPanel() {
  const [candidateId, setCandidateId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleIdCardDownload() {
    setError(null);
    setLoading(true);

    try {
      const parsed = idCardDownloadSchema.parse({ candidateId });
      const url = buildIdCardDownloadUrl(parsed.candidateId);
      window.open(url, "_blank");
    } catch (e) {
      if (e instanceof ZodError) {
        setError(e.errors.map((err) => err.message).join(". "));
      } else {
        setError("Validation failed. Please check your input.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Document Generation</h1>
        <p className="text-muted-foreground mt-1">
          Generate and download PDF documents — ID cards for candidates.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive border border-destructive/30 rounded-md px-4 py-3 text-sm flex items-start gap-2">
          <span className="font-medium">Error:</span>
          <span>{error}</span>
        </div>
      )}

      {/* ─── ID Card Tab ─────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IdCard className="size-5 text-primary" />
            Candidate ID Card
          </CardTitle>
          <CardDescription>
            Generate a PDF of a candidate&apos;s ID card by entering their candidate ID.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="candidate-id">Candidate ID</Label>
            <Input
              id="candidate-id"
              type="number"
              min={1}
              placeholder="e.g. 12345"
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleIdCardDownload(); }}
            />
            <p className="text-xs text-muted-foreground">
              The numeric ID of the candidate whose ID card you want to export.
            </p>
          </div>
          <Button
            onClick={handleIdCardDownload}
            disabled={loading || !candidateId.trim()}
            className="gap-2"
          >
            <Download className="size-4" />
            {loading ? "Downloading..." : "Download ID Card PDF"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">API Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">GET</span>{" "}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded break-all">
                /api/candidates/{`{candidateId}`}/id-card/pdf?format=pdf
              </code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
