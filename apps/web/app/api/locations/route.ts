import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import dbConnect from "../../../lib/db/mongoose";
import { Location } from "../../../lib/models/Location";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const state = req.nextUrl.searchParams.get("state");

  await dbConnect();
  const query = state ? { state } : {};
  const locations = await Location.find(query)
    .sort({ state: 1, city: 1, name: 1 })
    .lean();

  return NextResponse.json(
    locations.map((location) => ({
      id: location._id.toString(),
      name: location.name,
      city: location.city,
      state: location.state,
      lat: location.geo.coordinates[1],
      lng: location.geo.coordinates[0],
    }))
  );
}
