import stripes from './stripes';
import tripes from './tripes';
import blocky from './blocky';
import drink from './drink';
import sunset from './sunset';

const sketches = {sunset, drink, stripes, tripes, blocky,  }

export const keys = Object.keys(sketches)

export default (slug) => {
    return sketches[slug]
}

