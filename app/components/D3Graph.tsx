"use client";

import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

// Add these interfaces for TypeScript
interface StudyInsight {
  bestPractices: string[];
  commonMistakes: string[];
  studyTechniques?: string[];
  resourceRecommendations?: string[];
}

interface ChapterInsight {
  id: string;
  label: string;
  difficulty: string;
  estimatedHours: number;
  studyInsights: StudyInsight;
}

interface D3StudyGraphProps {
  chapterInsights: ChapterInsight[];
}

const D3StudyGraph: React.FC<D3StudyGraphProps> = ({ chapterInsights }) => {
  // Add proper type to the ref
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!chapterInsights?.length || !svgRef.current) return;
    
    // Clear any existing visualization
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;
    const margin = { top: 80, right: 80, bottom: 80, left: 80 };
    
    // Create nodes data
    const nodes = chapterInsights.map((chapter, i) => ({
      id: chapter.id.toString(),
      label: chapter.label,
      difficulty: chapter.difficulty,
      estimatedHours: chapter.estimatedHours,
      step: i + 1,
      insights: chapter.studyInsights,
      // Add hierarchy levels - this is what makes the layout hierarchical
      level: Math.floor(i / 3), // Create a new level every 3 chapters
      group: i % 3 // Group within level
    }));
    
    // Create links between nodes that represent dependencies
    const links = [];
    
    // Traditional sequential links - use node objects instead of indices
    for (let i = 0; i < nodes.length - 1; i++) {
      links.push({
        source: nodes[i].id, // Use node ID instead of array index
        target: nodes[i + 1].id, // Use node ID instead of array index
        value: 1,
        primary: true
      });
    }
    
    // Add cross-level dependencies (if applicable to your study structure)
    for (let i = 0; i < nodes.length - 3; i += 3) {
      if (i + 3 < nodes.length) {
        links.push({
          source: nodes[i].id, // Use node ID
          target: nodes[i + 3].id, // Use node ID
          value: 0.5,
          primary: false
        });
      }
      if (i + 4 < nodes.length) {
        links.push({
          source: nodes[i + 1].id, // Use node ID 
          target: nodes[i + 4].id, // Use node ID
          value: 0.5,
          primary: false
        });
      }
    }
    
    // Create a hierarchical force simulation
    // @ts-ignore
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links)
        .id((d: any) => d.id)
        .distance((d: any) => d.primary ? 100 : 170)
        .strength((d: any) => d.primary ? 0.8 : 0.3))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05));
    
    // Add hierarchical positioning force
    simulation.force("x", d3.forceX().x((d: any) => {
      // Position based on level and group
      const levelWidth = (width - margin.left - margin.right) / 3;
      return margin.left + (d.group + 0.5) * levelWidth;
    }).strength(0.7));
    
    simulation.force("y", d3.forceY().y((d: any) => {
      // Position based on level
      const levelHeight = (height - margin.top - margin.bottom) / 4;
      return margin.top + (d.level + 0.5) * levelHeight;
    }).strength(0.7));
    
    // Create arrow marker for primary links
    svg.append("defs").append("marker")
      .attr("id", "arrowhead-primary")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#4f46e5");
    
    // Create arrow marker for secondary links
    svg.append("defs").append("marker")
      .attr("id", "arrowhead-secondary")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#6b7280");
    
    // Add the links with different styles for primary vs secondary
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", (d: any) => d.primary ? "#4f46e5" : "#6b7280")
      .attr("stroke-width", (d: any) => d.primary ? 3 : 1.5)
      .attr("stroke-dasharray", (d: any) => d.primary ? null : "5,5")
      .attr("marker-end", (d: any) => d.primary ? "url(#arrowhead-primary)" : "url(#arrowhead-secondary)");
    
    // Create node groups
    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      // @ts-ignore
      .call(d3.drag()
        .on("start", dragstarted as any)
        .on("drag", dragged as any)
        .on("end", dragended as any));
    
    // Add circles to node groups with difficulty colors
    const difficultyColors = {
      easy: '#22c55e',
      medium: '#eab308',
      hard: '#ef4444'
    };
    
    // Add larger background circle for visual emphasis
    node.append("circle")
      .attr("r", 50)
      .attr("fill", "#1e293b")
      .attr("opacity", 0.7);
    
    node.append("circle")
      .attr("r", 45)
      .attr("fill", (d: any) => difficultyColors[d.difficulty] || "#4f46e5")
      .attr("stroke", "#1e293b")
      .attr("stroke-width", 3);
    
    // Add step numbers to nodes
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("font-size", "22px")
      .text((d: any) => d.step);
    
    // Add topic labels below nodes
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 65)
      .attr("fill", "white")
      .attr("font-size", "14px")
      .attr("font-weight", "medium")
      .text((d: any) => d.label.length > 20 ? d.label.substring(0, 18) + "..." : d.label);
    
    // Add hours text
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 85)
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text((d: any) => `${d.estimatedHours} hours`);
    
    // Create tooltips
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "#1e293b")
      .style("color", "white")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("border", "1px solid #6b7280")
      .style("font-size", "12px")
      .style("max-width", "250px")
      .style("box-shadow", "0 10px 15px -3px rgba(0, 0, 0, 0.1)")
      .style("z-index", "10");
    
    // Enhanced tooltips with more study insights
    node.on("mouseover", function(event: any, d: any) {
      const bestPractices = d.insights?.bestPractices?.join("<br>") || "No insights available";
      const commonMistakes = d.insights?.commonMistakes?.join("<br>") || "None listed";
      
      tooltip
        .html(`<strong>${d.label}</strong><br>
              <strong>Difficulty:</strong> ${d.difficulty}<br>
              <strong>Estimated Time:</strong> ${d.estimatedHours} hours<br>
              <strong>Step:</strong> ${d.step} of ${nodes.length}<br>
              <strong>Study Tips:</strong><br>${bestPractices}<br>
              <strong>Common Mistakes:</strong><br>${commonMistakes}`)
        .style("visibility", "visible");
    })
    .on("mousemove", function(event: any) {
      tooltip
        .style("top", (event.pageY - 10) + "px")
        .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function() {
      tooltip.style("visibility", "hidden");
    });
    
    // Add legend for link types
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 200}, 30)`);
    
    legend.append("rect")
      .attr("width", 180)
      .attr("height", 80)
      .attr("fill", "#1e293b")
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("opacity", 0.8);
    
    legend.append("text")
      .attr("x", 10)
      .attr("y", 20)
      .attr("fill", "white")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text("Study Path Legend");
    
    // Primary path legend
    legend.append("line")
      .attr("x1", 10)
      .attr("y1", 40)
      .attr("x2", 50)
      .attr("y2", 40)
      .attr("stroke", "#4f46e5")
      .attr("stroke-width", 3);
    
    legend.append("text")
      .attr("x", 60)
      .attr("y", 44)
      .attr("fill", "white")
      .attr("font-size", "10px")
      .text("Main sequence");
    
    // Secondary path legend
    legend.append("line")
      .attr("x1", 10)
      .attr("y1", 60)
      .attr("x2", 50)
      .attr("y2", 60)
      .attr("stroke", "#6b7280")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "5,5");
    
    legend.append("text")
      .attr("x", 60)
      .attr("y", 64)
      .attr("fill", "white")
      .attr("font-size", "10px")
      .text("Related topics");
    
    // Update positions on each tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);
      
      node
        .attr("transform", (d: any) => `translate(${d.x}, ${d.y})`);
    });
    
    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      // Keep nodes in place after dragging for better user control
      // Comment these out if you want nodes to resume floating
      // d.fx = null;
      // d.fy = null;
    }
    
    // Run simulation with higher alpha for better layout
    simulation.alpha(1).restart();
    
    // Modify your simulation to reduce movement
    simulation.alphaDecay(0.1);
    simulation.velocityDecay(0.5);
    
    // Cleanup
    return () => {
      d3.select("body").selectAll(".tooltip").remove();
    };
  }, [chapterInsights]);
  
  return (
    <div className="w-full h-[600px] overflow-hidden border border-gray-800 rounded-xl bg-gray-900">
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
};

export default D3StudyGraph;