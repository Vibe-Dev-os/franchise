import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";
import { USER_ROLES } from "@/lib/constants";

export { USER_ROLES };
export type { UserRole } from "@/lib/constants";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: Types.ObjectId };

export const User: Model<UserDoc> =
  (models.User as Model<UserDoc>) || model<UserDoc>("User", UserSchema);
