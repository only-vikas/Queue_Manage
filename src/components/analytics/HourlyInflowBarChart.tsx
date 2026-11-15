"use client";

import React, { useMemo } from "react";
import { Bar } from "@visx/shape";
import { Group } from "@visx/group";
import { scaleBand, scaleLinear } from "@visx/scale";
import { AxisBottom, AxisLeft } from "@visx/axis";

interface HourlyPoint {
  hour: number;
  label: string;
  inflow: number;
  completed: number;
}

interface HourlyInflowBarChartProps {
  data: HourlyPoint[];
  width?: number;
  height?: number;
}

export function HourlyInflowBarChart({
  data,
  width = 500,
  height = 220,
}: HourlyInflowBarChartProps) {
  const margin = { top: 20, right: 20, bottom: 36, left: 36 };

  const xMax = Math.max(0, width - margin.left - margin.right);
  const yMax = Math.max(0, height - margin.top - margin.bottom);

  // Scales
  const xScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, xMax],
        round: true,
        domain: data.map((d) => d.label),
        padding: 0.35,
      }),
    [xMax, data]
  );

  const yScale = useMemo(() => {
    const maxVal = Math.max(...data.map((d) => d.inflow), 5);
    return scaleLinear<number>({
      range: [yMax, 0],
      round: true,
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
            key={`grid-${tick}`}
            x1={0}
            x2={xMax}
            y1={yScale(tick)}
            y2={yScale(tick)}
            stroke="var(--border-hairline)"
            strokeWidth={1}
            strokeDasharray="2 2"
          />
        ))}

        {/* Bars */}
        {data.map((d) => {
          const barWidth = xScale.bandwidth();
          const barHeight = yMax - (yScale(d.inflow) ?? 0);
          const barX = xScale(d.label);
          const barY = yMax - barHeight;

          return (
            <g key={`bar-${d.hour}`}>
              <Bar
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill="#D9481E"
                rx={2}
                opacity={d.inflow > 0 ? 1 : 0.25}
                style={{
                  transition: "all 200ms ease",
                  cursor: "pointer",
                }}
              />
              {/* Top value badge on non-zero bars */}
              {d.inflow > 0 && (
                <text
                  x={(barX ?? 0) + barWidth / 2}
                  y={barY - 5}
                  textAnchor="middle"
                  fill="var(--text-secondary)"
                  fontSize={10}
                  fontFamily="var(--font-mono)"
                  fontWeight={600}
                >
                  {d.inflow}
                </text>
              )}
            </g>
          );
        })}

        {/* X Axis */}
        <AxisBottom
          top={yMax}
          scale={xScale}
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
