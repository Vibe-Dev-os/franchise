import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

// Singleton config document holding the current fee schedule and known zones.
const ConfigSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "franchise_config" },
    feeSchedule: {
      tricycle: { type: Number, default: 500 },
      "habal-habal/motorcycle": { type: Number, default: 350 },
      other: { type: Number, default: 400 },
    },
    zones: { type: [String], default: ["Poblacion", "Zone 1", "Zone 2", "Zone 3"] },
  },
  { timestamps: true }
);

export type ConfigDoc = InferSchemaType<typeof ConfigSchema>;

export const Config: Model<ConfigDoc> =
  (models.Config as Model<ConfigDoc>) || model<ConfigDoc>("Config", ConfigSchema);
