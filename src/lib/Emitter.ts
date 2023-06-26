import type { Svg, Element } from "@svgdotjs/svg.js";

type EmitterOptions = {
    strokeWidth: number,
    duration: number,
    wait: number,
    delay: number,
    xTravel: number,
    yTravel: number,
    scale: number,
    maxObjects: number,
  }
  
  class Emitter {
    objects: Element[];
    options: EmitterOptions;
    svg: Svg;
    makeObject: (svg: Svg, options: Partial<EmitterOptions>) => any;
    calculateScale: (options: Partial<EmitterOptions>) => number;
    constructor(svg, makeObject, calculateScale, options: Partial<EmitterOptions>) {
      this.objects = [];
      this.options = {
        scale: 1,
        strokeWidth: 5,
        duration: 5000,
        wait: 0,
        delay: 0,
        xTravel: 500,
        maxObjects: 15,
        yTravel: 0, ...options
      
      };
      this.calculateScale = calculateScale;
      this.makeObject = makeObject;
      this.svg = svg;
    }
    emit() {
      if (this.objects.length > this.options.maxObjects) {
        //this.options.maxObjects < 10  && console.log( this.objects.length, this.objects )
       //return false;
      }
      const scale = this.calculateScale(this.options)
      const c = this.makeObject(this.svg, {...this.options, scale: scale})
      c.animate({ duration:  this.options.duration/scale,
        wait: this.options.wait, delay: this.options.delay}).dmove(this.options.xTravel/scale, this.options.yTravel/scale).ease('-').after(() => {this.options.maxObjects < 10 && console.log('remove mtn'), c.remove(); this.objects.pop()});
        this.objects.push(c)
    }
  }

  export {Emitter}