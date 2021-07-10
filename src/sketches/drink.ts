import pipe from '../lib/pipe'
import random from '../lib/random'
import clamp from '../lib/clamp'
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
  newDrink.height = random(20, 100)
  newDrink.width = random(50, 100)
  newDrink.skew = Math.random()
  return newDrink
}

const getStem : DrinkProcess = ( drink : Drink ) => {
  if ( drink.height < 40 ) {
    const height = random(20, 100);
    return {...drink, slope: Math.random() > 0.6,
      stem: {
        width: random(2,3),
        baseSlope: random(5, clamp(0, 15)(height)),
        baseHeight: random(1, 3),
        baseWidthFactor: clamp(0.7, 1)(Math.random()),
        roundHeight: random(10, 20),
        height,
    }}
  }

  return {...drink, skew: clamp(0, 0.3)(drink.skew)}
}

const getRoundness : DrinkProcess = ( drink ) => {
  let x = Math.random()
  const y = Math.random()
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
    svg.path(makeStemPoints(drink)).fill(fill).stroke({...strokeOptions, width: 1})
  }
  const shapeFn = drink.slope ? makePointsSlope : makePoints;
  const maskShape = svg.path(makeMaskPoints(drink)).fill('white').stroke(strokeOptions);
  const mask = svg.mask().add(maskShape)
  svg.rect(200, 200).move(0, drink.position.y + drinkSpace).fill(fill).stroke(strokeOptions).maskWith(mask)
  svg.rect(7, 200).move(drink.position.x + drink.width/4, drink.position.y + drinkSpace).fill(stroke).stroke(strokeOptions).maskWith(mask)
  svg.rect(4, 200).move(drink.position.x + drink.width - 12, drink.position.y + drinkSpace).fill(stroke).stroke(strokeOptions).maskWith(mask)
  svg.path(makeMaskPoints(drink)).fill(fill).stroke(strokeOptions)
  svg.path(makePoints(drink)).fill(fill).stroke({...strokeOptions, width: 1});
  svg.path(makeHighlight(drink)).fill(fill).stroke(strokeOptions)
}

const makeHighlight = drink => {
  const commands = []
  const heightPortion = drink.height * drink.roundness.y > drink.height + drinkSpace ? drink.height + drinkSpace : drink.height * drink.roundness.y;
  const curveVal = drink.height - (heightPortion) - (drink.height * 0.05) - drinkSpace
  const highLightPath = path()
  highLightPath.move([drink.position.x + drink.width - 10, drink.position.y + drinkSpace / 2]);
  highLightPath.horizontal([-1 * (drink.width - 15)]);
  highLightPath.lineTo([0, curveVal + drinkSpace / 2]);
  highLightPath.quadratic([0, heightPortion, ((drink.width / 2)) * drink.roundness.x, heightPortion ]);
  commands.push(`M ${drink.position.x + drink.width - 10 } ${drink.position.y + drinkSpace / 2} `);
  commands.push(`h -${drink.width - 15} `);
  commands.push(`l 0 ${curveVal + drinkSpace / 2} `)
  commands.push(`q 0, ${heightPortion} ${((drink.width / 2)) * drink.roundness.x}, ${heightPortion} `)
  commands.push(`M ${drink.position.x + drink.width - 20} ${drink.position.y + drinkSpace / 2} `);
  commands.push(`l 0 ${curveVal + drinkSpace / 2} `)
  commands.push(`q 0, ${heightPortion} -${(drink.width / 50)}, ${heightPortion} `)
  const command = commands.join(' ');
  return command; 
}


const makeStemPoints = ( drink : Drink ) => {
  let commands = []
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
  commands.push(`M ${start.x - drink.stem.width} ${end.y}`)
  commands.push(`v ${drink.stem.height - (roundBase ? drink.stem.roundHeight : drink.stem.baseSlope)}`)
  if (roundBase) {
    commands.push(`q 0 ${drink.stem.roundHeight - 1} ${-1 * (((baseWidth / 2) - drink.stem.width))} ${drink.stem.roundHeight}`)
  } else {
    commands.push(`l ${-1 * ((baseWidth / 2) - drink.stem.width)} ${drink.stem.baseSlope - 1}`)
  }
  commands.push(`a ${-1 * (drink.stem.baseHeight/2)} ${drink.stem.baseHeight/2} 0 0 0 0 ${drink.stem.baseHeight}`)
  commands.push(`h ${baseWidth}`)
  commands.push(`a ${drink.stem.baseHeight/2} ${ -1 * drink.stem.baseHeight/2} 0 1 0 0 ${-1 * drink.stem.baseHeight}`)
  if (roundBase) {
    commands.push(`q ${ -1 * ((baseWidth / 2) - drink.stem.width)} -1 ${-1 * ((baseWidth / 2) - drink.stem.width)} ${-1 * drink.stem.roundHeight}`)
  } else {
    commands.push(`l ${-1 * ((baseWidth / 2) - drink.stem.width)} ${-1 * (drink.stem.baseSlope - 1)}`)
  }
  commands.push(`v ${ -1 * (drink.stem.height - (roundBase ? drink.stem.roundHeight : drink.stem.baseSlope))}`)
 // svg.line(start.x + 2, start.y, end.x + 2, end.y ).fill(fill).stroke(strokeOptions);
   // svg.line(start.x - 2, start.y, end.x - 2, end.y ).fill(fill).stroke(strokeOptions);
   // svg.line(start.x - (drink.width / 2), start.y, start.x + ((drink.width / 2)), start.y ).fill(fill).stroke(strokeOptions);

    const command = commands.join(' ');
    return command;
}

const makePoints = (drink) => {
  let path = [];
  const skewVal = 0//(drink.skew * ( drink.width / 2 ) - (drink.stem ? drink.stem.width / 2 : 2))
  const heightPortion = drink.height * drink.roundness.y;
  path.push(`M ${drink.position.x} ${drink.position.y} `);
  path.push(`l ${skewVal} ${ drink.height - (heightPortion)} `)
  path.push(`q 0, ${heightPortion} ${((drink.width / 2) + skewVal) * drink.roundness.x}, ${heightPortion} `)
  path.push(`l ${drink.width - (drink.width * drink.roundness.x) - (skewVal * 2)} 0 `)
  path.push(`q ${((drink.width / 2) + skewVal) * drink.roundness.x}, 0 ${((drink.width / 2) + skewVal) * drink.roundness.x}, ${-1 * heightPortion} `)
  path.push(`l ${skewVal} ${-1 * (drink.height - (heightPortion))} `)
  path.push('z');
  const command = path.join('')
  //console.log(command, path)
  return command;
}

const makeMaskPoints = (drink) => {
  
  let path = [];
  const skewVal = 0//(drink.skew * ( drink.width / 2 ) - (drink.stem ? drink.stem.width / 2 : 2))
  const heightPortion = drink.height * drink.roundness.y > drink.height + drinkSpace ? drink.height + drinkSpace : drink.height * drink.roundness.y;
  const curveVal = drink.height - (heightPortion) - (drink.height * 0.1) - drinkSpace
  path.push(`M ${drink.position.x + 2} ${drink.position.y + drinkSpace} `);
  path.push(`l ${skewVal} ${curveVal} `)
  path.push(`q 0, ${heightPortion} ${((drink.width / 2) + skewVal) * drink.roundness.x}, ${heightPortion} `)
  path.push(`l ${drink.width - (drink.width * drink.roundness.x) - (skewVal * 2) - 4} 0 `)
  path.push(`q ${((drink.width / 2) + skewVal) * drink.roundness.x}, 0 ${((drink.width / 2) + skewVal) * drink.roundness.x}, ${-1 * (heightPortion)} `)
  path.push(`l ${skewVal} ${-1 * (drink.height - (heightPortion) - (drink.height * 0.1) - drinkSpace)} `)
  path.push('z');
  const command = path.join('')
  //console.log(command, path)
  return command;
}

const makePointsSlope = (drink) => {
  let path = [];
  const skewVal = 0//(drink.skew * ( drink.width / 2 ) - (drink.stem ? drink.stem.width / 2 : 2))
  const heightPortion = drink.height * drink.roundness.y;
  path.push(`M ${drink.position.x} ${drink.position.y} `);
  path.push(`l ${(drink.width/2) - (drink.stem.width)} ${ drink.height} `)
  path.push(`h ${ drink.stem.width * 2} `)
  path.push(`l ${(drink.width/2) - (drink.stem.width)} ${ -drink.height } `)
  path.push('z');
  const command = path.join('')
  //console.log(command, path)
  return command;
}

function generate(svg) {
    // 200 x 200
const { width, height } = svg.viewbox();


const getDrink = pipe(getArea, getStem, getPosition, getRoundness)


renderDrink(getDrink({viewBox: {width, height}}), svg)
}

export default generate