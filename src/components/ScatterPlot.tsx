import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { Point } from '../hooks/useEmbedding';
import { Tooltip } from './Tooltip';

interface ScatterPlotProps {
  points: Point[];
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({ points }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0, visible: false, sampleId: '', umapX: 0, umapY: 0 });
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const resetZoom = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(750).call(zoomRef.current.transform, d3.zoomIdentity);
    }
  };

  useEffect(() => {
    if (!points || points.length === 0 || !svgRef.current) return;

    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 150, bottom: 40, left: 50 }; // Space for legend on right
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "transparent")
      .style("pointer-events", "all");

    svg.append("text")
       .attr("x", width / 2)
       .attr("y", Math.max(margin.top / 2, 16))
       .attr("text-anchor", "middle")
       .style("font-size", "16px")
       .style("font-weight", "600")
       .style("fill", "#334155")
       .text("UMAP Embedding Visualization");

    const rootGroup = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
      
    // Defs for clip path to prevent zoomed circles from spilling into margins
    svg.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight);

    const zoomGroup = rootGroup.append("g")
      .attr("clip-path", "url(#clip)");
      
    const circlesGroup = zoomGroup.append("g");

    const xExtent = d3.extent(points, d => d.x) as [number, number];
    const yExtent = d3.extent(points, d => d.y) as [number, number];
    
    const dx = xExtent[1] === xExtent[0] ? 1 : xExtent[1] - xExtent[0];
    const dy = yExtent[1] === yExtent[0] ? 1 : yExtent[1] - yExtent[0];
    
    const xPadding = dx * 0.1;
    const yPadding = dy * 0.1;

    const xScale = d3.scaleLinear()
      .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
      .range([innerHeight, 0]);

    const colorScale = d3.scaleOrdinal<string>(d3.schemeTableau10);
    const uniqueLabels = Array.from(new Set(points.map(p => p.label)));

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    const gx = rootGroup.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis);

    gx.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 35)
      .attr("fill", "#64748b")
      .style("text-anchor", "middle")
      .text("UMAP 1");

    const gy = rootGroup.append("g")
      .call(yAxis);

    gy.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -35)
      .attr("x", -innerHeight / 2)
      .attr("fill", "#64748b")
      .style("text-anchor", "middle")
      .text("UMAP 2");

    circlesGroup.selectAll("circle")
      .data(points)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 6)
      .attr("fill", d => colorScale(d.label))
      .attr("opacity", 0.8)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(150)
          .attr("stroke", "#000")
          .attr("stroke-width", 2)
          .attr("r", 10);
        
        setTooltip({
          visible: true,
          x: event.clientX,
          y: event.clientY,
          sampleId: d.sampleId,
          umapX: d.x,
          umapY: d.y
        });
      })
      .on("mousemove", (event) => {
        setTooltip(prev => ({ ...prev, x: event.clientX, y: event.clientY }));
      })
      .on("mouseout", (event) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(150)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .attr("r", 6);
        setTooltip(prev => ({ ...prev, visible: false }));
      });

    // Setup Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .extent([[0, 0], [innerWidth, innerHeight]])
      .on("zoom", (event) => {
        const transform = event.transform;
        circlesGroup.attr("transform", transform);
        
        // Dynamically update axes
        const updatedXScale = transform.rescaleX(xScale);
        const updatedYScale = transform.rescaleY(yScale);
        gx.call(xAxis.scale(updatedXScale));
        gy.call(yAxis.scale(updatedYScale));
      });

    svg.call(zoom);
    zoomRef.current = zoom;
    
    // Legend Rendering
    const legendGroup = svg.append("g")
      .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`);
      
    uniqueLabels.forEach((label, i) => {
      const g = legendGroup.append("g").attr("transform", `translate(0, ${i * 20})`);
      
      g.append("circle")
       .attr("cx", 0)
       .attr("cy", 0)
       .attr("r", 5)
       .attr("fill", colorScale(label));
       
      g.append("text")
       .attr("x", 10)
       .attr("y", 4)
       .style("font-size", "12px")
       .style("fill", "#64748b")
       .text(label);
    });

  }, [points]);

  return (
    <div className="relative flex flex-col justify-center items-center w-full h-full bg-white rounded-xl">
      <div className="absolute top-4 right-4 z-10">
        <button 
           onClick={resetZoom}
           className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-medium rounded shadow-sm focus:outline-none transition-colors"
        >
          Reset View
        </button>
      </div>
      <svg ref={svgRef} width={800} height={600} className="max-w-full h-auto" style={{ width: '800px', height: '600px' }} />
      <Tooltip {...tooltip} />
    </div>
  );
};
