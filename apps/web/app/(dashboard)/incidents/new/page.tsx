"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import LocationSearch, { type PickedLocation } from "@/components/LocationSearch";

const SEVERITIES = [
  { value: "Low", label: "Low", color: "success" },
  { value: "Medium", label: "Medium", color: "warning" },
  { value: "High", label: "High", color: "destructive" },
] as const;

export default function NewIncidentPage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"Low" | "Medium" | "High" | null>(null);
  const [location, setLocation] = useState<PickedLocation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = description.trim().length > 0 && severity && location && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          severity,
          lat: location!.lat,
          lng: location!.lng,
          locationName: location!.name,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to report incident");
      }

      router.push("/incidents");
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Report Incident</h1>
        <p className="text-text-secondary mt-1">
          Record a new incident with its severity and location.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="rounded-xl border border-white/8 bg-white/4 p-6 backdrop-blur-md space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Description</Label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened..."
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Severity</Label>
            <div className="flex gap-3">
              {SEVERITIES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSeverity(s.value)}
                  className={cn(
                    "flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                    s.color === "success" &&
                      (severity === s.value
                        ? "border-success bg-success/20 text-success"
                        : "border-success/30 text-success/70 hover:bg-success/10"),
                    s.color === "warning" &&
                      (severity === s.value
                        ? "border-warning bg-warning/20 text-warning"
                        : "border-warning/30 text-warning/70 hover:bg-warning/10"),
                    s.color === "destructive" &&
                      (severity === s.value
                        ? "border-destructive bg-destructive/20 text-destructive"
                        : "border-destructive/30 text-destructive/70 hover:bg-destructive/10")
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Location</Label>
            <p className="text-xs text-text-muted">Search for the incident location by name.</p>
            <LocationSearch value={location} onChange={setLocation} />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={!canSubmit}
            className="h-auto bg-brand-primary text-white hover:bg-brand-primary/90 px-6 py-2.5"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Report
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-auto px-6 py-2.5"
            onClick={() => router.push("/incidents")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
