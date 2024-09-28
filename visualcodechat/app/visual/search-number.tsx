// (2) searching whether a particular number appear in the list

import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import { Props } from "../components/visual-props";

// data, number, messageId

const SearchNumber: React.FC<Props> = ({ data, number, messageId }) => {
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
      const index = getIndex(data, number);

      if (index !== -1) {
        await sleep(1000);
        let selector = "A" + messageId;
        const lastsvg = d3.select(`#${selector}`);
        for (let i = 0; i < index + 1; i++) {
          let bar = lastsvg.select(`.bar:nth-child(${i + 1})`);
          const colorTween = (startColor: string, endColor: string) => {
            return function (t: number) {
              const interpolateColor = d3.interpolateRgb(startColor, endColor);
              bar.select("rect").attr("fill", interpolateColor(t));
            };
          };

          if (i === index) {
            bar
              .transition()
              .duration(300)
              .delay(0)
              .tween("color", () => colorTween("steelblue", "orange"))
              .transition()
              .duration(300)
              .delay(0)
              .tween("color", () => colorTween("orange", "red"))
              .transition()
              .duration(300)
              .delay(3000)
              .tween("color", () => colorTween("red", "steelblue"))
              .on("end", () => {
                chart();
              });
          } else {
            bar
              .transition()
              .duration(300)
              .delay(0)
              .tween("color", () => colorTween("steelblue", "orange"))
              .transition()
              .duration(300)
              .delay(0)
              .tween("color", () => colorTween("orange", "steelblue"));
          }
          await sleep(900);
        }
      } else {
        const lastsvg2 = d3.select(`#${"A" + messageId}`);
        for (let i = 0; i < data.length; i++) {
          let bar2 = lastsvg2.select(`.bar:nth-child(${i + 1})`);

          const colorTween2 = (startColor: string, endColor: string) => {
            return function (t: number) {
              const interpolateColor = d3.interpolateRgb(startColor, endColor);
              bar2.select("rect").attr("fill", interpolateColor(t));
            };
          };
          if (i !== data.length - 1) {
            bar2
              .transition()
              .duration(300)
              .delay(0)
              .tween("color", () => colorTween2("steelblue", "orange"))
              .transition()
              .duration(300)
              .delay(0)
              .tween("color", () => colorTween2("orange", "steelblue"));
          } else {
            bar2
              .transition()
              .duration(300)
              .delay(0)
              .tween("color", () => colorTween2("steelblue", "orange"))
              .transition()
              .duration(300)
              .delay(0)
              .tween("color", () => colorTween2("orange", "steelblue"))
              .on("end", () => {
                chart();
              });
          }

          await sleep(900);
        }
      }
    }
    chart();
  }, [data, number, messageId]);

  function getIndex(arr1: number[], num: number): number {
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] === num) {
        return i;
      }
    }
    return -1;
  }

  return (
    <div style={{ width: "200px", height: "150px" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default SearchNumber;
