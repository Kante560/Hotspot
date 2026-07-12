import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOfficer extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  badgeNumber?: string;
  department?: string;
}

const OfficerSchema: Schema<IOfficer> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true },
    badgeNumber: { type: String },
    department: { type: String },
  },
  { timestamps: true }
);

export const Officer: Model<IOfficer> =
  mongoose.models.Officer || mongoose.model<IOfficer>("Officer", OfficerSchema);
