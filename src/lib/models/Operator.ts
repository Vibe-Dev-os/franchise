import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

const OperatorSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    dateRegistered: { type: Date, required: true, default: Date.now },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type OperatorDoc = InferSchemaType<typeof OperatorSchema> & { _id: Types.ObjectId };

export const Operator: Model<OperatorDoc> =
  (models.Operator as Model<OperatorDoc>) ||
  model<OperatorDoc>("Operator", OperatorSchema);
