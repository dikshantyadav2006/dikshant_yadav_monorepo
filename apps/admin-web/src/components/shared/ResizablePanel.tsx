'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

interface ResizablePanelProps {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
  defaultLeftWidth?: number;
  defaultRightWidth?: number;
  minPanelWidth?: number;
}

export function ResizablePanel({
  left,
  center,
  right,
  defaultLeftWidth = 240,
  defaultRightWidth = 400,
  minPanelWidth = 180,
}: ResizablePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [rightWidth, setRightWidth] = useState(defaultRightWidth);
  const [dragging, setDragging] = useState<'left' | 'right' | null>(null);

  const handleMouseDown = useCallback(
    (panel: 'left' | 'right') => (e: React.MouseEvent) => {
      e.preventDefault();
      setDragging(panel);
    },
    [],
  );

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const containerWidth = rect.width;

      if (dragging === 'left') {
        const newWidth = Math.max(minPanelWidth, Math.min(e.clientX - rect.left, containerWidth - rightWidth - minPanelWidth));
        setLeftWidth(newWidth);
      } else if (dragging === 'right') {
        const newWidth = Math.max(minPanelWidth, Math.min(rect.right - e.clientX, containerWidth - leftWidth - minPanelWidth));
        setRightWidth(newWidth);
      }
    };

    const handleMouseUp = () => setDragging(null);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [dragging, leftWidth, rightWidth, minPanelWidth]);

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden">
      {/* Left Panel */}
      <div
        className="flex-shrink-0 h-full overflow-hidden"
        style={{ width: leftWidth }}
      >
        {left}
      </div>

      {/* Left Handle */}
      <div
        onMouseDown={handleMouseDown('left')}
        className={`flex-shrink-0 w-1 cursor-col-resize group relative z-10 ${
          dragging === 'left' ? 'bg-primary' : 'bg-border/60 hover:bg-primary/40'
        }`}
      >
        <div className="absolute inset-y-0 -left-1 -right-1" />
      </div>

      {/* Center Panel */}
      <div className="flex-1 h-full min-w-0 overflow-hidden">
        {center}
      </div>

      {/* Right Handle */}
      <div
        onMouseDown={handleMouseDown('right')}
        className={`flex-shrink-0 w-1 cursor-col-resize group relative z-10 ${
          dragging === 'right' ? 'bg-primary' : 'bg-border/60 hover:bg-primary/40'
        }`}
      >
        <div className="absolute inset-y-0 -left-1 -right-1" />
      </div>

      {/* Right Panel */}
      <div
        className="flex-shrink-0 h-full overflow-hidden"
        style={{ width: rightWidth }}
      >
        {right}
      </div>
    </div>
  );
}
