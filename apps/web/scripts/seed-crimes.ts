import mongoose from "mongoose";
import { Location } from "../lib/models/Location";
import { Incident } from "../lib/models/Incident";
import { Officer } from "../lib/models/Officer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from the root of apps/web
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/crime-hotspot-mvp";

// geo.coordinates are [lng, lat]
const locations = [
  // Nigeria — Cross River
  { name: "Calabar Municipal", city: "Calabar", state: "Cross River", country: "Nigeria", geo: { type: "Point", coordinates: [8.3286, 4.9583] } },
  { name: "Ikom Urban", city: "Ikom", state: "Cross River", country: "Nigeria", geo: { type: "Point", coordinates: [8.7167, 5.9667] } },
  { name: "Ogoja Main", city: "Ogoja", state: "Cross River", country: "Nigeria", geo: { type: "Point", coordinates: [8.7969, 6.6598] } },
  // Nigeria — Lagos
  { name: "Ikeja GRA", city: "Ikeja", state: "Lagos", country: "Nigeria", geo: { type: "Point", coordinates: [3.3515, 6.6018] } },
  { name: "Victoria Island", city: "Lagos", state: "Lagos", country: "Nigeria", geo: { type: "Point", coordinates: [3.4219, 6.4281] } },
  { name: "Surulere Stadium Area", city: "Surulere", state: "Lagos", country: "Nigeria", geo: { type: "Point", coordinates: [3.3554, 6.5005] } },
  // Nigeria — FCT
  { name: "Wuse Market", city: "Abuja", state: "FCT", country: "Nigeria", geo: { type: "Point", coordinates: [7.4635, 9.0765] } },
  { name: "Garki Area 11", city: "Abuja", state: "FCT", country: "Nigeria", geo: { type: "Point", coordinates: [7.4913, 9.0338] } },
  // Nigeria — Rivers
  { name: "Port Harcourt Waterfront", city: "Port Harcourt", state: "Rivers", country: "Nigeria", geo: { type: "Point", coordinates: [7.0134, 4.8156] } },
  // Nigeria — Kano
  { name: "Kano Sabon Gari", city: "Kano", state: "Kano", country: "Nigeria", geo: { type: "Point", coordinates: [8.5364, 12.0022] } },
  // Ghana — Greater Accra
  { name: "Osu Oxford Street", city: "Accra", state: "Greater Accra", country: "Ghana", geo: { type: "Point", coordinates: [-0.1770, 5.5571] } },
  { name: "Madina Market", city: "Accra", state: "Greater Accra", country: "Ghana", geo: { type: "Point", coordinates: [-0.1657, 5.6837] } },
  // Kenya — Nairobi
  { name: "Nairobi CBD", city: "Nairobi", state: "Nairobi County", country: "Kenya", geo: { type: "Point", coordinates: [36.8219, -1.2921] } },
  // South Africa — Gauteng
  { name: "Johannesburg Hillbrow", city: "Johannesburg", state: "Gauteng", country: "South Africa", geo: { type: "Point", coordinates: [28.0473, -26.1877] } },
  // United Kingdom — Greater London
  { name: "Camden High Street", city: "London", state: "Greater London", country: "United Kingdom", geo: { type: "Point", coordinates: [-0.1426, 51.5390] } },
  // United States — New York
  { name: "Brooklyn Downtown", city: "New York", state: "New York", country: "United States", geo: { type: "Point", coordinates: [-73.9857, 40.6928] } },
  // United States — California
  { name: "LA Skid Row", city: "Los Angeles", state: "California", country: "United States", geo: { type: "Point", coordinates: [-118.2437, 34.0407] } },
];

const crimeDescriptions = [
  "Armed robbery reported at a retail store; suspects fled on motorcycles.",
  "Residential burglary — rear window forced, electronics stolen.",
  "Phone snatching incident near the bus stop during rush hour.",
  "Vehicle theft from a parking lot; CCTV footage recovered.",
  "Assault following a bar altercation; one victim hospitalized.",
  "Pickpocketing ring operating around the central market.",
  "Vandalism of public property — street lights destroyed overnight.",
  "Fraudulent POS transactions traced to a cloned card syndicate.",
  "Shoplifting incident; suspect apprehended by store security.",
  "Carjacking at gunpoint reported on the expressway.",
  "Break-in at a pharmacy; controlled substances taken.",
  "Street fight involving multiple persons; two arrests made.",
  "Motorcycle theft outside a residential compound.",
  "Bag snatching by suspects on an unregistered motorcycle.",
  "Kidnapping attempt foiled by neighborhood watch patrol.",
  "House burglary while occupants were away for the weekend.",
  "Mugging of a pedestrian in a poorly lit alleyway.",
  "ATM tampering device discovered and removed by patrol officers.",
];

const severities = ["Low", "Medium", "High"] as const;
const statuses = ["Open", "Closed"] as const;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomDateWithinDays(days: number): Date {
  return new Date(Date.now() - Math.floor(Math.random() * days * 24 * 60 * 60 * 1000));
}

async function seed() {
  try {
    console.log("Connecting to MongoDB...", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    console.log("Upserting locations across states and countries...");
    const locationDocs = [];
    for (const loc of locations) {
      const doc = await Location.findOneAndUpdate(
        { name: loc.name },
        { $set: loc },
        { upsert: true, returnDocument: "after" }
      );
      locationDocs.push(doc);
    }

    const officers = await Officer.find({});
    console.log(`Found ${officers.length} officers to assign incidents to.`);

    console.log("Clearing existing incidents...");
    await Incident.deleteMany({});

    console.log("Inserting mock incidents...");
    const incidents = locationDocs.flatMap((loc) => {
      const count = 3 + Math.floor(Math.random() * 4); // 3-6 incidents per location
      return Array.from({ length: count }, () => ({
        locationId: loc._id,
        officerId: officers.length > 0 && Math.random() > 0.3 ? pick(officers)._id : undefined,
        date: randomDateWithinDays(90),
        description: pick(crimeDescriptions),
        severity: pick(severities),
        status: pick(statuses),
      }));
    });
    await Incident.insertMany(incidents);

    console.log(`Seeding complete! ${locationDocs.length} locations, ${incidents.length} incidents.`);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding crimes:", err);
    process.exit(1);
  }
}

seed();
