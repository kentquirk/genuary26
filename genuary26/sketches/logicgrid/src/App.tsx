import { useEffect, useRef, useState } from "react";
import { Container, Button, Row, Col } from "react-bootstrap";
import p5 from "p5";
import { sketch } from "./sketch";

function App() {
  const sketchRef = useRef<p5 | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<{
    restart: () => void;
    clearGrid: () => void;
    fillAll: () => void;
    setInteractionMode: (mode: string) => void;
    setPaused: (value: boolean) => void;
    togglePaused: () => void;
    isPaused: () => boolean;
    stepOnce: () => void;
    toggleWrapped: () => void;
    isWrapped: () => boolean;
    toggleShowBackground: () => void;
    isShowBackground: () => boolean;
  } | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>("paint-true");
  const [paused, setPausedState] = useState<boolean>(false);
  const [wrapped, setWrappedState] = useState<boolean>(false);
  const [showBackground, setShowBackgroundState] = useState<boolean>(true);
  const [showFullIntro, setShowFullIntro] = useState<boolean>(false);

  const introText = `An interactive generative sketch for Genuary 2026, Day 7. Today's
  prompt: "Boolean Logic". This is a grid-based cellular automaton
  where the rules are based on boolean logic operations. AND means
  all neighbors must be true for the cell to become true, OR means
  at least one neighbor must be true, XOR means an odd number of
  true neighbors makes the cell true, and so on. You can paint cells
  as true (white) or false (black), or set cells to apply different
  logic operations. Watch how patterns evolve over time based on
  these simple rules!`;
  const introPreview =
    introText.replace(/\s+/g, " ").trim().split(" ").slice(0, 20).join(" ") +
    "…";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    // Initialize p5 sketch with instance mode
    sketchRef.current = new p5((p: p5) => {
      const controls = sketch(p);
      controlsRef.current = controls;
    }, container);

    // Cleanup on unmount
    return () => {
      if (sketchRef.current) {
        sketchRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.setInteractionMode(selectedMode);
    }
  }, [selectedMode]);

  useEffect(() => {
    if (controlsRef.current) {
      setPausedState(controlsRef.current.isPaused());
      setWrappedState(controlsRef.current.isWrapped());
      setShowBackgroundState(controlsRef.current.isShowBackground());
    }
  }, []);

  const handleRestart = () => {
    if (controlsRef.current) {
      controlsRef.current.restart();
    }
  };

  const handleFillAll = () => {
    if (controlsRef.current) {
      controlsRef.current.fillAll();
    }
  };

  const handleSetMode = (mode: string) => {
    setSelectedMode(mode);
    if (controlsRef.current) {
      controlsRef.current.setInteractionMode(mode);
    }
  };

  const handleTogglePaused = () => {
    if (controlsRef.current) {
      controlsRef.current.togglePaused();
      setPausedState(controlsRef.current.isPaused());
    }
  };

  const handleStep = () => {
    if (controlsRef.current) {
      controlsRef.current.stepOnce();
    }
  };

  const handleToggleWrapped = () => {
    if (controlsRef.current) {
      controlsRef.current.toggleWrapped();
      setWrappedState(controlsRef.current.isWrapped());
    }
  };

  const handleToggleShowBackground = () => {
    if (controlsRef.current) {
      controlsRef.current.toggleShowBackground();
      setShowBackgroundState(controlsRef.current.isShowBackground());
    }
  };

  return (
    <Container fluid className="p-0">
      <Container className="py-4">
        <Row>
          <Col>
            <div className="text-start mb-1" style={{ lineHeight: "1.2" }}>
              <a
                href="https://kentquirk.github.io/genuary26/"
                className="home-link"
              >
                ← Home
              </a>
            </div>
            <h1 className="text-center mb-3">Logic Grid</h1>
            <p className="text-center mb-2">
              {showFullIntro ? (
                <>
                  {introText}{" "}
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setShowFullIntro(false)}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      setShowFullIntro(false);
                    }}
                  >
                    Less
                  </Button>
                </>
              ) : (
                <>
                  {introPreview}{" "}
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setShowFullIntro(true)}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      setShowFullIntro(true);
                    }}
                  >
                    More…
                  </Button>
                </>
              )}
            </p>
          </Col>
        </Row>

        <hr className="my-1" />

        <Row
          className="mb-1 g-2 justify-content-center"
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <Col xs={4} md={2}>
            <Button
              variant="secondary"
              onClick={handleRestart}
              className="w-100"
            >
              Restart
            </Button>
          </Col>
          <Col xs={4} md={2}>
            <Button
              variant="secondary"
              onClick={handleTogglePaused}
              className="w-100"
            >
              {paused ? "Run" : "Pause"}
            </Button>
          </Col>
          <Col xs={4} md={2}>
            <Button
              variant="secondary"
              onClick={handleStep}
              className="w-100"
              disabled={!paused}
            >
              Step
            </Button>
          </Col>
          <Col xs={4} md={2}>
            <Button variant="primary" onClick={handleFillAll} className="w-100">
              Fill All
            </Button>
          </Col>
          <Col xs={4} md={2}>
            <Button
              variant={wrapped ? "secondary" : "outline-text"}
              className="w-100"
              onClick={handleToggleWrapped}
            >
              {wrapped ? "No Wrap" : "Wrap"}
            </Button>
          </Col>
          <Col xs={4} md={2}>
            <Button
              variant={showBackground ? "secondary" : "outline-text"}
              className="w-100"
              onClick={handleToggleShowBackground}
            >
              {showBackground ? "Hide BG" : "Show BG"}
            </Button>
          </Col>
        </Row>
        <Row
          className="mb-1 g-2 justify-content-center"
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <Col xs="auto">
            <Button
              variant={
                selectedMode === "paint-false" ? "black" : "outline-black"
              }
              size="sm"
              onClick={() => handleSetMode("paint-false")}
            >
              BLK
            </Button>
          </Col>
          <Col xs="auto">
            <Button
              variant={
                selectedMode === "paint-true" ? "white" : "outline-white"
              }
              size="sm"
              onClick={() => handleSetMode("paint-true")}
            >
              WHT
            </Button>
          </Col>
          <Col xs="auto">
            <Button
              variant={selectedMode === "op-AND" ? "and" : "outline-and"}
              size="sm"
              onClick={() => handleSetMode("op-AND")}
            >
              AND
            </Button>
          </Col>
          <Col xs="auto">
            <Button
              variant={selectedMode === "op-OR" ? "or" : "outline-or"}
              size="sm"
              onClick={() => handleSetMode("op-OR")}
            >
              OR
            </Button>
          </Col>
          <Col xs="auto">
            <Button
              variant={selectedMode === "op-XOR" ? "xor" : "outline-xor"}
              size="sm"
              onClick={() => handleSetMode("op-XOR")}
            >
              XOR
            </Button>
          </Col>
          <Col xs="auto">
            <Button
              variant={selectedMode === "op-NAND" ? "nand" : "outline-nand"}
              size="sm"
              onClick={() => handleSetMode("op-NAND")}
            >
              NAND
            </Button>
          </Col>
          <Col xs="auto">
            <Button
              variant={selectedMode === "op-NOR" ? "nor" : "outline-nor"}
              size="sm"
              onClick={() => handleSetMode("op-NOR")}
            >
              NOR
            </Button>
          </Col>
          <Col xs="auto">
            <Button
              variant={selectedMode === "op-XNOR" ? "xnor" : "outline-xnor"}
              size="sm"
              onClick={() => handleSetMode("op-XNOR")}
            >
              XNOR
            </Button>
          </Col>
        </Row>
      </Container>

      <div
        id="sketch-holder"
        ref={containerRef}
        className="sketch-container"
      ></div>
    </Container>
  );
}

export default App;
