import pipe from '../lib/pipe'
import random from '../lib/random'
import clamp from '../lib/clamp'

type Drink = {
  height?: number,
  width?: number,
  skew?: number,
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
  newDrink.height = random(20, 40)
  newDrink.width = random(50, 100)
  newDrink.skew = Math.random()
  return newDrink
}

const getStem : DrinkProcess = ( drink : Drink ) => {
  if ( drink.height < 40 ) {
    const height = random(20, 100);
    return {...drink, stem: {
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
  const stroke = "#000"
  console.log('Render', drink, svg)
  if (drink.stem) {
    svg.path(makeStemPoints(drink)).fill(fill).stroke(stroke)
  }
  drawPath(drink, svg).fill(fill).stroke(stroke);
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
    commands.push(`q 0 ${drink.stem.roundHeight - 1} -${((baseWidth / 2) - drink.stem.width)} ${drink.stem.roundHeight}`)
  } else {
    commands.push(`l -${(baseWidth / 2) - drink.stem.width} ${drink.stem.baseSlope - 1}`)
  }
  commands.push(`a -${drink.stem.baseHeight/2} ${drink.stem.baseHeight/2} 0 0 0 0 ${drink.stem.baseHeight}`)
  commands.push(`h ${baseWidth}`)
  commands.push(`a ${drink.stem.baseHeight/2} -${drink.stem.baseHeight/2} 0 1 0 0 -${drink.stem.baseHeight}`)
  if (roundBase) {
    commands.push(`q -${((baseWidth / 2) - drink.stem.width)} -1 -${((baseWidth / 2) - drink.stem.width)} -${drink.stem.roundHeight}`)
  } else {
    commands.push(`l -${(baseWidth / 2) - drink.stem.width} -${drink.stem.baseSlope - 1}`)
  }
  commands.push(`v -${drink.stem.height - (roundBase ? drink.stem.roundHeight : drink.stem.baseSlope)}`)
 // svg.line(start.x + 2, start.y, end.x + 2, end.y ).fill(fill).stroke(stroke);
   // svg.line(start.x - 2, start.y, end.x - 2, end.y ).fill(fill).stroke(stroke);
   // svg.line(start.x - (drink.width / 2), start.y, start.x + ((drink.width / 2)), start.y ).fill(fill).stroke(stroke);

    const command = commands.join(' ');
  console.log(command)
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
  path.push(`q ${((drink.width / 2) + skewVal) * drink.roundness.x}, 0 ${((drink.width / 2) + skewVal) * drink.roundness.x}, -${heightPortion} `)
  path.push(`l ${skewVal} -${drink.height - (heightPortion)} `)
  path.push('z');
  const command = path.join('')
  //console.log(command, path)
  return command;
}

const drawPath = (drink, svg) => {
  return svg.path(makePoints(drink))
}

function generate(svg) {
    // 200 x 200
const { width, height } = svg.viewbox();


const getDrink = pipe(getArea, getStem, getPosition, getRoundness)


renderDrink(getDrink({viewBox: {width, height}}), svg)
}

export default generate