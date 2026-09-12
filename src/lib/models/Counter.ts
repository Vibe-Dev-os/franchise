import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

// Simple auto-increment counter used to generate sequential franchise numbers.
const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export type CounterDoc = InferSchemaType<typeof CounterSchema>;

export const Counter: Model<CounterDoc> =
  (models.Counter as Model<CounterDoc>) || model<CounterDoc>("Counter", CounterSchema);

export async function nextSequence(key: string): Promise<number> {
  const doc = await Counter.findByIdAndUpdate(
    key,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc.seq;
}
