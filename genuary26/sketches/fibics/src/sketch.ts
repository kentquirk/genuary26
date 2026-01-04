import type p5 from "p5";

enum Direction {
  Up = 1,
  Down,
  Left,
  Right,
}

function turnDirection(current: Direction): Direction {
  switch (current) {
    case Direction.Up:
      return Direction.Right;
    case Direction.Right:
      return Direction.Down;
    case Direction.Down:
      return Direction.Left;
    case Direction.Left:
      return Direction.Up;
  }
}

// draw a rectangle in the given direction at the given position, split up into n slices along its length
// because length/n may not be an integer, we divide to find the starting point of each slice and then
// round to the nearest integer for drawing
function drawSegmentedRectangle(
  x: number,
  y: number,
  w: number,
  h: number,
  n: number,
  dir: Direction,
  p: p5
) {
  // p.rect(x, y, w, h); // draw the full rectangle first
  // return;
  // n = 1;
  const segmentLength =
    dir === Direction.Up || dir === Direction.Down ? h / n : w / n;
  for (let i = 0; i < n; i++) {
    switch (dir) {
      case Direction.Up:
        p.rect(x, y + i * segmentLength, w, segmentLength);
        break;
      case Direction.Right:
        p.rect(x + i * segmentLength, y, segmentLength, h);
        break;
      case Direction.Down:
        p.rect(x, y + i * segmentLength, w, segmentLength);
        break;
      case Direction.Left:
        p.rect(x + i * segmentLength, y, segmentLength, h);
        break;
    }
  }
}

export function sketch(p: p5) {
  let paused = false;
  let backgroundColor = p.color(p.random(255), p.random(255), p.random(255));
  const ncolors = 5;
  const colors: p5.Color[] = [];
  for (let i = 0; i < ncolors; i++) {
    colors.push(p.color(p.random(255), p.random(255), p.random(255)));
  }

  const getShade = (dark: boolean): boolean[] => {
    return dark
      ? p.random([
          [false, false, false],
          [true, false, false],
          [false, true, false],
          [false, false, true],
        ])
      : p.random([
          [true, true, true],
          [true, true, false],
          [true, false, true],
          [false, true, true],
        ]);
  };

  const getRandomColor = (dark: boolean): p5.Color => {
    const shade = getShade(dark);
    if (dark) {
      return p.color(
        shade[0] ? p.random(80, 150) : p.random(64),
        shade[1] ? p.random(80, 150) : p.random(64),
        shade[2] ? p.random(80, 150) : p.random(64)
      );
    } else {
      return p.color(
        shade[0] ? p.random(128, 255) : p.random(50, 200),
        shade[1] ? p.random(128, 255) : p.random(50, 200),
        shade[2] ? p.random(128, 255) : p.random(50, 200)
      );
    }
  };

  const getCanvasSize = () => {
    // Get the parent container element
    const container = document.getElementById("sketch-holder");
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
    backgroundColor = p.color(p.random(255), p.random(255), p.random(255));
    paused = false;
    randomizeColor();
  };

  const randomizeColor = () => {
    const dark = p.random([true, false]);
    backgroundColor = getRandomColor(dark);
    colors.length = 0;
    for (let i = 0; i < ncolors; i++) {
      colors.push(getRandomColor(!dark));
    }
  };

  const saveImage = () => {
    p.saveCanvas("fibics", "png");
  };

  p.windowResized = () => {
    const size = getCanvasSize();
    p.resizeCanvas(size, size);
    restart();
  };

  p.keyTyped = () => {
    switch (p.key) {
      case " ":
        paused = !paused;
        return false; // Prevent default browser behavior
      case "r":
        restart();
        return false;
    }
  };

  p.setup = () => {
    const size = getCanvasSize();
    p.createCanvas(size, size);
    restart();
  };

  p.draw = () => {
    const thickness = p.width / 15;
    const turns = 25;
    let length = p.width / 10;
    let fib1 = 0;
    let fib2 = 1;
    let fib = 1;

    p.clear();
    p.background(backgroundColor);
    const centerx = p.width / 2;
    const centery = p.height / 2;

    p.rectMode(p.CORNER);
    if (!paused) {
      p.stroke(backgroundColor);
      let dir: Direction = Direction.Right;
      let x = centerx - thickness / 2;
      let y = centery;
      for (let i = 0; i < turns; i++) {
        p.fill(colors[i % ncolors]);
        switch (dir) {
          case Direction.Up:
            drawSegmentedRectangle(
              x,
              y - length,
              thickness,
              length,
              fib,
              dir,
              p
            );
            y -= length;
            break;
          case Direction.Right:
            drawSegmentedRectangle(
              x,
              y - thickness,
              length,
              thickness,
              fib,
              dir,
              p
            );
            x += length;
            break;
          case Direction.Down:
            drawSegmentedRectangle(
              x,
              y - thickness,
              thickness,
              length,
              fib,
              dir,
              p
            );
            y += length - thickness;
            break;
          case Direction.Left:
            drawSegmentedRectangle(
              x - length + thickness,
              y,
              length,
              thickness,
              fib,
              dir,
              p
            );
            x -= length;
            y += thickness;
            break;
        }
        dir = turnDirection(dir);
        length += (thickness * 2) / 3;
        const newFib = fib1 + fib2;
        fib1 = fib2;
        fib2 = newFib;
        fib = newFib;

        if (newFib > length) {
          break;
        }
      }
    }
  };

  // Return control functions that React can call
  return {
    restart,
    randomizeColor,
    saveImage,
  };
}
