import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../lib/models/User";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from the root of apps/web
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/crime-hotspot-mvp";

async function seed() {
  try {
    console.log("Connecting to MongoDB...", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    const email = "esemeudo@gmail.com";
    const existing = await User.findOne({ email });

    if (existing) {
      console.log("Admin user already exists.");
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash("12345678", 10);

    const admin = new User({
      email,
      passwordHash,
      role: "admin",
    });

    await admin.save();
    console.log(`Admin user seeded successfully. Email: ${email} | Password: 12345678`);
    
    process.exit(0);
  } catch (err) {
    console.error("Error seeding admin:", err);
    process.exit(1);
  }
}

seed();
