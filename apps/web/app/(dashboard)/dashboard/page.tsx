import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { Shield, Map, AlertTriangle } from "lucide-react";
import Link from "next/link";
import dbConnect from "../../../lib/db/mongoose";
import { Incident } from "../../../lib/models/Incident";
import { Officer } from "../../../lib/models/Officer";
import "../../../lib/models/Location";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  await dbConnect();

  // Quick stats
  const totalIncidents = await Incident.countDocuments();
  const openIncidents = await Incident.countDocuments({ status: "Open" });

  let officerCount = 0;
  if ((session?.user as any)?.role === "admin") {
    officerCount = await Officer.countDocuments();
  }

  const recentIncidents = await Incident.find()
    .populate("locationId", "name city")
    .populate("officerId", "name")
    .sort({ date: -1 })
    .limit(10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-text-secondary mt-1">Overview of Crime Hotspot Data</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-white/8 bg-white/4 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-secondary">Total Incidents</h3>
            <AlertTriangle className="h-4 w-4 text-brand-primary" />
          </div>
          <p className="mt-2 text-3xl font-bold text-white">{totalIncidents}</p>
        </div>

        <div className="rounded-xl border border-white/8 bg-white/4 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-secondary">Open Incidents</h3>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </div>
          <p className="mt-2 text-3xl font-bold text-white">{openIncidents}</p>
        </div>

        {(session?.user as any)?.role === "admin" && (
          <div className="rounded-xl border border-white/8 bg-white/4 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-text-secondary">Active Officers</h3>
              <Shield className="h-4 w-4 text-success" />
            </div>
            <p className="mt-2 text-3xl font-bold text-white">{officerCount}</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-white/8 bg-white/4 backdrop-blur-md overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Recent Incidents</h3>
        </div>
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
              {recentIncidents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                    No incidents recorded yet.
                  </td>
                </tr>
              ) : (
                recentIncidents.map((inc: any) => (
                  <tr key={inc._id.toString()} className="hover:bg-white/5 transition-colors">
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
                    <td className="px-4 py-3">{inc.officerId?.name || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/map" className="group rounded-xl border border-white/8 bg-white/4 p-6 backdrop-blur-md hover:border-brand-primary/50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-brand-primary/20 p-3">
              <Map className="h-6 w-6 text-brand-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-brand-primary transition-colors">Hotspot Map</h3>
              <p className="text-sm text-text-secondary">View incident density and locations</p>
            </div>
          </div>
        </Link>

        <Link href="/reports" className="group rounded-xl border border-white/8 bg-white/4 p-6 backdrop-blur-md hover:border-brand-primary/50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-brand-primary/20 p-3">
              <AlertTriangle className="h-6 w-6 text-brand-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-brand-primary transition-colors">Incident Reports</h3>
              <p className="text-sm text-text-secondary">Manage and export incident data</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
