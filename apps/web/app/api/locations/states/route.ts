import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import dbConnect from "../../../../lib/db/mongoose";
import { Location } from "../../../../lib/models/Location";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const states = await Location.distinct("state");
  return NextResponse.json(states.sort((a, b) => a.localeCompare(b)));
}
