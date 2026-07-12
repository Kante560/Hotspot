"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "../../../components/ui/button";

export default function IncidentsPage() {
  const { data: session } = useSession();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIncidents() {
      try {
        const res = await fetch("/api/incidents");
        if (res.ok) {
          const data = await res.json();
          setIncidents(data);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchIncidents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Incidents</h1>
          <p className="text-text-secondary mt-1">Manage and track reported crimes.</p>
        </div>
        <Button
          render={<Link href="/incidents/new" />}
          nativeButton={false}
          className="h-auto flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/25"
        >
          <Plus className="h-4 w-4" />
          Report Incident
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          </div>
        ) : incidents.length === 0 ? (
          <div className="col-span-full rounded-xl border border-white/8 bg-white/4 p-12 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-text-muted mb-4" />
            <h3 className="text-lg font-medium text-white">No Incidents Found</h3>
            <p className="text-text-secondary mt-1">There are currently no recorded incidents.</p>
          </div>
        ) : (
          incidents.map((inc) => (
            <Link key={inc._id} href={`/incidents/${inc._id}`} className="group block">
              <div className="rounded-xl border border-white/8 bg-white/4 p-6 backdrop-blur-md transition-all hover:border-brand-primary/50 hover:bg-white/5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border border-brand-primary/50 text-brand-primary bg-brand-primary/10">
                      👮 {inc.officerId?.name || "Unassigned"}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                      inc.severity === "High" ? "border-destructive/50 text-destructive bg-destructive/10" :
                      inc.severity === "Medium" ? "border-warning/50 text-warning bg-warning/10" :
                      "border-success/50 text-success bg-success/10"
                    }`}>
                      {inc.severity}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted">{new Date(inc.date).toLocaleDateString()}</span>
                </div>

                <h3 className="font-semibold text-white group-hover:text-brand-primary transition-colors line-clamp-1">
                  Incident Report
                </h3>
                <p className="text-sm text-text-secondary mt-1 line-clamp-2">{inc.description}</p>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-text-muted">
                  <span>📍 {inc.locationId?.name}</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                    inc.status === "Open" ? "border-warning/50 text-warning bg-warning/10" :
                    "border-success/50 text-success bg-success/10"
                  }`}>
                    {inc.status}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
