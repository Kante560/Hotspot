"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";

const SEVERITY_COLORS: Record<string, string> = {
  Low: "#10B981",
  Medium: "#F59E0B",
  High: "#EF4444",
};

function HeatmapLayer({ data }: { data: any[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !data || data.length === 0) return;

    // Data should be [lat, lng, intensity]
    const heatData = data.map((point) => [
      point.location.geo.coordinates[1], // lat
      point.location.geo.coordinates[0], // lng
      point.incidentCount * 10 // intensity multiplier
    ]);

    const heatLayer = (L as any).heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.4: "blue", 0.6: "cyan", 0.7: "lime", 0.8: "yellow", 1.0: "red" }
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, data]);

  return null;
}

export default function HotspotMap({ hotspots }: { hotspots: any[] }) {
  // Center roughly on Cross River State
  const center: [number, number] = [5.9, 8.5];

  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      <MapContainer center={center} zoom={7} className="h-full w-full" scrollWheelZoom={false}>
        {/* CartoDB Dark Matter Tiles for the premium dark theme */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <HeatmapLayer data={hotspots} />

        {hotspots.map((hotspot) => {
          const color = SEVERITY_COLORS[hotspot.maxSeverity] || SEVERITY_COLORS.Low;
          const severityCounts: Record<string, number> = {};
          for (const s of hotspot.severities || []) {
            severityCounts[s] = (severityCounts[s] || 0) + 1;
          }

          return (
            <CircleMarker
              key={hotspot._id}
              center={[hotspot.location.geo.coordinates[1], hotspot.location.geo.coordinates[0]]}
              radius={10}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.8, weight: 2 }}
            >
              <Popup className="bg-background text-foreground border border-white/10 rounded-lg">
                <div className="p-1">
                  <h3 className="font-semibold text-lg">{hotspot.location.name}</h3>
                  <p className="text-sm text-text-secondary mt-1">Incidents: <span className="font-bold text-white">{hotspot.incidentCount}</span></p>
                  <p className="text-xs text-text-muted mt-1">{hotspot.location.city}</p>
                  <div className="mt-2 flex gap-2 text-xs">
                    {Object.entries(severityCounts).map(([sev, count]) => (
                      <span key={sev} style={{ color: SEVERITY_COLORS[sev] }}>
                        {sev}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
