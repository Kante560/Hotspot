import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import dbConnect from "../../../lib/db/mongoose";
import { Officer } from "../../../lib/models/Officer";
import { User } from "../../../lib/models/User";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const officers = await Officer.find({}).populate("userId", "email").sort({ name: 1 });
  return NextResponse.json(officers);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email, password, name, badgeNumber, department, role } = await req.json();
    const accountRole = role === "admin" ? "admin" : "officer";
    await dbConnect();

    // Create User first
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, role: accountRole });

    if (accountRole === "admin") {
      return NextResponse.json(
        { userId: user._id, email: user.email, role: user.role },
        { status: 201 }
      );
    }

    // Create Officer profile (only officers are assignable to incidents)
    const officer = await Officer.create({
      userId: user._id,
      name,
      badgeNumber,
      department,
    });

    return NextResponse.json(officer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
