import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import connectDB from "@/lib/db";
import Token from "@/models/Token";
import { getSession } from "@/lib/auth";

const reorderSchema = z.object({
  direction: z.enum(["UP", "DOWN"]),
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
    const parsed = reorderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();

    const tokenObjectId = new mongoose.Types.ObjectId(id);
    const managerObjectId = new mongoose.Types.ObjectId(session.managerId);

    const currentToken = await Token.findOne({
      _id: tokenObjectId,
      managerId: managerObjectId,
      status: "WAITING",
    });

    if (!currentToken) {
      return NextResponse.json(
        { error: "Waiting token not found" },
        { status: 404 }
      );
    }

    const { direction } = parsed.data;

    // Find adjacent WAITING token in the same queue
    let adjacentToken = null;
    if (direction === "UP") {
      // Find the token with the highest position that is strictly less than current position
      adjacentToken = await Token.findOne({
        queueId: currentToken.queueId,
        status: "WAITING",
        position: { $lt: currentToken.position },
      })
        .sort({ position: -1 });
    } else {
      // Find the token with the lowest position that is strictly greater than current position
      adjacentToken = await Token.findOne({
        queueId: currentToken.queueId,
        status: "WAITING",
        position: { $gt: currentToken.position },
      })
        .sort({ position: 1 });
    }

    // Boundary check: No adjacent token to swap with (no-op)
    if (!adjacentToken) {
      return NextResponse.json({
        success: true,
        reordered: false,
        message: `Token is already at the ${direction === "UP" ? "top" : "bottom"} of the queue`,
        token: currentToken,
      });
    }

    const currentPos = currentToken.position;
    const adjacentPos = adjacentToken.position;

    // Execute swap inside a Mongoose transaction
    let transactionSuccess = false;
    try {
      const mongoSession = await mongoose.startSession();
      try {
        await mongoSession.withTransaction(async () => {
          await Token.updateOne(
            { _id: currentToken._id },
            { position: adjacentPos },
            { session: mongoSession }
          );
          await Token.updateOne(
            { _id: adjacentToken._id },
            { position: currentPos },
            { session: mongoSession }
          );
        });
        transactionSuccess = true;
      } finally {
        await mongoSession.endSession();
      }
    } catch (txErr) {
      console.warn("Transaction failed or unsupported, applying direct update fallback:", txErr);
    }

    if (!transactionSuccess) {
      // Fallback if transaction was aborted or unsupported
      await Token.updateOne({ _id: currentToken._id }, { position: adjacentPos });
      await Token.updateOne({ _id: adjacentToken._id }, { position: currentPos });
    }

    currentToken.position = adjacentPos;

    return NextResponse.json({
      success: true,
      reordered: true,
      token: {
        ...currentToken.toObject(),
        _id: currentToken._id.toString(),
        queueId: currentToken.queueId.toString(),
        managerId: currentToken.managerId.toString(),
      },
    });
  } catch (error) {
    console.error("PATCH /api/tokens/[id]/reorder error:", error);
    return NextResponse.json(
      { error: "Failed to reorder token" },
      { status: 500 }
    );
  }
}

