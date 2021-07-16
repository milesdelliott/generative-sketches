import pipe from '../lib/pipe'
import random from '../lib/random'
import clamp from '../lib/clamp'
import maybe from '../lib/maybe'
import path from '../lib/path'
const drinkSpace = 8;
type Drink = {
  height?: number,
  width?: number,
  skew?: number,
  slope?: boolean,
  stem?: {
    width: number,
    baseSlope: number,
    baseHeight: number,
    roundHeight: number,
    height: number,
    baseWidthFactor: number,
  },
  position?: {
    x: number,
    y: number,
  },
  roundness?: {
    x: number,
    y: number,
  },
  viewBox?: {
    height: number,
    width: number,
  },

}

type DrinkProcess = (drink : Drink) => Drink

const getArea : DrinkProcess = (drink : Drink) => {
  const newDrink = {...drink}
  newDrink.height = random(20, 150)
  newDrink.width = random(50, 100)
  newDrink.skew = Math.random()
  return newDrink
}

const getStem : DrinkProcess = ( drink : Drink ) => {
  if ( drink.height < 40 ) {
    const height = random(20, 100);
    const stem = {
        width: random(2,3),
        baseSlope: random(5, clamp(0, 15)(height)),
        baseHeight: random(1, 3),
        baseWidthFactor: clamp(0.7, 1)(Math.random()),
        roundHeight: random(10, 20),
        height,
    }
    return {...drink, slope: Math.random() > 0.6,
      stem}
  }

  return {...drink, skew: clamp(0, 0.3)(drink.skew)}
}

const getRoundness : DrinkProcess = ( drink ) => {
  let x = Math.random()
  const y = clamp(0, 0.6)(Math.random())
  if (! drink.stem ) {
    x = x > 0.4 ? 0.4 : x
  }
  return {...drink, roundness: {
    x,
    y,
  }}
}

const getPosition : DrinkProcess = ( drink : Drink ) => {
  const x = ( drink.viewBox.width / 2 ) - ( drink.width / 2 )
  const y = drink.viewBox.height - drink.height - 10 - (drink.stem ? drink.stem.height : 0)
  return {...drink, position: {
    x,
    y,
  }}
}

const renderDrink = (drink : Drink, svg) => {
  const fill = "transparent"
  const stroke = "#ec1304"
  const strokeOptions = {
    color: stroke,
    width: 0.25,
  }
  if (drink.stem) {
    const stemMaskShape = svg.path(makeStemPoints(drink)).fill('white').stroke(strokeOptions);
    const stemMask = svg.mask().add(stemMaskShape)
    svg.path(makeStemPoints(drink)).fill(fill).stroke({...strokeOptions, width: 0.5})
    svg.path(makeStemHighlight(drink)).fill(fill).stroke(strokeOptions).maskWith(stemMask)
    svg.rect((drink.width * drink.stem.baseWidthFactor)/2 + 2, drink.stem.height).move((drink.position.x + drink.width/2 + 0.5), drink.position.y + drink.height).fill(`${stroke}33`).maskWith(stemMask)
    svg.rect(drink.stem.width, random(3, (drink.stem.height > 6) ? (drink.stem.height / 2) : 4)).move(drink.position.x + (drink.width / 2) - (drink.stem.width), drink.position.y + drink.height ).fill(`${stroke}aa`).maskWith(stemMask)
    svg.rect(drink.stem.width, random(2, 4)).move(drink.position.x + (drink.width / 2), drink.position.y + drink.height ).fill(`${stroke}aa`).maskWith(stemMask)
  }
  const shapeFn = drink.slope ? makePointsSlope : makePoints;
  const outerMaskShape = svg.path(makePoints(drink)).fill('white').stroke({...strokeOptions, width: 0.5});
  const innerMaskShape = svg.path(makeMaskPoints(drink)).fill('white').stroke(strokeOptions);
  const innerMask = svg.mask().add(innerMaskShape)
  const outerMask = svg.mask().add(outerMaskShape)
  svg.rect(200, drink.height).move(0, drink.position.y + drinkSpace).fill(fill).stroke(strokeOptions).maskWith(innerMask)
  svg.rect(random(3, 15), drink.height).move(drink.position.x + drink.width/4, drink.position.y + drinkSpace).fill(stroke).stroke(strokeOptions).maskWith(innerMask)
  svg.rect(random(3, 40), drink.height).move(drink.position.x + 2, drink.position.y).fill(`${stroke}11`).maskWith(outerMask)
  svg.rect(random(4, 30), drink.height).move(drink.position.x + drink.width - 12, drink.position.y + drinkSpace).fill(`${stroke}33`).maskWith(innerMask)
  svg.rect(random(4, 30), drink.height).move(drink.position.x + drink.width - 22, drink.position.y + drinkSpace).fill(`${stroke}33`).maskWith(outerMask)
  svg.rect(random(2, 6), drink.height).move(drink.position.x + drink.width - 12, drink.position.y + drinkSpace).fill(stroke).maskWith(innerMask)
  svg.rect(random(2, 20), drink.height).move(drink.position.x + 1, drink.position.y + drinkSpace).fill(`${stroke}11`).maskWith(innerMask)
  maybe(70) && svg.rect(drink.width/2, 1).move(drink.position.x + 2, drink.position.y + drinkSpace / 4).fill(`${stroke}ee`).maskWith(outerMask)
  maybe(70) && svg.rect(drink.width/2, drink.height).move(drink.position.x + drink.width/2, drink.position.y).fill(`${stroke}22`).maskWith(outerMask)
  svg.rect(drink.width/2 * 0.7, random(1,3)).move(drink.position.x + 1, drink.position.y + drink.height - 4).fill(`${stroke}66`).maskWith(outerMask)
  svg.path(makeMaskPoints(drink)).fill(`${stroke}11`).stroke(strokeOptions)
  svg.path(makePoints(drink)).fill(fill).stroke({...strokeOptions, width: 0.5});
  svg.path(makeHighlight(drink)).fill(fill).stroke(strokeOptions)
  if (drink.height > 60 && maybe(40)) {
    svg.path(makeDetail(drink)).fill(fill).stroke(strokeOptions).maskWith(outerMask)
  }
  maybe(70) && svg.rect(random(2, 4), drink.height).move(drink.position.x + random(0, drink.width), drink.position.y).fill(`#ffffff99`).maskWith(innerMask)
  maybe(80) && svg.rect(random(1, 4), drink.height).move(drink.position.x + drink.width - random(0, drink.width/2), drink.position.y).fill(`#ffffffee`).maskWith(innerMask)
}

const makeStemHighlight = drink => {
  const start = {
    x: drink.viewBox.width / 2,
    y: drink.viewBox.height - 10,
  }
  const end = {
    x: start.x,
    y: start.y - drink.stem.height,
  }
  const roundBase = drink.roundness.x + drink.roundness.y > 0.5
  const baseWidth = drink.width * drink.stem.baseWidthFactor;
  const stemHighlight = path();
  stemHighlight.move([start.x - drink.stem.width + 2, end.y], true)
  stemHighlight.vertical([drink.stem.height - (roundBase ? drink.stem.roundHeight : drink.stem.baseSlope) + 2])
  if (roundBase) {

    stemHighlight.quadratic([0, drink.stem.roundHeight - 1, -1 * (((baseWidth / 2) - drink.stem.width)) - 1, drink.stem.roundHeight])
  } else {
    stemHighlight.lineTo([-1 * ((baseWidth / 2) - drink.stem.width - 3), (drink.stem.baseSlope - 3)])
  }
  return stemHighlight.render();
}

const makeDetail = (drink) => {
  const detailPath = path();
  const arcSizes = [5, 9, 10, 9, 5]
  const baseArc = drink.width/(arcSizes.length + 3)
  const total = arcSizes.reduce((s, c) => s + c, 0);
  const proportion = arcSizes.map(v => v/total)
  detailPath.move([drink.position.x, drink.position.y + baseArc + 25], true)
  proportion.map((width) => {
    detailPath.arc([(drink.width/2) * width/2, baseArc, 0, 0, 1, drink.width * width, 0])
  })
  proportion.reduce((last, width) => {
    detailPath.move([drink.position.x + (drink.width * (width + last)), drink.position.y + baseArc + 25], true)
    detailPath.vertical([10]);
    return width + last
  }, 0)
  return detailPath.render();
}

const makeHighlight = drink => {
  const heightPortion = drink.height * drink.roundness.y > drink.height + drinkSpace ? drink.height + drinkSpace : drink.height * drink.roundness.y;
  const curveVal = drink.height - (heightPortion) - (drink.height * 0.05) - drinkSpace
  const highLightPath = path()
  
  highLightPath.move([drink.position.x + 7, drink.position.y + drinkSpace / 2], true);
  highLightPath.lineTo([0, curveVal + drinkSpace / 2]);
  highLightPath.quadratic([0, heightPortion, ((drink.width / 2)) * drink.roundness.x, heightPortion ]);
  if (maybe(80)) {

    highLightPath.move([drink.position.x + drink.width - 20, drink.position.y + drinkSpace / 2], true)
    highLightPath.lineTo([0, curveVal + drinkSpace / 2])
    highLightPath.quadratic([0, heightPortion, -1 * (drink.width / 50), heightPortion])
  }
  highLightPath.move([drink.position.x + drink.width - 2, drink.position.y + drinkSpace / 2], true);
  highLightPath.horizontal([-1 * (drink.width - 4)]);
  const command = highLightPath.render();
  return command; 
}

const makeStemPoints = ( drink : Drink ) => {
  const stemPoints = path();
  const start = {
    x: drink.viewBox.width / 2,
    y: drink.viewBox.height - 10,
  }
  const end = {
    x: start.x,
    y: start.y - drink.stem.height,
  }
  const roundBase = drink.roundness.x + drink.roundness.y > 0.5
  const baseWidth = drink.width * drink.stem.baseWidthFactor;
  stemPoints.move([start.x - drink.stem.width, end.y], true)
  stemPoints.vertical([drink.stem.height - (roundBase ? drink.stem.roundHeight : drink.stem.baseSlope)])
  if (roundBase) {
    stemPoints.quadratic([0, drink.stem.roundHeight - 1, -1 * (((baseWidth / 2) - drink.stem.width)), drink.stem.roundHeight])
  } else {
    stemPoints.lineTo([-1 * ((baseWidth / 2) - drink.stem.width), drink.stem.baseSlope - 1])
  }
  stemPoints.arc([-1 * (drink.stem.baseHeight/2), drink.stem.baseHeight/2, 0, 0, 0, 0, drink.stem.baseHeight])
  stemPoints.horizontal([baseWidth])
  stemPoints.arc([(drink.stem.baseHeight/2), -1 * drink.stem.baseHeight/2, 0, 1, 0, 0, -1 * drink.stem.baseHeight])
  if (roundBase) {
    stemPoints.quadratic([-1 * ((baseWidth / 2) - drink.stem.width), -1, -1 * ((baseWidth / 2) - drink.stem.width), -1 * drink.stem.roundHeight])
  } else {
    stemPoints.lineTo([-1 * ((baseWidth / 2) - drink.stem.width), -1 * (drink.stem.baseSlope - 1)])
  }
  stemPoints.vertical([-1 * (drink.stem.height - (roundBase ? drink.stem.roundHeight : drink.stem.baseSlope))])
    return stemPoints.render();
}

const makePoints = (drink) => {
  const skewVal = 0//(drink.skew * ( drink.width / 2 ) - (drink.stem ? drink.stem.width / 2 : 2))
  const heightPortion = drink.height * drink.roundness.y;
  const outlinePath = path();
  outlinePath.move([drink.position.x, drink.position.y], true)
  outlinePath.lineTo([0, drink.height- heightPortion])
  outlinePath.quadratic([0, heightPortion, ((drink.width / 2) + skewVal) * drink.roundness.x, heightPortion])
  outlinePath.lineTo([drink.width - (drink.width * drink.roundness.x) - (skewVal * 2), 0])
  outlinePath.quadratic([((drink.width / 2) + skewVal) * drink.roundness.x, 0, ((drink.width / 2) + skewVal) * drink.roundness.x, -1 * heightPortion ])
  outlinePath.lineTo([0, -1 * (drink.height - (heightPortion))])
  outlinePath.close()
  const command = outlinePath.render()
  return command;
}

const makeMaskPoints = (drink) => {
  
  const skewVal = 0//(drink.skew * ( drink.width / 2 ) - (drink.stem ? drink.stem.width / 2 : 2))
  const heightPortion = drink.height * drink.roundness.y > drink.height + drinkSpace ? drink.height + drinkSpace : drink.height * drink.roundness.y;
  const curveVal = drink.height - (heightPortion) - (drink.height * 0.1) - drinkSpace
  const maskPath = path();
  maskPath.move([drink.position.x + 2, drink.position.y + drinkSpace], true)
  maskPath.lineTo([skewVal, curveVal])
  maskPath.quadratic([0, heightPortion, ((drink.width / 2) + skewVal) * drink.roundness.x, heightPortion])
  maskPath.lineTo([drink.width - (drink.width * drink.roundness.x) - (skewVal * 2) - 4, 0])
  maskPath.quadratic([((drink.width / 2) + skewVal) * drink.roundness.x, 0, ((drink.width / 2) + skewVal) * drink.roundness.x, -1 * (heightPortion)])
  maskPath.lineTo([skewVal, -1 * (drink.height - (heightPortion) - (drink.height * 0.1) - drinkSpace)])
  maskPath.close();
  const command = maskPath.render();
  return command;
}

const makePointsSlope = (drink) => {
 const slopePath = path();
  slopePath.move([drink.position.x, drink.position.y], true)
  slopePath.lineTo([(drink.width/2) - (drink.stem.width), drink.height])
  slopePath.horizontal([drink.stem.width * 2])
  slopePath.lineTo([(drink.width/2) - (drink.stem.width), -drink.height])
  slopePath.close()
  return slopePath.render();
}

function generate(svg) {
    // 200 x 200
const { width, height } = svg.viewbox();


const getDrink = pipe(getArea, getStem, getPosition, getRoundness)


renderDrink(getDrink({viewBox: {width, height}}), svg)
}

export default generate