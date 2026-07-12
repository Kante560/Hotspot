"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, Loader2, FileText, MapPin, User, Calendar, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function IncidentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [officers, setOfficers] = useState<any[]>([]);
  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchIncident();
    if (role === "admin") fetchOfficers();
  }, [id, role]);

  async function fetchIncident() {
    try {
      const res = await fetch(`/api/incidents/${id}`);
      if (res.ok) {
        const data = await res.json();
        setIncident(data);
        setSelectedOfficerId(data.officerId?._id || "");
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchOfficers() {
    const res = await fetch("/api/officers");
    if (res.ok) setOfficers(await res.json());
  }

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setIncident(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignOfficer = async () => {
    if (!selectedOfficerId) return;
    setAssigning(true);
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ officerId: selectedOfficerId })
      });
      if (res.ok) {
        await fetchIncident();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-brand-primary" /></div>;
  }

  if (!incident) {
    return <div className="text-center text-text-secondary py-12">Incident not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link
        href="/incidents"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Incidents
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">Incident Report</h1>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
              incident.status === "Open" ? "border-warning/50 text-warning bg-warning/10" :
              "border-success/50 text-success bg-success/10"
            }`}>
              {incident.status}
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
              incident.severity === "High" ? "border-destructive/50 text-destructive bg-destructive/10" :
              incident.severity === "Medium" ? "border-warning/50 text-warning bg-warning/10" :
              "border-success/50 text-success bg-success/10"
            }`}>
              {incident.severity}
            </span>
          </div>
          <p className="text-text-secondary mt-1 font-mono text-xs">ID: {incident._id}</p>
        </div>

        <div className="flex items-center gap-2">
          {incident.status !== "Closed" && role === "admin" && (
            <Button
              variant="outline"
              className="border-success text-success hover:bg-success/10"
              onClick={() => handleUpdateStatus("Closed")}
            >
              Close Case
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-white/4 p-6 backdrop-blur-md">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-brand-primary" />
          Incident Details
        </h3>
        <div className="space-y-4">
          <div>
            <Label className="text-text-muted text-xs uppercase tracking-wider">Description</Label>
            <p className="text-white mt-1 whitespace-pre-wrap">{incident.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <Label className="text-text-muted text-xs uppercase tracking-wider flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Location
              </Label>
              <p className="text-white mt-1">{incident.locationId?.name}</p>
              <p className="text-xs text-text-secondary">{incident.locationId?.city}</p>
            </div>
            <div>
              <Label className="text-text-muted text-xs uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Date & Time
              </Label>
              <p className="text-white mt-1">{new Date(incident.date).toLocaleString()}</p>
            </div>
            <div className="col-span-2">
              <Label className="text-text-muted text-xs uppercase tracking-wider flex items-center gap-1">
                <User className="h-3 w-3" /> Assigned Officer
              </Label>
              {role === "admin" ? (
                <div className="mt-1 flex items-center gap-2">
                  <select
                    value={selectedOfficerId}
                    onChange={(e) => setSelectedOfficerId(e.target.value)}
                    className="flex-1 rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  >
                    <option value="" className="bg-bg-surface">Unassigned</option>
                    {officers.map((o) => (
                      <option key={o._id} value={o._id} className="bg-bg-surface">
                        {o.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    disabled={assigning || !selectedOfficerId || selectedOfficerId === incident.officerId?._id}
                    onClick={handleAssignOfficer}
                    className="h-auto bg-brand-primary text-white hover:bg-brand-primary/90 px-4 py-2"
                  >
                    {assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                  </Button>
                </div>
              ) : (
                <p className="text-white mt-1">{incident.officerId?.name || "—"}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
