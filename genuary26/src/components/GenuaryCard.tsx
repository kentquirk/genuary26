import { Card, Button, Row, Col } from "react-bootstrap";
import placeholderImg from "../assets/images/placeholder.png";

interface GenuaryCardProps {
  name: string;
  title: string;
  subtitle: string;
  timestamp: string;
  image: string;
  alt: string;
  body: string;
  tryit: string;
  source: string;
}

const GenuaryCard = ({
  title,
  subtitle,
  timestamp,
  image,
  alt,
  body,
  tryit,
  source,
}: GenuaryCardProps) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = placeholderImg;
  };

  return (
    <Card className="h-100 shadow-sm">
      <Card.Img
        variant="top"
        src={image}
        alt={alt}
        onError={handleImageError}
        style={{
          aspectRatio: "1 / 1",
          objectFit: "cover",
          width: "100%",
        }}
      />
      <Card.Body className="d-flex flex-column">
        <Card.Title className="fw-bold">{title}</Card.Title>
        <Card.Subtitle className="mb-2">{subtitle}</Card.Subtitle>
        <div className="small mb-3">{timestamp}</div>
        <Card.Text className="flex-grow-1" style={{ fontSize: "0.9rem" }}>
          {body}
        </Card.Text>
        <Row className="g-2 mt-auto">
          <Col xs={8} sm={6}>
            <Button
              variant="primary"
              href={tryit}
              target="_blank"
              rel="noopener noreferrer"
              className="w-100"
            >
              See it run!
            </Button>
          </Col>
          <Col xs={4} sm={6}>
            <Button
              variant="outline-secondary"
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="w-100"
            >
              Source
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default GenuaryCard;
