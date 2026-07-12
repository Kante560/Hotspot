import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { PipelineStage } from "mongoose";
import { authOptions } from "../../../lib/auth";
import dbConnect from "../../../lib/db/mongoose";
import { Incident } from "../../../lib/models/Incident";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");

  const matchStage: any = {};

  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = new Date(startDate);
    if (endDate) matchStage.date.$lte = new Date(endDate);
  }

  await dbConnect();
  
  const pipeline: PipelineStage[] = [];
  
  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage });
  }

  pipeline.push({
    $group: {
      _id: "$locationId",
      incidentCount: { $sum: 1 },
      severities: { $push: "$severity" }
    }
  });

  pipeline.push({
    $lookup: {
      from: "locations",
      localField: "_id",
      foreignField: "_id",
      as: "location"
    }
  });

  pipeline.push({
    $unwind: "$location"
  });

  pipeline.push({
    $sort: { incidentCount: -1 }
  });

  const hotspots = await Incident.aggregate(pipeline);

  const severityRank: Record<string, number> = { Low: 1, Medium: 2, High: 3 };
  const withSeverity = hotspots.map((h) => {
    const maxSeverity = (h.severities || []).reduce((max: string, s: string) => {
      if (!s) return max;
      return !max || (severityRank[s] ?? 0) > (severityRank[max] ?? 0) ? s : max;
    }, "");
    return { ...h, maxSeverity: maxSeverity || "Low" };
  });

  return NextResponse.json(withSeverity);
}
