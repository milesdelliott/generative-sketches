import { SVG } from '@svgdotjs/svg.js';
import getSketch, { keys } from '../sketches';
const initialIndex = 0;

const nextIndex = (index) => (index + 2 > keys.length ? 0 : index + 1);
const prevIndex = (index) => (index - 1 < 0 ? keys.length : index - 1);

const init = () => {
  let index = initialIndex;

  const svg = SVG('.canvas');
  let generateSketch = getSketch(keys[index]);

  const regenerate = document.querySelector('.regenerate');
  const previous = document.querySelector('.previous');
  const next = document.querySelector('.next');

  previous.addEventListener('click', () => {
    svg.clear();
    index = prevIndex(index);
    generateSketch = getSketch(keys[index]);
    generateSketch(svg);
  });

  next.addEventListener('click', () => {
    svg.clear();
    index = nextIndex(index);
    generateSketch = getSketch(keys[index]);
    generateSketch(svg);
  });

  regenerate.addEventListener('click', () => {
    svg.clear();
    generateSketch(svg);
  });

  generateSketch(svg);
};

export default init;
