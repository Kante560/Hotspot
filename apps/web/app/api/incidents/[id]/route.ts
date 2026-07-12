import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import dbConnect from "../../../../lib/db/mongoose";
import { Incident } from "../../../../lib/models/Incident";
import { Officer } from "../../../../lib/models/Officer";
import "../../../../lib/models/Location";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await dbConnect();

  const incident = await Incident.findById(id)
    .populate("locationId", "name geo")
    .populate("officerId", "name badgeNumber");

  if (!incident) return NextResponse.json({ error: "Incident not found" }, { status: 404 });

  return NextResponse.json(incident);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await dbConnect();
    const data = await req.json();
    const incident = await Incident.findById(id);
    
    if (!incident) return NextResponse.json({ error: "Incident not found" }, { status: 404 });

    // Check permissions
    if ((session as any).user.role === "officer") {
      const officer = await Officer.findOne({ userId: (session as any).user.id });
      if (!officer || !incident.officerId || incident.officerId.toString() !== officer._id.toString()) {
        return NextResponse.json({ error: "Forbidden: You can only edit your own incidents" }, { status: 403 });
      }
    }

    // Only admins can (re)assign an incident to an officer
    if (data.officerId) {
      if ((session as any).user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden: Only admins can assign incidents" }, { status: 403 });
      }
      incident.officerId = data.officerId;
    }

    // Update fields
    if (data.locationId) incident.locationId = data.locationId;
    if (data.date) incident.date = data.date;
    if (data.description) incident.description = data.description;
    if (data.severity) incident.severity = data.severity;
    if (data.status) incident.status = data.status;

    await incident.save();

    return NextResponse.json(incident);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
