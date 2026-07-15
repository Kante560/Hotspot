"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";

export default function OfficersPage() {
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newOfficer, setNewOfficer] = useState({
    name: "",
    badgeNumber: "",
    department: "",
    email: "", // Creates user account under the hood
    password: "",
    role: "officer" as "officer" | "admin",
  });

  useEffect(() => {
    fetchOfficers();
  }, []);

  async function fetchOfficers() {
    setLoading(true);
    try {
      const res = await fetch("/api/officers");
      if (res.ok) {
        setOfficers(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/officers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOfficer)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create officer");
      }
      if (newOfficer.role === "admin") {
        setSuccess(`Admin account created for ${newOfficer.email}.`);
      }
      setNewOfficer({ name: "", badgeNumber: "", department: "", email: "", password: "", role: "officer" });
      await fetchOfficers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Manage Officers</h1>
        <p className="text-text-secondary mt-1">Register new officers and manage personnel access.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <div className="rounded-xl border border-white/8 bg-white/4 p-6 backdrop-blur-md sticky top-24">
            <h3 className="text-lg font-semibold text-white mb-4">Register Personnel</h3>
            {error && (
              <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-md bg-success/10 p-3 text-sm text-success border border-success/20">
                {success}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Role</Label>
                <select
                  value={newOfficer.role}
                  onChange={(e) => setNewOfficer({ ...newOfficer, role: e.target.value as "officer" | "admin" })}
                  className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                >
                  <option value="officer" className="bg-bg-surface">Officer</option>
                  <option value="admin" className="bg-bg-surface">Admin</option>
                </select>
              </div>
              {newOfficer.role === "officer" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-white">Full Name</Label>
                    <Input
                      required
                      value={newOfficer.name}
                      onChange={(e) => setNewOfficer({ ...newOfficer, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="bg-black/20 text-white border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Badge Number</Label>
                    <Input
                      value={newOfficer.badgeNumber}
                      onChange={(e) => setNewOfficer({ ...newOfficer, badgeNumber: e.target.value })}
                      placeholder="e.g. CRS-1234"
                      className="bg-black/20 text-white border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Department</Label>
                    <Input
                      value={newOfficer.department}
                      onChange={(e) => setNewOfficer({ ...newOfficer, department: e.target.value })}
                      placeholder="e.g. Homicide"
                      className="bg-black/20 text-white border-white/10"
                    />
                  </div>
                </>
              )}
              <div className="pt-2 border-t border-white/10 space-y-4">
                <h4 className="text-sm font-medium text-white">Account Details</h4>
                <div className="space-y-2">
                  <Label className="text-white">Email Address</Label>
                  <Input
                    required
                    type="email"
                    value={newOfficer.email}
                    onChange={(e) => setNewOfficer({ ...newOfficer, email: e.target.value })}
                    placeholder="officer@crs.gov.ng"
                    className="bg-black/20 text-white border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Initial Password</Label>
                  <Input
                    required
                    type="password"
                    value={newOfficer.password}
                    onChange={(e) => setNewOfficer({ ...newOfficer, password: e.target.value })}
                    className="bg-black/20 text-white border-white/10"
                  />
                </div>
              </div>
              
              <Button type="submit" disabled={submitting} className="w-full mt-4 bg-brand-primary text-white hover:bg-brand-primary/90">
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                {newOfficer.role === "admin" ? "Create Admin Account" : "Register Officer"}
              </Button>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="rounded-xl border border-white/8 bg-white/4 backdrop-blur-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-secondary">
                <thead className="bg-white/5 text-white">
                  <tr>
                    <th className="px-4 py-3 font-medium">Officer</th>
                    <th className="px-4 py-3 font-medium">Badge</th>
                    <th className="px-4 py-3 font-medium">Department</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand-primary" />
                      </td>
                    </tr>
                  ) : officers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-text-muted">
                        No officers registered.
                      </td>
                    </tr>
                  ) : (
                    officers.map((officer) => (
                      <tr key={officer._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-white">{officer.name}</div>
                          <div className="text-xs text-text-muted">{officer.userId?.email}</div>
                        </td>
                        <td className="px-4 py-3 text-white">{officer.badgeNumber || "-"}</td>
                        <td className="px-4 py-3 text-white">{officer.department || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
