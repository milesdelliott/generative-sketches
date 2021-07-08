function generate(svg) {
    // 200 x 200
const { width, height } = svg.viewbox();
// how many stripes should we paint?
const numStripes = 10;
// stripe width === viewBox width / the amount of stripes we would like to paint
const stripeWidth = width / numStripes;
  // store some simple browser default colors in an array
  const colors = ["gray", "blue", "cyan", "teal", "purple", "orange"];

  for (let i = 0; i < width; i += stripeWidth) {
    // pick a number between 0 and 5 (the length of the colors array)
    const diceRoll = Math.floor(Math.random() * colors.length);
    const diceRollB = Math.floor(Math.random() * colors.length);
    // pick out the color from the array using diceRoll as the index
    const color = colors[diceRoll];
    const colorB = colors[diceRollB];

    // draw a colored stripe on the canvas based on the “dice roll”
    svg.rect(stripeWidth, height).x(i).y(0).fill(color).stroke("#fff");
    svg.rect(height, stripeWidth).x(0).y(i).fill(colorB).stroke("#fff").opacity('0.5');
  }
}

export default generate