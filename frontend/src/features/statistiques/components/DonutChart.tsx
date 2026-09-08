'use client';

import React, { useState } from 'react';

export interface DonutSegment {
  id: string | number;
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  totalLabel?: string;
  size?: number;
  thickness?: number;
}

export function DonutChart({
  data,
  totalLabel = 'Total',
  size = 220,
  thickness = 28,
}: DonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((acc, item) => acc + item.value, 0);

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulatedOffset = 0;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="w-40 h-40 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">
          Aucune donnée
        </div>
        <p className="text-xs text-slate-400 font-semibold">Aucune demande enregistrée</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
      {/* 1. SVG Donut */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#F1F5F9"
            strokeWidth={thickness}
          />

          {/* Slices */}
          {data.map((item, index) => {
            if (item.value === 0) return null;
            const slicePercent = item.value / total;
            const strokeDasharray = `${slicePercent * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedOffset;
            accumulatedOffset += slicePercent * circumference;

            const isHovered = hoveredIndex === index;

            return (
              <circle
                key={item.id || index}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isHovered ? thickness + 4 : thickness}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          {hoveredIndex !== null && data[hoveredIndex] ? (
            <>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 line-clamp-1">
                {data[hoveredIndex].label}
              </span>
              <span className="text-2xl font-black text-[#071530] leading-none my-0.5">
                {data[hoveredIndex].value}
              </span>
              <span className="text-[11px] font-bold text-[#FF5E00]">
                {((data[hoveredIndex].value / total) * 100).toFixed(1)}%
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {totalLabel}
              </span>
              <span className="text-3xl font-black text-[#002B7F] leading-none my-0.5">
                {total}
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                demandes
              </span>
            </>
          )}
        </div>
      </div>

      {/* 2. Légende interactive */}
      <div className="flex-1 w-full space-y-2 max-w-xs">
        {data.map((item, index) => {
          const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={item.id || index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                isHovered
                  ? 'bg-slate-50 border border-slate-200 shadow-xs'
                  : 'hover:bg-slate-50/70 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-bold text-[#071530] truncate">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-black text-[#002B7F]">
                  {item.value}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 min-w-[36px] text-right">
                  {percent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
