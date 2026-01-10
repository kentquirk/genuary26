import type p5 from "p5";

enum Operations {
  AND = "AND",
  OR = "OR",
  XOR = "XOR",
  NAND = "NAND",
  NOR = "NOR",
  XNOR = "XNOR",
}

const opColorMap: { [key in Operations]: string } = {
  [Operations.AND]: "#e32a00ff",
  [Operations.OR]: "#00b521ff",
  [Operations.XOR]: "#0024c2ff",
  [Operations.NAND]: "#b50060ff",
  [Operations.NOR]: "#6501bbff",
  [Operations.XNOR]: "#00a89fff",
};

class Cell {
  x: number;
  y: number;
  operation: string;
  state: boolean;
  nextState: boolean;

  constructor(x: number, y: number, operation: string) {
    this.x = x;
    this.y = y;
    this.operation = operation;
    this.state = false;
    this.nextState = false;
  }

  calculateNextState(neighbors: Cell[]) {
    const states = neighbors.map((n) => n.state);
    let result: boolean;

    switch (this.operation) {
      case Operations.AND:
        result = states.reduce((a, b) => a && b, true);
        break;
      case Operations.OR:
        result = states.reduce((a, b) => a || b, false);
        break;
      case Operations.XOR:
        result = states.reduce((a, b) => a !== b, false);
        break;
      case Operations.NAND:
        result = !states.reduce((a, b) => a && b, true);
        break;
      case Operations.NOR:
        result = !states.reduce((a, b) => a || b, false);
        break;
      case Operations.XNOR:
        result = !states.reduce((a, b) => a !== b, false);
        break;
      default:
        result = false;
    }

    this.nextState = result;
  }
}

class Grid {
  cols: number;
  rows: number;
  cellSize: number;
  cells: Cell[][];
  offsetX: number;
  offsetY: number;
  wrapped: boolean = false;
  showBackground: boolean = true;

  constructor(
    cols: number,
    rows: number,
    cellSize: number,
    offsetX = 0,
    offsetY = 0
  ) {
    this.cols = cols;
    this.rows = rows;
    this.cellSize = cellSize;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.cells = [];
    this.wrapped = false;

    let randomOp: string = Operations.AND;
    for (let x = 0; x < cols; x++) {
      this.cells[x] = [];
      for (let y = 0; y < rows; y++) {
        const operationKeys = Object.keys(Operations);
        randomOp = operationKeys[Math.floor((x + y) % operationKeys.length)];
        this.cells[x][y] = new Cell(x, y, randomOp);
      }
    }
  }

  getCellAtPosition(px: number, py: number): Cell | null {
    if (px < this.offsetX || py < this.offsetY) {
      return null;
    }
    const gx = Math.floor((px - this.offsetX) / this.cellSize);
    const gy = Math.floor((py - this.offsetY) / this.cellSize);
    const right = this.offsetX + this.cols * this.cellSize;
    const bottom = this.offsetY + this.rows * this.cellSize;
    if (
      gx < 0 ||
      gx >= this.cols ||
      gy < 0 ||
      gy >= this.rows ||
      px >= right ||
      py >= bottom
    ) {
      return null;
    }
    return this.cells[gx][gy];
  }

  draw(p: p5) {
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        const cell = this.cells[x][y];
        if (this.showBackground) {
          p.fill(opColorMap[cell.operation as Operations]);
          p.stroke(50);
        } else {
          p.fill(128);
          p.noStroke();
        }
        p.rect(
          this.offsetX + x * this.cellSize,
          this.offsetY + y * this.cellSize,
          this.cellSize,
          this.cellSize
        );
        p.fill(cell.state ? 255 : 0);
        p.circle(
          this.offsetX + x * this.cellSize + this.cellSize / 2,
          this.offsetY + y * this.cellSize + this.cellSize / 2,
          this.cellSize / 2
        );
      }
    }
  }

  update() {
    const neighborCells = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ]; // Up, Right, Down, Left
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        const cell = this.cells[x][y];
        const neighbors: Cell[] = [];

        for (const [dx, dy] of neighborCells) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
            neighbors.push(this.cells[nx][ny]);
          } else if (this.wrapped) {
            const wrappedX = (nx + this.cols) % this.cols;
            const wrappedY = (ny + this.rows) % this.rows;
            neighbors.push(this.cells[wrappedX][wrappedY]);
          }
        }

        cell.calculateNextState(neighbors);
      }
    }
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        this.cells[x][y].state = this.cells[x][y].nextState;
      }
    }
  }

  fillOperations(op: Operations) {
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        this.cells[x][y].operation = op;
      }
    }
  }
}

export function sketch(p: p5) {
  const GRIDSIZE = 32;
  let paused = false;
  let backgroundColor = 0;
  let grid: Grid;
  let canvasEl: HTMLCanvasElement | null = null;
  let step = false;
  let frameDuration = 300; // in milliseconds
  let lastFrameTime = 0;
  let isMouseDown = false;
  let lastEnteredCell: Cell | null = null;
  type InteractionMode =
    | "paint-true"
    | "paint-false"
    | "op-AND"
    | "op-OR"
    | "op-XOR"
    | "op-NAND"
    | "op-NOR"
    | "op-XNOR";
  let currentMode: InteractionMode = "paint-true";

  const setInteractionMode = (mode: string) => {
    // Accept string to simplify interop with React
    switch (mode) {
      case "paint-true":
      case "paint-false":
      case "op-AND":
      case "op-OR":
      case "op-XOR":
      case "op-NAND":
      case "op-NOR":
      case "op-XNOR":
        currentMode = mode;
        break;
      default:
        // Ignore unknown modes
        break;
    }
  };

  const applyModeToCell = (cell: Cell) => {
    switch (currentMode) {
      case "paint-true":
        cell.state = true;
        break;
      case "paint-false":
        cell.state = false;
        break;
      case "op-AND":
        cell.operation = Operations.AND;
        break;
      case "op-OR":
        cell.operation = Operations.OR;
        break;
      case "op-XOR":
        cell.operation = Operations.XOR;
        break;
      case "op-NAND":
        cell.operation = Operations.NAND;
        break;
      case "op-NOR":
        cell.operation = Operations.NOR;
        break;
      case "op-XNOR":
        cell.operation = Operations.XNOR;
        break;
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
    backgroundColor = 0;
    paused = false;
    const cellSize = Math.floor(Math.min(p.width, p.height) / GRIDSIZE);
    const gridWidth = cellSize * GRIDSIZE;
    const gridHeight = cellSize * GRIDSIZE;
    const offsetX = Math.floor((p.width - gridWidth) / 2);
    const offsetY = Math.floor((p.height - gridHeight) / 2);
    grid = new Grid(GRIDSIZE, GRIDSIZE, cellSize, offsetX, offsetY);
  };

  const setPaused = (value: boolean) => {
    paused = value;
  };

  const togglePaused = () => {
    paused = !paused;
  };

  const isPaused = () => paused;

  const stepOnce = () => {
    // Trigger a single update on the next draw cycle
    step = true;
  };

  const clearGrid = () => {
    for (let x = 0; x < grid.cols; x++) {
      for (let y = 0; y < grid.rows; y++) {
        grid.cells[x][y].state = false;
      }
    }
  };

  const fillAll = () => {
    for (let x = 0; x < grid.cols; x++) {
      for (let y = 0; y < grid.rows; y++) {
        applyModeToCell(grid.cells[x][y]);
      }
    }
  };

  p.windowResized = () => {
    const size = getCanvasSize();
    const cellSize = Math.max(1, Math.floor(size / GRIDSIZE));
    const canvasSize = cellSize * GRIDSIZE;
    p.resizeCanvas(canvasSize, canvasSize);
    restart();
  };

  p.keyTyped = () => {
    switch (p.key) {
      case " ":
        paused = !paused;
        return false; // Prevent default browser behavior
      case "+":
        frameDuration = Math.max(50, frameDuration - 50);
        return false;
      case "-":
        frameDuration += 50;
        return false;
      case "!":
        clearGrid();
        return false;
      case "r":
        restart();
        return false;
      case "s":
        step = !step;
        return false;
      case "&":
        grid.fillOperations(Operations.AND);
        return false;
      case "|":
        grid.fillOperations(Operations.OR);
        return false;
      case "^":
        grid.fillOperations(Operations.XOR);
        return false;
      case "n":
        grid.fillOperations(Operations.NAND);
        return false;
      case "o":
        grid.fillOperations(Operations.NOR);
        return false;
      case "x":
        grid.fillOperations(Operations.XNOR);
        return false;
    }
  };

  p.setup = () => {
    const size = getCanvasSize();
    const cellSize = Math.max(1, Math.floor(size / GRIDSIZE));
    const canvasSize = cellSize * GRIDSIZE;
    const renderer = p.createCanvas(canvasSize, canvasSize);
    // renderer.elt is the underlying canvas element
    canvasEl = renderer.elt as unknown as HTMLCanvasElement;
    restart();
  };

  p.draw = () => {
    p.clear();
    p.background(backgroundColor);

    if (!paused) {
      const currentTime = p.millis();
      if (currentTime - lastFrameTime >= frameDuration) {
        step = true;
        lastFrameTime = currentTime;
      }
    }
    if (step) {
      step = false;
      grid.update();
    }
    grid.draw(p);
  };

  // Unified pointer handlers reused by mouse and touch events
  const pointerStart = (x: number, y: number) => {
    if (!grid) {
      return;
    }
    isMouseDown = true;
    const cell = grid.getCellAtPosition(x, y);
    if (cell) {
      applyModeToCell(cell);
      lastEnteredCell = cell;
    } else {
      lastEnteredCell = null;
    }
  };

  const pointerMove = (x: number, y: number) => {
    if (!isMouseDown || !grid) {
      return;
    }
    const cell = grid.getCellAtPosition(x, y);
    if (cell !== lastEnteredCell) {
      if (cell) {
        applyModeToCell(cell);
      }
      lastEnteredCell = cell;
    }
  };

  const pointerEnd = () => {
    isMouseDown = false;
    lastEnteredCell = null;
  };

  const isEventOnCanvas = (evt?: unknown): boolean => {
    if (!canvasEl) {
      return false;
    }
    const e = evt as
      | (MouseEvent & { touches?: TouchList })
      | (TouchEvent & { touches?: TouchList })
      | undefined;
    if (e?.target && canvasEl.contains(e.target as Node)) {
      return true;
    }
    const rect = canvasEl.getBoundingClientRect();
    let cx: number | undefined;
    let cy: number | undefined;
    if (e && "clientX" in (e as MouseEvent)) {
      const me = e as MouseEvent;
      cx = me.clientX;
      cy = me.clientY;
    } else if (
      e &&
      "touches" in (e as TouchEvent) &&
      (e as TouchEvent).touches &&
      (e as TouchEvent).touches.length > 0
    ) {
      const t = (e as TouchEvent).touches[0];
      cx = t.clientX;
      cy = t.clientY;
    }
    if (typeof cx === "number" && typeof cy === "number") {
      return (
        cx >= rect.left &&
        cx <= rect.right &&
        cy >= rect.top &&
        cy <= rect.bottom
      );
    }
    return false;
  };

  const isWithinCanvas = (x: number, y: number) =>
    x >= 0 && x <= p.width && y >= 0 && y <= p.height;

  // Mouse events delegate to pointer handlers
  p.mousePressed = (evt?: object) => {
    if (isEventOnCanvas(evt) || isWithinCanvas(p.mouseX, p.mouseY)) {
      pointerStart(p.mouseX, p.mouseY);
      return false; // only prevent default when interacting on canvas
    }
  };

  p.mouseDragged = (evt?: object) => {
    if (isEventOnCanvas(evt) || isWithinCanvas(p.mouseX, p.mouseY)) {
      pointerMove(p.mouseX, p.mouseY);
      return false;
    }
  };

  p.mouseReleased = (evt?: object) => {
    if (isEventOnCanvas(evt) || isWithinCanvas(p.mouseX, p.mouseY)) {
      pointerEnd();
      return false;
    }
  };

  // Touch events delegate to pointer handlers (first touch)
  p.touchStarted = (evt?: object) => {
    type P5WithTouches = { touches?: Array<{ x: number; y: number }> };
    const touches = (p as unknown as P5WithTouches).touches;
    const x = touches?.[0]?.x ?? p.mouseX;
    const y = touches?.[0]?.y ?? p.mouseY;
    if (isEventOnCanvas(evt) || isWithinCanvas(x, y)) {
      pointerStart(x, y);
      return false; // Prevent scrolling/zoom on canvas only
    }
  };

  p.touchMoved = (evt?: object) => {
    type P5WithTouches = { touches?: Array<{ x: number; y: number }> };
    const touches = (p as unknown as P5WithTouches).touches;
    const x = touches?.[0]?.x ?? p.mouseX;
    const y = touches?.[0]?.y ?? p.mouseY;
    if (isEventOnCanvas(evt) || isWithinCanvas(x, y)) {
      pointerMove(x, y);
      return false;
    }
  };

  p.touchEnded = () => {
    // Don't require withinCanvas here; just end interaction if active
    if (isMouseDown) {
      pointerEnd();
      return false;
    }
  };

  // Return control functions that React can call
  return {
    restart,
    clearGrid,
    setInteractionMode,
    fillAll,
    setPaused,
    togglePaused,
    isPaused,
    stepOnce,
    setWrapped: (value: boolean) => {
      if (grid) {
        grid.wrapped = value;
      }
    },
    toggleWrapped: () => {
      if (grid) {
        grid.wrapped = !grid.wrapped;
      }
    },
    isWrapped: () => (grid ? grid.wrapped : false),
    setShowBackground: (value: boolean) => {
      if (grid) {
        grid.showBackground = value;
      }
    },
    toggleShowBackground: () => {
      if (grid) {
        grid.showBackground = !grid.showBackground;
      }
    },
    isShowBackground: () => (grid ? grid.showBackground : true),
  };
}
