"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";

export interface PickedLocation {
  name: string;
  lat: number;
  lng: number;
}

export default function LocationSearch({
  value,
  onChange,
}: {
  value: PickedLocation | null;
  onChange: (location: PickedLocation) => void;
}) {
  const [query, setQuery] = useState(value?.name || "");
  const [results, setResults] = useState<PickedLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value && query === value.name) {
      setResults([]);
      return;
    }

    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          setResults(await res.json());
          setOpen(true);
        }
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleSelect = (place: PickedLocation) => {
    onChange(place);
    setQuery(place.name);
    setResults([]);
    setOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search for a location..."
          className="w-full rounded-md border border-white/10 bg-black/20 py-2 pl-9 pr-9 text-sm text-white placeholder:text-white/20 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-text-muted" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-white/10 bg-bg-surface shadow-lg max-h-56 overflow-y-auto">
          {results.map((place, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(place)}
              className="block w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 transition-colors"
            >
              {place.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
