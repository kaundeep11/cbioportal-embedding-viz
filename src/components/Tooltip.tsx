import React from 'react';

interface TooltipProps {
  x: number;
  y: number;
  visible: boolean;
  sampleId?: string;
  label?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ x, y, visible, sampleId, label }) => {
  if (!visible) return null;

  return (
    <div
      className="fixed bg-white border border-slate-200 shadow-lg rounded p-3 text-sm flex flex-col z-50 pointer-events-none transform -translate-x-1/2 -translate-y-[calc(100%+10px)]"
      style={{ left: x, top: y }}
    >
      <div className="font-semibold text-slate-800 border-b border-slate-100 pb-1 mb-1">
        Sample: {sampleId}
      </div>
      <div className="text-slate-600 flex flex-col">
        <span className="font-medium text-xs uppercase text-slate-400">Cancer Type</span>
        <span>{label}</span>
      </div>
    </div>
  );
};
