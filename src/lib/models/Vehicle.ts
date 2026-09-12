import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";
import { VEHICLE_TYPES } from "@/lib/constants";

export { VEHICLE_TYPES };
export type { VehicleType } from "@/lib/constants";

const VehicleSchema = new Schema(
  {
    plateOrBodyNumber: { type: String, required: true, trim: true, uppercase: true },
    vehicleType: { type: String, enum: VEHICLE_TYPES, required: true },
    engineNumber: { type: String, required: true, trim: true },
    chassisNumber: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    operatorId: { type: Schema.Types.ObjectId, ref: "Operator", required: true },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type VehicleDoc = InferSchemaType<typeof VehicleSchema> & { _id: Types.ObjectId };

export const Vehicle: Model<VehicleDoc> =
  (models.Vehicle as Model<VehicleDoc>) || model<VehicleDoc>("Vehicle", VehicleSchema);
