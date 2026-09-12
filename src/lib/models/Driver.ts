import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

const DriverSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    driversLicenseNumber: { type: String, required: true, trim: true },
    licenseExpiry: { type: Date, required: true },
    photoUrl: { type: String, trim: true },
    operatorId: { type: Schema.Types.ObjectId, ref: "Operator", default: null },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type DriverDoc = InferSchemaType<typeof DriverSchema> & { _id: Types.ObjectId };

export const Driver: Model<DriverDoc> =
  (models.Driver as Model<DriverDoc>) || model<DriverDoc>("Driver", DriverSchema);
