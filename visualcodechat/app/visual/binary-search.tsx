// binary search

import React, { useEffect, useState, useRef } from "react";
import { Selection } from "d3-selection";
import * as d3 from "d3";
import { Props } from "../components/visual-props";

// data, number, messageId

const BinarySearch: React.FC<Props> = ({ data, number, messageId }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    function sleep(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    const width = 640;
    const height = 400;
    const marginTop = 20;
    const marginRight = 0;
    const marginBottom = 30;
    const marginLeft = 40;
    const x = d3
      .scaleBand()
      .domain(data.map((_, idx) => idx.toString()))
      .range([marginLeft, width - marginRight])
      .padding(0.15);

    const xAxis = d3.axisBottom(x).tickSizeOuter(0);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data) as number])
      .nice()
      .range([height - marginBottom, marginTop]);

    const svgElement = d3
      .select(svgRef.current)
      .attr("id", "A" + messageId)
      .attr("viewBox", [0, 0, width, height])
      .attr(
        "style",
        `max-width: ${width}px; height: auto; font: 10px sans-serif; overflow: visible;`,
      );

    const bars = svgElement
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "bar")
      .style("mix-blend-mode", "normal");

    bars
      .append("rect")
      .attr("x", (_, idx) => x(idx.toString()) as number)
      .attr("y", (d) => y(d) as number)
      .attr("height", (d) => y(0) - (y(d) as number))
      .attr("width", x.bandwidth() as number)
      .attr("fill", "steelblue");

    // gx
    svgElement
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(xAxis)
      .selectAll("text")
      .style("font-size", "20px"); 

    // gy
    svgElement
      .append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(
        d3
          .axisLeft(y)
          .ticks(d3.max(data) as number)
          .tickFormat(d3.format(".0f")),
      )
      .selectAll("text")
      .style("font-size", "20px"); 

    async function chart() {

      let selector = "A" + messageId;
      const lastsvg = d3.select(`#${selector}`);

      const colorTween = (startColor: string, endColor: string, bar: Selection<d3.BaseType, unknown, HTMLElement, any>) => {
        return function (t: number) {
          const interpolateColor = d3.interpolateRgb(startColor, endColor);
          bar.select("rect").attr("fill", interpolateColor(t));
        };
      };

      let startBar = lastsvg.select(`.bar:nth-child(${0})`);
      let middleBar = lastsvg.select(`.bar:nth-child(${0})`);
      let endBar = lastsvg.select(`.bar:nth-child(${0})`);

      if (number === 1){
        startBar = lastsvg.select(`.bar:nth-child(${1})`);
        middleBar = lastsvg.select(`.bar:nth-child(${3})`);
        endBar = lastsvg.select(`.bar:nth-child(${6})`);
      }
      else if(number === 2){
        startBar = lastsvg.select(`.bar:nth-child(${1})`);
        middleBar = lastsvg.select(`.bar:nth-child(${1})`);
        endBar = lastsvg.select(`.bar:nth-child(${2})`);
      }
      else if (number === 3){
        startBar = lastsvg.select(`.bar:nth-child(${2})`);
        middleBar = lastsvg.select(`.bar:nth-child(${2})`);
        endBar = lastsvg.select(`.bar:nth-child(${2})`);
      }
      else if (number === 4){
        startBar = lastsvg.select(`.bar:nth-child(${3})`);
        endBar = lastsvg.select(`.bar:nth-child(${2})`);
      }

      startBar
        .transition()
        .duration(300)
        .delay(0)
        .tween("color", () => colorTween("steelblue", "orange", startBar));

      endBar
        .transition()
        .duration(300)
        .delay(0)
        .tween("color", () => colorTween("steelblue", "orange", endBar));

      middleBar
        .transition()
        .duration(300)
        .delay(500)
        .tween("color", () => colorTween("steelblue", "red", middleBar))
        .transition()
        .duration(300)
        .delay(0)
        .tween("color", () => colorTween("red", "steelblue", middleBar))
        .transition()
        .duration(300)
        .delay(0)
        .tween("color", () => colorTween("steelblue", "red", middleBar))
        .transition()
        .duration(300)
        .delay(0)
        .tween("color", () => colorTween("red", "steelblue", middleBar))
        .transition()
        .duration(300)
        .delay(0)
        .tween("color", () => colorTween("steelblue", "red", middleBar))
        .transition()
        .delay(300)
        .on("end", () => {
          chart();
        });
    }
    if (number !== 0){
      chart();
    }
  }, [data, number, messageId]);


  return (
    <div style={{ width: "200px", height: "150px" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default BinarySearch;
