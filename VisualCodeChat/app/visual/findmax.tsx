import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import { Props } from "../components/visual_props";

// 这个组件需要用到的参数：data, maxid, compareidx, messageId

const FindMax: React.FC<Props> = ({ data, maxidx, compareidx, messageId }) => {
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
      .attr("id", "B" + messageId)
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
      //.call(d3.axisLeft(y).tickFormat(d3.format(".0f")))
      .call(
        d3
          .axisLeft(y)
          .ticks(d3.max(data) as number)
          .tickFormat(d3.format(".0f")),
      )
      //.call((g) => g.select(".domain").remove())
      .selectAll("text")
      .style("font-size", "20px"); // 设置y轴文本字体大小;

    // 排序动画函数
    async function chart() {
      // 找到两个数组中不同的位置
      //const diffIndex = findArrayDifference(data, newData);

      //const theSVG = document.querySelector(`#${messageId}`);

      if (maxidx !== null && compareidx !== null) {
        const target_svg = d3.select(`#${"B" + messageId}`);
        await sleep(1000);

        // if data[maxidx] >= data[compareidx]的情况
        let bar1 = target_svg.select(`.bar:nth-child(${maxidx + 1})`);
        let bar2 = target_svg.select(`.bar:nth-child(${compareidx + 1})`);

        if (data[maxidx] < data[compareidx]) {
          bar2 = target_svg.select(`.bar:nth-child(${maxidx + 1})`);
          bar1 = target_svg.select(`.bar:nth-child(${compareidx + 1})`);
        }

        // 渐变颜色函数
        const colorTween1 = (startColor: string, endColor: string) => {
          return function (t: number) {
            const interpolateColor = d3.interpolateRgb(startColor, endColor);
            bar1.select("rect").attr("fill", interpolateColor(t));
          };
        };
        const colorTween2 = (startColor: string, endColor: string) => {
          return function (t: number) {
            const interpolateColor = d3.interpolateRgb(startColor, endColor);
            bar2.select("rect").attr("fill", interpolateColor(t));
          };
        };
        // 比较
        bar1
          .transition()
          .duration(300)
          .delay(0)
          .tween("color", () => colorTween1("steelblue", "orange"))
          .transition()
          .duration(300)
          .delay(0)
          .tween("color", () => colorTween1("orange", "steelblue"))
          .transition()
          .duration(300)
          .delay(0)
          .tween("color", () => colorTween1("steelblue", "orange"))
          .transition()
          .duration(300)
          .delay(0)
          .tween("color", () => colorTween1("orange", "steelblue"))
          .transition()
          .duration(300)
          .delay(0)
          .tween("color", () => colorTween1("steelblue", "orange"))
          .transition()
          .duration(300)
          .delay(0)
          .tween("color", () => colorTween1("orange", "steelblue"))
          .transition()
          .duration(500)
          .delay(100)
          .tween("color", () => colorTween1("steelblue", "green"))
          .transition()
          .delay(1000)
          .on("start", () => {
            bar1.select("rect").attr("fill", "steelblue");
          })
          .on("end", () => {
            chart();
          });

        // .on("start", () => {
        //   mov1.select("rect").attr("fill", "orange");
        // });

        bar2
          .transition()
          .duration(300)
          .delay(0)
          .tween("color", () => colorTween2("steelblue", "orange"))
          .transition()
          .duration(300)
          .delay(0)
          .tween("color", () => colorTween2("orange", "steelblue"))
          .transition()
          .duration(300)
          .delay(0)
          .tween("color", () => colorTween2("steelblue", "orange"))
          .transition()
          .duration(300)
          .delay(0)
          .tween("color", () => colorTween2("orange", "steelblue"))
          .transition()
          .duration(300)
          .delay(0)
          .tween("color", () => colorTween2("steelblue", "orange"))
          .transition()
          .duration(300)
          .delay(0)
          .tween("color", () => colorTween2("orange", "steelblue"));
        //   .on("start", () => {
        //     bar2.select("rect").attr("fill", "steelblue");
        //   })
        //   .on("end", () => {
        //     chart();
        //   });
      }
    }

    // 更新数据并触发排序动画
    // setTimeout(() => {
    //   bars
    //     .data(data)
    //     .select("rect")
    //     .transition()
    //     .attr("x", (_, idx) => x(idx.toString()) as number)
    //     .attr("y", (d) => y(d) as number)
    //     .attr("height", (d) => y(0) - (y(d) as number))
    //     .attr("width", x.bandwidth() as number)
    //     .on("end", () => {
    //       if (!data.every((element, index) => element === newData[index])) {
    //         console.log("olddata: ", data);
    //         console.log("newdata: ", newData);
    //         chart();
    //       }
    //     });
    //   //chart();
    // });
    chart();
  }, [data, maxidx, compareidx, messageId]);

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

export default FindMax;
