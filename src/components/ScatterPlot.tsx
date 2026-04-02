import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { Point } from '../hooks/useEmbedding';
import { Tooltip } from './Tooltip';

interface ScatterPlotProps {
  points: Point[];
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({ points }) => {
  console.log("ScatterPlot received points:", points);
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0, visible: false, sampleId: '', label: '' });

  useEffect(() => {
    if (!points || points.length === 0 || !svgRef.current) return;

    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // clean previous renders

    // Title
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

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    rootGroup.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 35)
      .attr("fill", "#64748b")
      .style("text-anchor", "middle")
      .text("UMAP 1");

    rootGroup.append("g")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -35)
      .attr("x", -innerHeight / 2)
      .attr("fill", "#64748b")
      .style("text-anchor", "middle")
      .text("UMAP 2");

    rootGroup.selectAll("circle")
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
          .attr("stroke", "#0f172a")
          .attr("stroke-width", 2)
          .attr("r", 8);
        
        setTooltip({
          visible: true,
          x: event.clientX,
          y: event.clientY,
          sampleId: d.sampleId,
          label: d.label
        });
      })
      .on("mousemove", (event) => {
        setTooltip(prev => ({ ...prev, x: event.clientX, y: event.clientY }));
      })
      .on("mouseout", (event) => {
        d3.select(event.currentTarget)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .attr("r", 6);
        setTooltip(prev => ({ ...prev, visible: false }));
      });

  }, [points]);

  return (
    <div className="relative flex justify-center items-center w-full h-full bg-white rounded-xl">
      <svg ref={svgRef} width={800} height={600} className="max-w-full h-auto" style={{ width: '800px', height: '600px' }} />
      <Tooltip {...tooltip} />
    </div>
  );
};
