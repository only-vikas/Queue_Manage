import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import connectDB from "@/lib/db";
import Token from "@/models/Token";
import { getSession } from "@/lib/auth";

const statusSchema = z.object({
  status: z.enum(["COMPLETED", "CANCELLED"]),
});

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
      return NextResponse.json({ error: "Invalid token ID" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();

    const tokenObjectId = new mongoose.Types.ObjectId(id);
    const managerObjectId = new mongoose.Types.ObjectId(session.managerId);

    const token = await Token.findOne({
      _id: tokenObjectId,
      managerId: managerObjectId,
    });

    if (!token) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    const now = new Date();
    token.status = parsed.data.status;

    if (parsed.data.status === "COMPLETED") {
      token.completedAt = now;
    } else if (parsed.data.status === "CANCELLED") {
      token.cancelledAt = now;
    }

    await token.save();

    return NextResponse.json({
      success: true,
      token: {
        ...token.toObject(),
        _id: token._id.toString(),
        queueId: token.queueId.toString(),
        managerId: token.managerId.toString(),
      },
    });
  } catch (error) {
    console.error("PATCH /api/tokens/[id]/status error:", error);
    return NextResponse.json(
      { error: "Failed to update token status" },
      { status: 500 }
    );
  }
}

