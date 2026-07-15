import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILocation extends Document {
  name: string;
  city: string;
  state: string;
  country: string;
  geo: {
    type: "Point";
    coordinates: number[]; // [longitude, latitude]
  };
}

const LocationSchema: Schema<ILocation> = new Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true, default: "Calabar" },
    state: { type: String, required: true, default: "Cross River" },
    country: { type: String, required: true, default: "Nigeria" },
    geo: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
  },
  { timestamps: true }
);

LocationSchema.index({ geo: "2dsphere" });

export const Location: Model<ILocation> =
  mongoose.models.Location || mongoose.model<ILocation>("Location", LocationSchema);
