import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import dbConnect from "../../../lib/db/mongoose";
import { Incident } from "../../../lib/models/Incident";
import { Officer } from "../../../lib/models/Officer";
import { Location } from "../../../lib/models/Location";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  const query: any = {};
  if (status) query.status = status;

  await dbConnect();

  // Officers see all incidents per PRD (for spatial awareness)
  const incidents = await Incident.find(query)
    .populate("locationId", "name geo")
    .populate("officerId", "name badgeNumber")
    .sort({ date: -1 });

  return NextResponse.json(incidents);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    await dbConnect();
    
    // Determine the officer creating this
    // If admin, they can specify officerId. If officer, it uses their own.
    let officerId = data.officerId;
    if ((session as any).user.role === "officer") {
      const officer = await Officer.findOne({ userId: (session as any).user.id });
      if (!officer) throw new Error("Officer profile not found");
      officerId = officer._id;
    }

    let locationId = data.locationId;
    if (!locationId && data.lat != null && data.lng != null) {
      const location = await Location.create({
        name: data.locationName || `Pinned Location (${Number(data.lat).toFixed(4)}, ${Number(data.lng).toFixed(4)})`,
        geo: { type: "Point", coordinates: [data.lng, data.lat] },
      });
      locationId = location._id;
    }

    const incident = await Incident.create({
      locationId,
      officerId,
      date: data.date || Date.now(),
      description: data.description,
      severity: data.severity,
      status: data.status || "Open",
    });

    return NextResponse.json(incident, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
