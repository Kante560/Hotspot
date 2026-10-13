import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import dbConnect from "../../../../lib/db/mongoose";
import { Location } from "../../../../lib/models/Location";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const latitudeParam = request.nextUrl.searchParams.get("lat");
  const longitudeParam = request.nextUrl.searchParams.get("lng");
  const latitude = Number(latitudeParam);
  const longitude = Number(longitudeParam);
  if (
    latitudeParam === null ||
    longitudeParam === null ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return NextResponse.json(
      { error: "A valid device latitude and longitude are required." },
      { status: 400 }
    );
  }

  await dbConnect();
  const locations = await Location.find({
    geo: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: 100_000,
      },
    },
  })
    .select("name city state")
    .limit(100)
    .lean();

  return NextResponse.json(
    locations.map((location) => ({
      id: location._id.toString(),
      name: location.name,
      city: location.city,
      state: location.state,
    }))
  );
}
