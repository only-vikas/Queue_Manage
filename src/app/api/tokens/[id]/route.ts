import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import connectDB from "@/lib/db";
import Token from "@/models/Token";
import { getSession } from "@/lib/auth";

const updateTokenSchema = z.object({
  personName: z.string().trim().min(1).optional(),
  phone: z.string().trim().optional(),
  notes: z.string().trim().optional(),
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
      return NextResponse.json({ error: "Invalid token ID" }, { status: 400 });
    }

    await connectDB();

    const token = await Token.findOne({
      _id: new mongoose.Types.ObjectId(id),
      managerId: new mongoose.Types.ObjectId(session.managerId),
    }).lean();

    if (!token) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    return NextResponse.json({
      token: {
        ...token,
        _id: token._id.toString(),
        queueId: token.queueId.toString(),
        managerId: token.managerId.toString(),
      },
    });
  } catch (error) {
    console.error("GET /api/tokens/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch token" }, { status: 500 });
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
      return NextResponse.json({ error: "Invalid token ID" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updateTokenSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();

    const token = await Token.findOne({
      _id: new mongoose.Types.ObjectId(id),
      managerId: new mongoose.Types.ObjectId(session.managerId),
    });

    if (!token) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    if (parsed.data.personName !== undefined) {
      token.personName = parsed.data.personName;
    }
    if (parsed.data.phone !== undefined) {
      token.phone = parsed.data.phone;
    }
    if (parsed.data.notes !== undefined) {
      token.notes = parsed.data.notes;
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
    console.error("PATCH /api/tokens/[id] error:", error);
    return NextResponse.json({ error: "Failed to update token" }, { status: 500 });
  }
}
