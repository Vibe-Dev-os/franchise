import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";
import { INSPECTION_RESULTS } from "@/lib/constants";

export { INSPECTION_RESULTS };
export type { InspectionResult } from "@/lib/constants";

const InspectionLogSchema = new Schema(
  {
    searchedValue: { type: String, required: true, trim: true, uppercase: true },
    result: { type: String, enum: INSPECTION_RESULTS, required: true },
    officerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    linkedFranchiseId: { type: Schema.Types.ObjectId, ref: "Franchise", default: null },
  },
  { timestamps: true }
);

export type InspectionLogDoc = InferSchemaType<typeof InspectionLogSchema> & {
  _id: Types.ObjectId;
};

export const InspectionLog: Model<InspectionLogDoc> =
  (models.InspectionLog as Model<InspectionLogDoc>) ||
  model<InspectionLogDoc>("InspectionLog", InspectionLogSchema);
