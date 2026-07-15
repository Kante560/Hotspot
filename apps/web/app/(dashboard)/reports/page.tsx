"use client";

import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import Papa from "papaparse";

export default function ReportsPage() {
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

  const handleExport = () => {
    const exportData = incidents.map(inc => ({
      ID: inc._id,
      Date: new Date(inc.date).toLocaleDateString(),
      Severity: inc.severity || "Unknown",
      Location: inc.locationId?.name || "Unknown",
      City: inc.locationId?.city || "Unknown",
      Status: inc.status,
      Officer: inc.officerId?.name || "Unknown",
      Description: inc.description
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `incidents_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Incident Reports</h1>
          <p className="text-text-secondary mt-1">View and export all recorded incidents.</p>
        </div>
        <button
          onClick={handleExport}
          disabled={incidents.length === 0}
          className="flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="rounded-xl border border-white/8 bg-white/4 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-secondary">
            <thead className="bg-white/5 text-white">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Officer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand-primary" />
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                    No incidents found.
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-white">{new Date(inc.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                        inc.severity === "High" ? "border-destructive/50 text-destructive bg-destructive/10" :
                        inc.severity === "Medium" ? "border-warning/50 text-warning bg-warning/10" :
                        "border-success/50 text-success bg-success/10"
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white">{inc.locationId?.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                        inc.status === "Open" ? "border-warning/50 text-warning bg-warning/10" :
                        "border-success/50 text-success bg-success/10"
                      }`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{inc.officerId?.name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
