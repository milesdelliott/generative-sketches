import maybe from "../lib/maybe";
import random from "../lib/random";
import { Emitter } from "../lib/Emitter";
const yPos = 110;
function generate(svg) {
    // 200 x 200
const { width, height } = svg.viewbox();
  svg.rect(width, height).fill('#000');
  const clip = svg.clip().add(svg.rect(200, yPos))
  const sun = svg.circle(100).fill('red').move(50, 50).clipWith(clip);
  const sunClipCircle = svg.circle(100).fill('red').move(50, 50).clipWith(clip);
  const sunClip = svg.clip().add(sunClipCircle);
  const mountainScale = () => 1
  const mountainEmitter = new Emitter(svg, (svg, options) => {
    console.log('emit mtn')
    const points = pointsToMountain(0, 112);
    return svg.polygon(points).fill('#750000').clipWith(sunClip)
  }, mountainScale, {strokeWidth: 5, maxObjects: 5, duration: 20000, wait: 10, delay: 0, xTravel: 360, yTravel: 0})
  setInterval( () => mountainEmitter.emit(), 500)
  const cactiScale = () => random(3, 15)/10
  const cactiEmitter = new Emitter(svg, makeCactus, cactiScale, {strokeWidth: 5, duration: 5000, wait: 0, delay: 0, xTravel: 400, yTravel: 0})
  setInterval( () => cactiEmitter.emit(), 200)
  
}

let draws = 0;
const drawMountain = (points : Array<number[]>) => {
  const [x, y] = points[points.length - 1] ? points[points.length - 1] : [0, 0];
  let rise = maybe(50);
  if (y < 0) {
    rise = false
  }
  if (y > 20) {
    rise = true
  }
  points.push([x + 1, rise ? y - 1 : y + 1])
  draws++
  if (draws > 50) {
    return points
  }
  return drawMountain(points);
}

const pointsToMountain = (xOffset = 0, yOffset = 0) => {
  
  let points = drawMountain([])
  
  return [...points, [points.length + (points[points.length - 1][1]), 0]].map(([x, y]) => {
    return [(2 * x + xOffset), (yOffset - (2 * y) )
    ]});
}

type CactusArgs = {
  strokeWidth?: number,
  scale?: number,
  translateY?: number
}



const makeCactus = (svg, {strokeWidth = 5, scale = 1, translateY = 0}: CactusArgs) => {
  const cactusTrunk = svg.path(`M 00, ${yPos} v -15`).stroke({ width: strokeWidth, color: '#000', linecap: 'round' })
  const cactusArmA = svg.path(`M 00, ${yPos - 8} q 7 0 7 -6`).fill('none').stroke({ width: strokeWidth - 1, color: '#000', linecap: 'round' })
  const cactus = svg.group();
  if(maybe(59)) {
    const cactusArmB = svg.path(`M 00, ${yPos - 4} q -7 0 -7 -6`).fill('none').stroke({ width: strokeWidth - 1, color: '#000', linecap: 'round' })
    cactus.add(cactusArmB);
  }
  cactus.add(cactusArmA);
  cactus.add(cactusTrunk);
  return cactus.transform({scale, translateY, origin: "center bottom"})
}

export default generate