import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";
import { FRANCHISE_STATUSES } from "@/lib/constants";

export { FRANCHISE_STATUSES };
export type { FranchiseStatus } from "@/lib/constants";

const RenewalHistorySchema = new Schema(
  {
    renewedAt: { type: Date, required: true, default: Date.now },
    renewedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    previousExpiryDate: { type: Date, required: true },
    newExpiryDate: { type: Date, required: true },
  },
  { _id: false }
);

const FranchiseSchema = new Schema(
  {
    franchiseNumber: { type: String, required: true, unique: true, trim: true },
    driverId: { type: Schema.Types.ObjectId, ref: "Driver", required: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
    operatorId: { type: Schema.Types.ObjectId, ref: "Operator", required: true },
    routeOrZone: { type: String, required: true, trim: true },
    dateIssued: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    // Manually settable to suspended/revoked; otherwise auto-derived from expiryDate.
    status: {
      type: String,
      enum: FRANCHISE_STATUSES,
      required: true,
      default: "active",
    },
    feeAmount: { type: Number, required: true, default: 0 },
    feePaid: { type: Boolean, default: false },
    renewalHistory: { type: [RenewalHistorySchema], default: [] },
  },
  { timestamps: true }
);

export type FranchiseDoc = InferSchemaType<typeof FranchiseSchema> & { _id: Types.ObjectId };

export const Franchise: Model<FranchiseDoc> =
  (models.Franchise as Model<FranchiseDoc>) ||
  model<FranchiseDoc>("Franchise", FranchiseSchema);
