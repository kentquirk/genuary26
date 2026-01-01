import { useEffect, useRef, useState } from "react";
import { Container, Button, Row, Col, Form } from "react-bootstrap";
import p5 from "p5";
import { sketch } from "./sketch";

function App() {
  const sketchRef = useRef<p5 | null>(null);
  const controlsRef = useRef<{
    restart: () => void;
    randomizeColor: () => void;
    saveImage: () => void;
  } | null>(null);

  const [maxDepth, setMaxDepth] = useState(6);
  const [levelCountMultiplier, setLevelCountMultiplier] = useState(3);
  const [levelSizeMultiplier, setLevelSizeMultiplier] = useState(0.4);

  useEffect(() => {
    // Cleanup existing sketch if it exists
    if (sketchRef.current) {
      sketchRef.current.remove();
    }

    // Initialize p5 sketch with instance mode and current parameters
    sketchRef.current = new p5((p: p5) => {
      const controls = sketch(
        p,
        maxDepth,
        levelCountMultiplier,
        levelSizeMultiplier
      );
      controlsRef.current = controls;
    }, "sketch-holder");

    // Cleanup on unmount
    return () => {
      if (sketchRef.current) {
        sketchRef.current.remove();
      }
    };
  }, [maxDepth, levelCountMultiplier, levelSizeMultiplier]);

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
            <h1 className="text-center mb-3">One Shape, One Color</h1>
            <p className="text-center mb-4">
              That's the Genuary prompt for Jan 1, 2026. I decided to draw
              triangles.
            </p>
          </Col>
        </Row>

        <hr className="my-4" />

        {/* Slider Controls */}
        <Row className="mb-4">
          <Col xs={12} md={4} className="mb-3">
            <Form.Group>
              <Form.Label>Max Depth: {maxDepth}</Form.Label>
              <Form.Range
                min={1}
                max={10}
                value={maxDepth}
                onChange={(e) => setMaxDepth(parseInt(e.target.value))}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={4} className="mb-3">
            <Form.Group>
              <Form.Label>
                Level Count Multiplier: {levelCountMultiplier}
              </Form.Label>
              <Form.Range
                min={1}
                max={6}
                value={levelCountMultiplier}
                onChange={(e) =>
                  setLevelCountMultiplier(parseInt(e.target.value))
                }
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={4} className="mb-3">
            <Form.Group>
              <Form.Label>
                Level Size Multiplier: {levelSizeMultiplier.toFixed(2)}
              </Form.Label>
              <Form.Range
                min={0.3}
                max={0.7}
                step={0.01}
                value={levelSizeMultiplier}
                onChange={(e) =>
                  setLevelSizeMultiplier(parseFloat(e.target.value))
                }
              />
            </Form.Group>
          </Col>
        </Row>

        <hr className="my-4" />

        <Row className="mb-4">
          <Col xs={12} sm={6} md={4} className="mb-2 mb-sm-0">
            <Button
              variant="primary"
              onClick={handleRandomizeColor}
              className="w-100"
            >
              Randomize Color
            </Button>
          </Col>
          <Col xs={12} sm={6} md={4} className="mb-2 mb-md-0">
            <Button
              variant="secondary"
              onClick={handleRestart}
              className="w-100"
            >
              Restart
            </Button>
          </Col>
          <Col xs={12} md={4}>
            <Button variant="secondary" onClick={handleSave} className="w-100">
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
