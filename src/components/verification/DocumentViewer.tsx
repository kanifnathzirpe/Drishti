import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, FileText } from 'lucide-react';

interface DocumentViewerProps {
  fileUrl: string;
  fileName: string;
  activeBoundingBox?: [number, number, number, number] | null; // [ymin, xmin, ymax, xmax] 0-1000
  activeFieldName?: string;
  pageCount?: number;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  fileUrl,
  fileName,
  activeBoundingBox,
  activeFieldName,
  pageCount = 1,
}) => {
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const handleZoomIn = () => setZoom((z) => Math.min(2.5, +(z + 0.2).toFixed(1)));
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, +(z - 0.2).toFixed(1)));
  const handleResetZoom = () => setZoom(1);

  // Compute bounding box CSS percentages
  // Bounding box format: [ymin, xmin, ymax, xmax] in 0-1000 coordinate space
  const boxStyle: React.CSSProperties | null = activeBoundingBox
    ? {
        top: `${activeBoundingBox[0] / 10}%`,
        left: `${activeBoundingBox[1] / 10}%`,
        height: `${(activeBoundingBox[2] - activeBoundingBox[0]) / 10}%`,
        width: `${(activeBoundingBox[3] - activeBoundingBox[1]) / 10}%`,
      }
    : null;

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
      {/* Viewer Toolbar */}
      <div className="bg-slate-800 text-slate-200 px-4 py-2 flex items-center justify-between text-xs border-b border-slate-700">
        <div className="flex items-center space-x-2 truncate">
          <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="font-semibold truncate">{fileName}</span>
          <span className="text-slate-400 text-[10px]">
            (Page {currentPage} of {pageCount})
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {activeFieldName && (
            <span className="px-2 py-0.5 rounded bg-indigo-900 text-indigo-200 border border-indigo-700 text-[11px] font-mono">
              Target: {activeFieldName}
            </span>
          )}
          <div className="flex items-center bg-slate-700 rounded-md">
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-slate-600 rounded-l transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-slate-600 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 hover:bg-slate-600 rounded-r transition text-slate-400 hover:text-white"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Document Viewport */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/80 relative">
        <div
          className="relative transition-transform duration-100 ease-out origin-top shadow-2xl bg-white rounded"
          style={{ transform: `scale(${zoom})` }}
        >
          <img
            src={fileUrl}
            alt="Source Land Record"
            className="max-w-[750px] w-full object-contain block select-none pointer-events-none"
            onError={(e) => {
              // fallback to template svg if image fails
              (e.currentTarget as HTMLImageElement).src = '/samples/document_template.svg';
            }}
          />

          {/* Interactive Bounding Box Highlight Overlay */}
          {boxStyle && (
            <div
              style={boxStyle}
              className="absolute border-2 border-amber-500 bg-amber-400/25 pointer-events-none rounded-xs transition-all duration-200 shadow-lg animate-pulse ring-4 ring-amber-400/20"
            >
              <span className="absolute -top-6 left-0 bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                {activeFieldName || 'Field Reference'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
