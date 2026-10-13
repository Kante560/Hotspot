"use client";

import { useMemo, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export type IncidentLocation = {
  id: string;
  name: string;
  city: string;
  state: string;
};

type DevicePosition = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

export function IncidentLocationPicker({
  value,
  onChange,
}: {
  value: IncidentLocation | null;
  onChange: (location: IncidentLocation | null) => void;
}) {
  const [position, setPosition] = useState<DevicePosition | null>(null);
  const [locations, setLocations] = useState<IncidentLocation[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  const states = useMemo(
    () => [...new Set(locations.map((location) => location.state))].sort(),
    [locations]
  );
  const cities = useMemo(
    () =>
      [
        ...new Set(
          locations
            .filter((location) => location.state === selectedState)
            .map((location) => location.city)
        ),
      ].sort(),
    [locations, selectedState]
  );
  const reportingLocations = useMemo(
    () =>
      locations.filter(
        (location) =>
          location.state === selectedState && location.city === selectedCity
      ),
    [locations, selectedCity, selectedState]
  );

  const chooseState = (state: string) => {
    setSelectedState(state);
    const firstCity = locations.find((location) => location.state === state)?.city ?? "";
    setSelectedCity(firstCity);
    onChange(
      locations.find(
        (location) => location.state === state && location.city === firstCity
      ) ?? null
    );
  };

  const chooseCity = (city: string) => {
    setSelectedCity(city);
    onChange(
      locations.find(
        (location) => location.state === selectedState && location.city === city
      ) ?? null
    );
  };

  const locateDevice = () => {
    if (!navigator.geolocation) {
      setError("This browser does not support device location.");
      return;
    }

    setError("");
    setLocating(true);
    onChange(null);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const devicePosition = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        };
        setPosition(devicePosition);

        try {
          const params = new URLSearchParams({
            lat: String(coords.latitude),
            lng: String(coords.longitude),
          });
          const response = await fetch(`/api/locations/nearby?${params}`);
          const result: unknown = await response.json();
          if (!response.ok) {
            const message =
              typeof result === "object" &&
              result !== null &&
              "error" in result &&
              typeof result.error === "string"
                ? result.error
                : "Could not find nearby reporting locations.";
            throw new Error(message);
          }

          const nearbyLocations = result as IncidentLocation[];
          setLocations(nearbyLocations);
          if (nearbyLocations.length === 0) {
            setSelectedState("");
            setSelectedCity("");
            setError("No seeded reporting locations were found within 100 km.");
            return;
          }

          const nearest = nearbyLocations[0]!;
          setSelectedState(nearest.state);
          setSelectedCity(nearest.city);
          onChange(nearest);
        } catch (cause) {
          setLocations([]);
          setSelectedState("");
          setSelectedCity("");
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not find nearby reporting locations."
          );
        } finally {
          setLocating(false);
        }
      },
      (geolocationError) => {
        const messages: Record<number, string> = {
          1: "Location permission was denied. Allow location access in your browser settings, then try again.",
          2: "Your device could not determine its location. Check that location services are enabled, then try again.",
          3: "The location request timed out. Please try again.",
        };
        setError(
          messages[geolocationError.code] ??
            "Could not get your device location. Please try again."
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        onClick={locateDevice}
        disabled={locating}
        className="h-auto w-full justify-center gap-2 px-4 py-2.5"
      >
        {locating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MapPin className="h-4 w-4" />
        )}
        {locating
          ? "Getting your location..."
          : position
            ? "Refresh current location"
            : "Get current location"}
      </Button>

      {position && (
        <p className="text-xs text-text-muted" role="status">
          Device location: {position.latitude.toFixed(5)},{" "}
          {position.longitude.toFixed(5)} (accuracy approximately{" "}
          {Math.round(position.accuracy)} m)
        </p>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {locations.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="space-y-1.5 text-sm text-text-secondary">
            State
            <select
              value={selectedState}
              onChange={(event) => chooseState(event.target.value)}
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              {states.map((state) => (
                <option key={state} value={state} className="bg-bg-surface">
                  {state}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 text-sm text-text-secondary">
            City
            <select
              value={selectedCity}
              onChange={(event) => chooseCity(event.target.value)}
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              {cities.map((city) => (
                <option key={city} value={city} className="bg-bg-surface">
                  {city}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 text-sm text-text-secondary">
            Reporting location
            <select
              value={value?.id ?? ""}
              onChange={(event) =>
                onChange(
                  reportingLocations.find(
                    (location) => location.id === event.target.value
                  ) ?? null
                )
              }
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              {reportingLocations.map((location) => (
                <option
                  key={location.id}
                  value={location.id}
                  className="bg-bg-surface"
                >
                  {location.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
