import mongoose from "mongoose";
import { Location } from "../lib/models/Location";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from the root of apps/web
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/crime-hotspot-mvp";

const locations = [
  { name: "Calabar Municipal", city: "Calabar", geo: { type: "Point", coordinates: [8.3286, 4.9583] } },
  { name: "Calabar South", city: "Calabar", geo: { type: "Point", coordinates: [8.3167, 4.9333] } },
  { name: "Ikom Urban", city: "Ikom", geo: { type: "Point", coordinates: [8.7167, 5.9667] } },
  { name: "Ugep Central", city: "Ugep", geo: { type: "Point", coordinates: [8.0833, 5.8087] } },
  { name: "Ogoja Main", city: "Ogoja", geo: { type: "Point", coordinates: [8.7969, 6.6598] } },
  { name: "Obudu Center", city: "Obudu", geo: { type: "Point", coordinates: [9.1667, 6.6667] } },
  { name: "Akamkpa Station", city: "Akamkpa", geo: { type: "Point", coordinates: [8.3667, 5.3167] } },
  { name: "Boki Hub", city: "Boki", geo: { type: "Point", coordinates: [8.9167, 6.2500] } },
  { name: "Yala Junction", city: "Yala", geo: { type: "Point", coordinates: [8.6333, 6.7000] } },
  { name: "Biase Market", city: "Biase", geo: { type: "Point", coordinates: [8.0833, 5.5667] } },
  { name: "Abi Station", city: "Abi", geo: { type: "Point", coordinates: [7.9667, 5.8833] } },
  { name: "Yakurr Plaza", city: "Yakurr", geo: { type: "Point", coordinates: [8.1167, 5.8167] } },
  { name: "Obubra Checkpoint", city: "Obubra", geo: { type: "Point", coordinates: [8.3333, 6.0833] } },
  { name: "Etung Gate", city: "Etung", geo: { type: "Point", coordinates: [8.7833, 5.9167] } },
  { name: "Odukpani Road", city: "Odukpani", geo: { type: "Point", coordinates: [8.3167, 5.2167] } },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    console.log("Clearing existing locations...");
    await Location.deleteMany({});

    console.log("Inserting mock locations...");
    await Location.insertMany(locations);

    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding locations:", err);
    process.exit(1);
  }
}

seed();
