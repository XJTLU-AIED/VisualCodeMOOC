//change the certain number into another number
// 实际上是Bar的上下移动动效，一次只移动一个

// ChatNext: 找到生成chat对话的组件

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Props } from "../components/visual_props";
interface BarChartProps {
  data: number[];
  newData: number[];
  messageId: string;
}

const BarChart_changingAllNumber: React.FC<Props> = ({
  data,
  newData,
  messageId,
}) => {
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
      .style("font-size", "20px"); // 设置x轴文本字体大小;

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
      .style("font-size", "20px"); // 设置y轴文本字体大小;

    // 排序动画函数
    async function chart() {
      // 找到两个数组中不同的位置
      const diffIndex = findArrayDifference(data, newData);

      if (diffIndex !== null) {
        let selector = "A" + messageId;
        const lastsvg = d3.select(`#${selector}`);
        const mov1 = lastsvg.select(`.bar:nth-child(${diffIndex[0] + 1})`);
        // 渐变颜色函数
        const colorTween = (startColor: string, endColor: string) => {
          return function (t: number) {
            const interpolateColor = d3.interpolateRgb(startColor, endColor);
            mov1.select("rect").attr("fill", interpolateColor(t));
          };
        };
        const oldHeight = y(data[diffIndex[0]]) as number;
        const newBarY = y(newData[diffIndex[0]]) as number;
        const heightDiff = oldHeight - newBarY;

        // 移动
        mov1
          .transition()
          .duration(1000)
          .tween("color", () => colorTween("steelblue", "orange"))
          .select("rect")
          .attr("y", y(newData[diffIndex[0]]))
          .attr("height", function (d) {
            return +d3.select(this).attr("height") + heightDiff;
          })
          .on("end", () => {
            mov1
              .select("rect")
              .attr("y", y(data[diffIndex[0]]))
              .attr("height", function (d) {
                return +d3.select(this).attr("height") - heightDiff;
              });
            chart();
          });
      }
    }

    if (
      !data.every((element, index) => element === newData[index]) &&
      newData.length === 5
    ) {
      //如果新旧数组不相同，并且newData已经被赋新值，则触发排序动画
      console.log("进入BarChart动画");
      chart();
    }
  }, [data, newData, messageId]);

  // 找到两个数组中不同的位置
  function findArrayDifference(
    arr1: number[],
    arr2: number[],
  ): number[] | null {
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return [i, i + 1];
      }
    }
    return null;
  }

  return (
    <div style={{ width: "200px", height: "150px" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default BarChart_changingAllNumber;
