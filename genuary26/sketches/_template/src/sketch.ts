import type p5 from "p5";

export function sketch(p: p5) {
  let paused = false;
  let backgroundColor = 0;

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
    backgroundColor = 0;
    paused = false;
  };

  const randomizeColor = () => {
    backgroundColor = p.random(255);
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
    p.clear();
    p.background(backgroundColor);

    if (!paused) {
      // Animation code goes here
    }
  };

  // Return control functions that React can call
  return {
    restart,
    randomizeColor,
  };
}
