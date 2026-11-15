import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import connectDB from "@/lib/db";
import Queue from "@/models/Queue";
import Token from "@/models/Token";
import { getSession } from "@/lib/auth";


const createQueueSchema = z.object({
  name: z.string().trim().min(1, "Queue name is required"),
  prefix: z
    .string()
    .trim()
    .min(1)
    .max(4)
    .toUpperCase()
    .default("A")
    .optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const managerObjectId = new mongoose.Types.ObjectId(session.managerId);

    // Fetch active queues for this manager
    const queues = await Queue.find({
      managerId: managerObjectId,
      isActive: true,
    }).sort({ createdAt: 1 }).lean();

    // Aggregate WAITING tokens count per queueId to avoid N+1 queries
    const waitingCounts = await Token.aggregate([
      {
        $match: {
          managerId: managerObjectId,
          status: "WAITING",
        },
      },
      {
        $group: {
          _id: "$queueId",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map<string, number>(
      waitingCounts.map((item) => [item._id.toString(), item.count])
    );

    const queuesWithCounts = queues.map((q) => ({
      ...q,
      _id: q._id.toString(),
      managerId: q.managerId.toString(),
      waitingCount: countMap.get(q._id.toString()) || 0,
    }));

    return NextResponse.json({ queues: queuesWithCounts });
  } catch (error) {
    console.error("GET /api/queues error:", error);
    return NextResponse.json(
      { error: "Failed to fetch queues" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createQueueSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();

    const managerObjectId = new mongoose.Types.ObjectId(session.managerId);
    const { name, prefix } = parsed.data;

    // Check duplicate active queue name for this manager
    const existing = await Queue.findOne({
      managerId: managerObjectId,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      isActive: true,
    });

    if (existing) {
      return NextResponse.json(
        { error: "A queue with this name already exists" },
        { status: 409 }
      );
    }

    const newQueue = await Queue.create({
      managerId: managerObjectId,
      name: name.trim(),
      prefix: (prefix || "A").toUpperCase(),
      tokenCounter: 0,
      isActive: true,
    });

    return NextResponse.json(
      {
        queue: {
          ...newQueue.toObject(),
          _id: newQueue._id.toString(),
          managerId: newQueue.managerId.toString(),
          waitingCount: 0,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Check for Mongo duplicate key error (code 11000)
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: number }).code === 11000) {
      return NextResponse.json(
        { error: "A queue with this name already exists" },
        { status: 409 }
      );
    }
    console.error("POST /api/queues error:", error);
    return NextResponse.json(
      { error: "Failed to create queue" },
      { status: 500 }
    );
  }
}
