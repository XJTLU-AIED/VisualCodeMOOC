import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Props } from "../components/visual-props";
interface BarChartProps {
  data: number[];
  newData: number[];
  messageId: string;
}
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const SelectionSort: React.FC<Props> = ({ data, newData, messageId }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
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

    function findArrayDifference(
      arr1: number[],
      arr2: number[],
    ): number[][] | null {
      const diffIndices: number[][] = [];
      for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
          diffIndices.push([i, arr2.indexOf(arr1[i])]);
        }
      }
      return diffIndices.length > 0 ? diffIndices : null;
    }
    function findSortedIndexes<T>(arr: T[]): number[] {
      const sortedIndexes: number[] = [];
      const sortedArr = [...arr].sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      });
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== sortedArr[i]) {
          break;
        }
        sortedIndexes.push(i);
      }
      return sortedIndexes;
    }

    function isSorted(arr: number[]) {
      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] > arr[i + 1]) {
          return false;
        }
      }
      return true;
    }

    function findIndexChangesAndFinalPosition(
      arr1: number[],
      arr2: number[],
    ): { changedIndexes: number[]; finalPositions: boolean[] } {
      const changedIndexes: number[] = [];
      const finalPositions: boolean[] = [];

      // Compare arrays and find changed indexes
      for (let i = 0; i < Math.max(arr1.length, arr2.length); i++) {
        if (arr1[i] !== arr2[i]) {
          changedIndexes.push(i);
        }
      }

      // Check if the changed indexes are in their final sorted positions
      const sortedArr = [...arr2].sort((a, b) => a - b);
      for (const index of changedIndexes) {
        finalPositions[index] = sortedArr.indexOf(arr2[index]) === index;
      }

      return { changedIndexes, finalPositions };
    }
    const diffIndices = findArrayDifference(data, newData);
    async function highlightBars(diffIndices: number[][]) {
      const sortedIndexes = findSortedIndexes(data);
      let selector = "A" + messageId;
      const lastsvg2 = d3.select(`#${selector}`);
      sortedIndexes.forEach((index) => {
        const bar = lastsvg2.select(`.bar:nth-child(${index + 1})`);
        bar.select("rect").attr("fill", "green");
      });
      for (let i = diffIndices[0][0]; i < data.length; i++) {
        let bar2 = lastsvg2.select(`.bar:nth-child(${i + 1})`);
        const colorTween2 = (startColor: string, endColor: string) => {
          return function (t: number) {
            const interpolateColor = d3.interpolateRgb(startColor, endColor);
            bar2.select("rect").attr("fill", interpolateColor(t));
          };
        };
        if (i === data.length - 1) {
          bar2
            .transition()
            .duration(300)
            .delay(0)
            .tween("color", () => colorTween2("steelblue", "red"))
            .transition()
            .duration(300)
            .delay(0)
            .tween("color", () => colorTween2("red", "steelblue"))
            .on("end", () => {
              chart();
            });
        } else if (i === diffIndices[0][0] || i === diffIndices[0][1]) {
          bar2
            .transition()
            .duration(300)
            .delay(0)
            .tween("color", () => colorTween2("steelblue", "red"));
          await sleep(300);
        } else {
          bar2
            .transition()
            .duration(300)
            .delay(0)
            .tween("color", () => colorTween2("steelblue", "red"))
            .transition()
            .duration(300)
            .delay(0)
            .tween("color", () => colorTween2("red", "steelblue"));
        }
        await sleep(900);
      }
    }
    function staticChart(){
      const sortedIndexes = findSortedIndexes(data);
      let selector = "A" + messageId;
      const lastsvg = d3.select(`#${selector}`);
      sortedIndexes.forEach((index) => {
        const bar = lastsvg.select(`.bar:nth-child(${index + 1})`);
        bar.select("rect").attr("fill", "green");
      });
    }

    async function chart() {
      let selector = "A" + messageId;
      const lastsvg = d3.select(`#${selector}`);

      if (diffIndices !== null) {
        const { changedIndexes, finalPositions } =
          findIndexChangesAndFinalPosition(data, newData);
        for (const [i, diffIndex] of diffIndices.entries()) {
          const mov = lastsvg.select(`.bar:nth-child(${diffIndex[0] + 1})`);
          const moveDistance = x.step() * (diffIndex[1] - diffIndex[0]);
          const colorTween = (startColor: string, endColor: string) => {
            return function (t: number) {
              const interpolateColor = d3.interpolateRgb(startColor, endColor);
              mov.select("rect").attr("fill", interpolateColor(t));
            };
          };

          mov
            .transition()
            .attr("transform", `translate(${moveDistance}, 0)`)
            .duration(2000)
            .delay(0)
            .tween("color", () => colorTween("steelblue", "orange"))

            .on("start", () => {
              mov.select("rect").attr("fill", "orange");
            })
            .on("end", async () => {
              mov
                .transition()
                .attr("transform", `translate(0, 0)`)
                .duration(0)
                .delay(0)
                .tween("color", () => colorTween("orange", "steelblue"));
              if (i === diffIndices.length - 1) {
                highlightBars(diffIndices);
              }
            });
        }
      }
    }
    if (
      !data.every((element, index) => element === newData[index]) &&
      newData.length >= 5 &&
      !isSorted(data)
    ) {
      if (diffIndices !== null) {
        highlightBars(diffIndices);
      }
    }else{
      staticChart();
    }
  }, [data, newData, messageId]);

  return (
    <div style={{ width: "200px", height: "150px" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default SelectionSort;
