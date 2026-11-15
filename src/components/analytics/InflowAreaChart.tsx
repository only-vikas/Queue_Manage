"use client";

import React, { useMemo } from "react";
import { AreaClosed, LinePath } from "@visx/shape";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { AxisBottom, AxisLeft } from "@visx/axis";

interface HourlyPoint {
  hour: number;
  label: string;
  inflow: number;
  completed: number;
}

interface InflowAreaChartProps {
  data: HourlyPoint[];
  width?: number;
  height?: number;
}

export function InflowAreaChart({
  data,
  width = 500,
  height = 220,
}: InflowAreaChartProps) {
  const margin = { top: 20, right: 20, bottom: 36, left: 36 };

  const xMax = Math.max(0, width - margin.left - margin.right);
  const yMax = Math.max(0, height - margin.top - margin.bottom);

  // Scales
  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [0, xMax],
        domain: [0, Math.max(data.length - 1, 1)],
      }),
    [xMax, data.length]
  );

  const yScale = useMemo(() => {
    const maxVal = Math.max(...data.map((d) => d.inflow), 5);
    return scaleLinear<number>({
      range: [yMax, 0],
      domain: [0, maxVal],
      nice: true,
    });
  }, [yMax, data]);

  if (width < 10) return null;

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <Group left={margin.left} top={margin.top}>
        {/* Hairline horizontal gridlines */}
        {yScale.ticks(4).map((tick) => (
          <line
            key={`area-grid-${tick}`}
            x1={0}
            x2={xMax}
            y1={yScale(tick)}
            y2={yScale(tick)}
            stroke="var(--border-hairline)"
            strokeWidth={1}
            strokeDasharray="2 2"
          />
        ))}

        {/* Flat Area Fill: rgba(217, 72, 30, 0.08) - strictly no gradients */}
        <AreaClosed<HourlyPoint>
          data={data}
          x={(_, i) => xScale(i) ?? 0}
          y={(d) => yScale(d.inflow) ?? 0}
          yScale={yScale}
          fill="rgba(217, 72, 30, 0.08)"
        />

        {/* 1.5px Signal Vermilion Line Path */}
        <LinePath<HourlyPoint>
          data={data}
          x={(_, i) => xScale(i) ?? 0}
          y={(d) => yScale(d.inflow) ?? 0}
          stroke="#D9481E"
          strokeWidth={1.5}
        />

        {/* Data points */}
        {data.map((d, i) => (
          <circle
            key={`dot-${d.hour}`}
            cx={xScale(i)}
            cy={yScale(d.inflow)}
            r={d.inflow > 0 ? 3 : 2}
            fill="#FFFFFF"
            stroke="#D9481E"
            strokeWidth={1.5}
          />
        ))}

        {/* X Axis */}
        <AxisBottom
          top={yMax}
          scale={xScale}
          numTicks={Math.min(data.length, 7)}
          tickFormat={(val) => data[Number(val)]?.label || ""}
          stroke="var(--border-hairline)"
          tickStroke="var(--border-hairline)"
          tickLabelProps={() => ({
            fill: "var(--text-muted)",
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            textAnchor: "middle",
            dy: 4,
          })}
        />

        {/* Y Axis */}
        <AxisLeft
          scale={yScale}
          numTicks={4}
          stroke="var(--border-hairline)"
          tickStroke="var(--border-hairline)"
          tickLabelProps={() => ({
            fill: "var(--text-muted)",
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            textAnchor: "end",
            dx: -4,
            dy: 3,
          })}
        />
      </Group>
    </svg>
  );
}
