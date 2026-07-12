import mongoose, { Schema, Document, Model } from "mongoose";

export interface IIncident extends Document {
  locationId: mongoose.Types.ObjectId;
  officerId?: mongoose.Types.ObjectId;
  date: Date;
  description: string;
  severity: "Low" | "Medium" | "High";
  status: "Open" | "Closed";
}

const IncidentSchema: Schema<IIncident> = new Schema(
  {
    locationId: { type: Schema.Types.ObjectId, ref: "Location", required: true },
    officerId: { type: Schema.Types.ObjectId, ref: "Officer" },
    date: { type: Date, required: true, default: Date.now },
    description: { type: String, required: true },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open",
    },
  },
  { timestamps: true }
);

export const Incident: Model<IIncident> =
  mongoose.models.Incident || mongoose.model<IIncident>("Incident", IncidentSchema);
