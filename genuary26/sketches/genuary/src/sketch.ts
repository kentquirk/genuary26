import type p5 from "p5";

const genuary = `
******  ******  *     *  *     *     *     *****   *     *
*       *       **    *  *     *    * *    *    *   *   *
*       *       * *   *  *     *   *   *   *    *    * *
*  ***  ****    *  *  *  *     *  *** ***  *  **      *
*    *  *       *   * *  *     *  *     *  *  *       *
*    *  *       *    **  *     *  *     *  *   *      *
******  ******  *     *  *******  *     *  *    *     *
`;

export function sketch(p: p5) {
  let paused = false;
  let backgroundColor: p5.Color;
  let solidColor: p5.Color;
  let paintedColor: p5.Color;
  let emptyColor: p5.Color;
  let ballColor: p5.Color;

  // Grid configuration
  type CellState = "solid" | "painted" | "empty";
  const GRID_WIDTH = 80;
  const GRID_HEIGHT = 80;
  let grid: CellState[][] = [];

  // Drawing colors

  // Ball configuration
  type Ball = { x: number; y: number; vx: number; vy: number; r: number };
  let balls: Ball[] = [];
  const BALL_MIN_SPEED = 250; // px/s
  const BALL_MAX_SPEED = 1000; // px/s

  const createRandomBall = (): Ball => {
    const cellW = p.width / GRID_WIDTH;
    const cellH = p.height / GRID_HEIGHT;
    const ballMinRadius = cellW * 0.3;
    const ballMaxRadius = cellW * 1.2;
    const maxAttempts = 1000;

    // guard against resize
    if (p.width === 0 || p.height === 0) {
      return { x: 0, y: 0, vx: 0, vy: 0, r: ballMinRadius };
    }

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
          r: p.random(ballMinRadius, ballMaxRadius),
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
      r: p.random(ballMinRadius, ballMaxRadius),
    };
  };
  
  const addBall = () => {
    // Prevent adding from inactive instances
    if (p.width === 0 || p.height === 0) {
      return;
    }
    balls.push(createRandomBall());
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
    backgroundColor = p.color(0);
    solidColor = p.color(20);
    paintedColor = p.color(20);
    emptyColor = p.color(255);
    ballColor = p.color(255, 0, 0);
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
    balls = Array.from({ length: 15 }, () => createRandomBall());
  };

  const randomizeColor = () => {
    backgroundColor = p.color(p.random(255));
    solidColor = p.color(p.random(128), p.random(128), p.random(128));
    paintedColor = solidColor;
    emptyColor = p.color(
      p.random(200, 255),
      p.random(200, 255),
      p.random(200, 255)
    );
    ballColor = p.color(p.random(255), p.random(255), p.random(255));
  };

  p.windowResized = () => {
    const size = getCanvasSize();
    p.resizeCanvas(size, size);
    restart();
  };

  p.keyTyped = () => {
    switch (p.key) {
      case " ":
        addBall();
        return false; // Prevent default browser behavior
      case "r":
        restart();
        return false;
      case "b":
      case "B":
        if (p.width === 0 || p.height === 0) {
          return false;
        }
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

    // Update balls (movement and collisions) with adaptive substeps and ball-ball collisions
    if (!paused) {
      const dt = p.deltaTime / 1000; // seconds
      const moveThreshold = Math.max(1e-4, 0.5 * Math.min(cellW, cellH));
      const maxSpeed = balls.length
        ? Math.max(...balls.map((b) => Math.hypot(b.vx, b.vy)))
        : 0;
      const steps = Math.max(1, Math.ceil((maxSpeed * dt) / moveThreshold));
      const stepDt = dt / steps;

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

      for (let s = 0; s < steps; s++) {
        // Move and collide with grid
        for (let i = 0; i < balls.length; i++) {
          const b = balls[i];
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

        // Ball-ball collisions (equal-mass elastic)
        for (let i = 0; i < balls.length; i++) {
          for (let j = i + 1; j < balls.length; j++) {
            const bi = balls[i];
            const bj = balls[j];
            const dx = bj.x - bi.x;
            const dy = bj.y - bi.y;
            const rSum = bi.r + bj.r;
            const dist2 = dx * dx + dy * dy;
            if (dist2 > rSum * rSum) {
              continue;
            }

            const dist = Math.max(1e-6, Math.sqrt(dist2));
            const nx = dx / dist;
            const ny = dy / dist;

            // Resolve penetration by splitting movement
            const penetration = rSum - dist;
            const sep = penetration / 2;
            bi.x -= nx * sep;
            bi.y -= ny * sep;
            bj.x += nx * sep;
            bj.y += ny * sep;

            // Relative normal velocity; only resolve if approaching
            const relVx = bj.vx - bi.vx;
            const relVy = bj.vy - bi.vy;
            const relN = relVx * nx + relVy * ny;
            if (relN < 0) {
              // Decompose velocities into normal and tangent
              const viN = bi.vx * nx + bi.vy * ny;
              const vjN = bj.vx * nx + bj.vy * ny;
              const tx = -ny;
              const ty = nx;
              const viT = bi.vx * tx + bi.vy * ty;
              const vjT = bj.vx * tx + bj.vy * ty;

              // Equal-mass elastic: swap normal components
              const newViN = vjN;
              const newVjN = viN;

              bi.vx = newViN * nx + viT * tx;
              bi.vy = newViN * ny + viT * ty;
              bj.vx = newVjN * nx + vjT * tx;
              bj.vy = newVjN * ny + vjT * ty;
            }
          }
        }
      }
    }

    // Draw the grid scaled to the canvas
    p.noStroke();
    let nPainted = 0;
    for (let r = 0; r < GRID_HEIGHT; r++) {
      for (let c = 0; c < GRID_WIDTH; c++) {
        const state = grid[r][c];
        switch (state) {
          case "solid":
            p.fill(solidColor);
            break;
          case "painted":
            nPainted++;
            p.fill(paintedColor);
            break;
          case "empty":
            p.fill(emptyColor);
            break;
        }
        p.rect(c * cellW, r * cellH, cellW, cellH);
      }
    }

    if (nPainted === 0 && !paused) {
      paused = true;
    }

    // Draw balls
    p.stroke(0);
    p.strokeWeight(1);
    p.fill(ballColor);
    for (const b of balls) {
      p.circle(b.x, b.y, b.r * 2);
    }
  };

  // Return control functions that React can call
  return {
    restart,
    randomizeColor,
    addBall,
  };
}
