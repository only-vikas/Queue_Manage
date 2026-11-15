import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type TokenStatus = "WAITING" | "SERVING" | "COMPLETED" | "CANCELLED";

export interface IToken extends Document {
  _id: Types.ObjectId;
  queueId: Types.ObjectId;
  managerId: Types.ObjectId;
  tokenNumber: string;
  sequenceNumber: number;
  personName: string;
  phone?: string;
  notes?: string;
  status: TokenStatus;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  servedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
}

const TokenSchema = new Schema<IToken>(
  {
    queueId: {
      type: Schema.Types.ObjectId,
      ref: "Queue",
      required: [true, "Queue ID is required"],
      index: true,
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "Manager",
      required: [true, "Manager ID is required"],
      index: true,
    },
    tokenNumber: {
      type: String,
      required: [true, "Token number is required"],
      trim: true,
    },
    sequenceNumber: {
      type: Number,
      required: true,
    },
    personName: {
      type: String,
      required: [true, "Person name is required"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["WAITING", "SERVING", "COMPLETED", "CANCELLED"],
      default: "WAITING",
      index: true,
    },
    position: {
      type: Number,
      required: true,
    },
    servedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes: { queueId: 1, status: 1, position: 1 } and { managerId: 1, createdAt: -1 }
TokenSchema.index({ queueId: 1, status: 1, position: 1 });
TokenSchema.index({ managerId: 1, createdAt: -1 });

export const Token: Model<IToken> =
  mongoose.models.Token || mongoose.model<IToken>("Token", TokenSchema);

export default Token;

