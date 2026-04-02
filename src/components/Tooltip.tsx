import React from 'react';

interface TooltipProps {
  x: number;
  y: number;
  visible: boolean;
  sampleId?: string;
  umapX?: number;
  umapY?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ x, y, visible, sampleId, umapX, umapY }) => {
  return (
    <div
      className={`fixed bg-white border border-slate-200 shadow-lg rounded-lg p-2 text-sm flex flex-col z-50 pointer-events-none transition-opacity duration-200 ease-in-out ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ left: x + 10, top: y - 10, transform: 'translate(0, -100%)' }}
    >
      <div className="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-1">
        {sampleId}
      </div>
      <div className="text-slate-600 flex flex-col space-y-1">
        <div className="flex justify-between items-center space-x-3">
          <span className="font-semibold text-xs uppercase text-slate-400">UMAP 1</span>
          <span className="font-mono text-xs text-slate-700">{umapX !== undefined ? umapX.toFixed(3) : ''}</span>
        </div>
        <div className="flex justify-between items-center space-x-3">
          <span className="font-semibold text-xs uppercase text-slate-400">UMAP 2</span>
          <span className="font-mono text-xs text-slate-700">{umapY !== undefined ? umapY.toFixed(3) : ''}</span>
        </div>
      </div>
    </div>
  );
};
