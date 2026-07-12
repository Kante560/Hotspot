import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db/mongoose";
import { User } from "@/lib/models/User";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  await dbConnect();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Public self-signup always creates an officer account.
  // Admin accounts are provisioned via scripts/seed-admin.ts.
  const user = await User.create({
    email,
    passwordHash,
    role: "officer",
  });

  return NextResponse.json(
    { message: "Account created successfully", userId: user._id },
    { status: 201 }
  );
}
