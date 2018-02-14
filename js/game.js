import * as d3 from 'd3';
import * as MyMath from './math';

// Note: Becuase I add this script on top of the html file, so I need to make
// an event listener to wait for all content loaded before running the code.
// If you don't want to add event, then simple add the script at the end of the html file
const deltaT = 1;

let data = [12, 34, 100, 200, 400];
let queue = [];

document.addEventListener("DOMContentLoaded", () => {
  let svg = d3.select("svg")
    .attr("width",  window.innerWidth - 300)
    .attr("height", window.innerHeight);

  let rScale = d3.scaleLinear() // radius scale
    .domain([12, 400])
    .range([10, 100]); // width / number of data, divide 2 again cus this is radius scale

  let mScale = d3.scaleLinear() // mass scale
    .domain([12, 400])
    .range([1, 20]);

  //Create shield:
  svg.append("circle")
    .attr("cx", parseInt(svg.attr("width"))/2)
    .attr("cy", parseInt(svg.attr("height")) - 400)
    .attr("r", 50)
    .attr("id", "shield")
    .attr("fill", "red");

  //Create falling objects:
  let circle= svg.selectAll("circle")
    .data(data);
  circle.enter().append("circle")
    .attr("cx", parseInt(svg.attr("width"))/2 - 10)
    .attr("cy", (d) => rScale(d))
    .attr("r", d => (rScale(d)) )
    .attr("fill", "steelblue")
    .attr("fill-opacity", 0.5)
    .attr("class", "data-circle")
    .attr("m", (d) => mScale(d) )
    .attr("vx", 0) //initialize initial velocity:
    .attr("vy", 0);
  circle.exit().remove();
  //Physics constants:

  //Find HTML elements:
  const circles = document.getElementsByClassName("data-circle");
  const shield = document.getElementById('shield');
  //Game Loop:
  const interval = setInterval(() => {
    for (let i = 0; i < circles.length; i++) {
      let Fnet;
      let hasCollision = false;
      if (MyMath.detectCollision(circles[i], shield)) {
        Fnet = MyMath.getFnet(
          MyMath.getFg(circles[i]),
          MyMath.getFs(circles[i], shield)
        );
        hasCollision = true;
      } else {
        for (let j = i + 1; j < circles.length; j++) {
          if (MyMath.detectCollision(circles[i], circles[j])) {
            Fnet = MyMath.getFnet(
              MyMath.getFs(circles[i], circles[j]),
              MyMath.getFg(circles[i])
            );
            // MyMath.updatePos(circle[j], Fnet, deltaT);
            hasCollision = true;
            break;
          }
        }
      }
      if (!hasCollision) Fnet = MyMath.getFnet(MyMath.getFg(circles[i]));
      MyMath.updatePos(circles[i], Fnet, deltaT);

      if (isOutOfFrame(circles[i])) {
        circles[i].remove();
        // queue = queue.slice(1);
      }
    }
  }, deltaT);
});

function isOutOfFrame(htmlCircle) {
  const cx = parseInt(htmlCircle.getAttribute("cx"));
  const cy = parseInt(htmlCircle.getAttribute("cy"));
  const r = parseInt(htmlCircle.getAttribute("r"));
  const leftBound = 0;
  const rightBound = parseInt(d3.select("svg").attr("width"));
  const bottomBound = parseInt(d3.select("svg").attr("height"));

  return ((cx+r)<leftBound || (cx-r)>rightBound || (cy+r)>bottomBound);
}
// Momemtum = Mass * Velocity
// p = F * dt
// v = p/m = a * dt
// pos =
