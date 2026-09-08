'use client';

import React, { useState } from 'react';

export interface BarDataPoint {
  label: string;
  subLabel?: string;
  total: number;
  resolues: number;
}

interface VolumeBarChartProps {
  data: BarDataPoint[];
  height?: number;
}

export function VolumeBarChart({ data, height = 220 }: VolumeBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxVal = Math.max(...data.map((d) => d.total), 5);

  return (
    <div className="space-y-4">
      {/* Légende en haut */}
      <div className="flex items-center justify-end gap-5 text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-[#002B7F]" />
          <span className="text-[#475569]">Créées</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-[#FF5E00]" />
          <span className="text-[#475569]">Résolues</span>
        </div>
      </div>

      {/* Zone Graphique */}
      <div className="relative pt-6 pb-2" style={{ height }}>
        {/* Lignes de repère horizontales */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
          <div className="border-b border-dashed border-slate-200 w-full" />
          <div className="border-b border-dashed border-slate-200 w-full" />
          <div className="border-b border-dashed border-slate-200 w-full" />
          <div className="border-b border-slate-200 w-full" />
        </div>

        {/* Colonnes / Barres */}
        <div className="relative h-full flex items-end justify-between gap-2 sm:gap-4 px-2">
          {data.map((item, idx) => {
            const totalHeight = (item.total / maxVal) * 100;
            const resolueHeight = (item.resolues / maxVal) * 100;
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={item.label || idx}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip au survol */}
                {isHovered && (
                  <div className="absolute -top-12 z-20 px-3 py-1.5 bg-[#071530] text-white rounded-xl shadow-lg text-[11px] font-black whitespace-nowrap animate-fade-in pointer-events-none">
                    <p>{item.label} : <span className="text-[#B3D1FF]">{item.total} créées</span> · <span className="text-[#FFB380]">{item.resolues} résolues</span></p>
                  </div>
                )}

                {/* Paire de Barres */}
                <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                  {/* Barre Total */}
                  <div
                    style={{ height: `${Math.max(totalHeight, 4)}%` }}
                    className={`w-full max-w-[18px] rounded-t-lg transition-all duration-300 ${
                      isHovered ? 'bg-[#0047cc] shadow-md' : 'bg-[#002B7F]'
                    }`}
                  />
                  {/* Barre Résolues */}
                  <div
                    style={{ height: `${Math.max(resolueHeight, 4)}%` }}
                    className={`w-full max-w-[18px] rounded-t-lg transition-all duration-300 ${
                      isHovered ? 'bg-[#ff7a29] shadow-md' : 'bg-[#FF5E00]'
                    }`}
                  />
                </div>

                {/* Libellé de l'axe X */}
                <div className="mt-2 text-center">
                  <span className="text-[11px] font-black text-slate-500 block truncate">
                    {item.label}
                  </span>
                  {item.subLabel && (
                    <span className="text-[9px] font-semibold text-slate-400 block">
                      {item.subLabel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
