type commandKey = 'M' | 'm' | 'L' | 'l' | 'H' | 'h' | 'V' | 'v' | 'C' | 'c' | 'S' | 's' | 'Q' | 'q' | 'T' | 't' | 'A' | 'a' | 'Z' | 'z'

type commandName = 'move' | 'lineTo' | 'horizontal' | 'vertical' | 'cubic' | 'smoothCubic' | 'quadratic' | 'smoothQuadratic' | 'arc' | 'close'

enum axis {y = 'y', x = 'x'}

type commandPair = {
    relative: commandKey,
    absolute: commandKey,
}

type point = {
    axis: axis,
    coordinate: number,
}

type commandObject = {
    commandName: commandName,
    absolute: boolean,
    points: point[]
}

const commandMap : Record<commandName, commandPair> = {
    move: {
        relative: 'm',
        absolute: 'M'
    },
    lineTo: {
        relative: 'l',
        absolute: 'L'
    },
    horizontal: {
        relative: 'h',
        absolute: 'H'
    },
    vertical: {
        relative: 'v',
        absolute: 'V'
    },
    cubic: {
        relative: 'c',
        absolute: 'C'
    },
    smoothCubic: {
        relative: 's',
        absolute: 'S'
    },
    quadratic: {
        relative: 'q',
        absolute: 'Q'
    },
    smoothQuadratic: {
        relative: 't',
        absolute: 'T'
    },
    arc: {
        relative: 'a',
        absolute: 'A'
    },
    close: {
        relative: 'z',
        absolute: 'Z'
    },
}

const getAxis = (command : commandName , index : number) => {
    if ( 'vertical' === command ) {
        return 'y'
    }
    if ( 'horizontal' === command ) {
        return 'x'
    }
    return index % 2 === 0 ? 'x' : 'y';
}

const renderCommand = (command : commandObject) => `${commandMap[command.commandName][command.absolute ? 'absolute' : 'relative']} ${command.points.map(p => p.coordinate).join(' ')}`

const shiftPoint = (point : point, shiftValue : number) => ({...point, coordinate: Math.round(point.coordinate + shiftValue)})

const shiftPoints = (points : point[], xShift: number, yShift: number) => points.map((point) => shiftPoint(point, point.axis === 'x' ? xShift : yShift ))


const path = () => {
    let commands : commandObject[] = []

    const render = () => commands.reduce((output, current) => `${output} ${renderCommand(current)}`, '')
    const push = (command : commandObject) => {
        commands = [...commands, command]
        return commands
    }
    const shift = (x, y) => {
        commands = commands.map((command : commandObject) => ({...command, points: shiftPoints(command.points, x, y)}))
        return commands
    }
    const get = () => commands

    const addCommand = (command : commandName) => (points = [], absolute = false) => push({commandName: command, absolute, points: points.map((p, i) => ({coordinate: p, axis: getAxis(command, i)})) })

   const move = addCommand('move');
const lineTo = addCommand('lineTo');
const horizontal = addCommand('horizontal');
const vertical = addCommand('vertical');
const cubic = addCommand('cubic');
const smoothCubic = addCommand('smoothCubic');
const quadratic = addCommand('quadratic');
const smoothQuadratic = addCommand('smoothQuadratic');
const arc = addCommand('arc');
const close = addCommand('close');

    return {
        render,
        push,
        shift,
        get,
        move,
        lineTo,
        horizontal,
        vertical,
        cubic,
        smoothCubic,
        quadratic,
        smoothQuadratic,
        arc,
        close,
    }
}

export default path