"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle, Loader2 } from "lucide-react";

// Dynamically import the map component with SSR disabled
const HotspotMap = dynamic(() => import("../../../components/HotspotMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
    </div>
  ),
});

export default function MapPage() {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchHotspots() {
      try {
        const res = await fetch("/api/hotspots");
        if (!res.ok) throw new Error("Failed to fetch hotspots");
        const data = await res.json();
        setHotspots(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchHotspots();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Hotspot Analysis Map</h1>
        <p className="text-text-secondary mt-1">Geospatial view of incident densities across Cross River State.</p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {!error && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <HotspotMap hotspots={hotspots} />
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-white/8 bg-white/4 p-6 backdrop-blur-md">
              <h3 className="font-semibold text-white mb-4">Top Hotspots</h3>
              {loading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  {hotspots.slice(0, 5).map((h: any, index: number) => (
                    <div key={h._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary/20 text-xs font-medium text-brand-primary">
                          {index + 1}
                        </span>
                        <span
                          className={`h-2 w-2 rounded-full ${
                            h.maxSeverity === "High" ? "bg-destructive" :
                            h.maxSeverity === "Medium" ? "bg-warning" : "bg-success"
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium text-white">{h.location.name}</p>
                          <p className="text-xs text-text-muted">{h.location.city}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-white">{h.incidentCount}</span>
                    </div>
                  ))}
                  {hotspots.length === 0 && (
                    <p className="text-sm text-text-muted text-center py-4">No incidents recorded yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
