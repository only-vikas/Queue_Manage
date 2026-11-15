import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IQueue extends Document {
  _id: Types.ObjectId;
  managerId: Types.ObjectId;
  name: string;
  prefix: string;
  tokenCounter: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QueueSchema = new Schema<IQueue>(
  {
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "Manager",
      required: [true, "Manager ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Queue name is required"],
      trim: true,
    },
    prefix: {
      type: String,
      default: "A",
      trim: true,
      uppercase: true,
      maxlength: 4,
    },
    tokenCounter: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index { managerId: 1, name: 1 }
QueueSchema.index({ managerId: 1, name: 1 }, { unique: true });

export const Queue: Model<IQueue> =
  mongoose.models.Queue || mongoose.model<IQueue>("Queue", QueueSchema);

export default Queue;

