import { useEffect, useRef } from "react";
import { Container, Button, Row, Col } from "react-bootstrap";
import p5 from "p5";
import { sketch } from "./sketch";

function App() {
  const sketchRef = useRef<p5 | null>(null);
  const controlsRef = useRef<{
    restart: () => void;
    randomizeColor: () => void;
    randomJump: () => void;
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

  const handleRandomJump = () => {
    if (controlsRef.current && "randomJump" in controlsRef.current) {
      controlsRef.current.randomJump();
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
            <h1 className="text-center mb-3">Low Res Imagery</h1>
            <p className="text-center mb-4">
              An interactive generative sketch for Genuary 2026, Day 4. It's
              playing with low-resolution images, color channels, and blending
              modes. Press the "Jump!" button to see one of the color channels
              bounce; hit it a few times to see the effect.
            </p>
          </Col>
        </Row>

        <hr className="my-4" />

        <Row className="mb-1">
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
              variant="primary"
              onClick={handleRandomJump}
              className="w-100"
            >
              Jump!
            </Button>
          </Col>
        </Row>
      </Container>

      <div id="sketch-holder" className="sketch-container"></div>
    </Container>
  );
}

export default App;
