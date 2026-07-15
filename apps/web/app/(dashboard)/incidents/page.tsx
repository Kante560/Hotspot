"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Plus, AlertTriangle, LayoutGrid, Table2, Filter, Search, X, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "../../../components/ui/button";

type LayoutMode = "cards" | "table";
type SortOrder = "desc" | "asc";

interface Filters {
  state: string;
  severity: string;
  status: string;
  sort: SortOrder;
}

const DEFAULT_FILTERS: Filters = { state: "all", severity: "all", status: "all", sort: "desc" };

export default function IncidentsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [search, setSearch] = useState("");
  const [funnelOpen, setFunnelOpen] = useState(false);
  const funnelRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<LayoutMode>("cards");

  useEffect(() => {
    if (!funnelOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (funnelRef.current && !funnelRef.current.contains(e.target as Node)) {
        setFunnelOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [funnelOpen]);

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

  const states = useMemo(() => {
    const set = new Set<string>();
    for (const inc of incidents) {
      if (inc.locationId?.state) set.add(inc.locationId.state);
    }
    return Array.from(set).sort();
  }, [incidents]);

  const activeFilterCount =
    (filters.state !== "all" ? 1 : 0) +
    (filters.severity !== "all" ? 1 : 0) +
    (filters.status !== "all" ? 1 : 0) +
    (filters.sort !== "desc" ? 1 : 0);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = incidents.filter((inc) => {
      if (filters.state !== "all" && inc.locationId?.state !== filters.state) return false;
      if (filters.severity !== "all" && inc.severity !== filters.severity) return false;
      if (filters.status !== "all" && inc.status !== filters.status) return false;
      if (q) {
        const haystack = [
          inc.officerId?.name,
          inc.officerId?.badgeNumber,
          inc.description,
          inc.locationId?.name,
          inc.locationId?.state,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    result.sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return filters.sort === "asc" ? diff : -diff;
    });
    return result;
  }, [incidents, filters, search]);

  const setFilter = (key: keyof Filters, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const hasActiveCriteria = activeFilterCount > 0 || search.trim() !== "";

  const selectClass =
    "w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-primary/50 [&>option]:bg-neutral-900";

  const severityBadge = (severity: string) =>
    `inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
      severity === "High" ? "border-destructive/50 text-destructive bg-destructive/10" :
      severity === "Medium" ? "border-warning/50 text-warning bg-warning/10" :
      "border-success/50 text-success bg-success/10"
    }`;

  const statusBadge = (status: string) =>
    `inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${
      status === "Open" ? "border-warning/50 text-warning bg-warning/10" :
      "border-success/50 text-success bg-success/10"
    }`;

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

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative" ref={funnelRef}>
            <button
              type="button"
              onClick={() => setFunnelOpen((open) => !open)}
              className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                activeFilterCount > 0
                  ? "border-brand-primary/50 bg-brand-primary/10 text-brand-primary"
                  : "border-white/10 bg-white/5 text-white hover:border-white/20"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-[10px] font-semibold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {funnelOpen && (
              <div className="absolute left-0 top-full z-20 mt-2 w-64 space-y-3 rounded-xl border border-white/10 bg-neutral-900 p-4 shadow-xl">
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-muted">State</label>
                  <select
                    value={filters.state}
                    onChange={(e) => setFilter("state", e.target.value)}
                    className={selectClass}
                  >
                    <option value="all">All States</option>
                    {states.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-text-muted">Severity</label>
                  <select
                    value={filters.severity}
                    onChange={(e) => setFilter("severity", e.target.value)}
                    className={selectClass}
                  >
                    <option value="all">All Severities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-text-muted">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilter("status", e.target.value)}
                    className={selectClass}
                  >
                    <option value="all">All Statuses</option>
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-text-muted">Sort by Date</label>
                  <button
                    type="button"
                    onClick={() => setFilter("sort", filters.sort === "desc" ? "asc" : "desc")}
                    className="flex w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:border-white/20"
                  >
                    {filters.sort === "desc" ? "Newest first" : "Oldest first"}
                    <ArrowUpDown className="h-4 w-4 text-text-muted" />
                  </button>
                </div>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="w-full rounded-md border border-white/10 px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-destructive/50 hover:text-destructive"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search officer, description, location..."
              className="w-full rounded-md border border-white/10 bg-white/5 py-2 pl-9 pr-8 text-sm text-white placeholder:text-text-muted outline-none focus:border-brand-primary/50"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {hasActiveCriteria && (
            <span className="whitespace-nowrap text-xs text-text-muted">
              {filtered.length} incident{filtered.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        <div className="flex items-center rounded-md border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setLayout("cards")}
            aria-label="Card layout"
            className={`rounded p-1.5 transition-colors ${layout === "cards" ? "bg-brand-primary/20 text-brand-primary" : "text-text-muted hover:text-white"}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setLayout("table")}
            aria-label="Table layout"
            className={`rounded p-1.5 transition-colors ${layout === "table" ? "bg-brand-primary/20 text-brand-primary" : "text-text-muted hover:text-white"}`}
          >
            <Table2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-white/8 bg-white/4 p-12 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-text-muted mb-4" />
          <h3 className="text-lg font-medium text-white">No Incidents Found</h3>
          <p className="text-text-secondary mt-1">
            {hasActiveCriteria
              ? "No incidents match your current filters."
              : "There are currently no recorded incidents."}
          </p>
          {hasActiveCriteria && (
            <button
              type="button"
              onClick={() => { setFilters(DEFAULT_FILTERS); setSearch(""); }}
              className="mt-4 text-sm text-brand-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : layout === "cards" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((inc) => (
            <Link key={inc._id} href={`/incidents/${inc._id}`} className="group block">
              <div className="rounded-xl border border-white/8 bg-white/4 p-6 backdrop-blur-md transition-all hover:border-brand-primary/50 hover:bg-white/5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border border-brand-primary/50 text-brand-primary bg-brand-primary/10">
                      👮 {inc.officerId?.name || "Unassigned"}
                    </span>
                    <span className={severityBadge(inc.severity)}>{inc.severity}</span>
                  </div>
                  <span className="text-xs text-text-muted">{new Date(inc.date).toLocaleDateString()}</span>
                </div>

                <h3 className="font-semibold text-white group-hover:text-brand-primary transition-colors line-clamp-1">
                  Incident Report
                </h3>
                <p className="text-sm text-text-secondary mt-1 line-clamp-2">{inc.description}</p>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-text-muted">
                  <span>
                    📍 {inc.locationId?.name}
                    {inc.locationId?.state ? `, ${inc.locationId.state}` : ""}
                  </span>
                  <span className={statusBadge(inc.status)}>{inc.status}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/8 bg-white/4 backdrop-blur-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-text-muted">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">State</th>
                <th className="px-4 py-3 font-medium">Officer</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inc) => (
                <tr
                  key={inc._id}
                  onClick={() => router.push(`/incidents/${inc._id}`)}
                  className="cursor-pointer border-b border-white/5 last:border-0 transition-colors hover:bg-white/5"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-text-muted">
                    {new Date(inc.date).toLocaleDateString()}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-white">
                    <span className="line-clamp-1">{inc.description}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{inc.locationId?.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{inc.locationId?.state || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{inc.officerId?.name || "Unassigned"}</td>
                  <td className="px-4 py-3"><span className={severityBadge(inc.severity)}>{inc.severity}</span></td>
                  <td className="px-4 py-3"><span className={statusBadge(inc.status)}>{inc.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
