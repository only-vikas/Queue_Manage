import mongoose, { Schema, Document, Model } from "mongoose";

export interface IManager extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  workspaceName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ManagerSchema = new Schema<IManager>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      select: false,
    },
    workspaceName: {
      type: String,
      default: "Rugas Desk",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Manager: Model<IManager> =
  mongoose.models.Manager || mongoose.model<IManager>("Manager", ManagerSchema);

export default Manager;

