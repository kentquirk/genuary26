import { useEffect, useRef } from "react";
import { Container, Button, Row, Col } from "react-bootstrap";
import p5 from "p5";
import { sketch } from "./sketch";

function App() {
  const sketchRef = useRef<p5 | null>(null);
  const controlsRef = useRef<{
    restart: () => void;
    randomizeColor: () => void;
    addBall: () => void;
  } | null>(null);

  useEffect(() => {
    // Initialize p5 sketch with instance mode
    const holder = document.getElementById("sketch-holder");
    if (!holder) {
      return;
    }
    sketchRef.current = new p5((p: p5) => {
      const controls = sketch(p);
      controlsRef.current = controls;
    }, holder);

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

  const handleAddBall = () => {
    if (controlsRef.current) {
      controlsRef.current.addBall();
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
            <h1 className="text-center mb-3">
              Write 'Genuary'. Don't use a font.
            </h1>
            <p className="text-center mb-4">
              An interactive generative sketch for Genuary 2026, Day 5. It'll
              stop when it's got nothing left to do. Click "b" to add a ball.
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
          <Col xs={4} className="mb-2 mb-sm-0">
            <Button
              variant="secondary"
              onClick={handleAddBall}
              className="w-100"
            >
              Add Ball
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
        </Row>
      </Container>

      <div id="sketch-holder" className="sketch-container"></div>
    </Container>
  );
}

export default App;
