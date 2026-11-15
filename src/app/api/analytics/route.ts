import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Token from "@/models/Token";
import { getSession } from "@/lib/auth";


export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const queueId = searchParams.get("queueId");
    const range = searchParams.get("range") || "today";

    await connectDB();

    const managerObjectId = new mongoose.Types.ObjectId(session.managerId);

    // Calculate date range boundary
    const now = new Date();
    let startDate = new Date();

    if (range === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    } else if (range === "7d") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === "30d") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      // Default to today
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    }

    // Build match stage
    const matchStage: Record<string, unknown> = {
      managerId: managerObjectId,
      createdAt: { $gte: startDate },
    };

    if (queueId && mongoose.Types.ObjectId.isValid(queueId)) {
      matchStage.queueId = new mongoose.Types.ObjectId(queueId);
    }

    // Single $facet aggregation pipeline
    const [result] = await Token.aggregate([
      { $match: matchStage },
      {
        $facet: {
          // 1. Overall KPI metrics
          kpi: [
            {
              $group: {
                _id: null,
                totalTokens: { $sum: 1 },
                tokensServed: {
                  $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
                },
                activeServingCount: {
                  $sum: { $cond: [{ $eq: ["$status", "SERVING"] }, 1, 0] },
                },
                cancelledCount: {
                  $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] },
                },
                waitingCount: {
                  $sum: { $cond: [{ $eq: ["$status", "WAITING"] }, 1, 0] },
                },
                avgWaitMs: {
                  $avg: {
                    $cond: [
                      {
                        $and: [
                          { $ne: ["$servedAt", null] },
                          { $gt: ["$servedAt", "$createdAt"] },
                        ],
                      },
                      { $subtract: ["$servedAt", "$createdAt"] },
                      null,
                    ],
                  },
                },
              },
            },
          ],

          // 2. Status breakdown count
          statusBreakdown: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],

          // 3. Hourly queue length trends
          hourlyTrends: [
            {
              $group: {
                _id: {
                  hour: { $hour: { date: "$createdAt", timezone: "UTC" } },
                  date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } },
                },
                inflowCount: { $sum: 1 },
                completedCount: {
                  $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
                },
              },
            },
            { $sort: { "_id.date": 1, "_id.hour": 1 } },
          ],
        },
      },
    ]);

    const kpiData = result?.kpi?.[0] || {
      totalTokens: 0,
      tokensServed: 0,
      activeServingCount: 0,
      cancelledCount: 0,
      waitingCount: 0,
      avgWaitMs: 0,
    };

    const total = kpiData.totalTokens || 0;
    const cancelRate = total > 0 ? ((kpiData.cancelledCount / total) * 100) : 0;
    const avgWaitMinutes = kpiData.avgWaitMs ? Number((kpiData.avgWaitMs / 60000).toFixed(1)) : 0;

    // Normalize status breakdown into friendly map
    const statusMap: Record<string, number> = {
      WAITING: 0,
      SERVING: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    (result?.statusBreakdown || []).forEach((item: { _id: string; count: number }) => {
      if (item._id) {
        statusMap[item._id] = item.count;
      }
    });

    const hourlyTrends = (result?.hourlyTrends || []).map(
      (h: { _id: { hour: number; date: string }; inflowCount: number; completedCount: number }) => ({
        hour: h._id.hour,
        label: `${String(h._id.hour).padStart(2, "0")}:00`,
        date: h._id.date,
        inflow: h.inflowCount,
        completed: h.completedCount,
      })
    );

    return NextResponse.json({
      success: true,
      range,
      kpis: {
        avgWaitMinutes,
        tokensServed: kpiData.tokensServed,
        activeServingCount: kpiData.activeServingCount,
        waitingCount: kpiData.waitingCount,
        totalTokens: total,
        cancelRate: Number(cancelRate.toFixed(1)),
      },
      statusBreakdown: statusMap,
      hourlyTrends,
    });
  } catch (error) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json(
      { error: "Failed to generate analytics" },
      { status: 500 }
    );
  }
}
