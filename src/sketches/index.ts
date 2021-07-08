import stripes from './stripes';
import tripes from './tripes';
import blocky from './blocky';
import drink from './drink';

const sketches = {drink, stripes, tripes, blocky }

export const keys = Object.keys(sketches)

export default (slug) => {
    return sketches[slug]
}

