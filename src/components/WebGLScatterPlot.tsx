import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { Point } from '../hooks/useEmbedding';
import { Tooltip } from './Tooltip';
import { useWebGL } from '../hooks/useWebGL';

interface WebGLScatterPlotProps {
  points: Point[];
}

export const WebGLScatterPlot: React.FC<WebGLScatterPlotProps> = ({ points }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | undefined>(undefined);
  
  const { regl, drawPoints, ready } = useWebGL(canvasRef);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0, visible: false, sampleId: '', umapX: 0, umapY: 0 });

  const metricsRef = useRef<any>({});

  useEffect(() => {
    if (!ready || !regl || !drawPoints || points.length === 0) return;

    // Dimensions correlating to the SVG ScatterPlot container
    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 }; 
    metricsRef.current = { width, height, margin };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xExtent = d3.extent(points, d => d.x) as [number, number];
    const yExtent = d3.extent(points, d => d.y) as [number, number];
    const dx = xExtent[1] === xExtent[0] ? 1 : xExtent[1] - xExtent[0];
    const dy = yExtent[1] === yExtent[0] ? 1 : yExtent[1] - yExtent[0];
    
    // Scale domain bounds
    const xScale = d3.scaleLinear().domain([xExtent[0] - dx*0.1, xExtent[1] + dx*0.1]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([yExtent[0] - dy*0.1, yExtent[1] + dy*0.1]).range([innerHeight, 0]);
    metricsRef.current.xScale = xScale;
    metricsRef.current.yScale = yScale;

    // WebGL contiguous Float buffers instead of mapping generic POJOs
    const positions = new Float32Array(points.length * 2);
    const colors = new Float32Array(points.length * 3);
    const colorScale = d3.scaleOrdinal<string>(d3.schemeTableau10);
    
    const mappedPoints: {x:number, y:number, point: Point}[] = [];

    points.forEach((pt, i) => {
      const px = xScale(pt.x);
      const py = yScale(pt.y);
      positions[i*2] = px; 
      positions[i*2+1] = py;
      
      mappedPoints.push({x: px, y: py, point: pt});

      const color = d3.color(colorScale(pt.label))?.rgb() || {r:0,g:0,b:0};
      colors[i*3] = color.r / 255;
      colors[i*3+1] = color.g / 255;
      colors[i*3+2] = color.b / 255;
    });
    
    metricsRef.current.mappedPoints = mappedPoints;

    const startTime = performance.now();
    
    // Core regl animation loop
    const renderLoop = () => {
      const elapse = performance.now() - startTime;
      
      // Calculate opacity for smooth fade arrival
      const opacity = Math.min(1.0, elapse / 500); 

      regl.poll(); // Request frame buffer
      regl.clear({ color: [1, 1, 1, 1], depth: 1 }); // Paint raw white Canvas natively

      drawPoints({
        positions: positions,
        colors: colors,
        resolution: [width, height],
        offset: [margin.left, margin.top],
        pointSize: 12,
        opacity: opacity, // animate
        count: points.length
      });

      // Break loop efficiently once 1.0 opacity reached 
      if (opacity < 1.0) {
        animRef.current = requestAnimationFrame(renderLoop);
      }
    };
    
    // Ignite Loop
    animRef.current = requestAnimationFrame(renderLoop);
    
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };

  }, [ready, regl, drawPoints, points]);

  // Handle intersection manually through Euclidean proximity parsing
  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !metricsRef.current.mappedPoints) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;   
    const scaleY = canvas.height / rect.height; 
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    const { margin, mappedPoints } = metricsRef.current;
    
    // Localize click mapping to chart constraints internally
    const px = mouseX - margin.left;
    const py = mouseY - margin.top;
    
    let nearest = null;
    let minDist = 12; // hit-test radius width allowed (pixels)

    // JS map iteration (extremely fast internally despite CPU parsing)
    for (let i = 0; i < mappedPoints.length; i++) {
        const pt = mappedPoints[i];
        const dx = pt.x - px;
        const dy = pt.y - py;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < minDist) {
            minDist = dist;
            nearest = pt.point;
        }
    }

    if (nearest) {
      setTooltip({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        sampleId: nearest.sampleId,
        umapX: nearest.x,
        umapY: nearest.y
      });
    } else {
      setTooltip(prev => ({ ...prev, visible: false }));
    }
  };

  const handleMouseOut = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className="relative flex justify-center items-center w-full h-full bg-white rounded-xl" ref={containerRef}>
      <h2 className="absolute top-4 font-semibold text-slate-700 pointer-events-none">UMAP WebGL Render Layer</h2>
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600} 
        className="max-w-full h-auto cursor-crosshair rounded-xl border border-slate-100 shadow-sm"
        style={{ width: '800px', height: '600px' }}
        onMouseMove={handleMouseMove}
        onMouseOut={handleMouseOut}
      />
      <Tooltip {...tooltip} />
    </div>
  );
};
