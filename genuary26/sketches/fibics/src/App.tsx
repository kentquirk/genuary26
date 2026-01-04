import { useEffect, useRef } from "react";
import { Container, Button, Row, Col } from "react-bootstrap";
import p5 from "p5";
import { sketch } from "./sketch";

function App() {
  const sketchRef = useRef<p5 | null>(null);
  const controlsRef = useRef<{
    restart: () => void;
    randomizeColor: () => void;
    saveImage: () => void;
  } | null>(null);

  useEffect(() => {
    // Initialize p5 sketch with instance mode
    sketchRef.current = new p5((p: p5) => {
      const controls = sketch(p);
      controlsRef.current = controls;
    }, document.getElementById("sketch-holder")!);

    // Cleanup on unmount
    return () => {
      if (sketchRef.current) {
        sketchRef.current.remove();
      }
    };
  }, []);

  const handleRestart = () => {
    if (controlsRef.current) {
      controlsRef.current.restart();
    }
  };

  const handleRandomizeColor = () => {
    if (controlsRef.current) {
      controlsRef.current.randomizeColor();
    }
  };

  const handleSave = () => {
    if (controlsRef.current) {
      controlsRef.current.saveImage();
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
                className="text-decoration-none"
              >
                ← Home
              </a>
            </div>
            <h1 className="text-center mb-3">Fib-ics</h1>
            <p className="text-center mb-4">
              Using the Fibonacci sequence for inspiration, I created a
              rectangular spiral pattern where each segment's length is
              determined by the Fibonacci numbers. The thickness of the lines
              and the colors can be randomized to create different visual
              effects. I had trouble deciding what to do with this prompt, so
              it's not very sophisticated.
            </p>
          </Col>
        </Row>

        <hr className="my-4" />

        <Row className="mb-1">
          <Col xs={4} className="mb-2 mb-sm-0">
            <Button
              variant="primary"
              onClick={handleRandomizeColor}
              className="w-100"
            >
              Randomize Color
            </Button>
          </Col>
          <Col xs={4}>
            <Button
              variant="secondary"
              onClick={handleRestart}
              className="w-100"
            >
              Restart
            </Button>
          </Col>
          <Col xs={4}>
            <Button
              variant="secondary"
              onClick={handleSave}
              className="mb-2 mb-sm-0 w-100"
            >
              Save Image
            </Button>
          </Col>
        </Row>
      </Container>

      <div id="sketch-holder" className="sketch-container"></div>
    </Container>
  );
}

export default App;
