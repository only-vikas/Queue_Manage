import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import connectDB from "@/lib/db";
import Queue from "@/models/Queue";
import Token from "@/models/Token";
import { getSession } from "@/lib/auth";

const createTokenSchema = z.object({
  queueId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid queue ID",
  }),
  personName: z.string().trim().min(1, "Person name is required"),
  phone: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createTokenSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();

    const queueObjectId = new mongoose.Types.ObjectId(parsed.data.queueId);
    const managerObjectId = new mongoose.Types.ObjectId(session.managerId);

    // Atomically increment tokenCounter on Queue
    const queue = await Queue.findOneAndUpdate(
      {
        _id: queueObjectId,
        managerId: managerObjectId,
        isActive: true,
      },
      {
        $inc: { tokenCounter: 1 },
      },
      { new: true }
    );

    if (!queue) {
      return NextResponse.json(
        { error: "Queue not found or inactive" },
        { status: 404 }
      );
    }

    const sequenceNumber = queue.tokenCounter;
    const prefix = queue.prefix || "A";
    const tokenNumber = `${prefix}-${String(sequenceNumber).padStart(3, "0")}`;

    // Find the current highest position in the queue to append with gap indexing (+1000)
    const highestToken = await Token.findOne({ queueId: queueObjectId })
      .sort({ position: -1 })
      .select("position")
      .lean();

    const nextPosition = (highestToken?.position ?? 0) + 1000;

    const token = await Token.create({
      queueId: queueObjectId,
      managerId: managerObjectId,
      tokenNumber,
      sequenceNumber,
      personName: parsed.data.personName.trim(),
      phone: parsed.data.phone?.trim() || "",
      notes: parsed.data.notes?.trim() || "",
      status: "WAITING",
      position: nextPosition,
    });

    return NextResponse.json(
      {
        token: {
          ...token.toObject(),
          _id: token._id.toString(),
          queueId: token.queueId.toString(),
          managerId: token.managerId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/tokens error:", error);
    return NextResponse.json(
      { error: "Failed to create token" },
      { status: 500 }
    );
  }
}

