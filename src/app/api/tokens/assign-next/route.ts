import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import connectDB from "@/lib/db";
import Queue from "@/models/Queue";
import Token from "@/models/Token";
import { getSession } from "@/lib/auth";

const assignNextSchema = z.object({
  queueId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid queue ID",
  }),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = assignNextSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();

    const queueObjectId = new mongoose.Types.ObjectId(parsed.data.queueId);
    const managerObjectId = new mongoose.Types.ObjectId(session.managerId);

    // Verify queue exists and belongs to this manager
    const queue = await Queue.findOne({
      _id: queueObjectId,
      managerId: managerObjectId,
      isActive: true,
    });

    if (!queue) {
      return NextResponse.json(
        { error: "Queue not found or inactive" },
        { status: 404 }
      );
    }

    const now = new Date();
    let completedTokenId: mongoose.Types.ObjectId | null = null;
    let nextServingTokenId: mongoose.Types.ObjectId | null = null;

    // Execute assign-next inside a Mongoose transaction
    let transactionSuccess = false;
    try {
      const mongoSession = await mongoose.startSession();
      try {
        await mongoSession.withTransaction(async () => {
          // 1. Find currently SERVING token if any
          const currentServing = await Token.findOne({
            queueId: queueObjectId,
            status: "SERVING",
          }).session(mongoSession);

          if (currentServing) {
            completedTokenId = currentServing._id;
            await Token.updateOne(
              { _id: currentServing._id },
              {
                status: "COMPLETED",
                completedAt: now,
              },
              { session: mongoSession }
            );
          }

          // 2. Atomically find and promote top WAITING token
          const topWaiting = await Token.findOne({
            queueId: queueObjectId,
            status: "WAITING",
          })
            .sort({ position: 1 })
            .session(mongoSession);

          if (topWaiting) {
            nextServingTokenId = topWaiting._id;
            await Token.updateOne(
              { _id: topWaiting._id },
              {
                status: "SERVING",
                servedAt: now,
              },
              { session: mongoSession }
            );
          }
        });
        transactionSuccess = true;
      } finally {
        await mongoSession.endSession();
      }
    } catch (txErr) {
      console.warn("Transaction failed or unsupported, applying atomic fallback:", txErr);
    }

    if (!transactionSuccess) {
      // Fallback without replica-set transaction
      const currentServing = await Token.findOne({
        queueId: queueObjectId,
        status: "SERVING",
      });

      if (currentServing) {
        completedTokenId = currentServing._id;
        await Token.updateOne(
          { _id: currentServing._id },
          {
            status: "COMPLETED",
            completedAt: now,
          }
        );
      }

      const topWaiting = await Token.findOne({
        queueId: queueObjectId,
        status: "WAITING",
      }).sort({ position: 1 });

      if (topWaiting) {
        nextServingTokenId = topWaiting._id;
        await Token.updateOne(
          { _id: topWaiting._id },
          {
            status: "SERVING",
            servedAt: now,
          }
        );
      }
    }

    if (!nextServingTokenId && !completedTokenId) {
      return NextResponse.json(
        { error: "No waiting tokens in this queue" },
        { status: 400 }
      );
    }

    const servingToken = nextServingTokenId
      ? await Token.findById(nextServingTokenId).lean()
      : null;

    const completedToken = completedTokenId
      ? await Token.findById(completedTokenId).lean()
      : null;

    return NextResponse.json({
      success: true,
      servingToken: servingToken
        ? {
            ...servingToken,
            _id: servingToken._id.toString(),
            queueId: servingToken.queueId.toString(),
            managerId: servingToken.managerId.toString(),
          }
        : null,
      completedToken: completedToken
        ? {
            ...completedToken,
            _id: completedToken._id.toString(),
            queueId: completedToken.queueId.toString(),
            managerId: completedToken.managerId.toString(),
          }
        : null,
    });
  } catch (error) {
    console.error("POST /api/tokens/assign-next error:", error);
    return NextResponse.json(
      { error: "Failed to assign next token" },
      { status: 500 }
    );
  }
}

