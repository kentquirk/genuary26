import type p5 from 'p5';

let triangles : triangle[] = [];
let triangleColor: p5.Color | undefined; // Initialize as undefined until p5 is ready

class triangle {
  x: number;
  y: number;
  radius: number;
  angle: number;
  colored: boolean;

  constructor(x: number, y: number, radius: number, angle: number, colored: boolean) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.angle = angle;
    this.colored = colored;
  }

  draw(p: p5) {
    p.push();
    p.translate(this.x, this.y);
    const col = triangleColor || p.color(0, 255, 0); // Use default color if undefined
    if (this.colored) {
      p.fill(col);
      p.stroke(0);
    } else {
      p.fill(0);
      p.stroke(col);
    }
    // draw an equilateral triangle
    p.triangle(
      this.radius * p.cos(this.angle),
      this.radius * p.sin(this.angle),
      this.radius * p.cos(this.angle + (2 * p.PI) / 3),
      this.radius * p.sin(this.angle + (2 * p.PI) / 3),
      this.radius * p.cos(this.angle + (4 * p.PI) / 3),
      this.radius * p.sin(this.angle + (4 * p.PI) / 3)
    );
    p.pop();
  }
}


export function sketch(p: p5, maxDepth: number = 6, levelCountMultiplier: number = 3, levelSizeMultiplier: number = 0.4) {
  let paused = false;

  const getCanvasSize = () => {
    // Get the parent container element
    const container = document.getElementById('sketch-holder');
    if (!container) {
      return p.windowWidth;
    }

    // Get container width
    const containerWidth = container.clientWidth;

    // Calculate available height by finding how much space is left below the container
    const containerRect = container.getBoundingClientRect();
    const distanceFromTop = containerRect.top;
    const bottomPadding = 20; // Small padding at the bottom
    const availableHeight = p.windowHeight - distanceFromTop - bottomPadding;

    // Canvas should be square, using the smaller of width or available height
    return Math.min(containerWidth, availableHeight);
  };

  const restart = () => {
    // Reset sketch state here
    triangleColor = p.color(255, 0, 0); // Initialize with a default color
    triangles = [];
    paused = false;
    let levelCount = 1;
    let levelSize = p.width * .8;
    let colored = true;
    for (let depth = 0; depth < maxDepth; depth++) {
      for (let i = 0; i < levelCount; i++) {
        const angle = p.random(0, p.TWO_PI);
        const x = p.random(levelSize, p.width - levelSize);
        const y = p.random(levelSize, p.height - levelSize);
        triangles.push(new triangle(x, y, levelSize, angle, colored));
      }
      levelCount *= levelCountMultiplier;
      levelSize *= levelSizeMultiplier;
      colored = !colored;
    }
  };

  const randomizeColor = () => {
    triangleColor = p.color(p.random(255), p.random(255), p.random(255));
  };

  const saveImage = () => {
    p.save('oneshape.jpg');
  };

  p.windowResized = () => {
    const size = getCanvasSize();
    p.resizeCanvas(size, size);
    restart();
  };

  p.keyTyped = () => {
    switch (p.key) {
      case ' ':
        paused = !paused;
        return false; // Prevent default browser behavior
      case 'r':
        restart();
        return false;
    }
  };

  p.setup = () => {
    p.colorMode(p.RGB, 255);
    const size = getCanvasSize();
    p.createCanvas(size, size);
    restart();
  };

  p.draw = () => {
    p.clear();
    p.background(0);

    if (!paused) {
      // Animation code goes here
    }
    for (const tri of triangles) {
      tri.draw(p);
    }
  };

  // Return control functions that React can call
  return {
    restart,
    randomizeColor,
    saveImage,
  };
}
