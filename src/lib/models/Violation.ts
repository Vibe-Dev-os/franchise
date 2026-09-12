import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";
import { VIOLATION_TYPES, VIOLATION_STATUSES } from "@/lib/constants";

export { VIOLATION_TYPES, VIOLATION_STATUSES };
export type { ViolationType, ViolationStatus } from "@/lib/constants";

const ViolationSchema = new Schema(
  {
    relatedFranchiseId: { type: Schema.Types.ObjectId, ref: "Franchise", default: null },
    plateOrBodyNumberChecked: { type: String, required: true, trim: true, uppercase: true },
    violationType: { type: String, enum: VIOLATION_TYPES, required: true },
    description: { type: String, trim: true },
    location: { type: String, required: true, trim: true },
    officerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dateRecorded: { type: Date, required: true, default: Date.now },
    fineAmount: { type: Number, required: true, default: 0 },
    status: { type: String, enum: VIOLATION_STATUSES, default: "recorded" },
  },
  { timestamps: true }
);

export type ViolationDoc = InferSchemaType<typeof ViolationSchema> & { _id: Types.ObjectId };

export const Violation: Model<ViolationDoc> =
  (models.Violation as Model<ViolationDoc>) ||
  model<ViolationDoc>("Violation", ViolationSchema);
