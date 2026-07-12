import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q");

  if (!q || q.trim().length < 3) {
    return NextResponse.json([]);
  }

  const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search");
  nominatimUrl.searchParams.set("format", "json");
  nominatimUrl.searchParams.set("q", q);
  nominatimUrl.searchParams.set("countrycodes", "ng");
  nominatimUrl.searchParams.set("limit", "5");

  const res = await fetch(nominatimUrl, {
    headers: {
      "User-Agent": "crime-hotspot-mvp (Cross River State Police incident reporting)",
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Location search failed" }, { status: 502 });
  }

  const results = await res.json();

  const places = results.map((r: any) => ({
    name: r.display_name,
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
  }));

  return NextResponse.json(places);
}
