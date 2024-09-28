
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Props, graphType } from '../components/visual-props';

const origindata={
  "nodes": [
    {"id": "A",},
    {"id": "B",},
    {"id": "C",},
    {"id": "D",},
    {"id": "E",}
  ],
  "links": [
    {"source": "A", "target": "B",},
    {"source": "A", "target": "D",},
    {"source": "A", "target": "C",},
    {"source": "B", "target": "D",},
    {"source": "D", "target": "C",},
    {"source": "D", "target": "E",},
    {"source": "E", "target": "B",},
  ],
  "currentDFSpaths":[],
  "visitedNodes": [],
}

function combine_data(original: any, replacement: any): graphType{
    let result = {...original};
    if (replacement["currentNodes"]) {
    result["currentNodes"] = [...replacement["currentNodes"]];
    }
    if (replacement["visitedNodes"]) {
    result["visitedNodes"] = [...replacement["visitedNodes"]];
    }
    if (replacement["connectedPath"]) {
    result["connectedPath"] = [...replacement["connectedPath"]];
    }
    if(replacement["currentDFSpaths"]){
      result["currentDFSpaths"] = [...replacement["currentDFSpaths"]];
    }
    if (replacement["connectedComponents"]) {
    result["connectedComponents"] = [...replacement["connectedComponents"]];
    }

    return result;
}


const Graph_Cycle: React.FC<Props> = ({ json, messageId}) => {
const svgRef = React.useRef<SVGSVGElement>(null);

React.useEffect(() => {
if (json) {
    const forcedata = combine_data(origindata, json);
    const searchedNodes = forcedata.visitedNodes || []; 
    const width = 600;
    const height = 600;
    const node_radius = 40;  
    const links = forcedata.links.map(d => ({...d}));
    const nodes = forcedata.nodes.map(d => ({
    ...d,
    color: searchedNodes.includes(d.id) ? "#2ca02c" : "#1f77b4" 
    }));
    const nodess = nodes as d3.SimulationNodeDatum[];

    const linkForce = d3.forceLink(links)
        .id((d: any) => d.id)
        .distance(240) 
        .strength(0.6); 

    const simulation = d3.forceSimulation(nodess)
    .force("link", linkForce)
    .force("charge", d3.forceManyBody().strength(-240)) 
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide().radius(15))
    .force("avoidCollide", d3.forceCollide().radius(15).strength(1))
    .force("boundary", boundingForce(width, height))  
    .on("tick", ticked);

    const svg = d3.select(svgRef.current)
    .attr("id", "A" + messageId)
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height].join(' '))
    .attr("style", "max-width: 100%; height: 100%;"); 
    const defs = svg.append("defs");
    links.forEach((link, index) => {
    defs.append("marker")
        .attr("id", "arrow-" + index) 
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 10)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "none")
        .attr("stroke", "rgba(0, 0, 0, 0.8)")
    });

    const link = svg.append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll('line')
    .data(links)
    .join("line")
    .attr("stroke-width", 5)   
    .attr("marker-end", (d, i) => `url(#arrow-${i})`); 

    const drag = (simulation:d3.Simulation<d3.SimulationNodeDatum, undefined>) => {

    function dragstarted(event: d3.D3DragEvent<any, any, any>, d: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    
    function dragged(event: d3.D3DragEvent<any, any, any>, d: any) {
        d.fx = event.x;
        d.fy = event.y;
        d.fx = Math.max(0, Math.min(600-node_radius, event.x));
        d.fy = Math.max(0, Math.min(600-node_radius, event.y));
    }
    
    function dragended(event: d3.D3DragEvent<any, any, any>, d: any) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
    
    return d3.drag<SVGGElement, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    };

      
function boundingForce(width: number, height: number) {
        return (alpha: number) => {
          for (let d of nodess) {
            d.x = Math.max(node_radius, Math.min(width - node_radius, d.x as number));
            d.y = Math.max(node_radius, Math.min(height - node_radius, d.y as number));
          }
        };
      }
      const node = svg.append("g")
        .attr("stroke", "#fff") 
        .attr("stroke-width", 1)
        .selectAll('circle')
        .data(nodes)        
        .enter().append('g');

      node.append('circle')
        .attr("r", node_radius)
        .attr("fill", (d: any) => d.color);

      node.append('text')
        .attr('dx', '0em')
        .attr('dy', '0.35em')
        .attr("font-size", "40px")
        .text((d: any) => d.id)
        .attr("stroke", "none")
        .attr("fill", "white");
  
      node.append("title")
        .text((d: any) => d.id);

      node.call(drag(simulation));
  
      function isDFSpath(node: any) {
        if(forcedata.currentDFSpaths){
          return forcedata.currentDFSpaths.includes(node.id);
        }
      }

      function convertToLinksArray(arr: string[]): { source: string, target: string }[] {
        const links: { source: string, target: string }[] = [];
        for (let i = 0; i < arr.length - 1; i++) {
            const link = {
                source: arr[i],
                target: arr[i + 1]
            };
            links.push(link);
        }
        return links;
      }

      //Check that the link is in currentNodes
      function isHighlightedLink(link: any) {
        const linkData = convertToLinksArray(forcedata.currentDFSpaths as string[]);
        if(forcedata.currentDFSpaths){
          return linkData.some((l: { source: any; target: any; }) => l.source === link.source.id && l.target === link.target.id);
        }
      }
      
      function ticked() {
        link.attr("x1", (d: any) => {
          return d.source.x + (Math.cos(Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x)) * node_radius);
        }).attr("y1", (d: any) => {
          return d.source.y + (Math.sin(Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x)) * node_radius);
        }).attr("x2", (d: any) => {
          return d.target.x - (Math.cos(Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x)) * node_radius);
        }).attr("y2", (d: any) => {
          return d.target.y - (Math.sin(Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x)) * node_radius);
        })
        node
        .attr("transform", (d: any) => `translate(${d.x}, ${d.y})`);
      }

      const initialLinkColor = "#999";
      const initialArrowColor = "#999";
      const initialNodeRadius = node_radius;
      const initialNodeColor: (d: { color: string }) => string = d => d.color;

      const initialStates = {
        linkColor: initialLinkColor,
        arrowColor: initialArrowColor,
        nodeRadius: initialNodeRadius,
        nodeColor: initialNodeColor
      };

      let selector = "A" + messageId;
      const svgT = d3.select(`#${selector}`); 
      const linkT = svgT.selectAll('line');
      const nodeT = svgT.selectAll("circle");

      function resetToInitialState() {
        linkT.transition().duration(0).attr("stroke", initialStates.linkColor);
        svgT.selectAll("circle")
          .transition().duration(0)
          .attr("r", initialStates.nodeRadius)
          .attr("fill", (d: any) => d.color);
      }

    function startAllAnimations() {
      resetToInitialState();
      svgT.selectAll('line')
        .transition()
        .delay(1000)
        .duration(2000)
        .attrTween("stroke", function(d: any) {
          const initialColor: string = d3.select(this).attr("stroke") || "#999"; 
          const targetColor: string = isHighlightedLink(d) ? "red" : "#999"; 
          return d3.interpolate(initialColor, targetColor); 
      })

      svgT.selectAll("circle")
      .transition()
      .delay(1000)
      .duration(2000)
      .attr("r", (d: any) => isDFSpath(d) ? node_radius+5 : node_radius)
      .attr("fill", (d: any) => isDFSpath(d) ? "red" : d.color)
      .end()
        .then(() => {
          if(forcedata.currentDFSpaths){
            startAllAnimations();}
        })
      }
      
      function animateConnectedPaths(paths: any[], nodes: any[]) {
        paths.forEach((id, index) => {

          setTimeout(() => {
            const node = nodes.find(node => node.id === id);
            if (node) {
              const nodeElement = svg.selectAll('circle').filter((d: any) => d.id === id).node();
              const currentColor = nodeElement ? d3.select(nodeElement).style("fill") : "#1f77b4"; 
              const targetColor = "#ffa500"; 
              const interpolate = d3.interpolateRgb(currentColor, targetColor);
              svgT.selectAll('circle')
              .filter((d: any) => d.id === id)  
              .transition()
              .duration(1000)
              .attrTween("fill", function() { return t => interpolate(t); });

              if (index < paths.length - 1) {
                const nextId = paths[index + 1];
                svgT.selectAll('line')
                    .filter((d: any) => (d.source.id === id && d.target.id === nextId) || (d.source.id === nextId && d.target.id === id))
                    .transition()
                    .duration(1000)
                    .attrTween("stroke", function() {
                      const currentLinkColor: string = d3.select(this).attr("stroke");
                      const interpolateLink = d3.interpolateRgb(currentLinkColor, targetColor);
                      return t => interpolateLink(t);
                    })               
              }
                
            }
          }, index * 1000);  
        });
        setTimeout(() => {
          startAllAnimations();
        }, paths.length * 1000 + 2000);
      }
      startAllAnimations();
  }

    }, [json,messageId]);
  
    return (
      <div style={{ width: "300px", height: "300px" }}>
        <svg ref={svgRef}></svg>
      </div>
    );
  };
  
  export default Graph_Cycle;
  

