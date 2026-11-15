import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import connectDB from "@/lib/db";
import Queue from "@/models/Queue";
import Token from "@/models/Token";
import { getSession } from "@/lib/auth";


const patchQueueSchema = z.object({
  name: z.string().trim().min(1).optional(),
  prefix: z.string().trim().min(1).max(4).toUpperCase().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid queue ID" }, { status: 400 });
    }

    await connectDB();

    const queueObjectId = new mongoose.Types.ObjectId(id);
    const managerObjectId = new mongoose.Types.ObjectId(session.managerId);

    const queue = await Queue.findOne({
      _id: queueObjectId,
      managerId: managerObjectId,
    }).lean();

    if (!queue) {
      return NextResponse.json({ error: "Queue not found" }, { status: 404 });
    }

    // Fetch current SERVING token
    const servingToken = await Token.findOne({
      queueId: queueObjectId,
      status: "SERVING",
    }).lean();

    // Fetch sorted WAITING tokens
    const waitingTokens = await Token.find({
      queueId: queueObjectId,
      status: "WAITING",
    })
      .sort({ position: 1 })
      .lean();

    // Fetch recent HISTORY tokens (COMPLETED & CANCELLED)
    const historyTokens = await Token.find({
      queueId: queueObjectId,
      status: { $in: ["COMPLETED", "CANCELLED"] },
    })
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      queue: {
        ...queue,
        _id: queue._id.toString(),
        managerId: queue.managerId.toString(),
      },
      servingToken: servingToken
        ? {
            ...servingToken,
            _id: servingToken._id.toString(),
            queueId: servingToken.queueId.toString(),
            managerId: servingToken.managerId.toString(),
          }
        : null,
      waitingTokens: waitingTokens.map((t) => ({
        ...t,
        _id: t._id.toString(),
        queueId: t.queueId.toString(),
        managerId: t.managerId.toString(),
      })),
      historyTokens: historyTokens.map((t) => ({
        ...t,
        _id: t._id.toString(),
        queueId: t.queueId.toString(),
        managerId: t.managerId.toString(),
      })),
      waitingCount: waitingTokens.length,
    });
  } catch (error) {
    console.error("GET /api/queues/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch queue details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid queue ID" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = patchQueueSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();

    const queueObjectId = new mongoose.Types.ObjectId(id);
    const managerObjectId = new mongoose.Types.ObjectId(session.managerId);

    const queue = await Queue.findOne({
      _id: queueObjectId,
      managerId: managerObjectId,
    });

    if (!queue) {
      return NextResponse.json({ error: "Queue not found" }, { status: 404 });
    }

    if (parsed.data.name && parsed.data.name !== queue.name) {
      const duplicate = await Queue.findOne({
        managerId: managerObjectId,
        name: { $regex: new RegExp(`^${parsed.data.name.trim()}$`, "i") },
        _id: { $ne: queueObjectId },
        isActive: true,
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "Another queue with this name already exists" },
          { status: 409 }
        );
      }
      queue.name = parsed.data.name.trim();
    }

    if (parsed.data.prefix) {
      queue.prefix = parsed.data.prefix.toUpperCase();
    }

    if (parsed.data.isActive !== undefined) {
      queue.isActive = parsed.data.isActive;
    }

    await queue.save();

    return NextResponse.json({
      success: true,
      queue: {
        ...queue.toObject(),
        _id: queue._id.toString(),
        managerId: queue.managerId.toString(),
      },
    });
  } catch (error) {
    console.error("PATCH /api/queues/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update queue" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid queue ID" }, { status: 400 });
    }

    await connectDB();

    const queueObjectId = new mongoose.Types.ObjectId(id);
    const managerObjectId = new mongoose.Types.ObjectId(session.managerId);

    const queue = await Queue.findOne({
      _id: queueObjectId,
      managerId: managerObjectId,
    });

    if (!queue) {
      return NextResponse.json({ error: "Queue not found" }, { status: 404 });
    }

    // Check if there are WAITING tokens in this queue
    const waitingCount = await Token.countDocuments({
      queueId: queueObjectId,
      status: "WAITING",
    });

    if (waitingCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete or archive queue: ${waitingCount} token(s) are still waiting in line. Complete or cancel them first.`,
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const hardDelete = searchParams.get("hard") === "true";

    if (hardDelete) {
      // Delete tokens belonging to this queue and then remove queue
      await Token.deleteMany({ queueId: queueObjectId });
      await Queue.deleteOne({ _id: queueObjectId });
      return NextResponse.json({ success: true, message: "Queue permanently deleted" });
    } else {
      // Soft-delete / Archive queue
      queue.isActive = false;
      await queue.save();
      return NextResponse.json({ success: true, message: "Queue archived successfully" });
    }
  } catch (error) {
    console.error("DELETE /api/queues/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete queue" },
      { status: 500 }
    );
  }
}
