import type p5 from "p5";

const genuary = `
******  ******  *     *  *     *     *     *****   *     *
*       *       **    *  *     *    * *    *    *   *   *
*       *       * *   *  *     *   *   *   *    *    * *
*  ***  ****    *  *  *  *     *  *** ***  * ***      *
*    *  *       *   * *  *     *  *     *  *  *       *
*    *  *       *    **  *     *  *     *  *   *      *
******  ******  *     *  *******  *     *  *    *     *
`;

export function sketch(p: p5) {
  let paused = false;
  let backgroundColor = 0;

  // Grid configuration
  type CellState = "solid" | "painted" | "empty";
  const GRID_WIDTH = 80;
  const GRID_HEIGHT = 80;
  let grid: CellState[][] = [];

  // Drawing colors
  const SOLID_COLOR = 20; // dark
  const PAINTED_COLOR = 20; // mid
  const EMPTY_COLOR = 255; // light

  // Ball configuration
  type Ball = { x: number; y: number; vx: number; vy: number; r: number };
  let balls: Ball[] = [];
  const BALL_MIN_RADIUS = 3;
  const BALL_MAX_RADIUS = 8;
  const BALL_MIN_SPEED = 250; // px/s
  const BALL_MAX_SPEED = 1000; // px/s

  const createRandomBall = (): Ball => {
    // Fallback early if grid/canvas not ready yet
    // if (!grid.length || !grid[0]?.length || p.width === 0 || p.height === 0) {
    //   const angle = p.random(0, Math.PI * 2);
    //   const speed = p.random(BALL_MIN_SPEED, BALL_MAX_SPEED);
    //   return {
    //     x: Math.max(
    //       BALL_MAX_RADIUS,
    //       Math.min(p.width - BALL_MAX_RADIUS, p.width / 2 || 0)
    //     ),
    //     y: Math.max(
    //       BALL_MAX_RADIUS,
    //       Math.min(p.height - BALL_MAX_RADIUS, p.height / 2 || 0)
    //     ),
    //     vx: Math.cos(angle) * speed,
    //     vy: Math.sin(angle) * speed,
    //     r: p.random(BALL_MIN_RADIUS, BALL_MAX_RADIUS),
    //   };
    // }
    const cellW = p.width / GRID_WIDTH;
    const cellH = p.height / GRID_HEIGHT;
    const maxAttempts = 1000;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const row = Math.floor(p.random(GRID_HEIGHT));
      const col = Math.floor(p.random(GRID_WIDTH));
      const rowArr = grid[row];
      if (rowArr && rowArr[col] !== "solid") {
        const x = (col + 0.5) * cellW;
        const y = (row + 0.5) * cellH;
        const angle = p.random(0, Math.PI * 2);
        const speed = p.random(BALL_MIN_SPEED, BALL_MAX_SPEED);
        return {
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: p.random(BALL_MIN_RADIUS, BALL_MAX_RADIUS),
        };
      }
    }
    // Fallback: center if no spot found
    const angle = p.random(0, Math.PI * 2);
    const speed = p.random(BALL_MIN_SPEED, BALL_MAX_SPEED);
    return {
      x: p.width / 2,
      y: p.height / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: p.random(BALL_MIN_RADIUS, BALL_MAX_RADIUS),
    };
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
    backgroundColor = 0;
    paused = false;

    // Initialize grid to painted
    grid = Array.from({ length: GRID_HEIGHT }, () =>
      new Array<CellState>(GRID_WIDTH).fill("painted")
    );

    // Overlay the genuary string centered; '*' => solid
    const lines = genuary.trim().split("\n");
    const strHeight = lines.length;
    const strWidth = Math.max(...lines.map((l) => l.length));
    const startRow = Math.max(0, Math.floor((GRID_HEIGHT - strHeight) / 2));
    const startCol = Math.max(0, Math.floor((GRID_WIDTH - strWidth) / 2));

    for (let r = 0; r < lines.length; r++) {
      const line = lines[r];
      for (let c = 0; c < line.length; c++) {
        if (line[c] === "*") {
          const gr = startRow + r;
          const gc = startCol + c;
          if (gr >= 0 && gr < GRID_HEIGHT && gc >= 0 && gc < GRID_WIDTH) {
            grid[gr][gc] = "solid";
          }
        }
      }
    }

    // Make border rows and columns solid
    for (let c = 0; c < GRID_WIDTH; c++) {
      grid[0][c] = "solid";
      grid[GRID_HEIGHT - 1][c] = "solid";
    }
    for (let r = 0; r < GRID_HEIGHT; r++) {
      grid[r][0] = "solid";
      grid[r][GRID_WIDTH - 1] = "solid";
    }

    // Initialize balls: 10 random spawns on non-solid cells
    balls = Array.from({ length: 10 }, () => createRandomBall());
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
      case "b":
      case "B":
        balls.push(createRandomBall());
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
    const cellW = p.width / GRID_WIDTH;
    const cellH = p.height / GRID_HEIGHT;

    // Update balls (movement and collisions) with adaptive substeps to prevent tunneling
    if (!paused) {
      const dt = p.deltaTime / 1000; // seconds
      const moveThreshold = Math.max(1e-4, 0.5 * Math.min(cellW, cellH));

      for (const b of balls) {
        const speed = Math.hypot(b.vx, b.vy);
        const steps = Math.max(1, Math.ceil((speed * dt) / moveThreshold));
        const stepDt = dt / steps;

        for (let s = 0; s < steps; s++) {
          const prevX = b.x;
          const prevY = b.y;

          // Integrate position for this substep
          b.x += b.vx * stepDt;
          b.y += b.vy * stepDt;

          // Candidate grid range near the ball
          const minCol = Math.max(0, Math.floor((b.x - b.r) / cellW));
          const maxCol = Math.min(
            GRID_WIDTH - 1,
            Math.floor((b.x + b.r) / cellW)
          );
          const minRow = Math.max(0, Math.floor((b.y - b.r) / cellH));
          const maxRow = Math.min(
            GRID_HEIGHT - 1,
            Math.floor((b.y + b.r) / cellH)
          );

          // Helper: circle-rect intersection test
          const circleRectIntersect = (
            cx: number,
            cy: number,
            r: number,
            rx: number,
            ry: number,
            rw: number,
            rh: number
          ) => {
            const nx = Math.max(rx, Math.min(cx, rx + rw));
            const ny = Math.max(ry, Math.min(cy, ry + rh));
            const dx = cx - nx;
            const dy = cy - ny;
            return dx * dx + dy * dy <= r * r;
          };

          let bounced = false;
          for (let row = minRow; row <= maxRow && !bounced; row++) {
            for (let col = minCol; col <= maxCol && !bounced; col++) {
              const rx = col * cellW;
              const ry = row * cellH;
              const rw = cellW;
              const rh = cellH;

              const state = grid[row][col];
              if (state === "painted") {
                if (circleRectIntersect(b.x, b.y, b.r, rx, ry, rw, rh)) {
                  grid[row][col] = "empty";
                }
              } else if (state === "solid") {
                if (circleRectIntersect(b.x, b.y, b.r, rx, ry, rw, rh)) {
                  // Determine collision orientation using expanded boundaries and previous position
                  const left = rx - b.r;
                  const right = rx + rw + b.r;
                  const top = ry - b.r;
                  const bottom = ry + rh + b.r;

                  const crossedLeft = prevX < left && b.x >= left;
                  const crossedRight = prevX > right && b.x <= right;
                  const crossedTop = prevY < top && b.y >= top;
                  const crossedBottom = prevY > bottom && b.y <= bottom;

                  const horizontalHit = crossedLeft || crossedRight;
                  const verticalHit = crossedTop || crossedBottom;

                  if (horizontalHit && !verticalHit) {
                    b.vx = -b.vx;
                    b.x = crossedLeft ? left - 0.0001 : right + 0.0001;
                    bounced = true;
                  } else if (verticalHit && !horizontalHit) {
                    b.vy = -b.vy;
                    b.y = crossedTop ? top - 0.0001 : bottom + 0.0001;
                    bounced = true;
                  } else {
                    // Corner or ambiguous: choose axis with smaller penetration
                    const dxPen = Math.min(
                      Math.abs(b.x - left),
                      Math.abs(right - b.x)
                    );
                    const dyPen = Math.min(
                      Math.abs(b.y - top),
                      Math.abs(bottom - b.y)
                    );
                    if (dxPen < dyPen) {
                      b.vx = -b.vx;
                      b.x = b.x < rx + rw / 2 ? left - 0.0001 : right + 0.0001;
                    } else {
                      b.vy = -b.vy;
                      b.y = b.y < ry + rh / 2 ? top - 0.0001 : bottom + 0.0001;
                    }
                    bounced = true;
                  }
                }
              }
            }
          }

          // Safety: bounce on canvas bounds to prevent escape
          if (b.x - b.r < 0) {
            b.x = b.r;
            b.vx = Math.abs(b.vx);
          } else if (b.x + b.r > p.width) {
            b.x = p.width - b.r;
            b.vx = -Math.abs(b.vx);
          }
          if (b.y - b.r < 0) {
            b.y = b.r;
            b.vy = Math.abs(b.vy);
          } else if (b.y + b.r > p.height) {
            b.y = p.height - b.r;
            b.vy = -Math.abs(b.vy);
          }
        }
      }
    }

    // Draw the grid scaled to the canvas
    p.noStroke();
    for (let r = 0; r < GRID_HEIGHT; r++) {
      for (let c = 0; c < GRID_WIDTH; c++) {
        const state = grid[r][c];
        switch (state) {
          case "solid":
            p.fill(SOLID_COLOR);
            break;
          case "painted":
            p.fill(PAINTED_COLOR);
            break;
          case "empty":
            p.fill(EMPTY_COLOR);
            break;
        }
        p.rect(c * cellW, r * cellH, cellW, cellH);
      }
    }

    // Draw balls
    p.stroke(0);
    p.strokeWeight(1);
    p.fill(255, 0, 0);
    for (const b of balls) {
      p.circle(b.x, b.y, b.r * 2);
    }
  };

  // Return control functions that React can call
  return {
    restart,
    randomizeColor,
  };
}
