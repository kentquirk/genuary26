import { useEffect, useRef } from "react";
import { Container, Button, Row, Col } from "react-bootstrap";
import p5 from "p5";
import { sketch } from "./sketch";

function App() {
  const sketchRef = useRef<p5 | null>(null);
  const controlsRef = useRef<{
    restart: () => void;
    randomizeColor: () => void;
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

  return (
    <Container fluid className="p-0">
      <Container className="py-4">
        <Row>
          <Col>
            <h1 className="text-center mb-3">__TITLE__</h1>
            <p className="text-center mb-4">
              An interactive generative sketch for Genuary 2026, Day __DAY__.
            </p>
          </Col>
        </Row>

        <hr className="my-4" />

        <Row className="mb-4">
          <Col xs={12} sm={6} className="mb-2 mb-sm-0">
            <Button
              variant="primary"
              onClick={handleRandomizeColor}
              className="w-100"
            >
              Randomize Color
            </Button>
          </Col>
          <Col xs={12} sm={6}>
            <Button
              variant="secondary"
              onClick={handleRestart}
              className="w-100"
            >
              Restart
            </Button>
          </Col>
        </Row>
      </Container>

      <div id="sketch-holder" className="sketch-container"></div>
    </Container>
  );
}

export default App;
