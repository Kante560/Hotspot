"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export type IncidentLocation = {
  id: string;
  name: string;
  city: string;
  state: string;
  lat?: number;
  lng?: number;
};

export function IncidentLocationPicker({
  value,
  onChange,
}: {
  value: IncidentLocation | null;
  onChange: (location: IncidentLocation | null) => void;
}) {
  const [states, setStates] = useState<string[]>([]);
  const [areas, setAreas] = useState<IncidentLocation[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [error, setError] = useState("");

  // Load the list of states once on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/locations/states");
        const result: unknown = await response.json();
        if (!response.ok) {
          throw new Error(
            typeof result === "object" &&
              result !== null &&
              "error" in result &&
              typeof result.error === "string"
              ? result.error
              : "Could not load states."
          );
        }
        if (!cancelled) setStates(result as string[]);
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof Error ? cause.message : "Could not load states."
          );
        }
      } finally {
        if (!cancelled) setLoadingStates(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // When a state is chosen, load the seeded areas (lat/lng locations) for it
  useEffect(() => {
    if (!selectedState) {
      setAreas([]);
      onChange(null);
      return;
    }

    let cancelled = false;
    setLoadingAreas(true);
    setError("");
    onChange(null);

    (async () => {
      try {
        const params = new URLSearchParams({ state: selectedState });
        const response = await fetch(`/api/locations?${params}`);
        const result: unknown = await response.json();
        if (!response.ok) {
          throw new Error(
            typeof result === "object" &&
              result !== null &&
              "error" in result &&
              typeof result.error === "string"
              ? result.error
              : "Could not load locations for this state."
          );
        }

        if (!cancelled) {
          const stateAreas = result as IncidentLocation[];
          setAreas(stateAreas);
          // Pre-select the first area so a location is always indexed
          if (stateAreas.length > 0) {
            onChange(stateAreas[0]!);
          } else {
            setError("No seeded reporting locations were found for this state.");
          }
        }
      } catch (cause) {
        if (!cancelled) {
          setAreas([]);
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not load locations for this state."
          );
        }
      } finally {
        if (!cancelled) setLoadingAreas(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedState]);

  return (
    <div className="space-y-3">
      {/* Indexed state: kept behind the scenes and used to look up the areas */}
      <input type="hidden" name="state" value={selectedState} />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm text-text-secondary">
          State
          <select
            value={selectedState}
            onChange={(event) => setSelectedState(event.target.value)}
            disabled={loadingStates}
            className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary disabled:opacity-60"
          >
            <option value="" className="bg-bg-surface">
              {loadingStates ? "Loading states..." : "Select a state"}
            </option>
            {states.map((state) => (
              <option key={state} value={state} className="bg-bg-surface">
                {state}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 text-sm text-text-secondary">
          Area
          <select
            value={value?.id ?? ""}
            onChange={(event) =>
              onChange(
                areas.find((area) => area.id === event.target.value) ?? null
              )
            }
            disabled={!selectedState || loadingAreas || areas.length === 0}
            className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary disabled:opacity-60"
          >
            <option value="" className="bg-bg-surface">
              {loadingAreas
                ? "Loading areas..."
                : !selectedState
                  ? "Select a state first"
                  : areas.length === 0
                    ? "No areas available"
                    : "Select an area"}
            </option>
            {areas.map((area) => (
              <option key={area.id} value={area.id} className="bg-bg-surface">
                {area.name} ({area.city})
              </option>
            ))}
          </select>
        </label>
      </div>

      {loadingAreas && (
        <p className="flex items-center gap-2 text-xs text-text-muted" role="status">
          <Loader2 className="h-3 w-3 animate-spin" />
          Loading locations for {selectedState}...
        </p>
      )}

      {!loadingAreas && value && (
        <p className="text-xs text-text-muted" role="status">
          Indexed location: {value.name}, {value.city}, {value.state}
          {typeof value.lat === "number" && typeof value.lng === "number"
            ? ` (${value.lat.toFixed(4)}, ${value.lng.toFixed(4)})`
            : ""}
        </p>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
