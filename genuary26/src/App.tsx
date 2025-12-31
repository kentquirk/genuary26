import { Container, Row, Col } from 'react-bootstrap';
import GenuaryCard from './components/GenuaryCard';
import contentYaml from './assets/content.yaml?raw';
import yaml from 'js-yaml';
import './App.css';

interface Artwork {
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

interface ContentData {
  content: {
    artworks: Artwork[];
  };
}

function App() {
  const data = yaml.load(contentYaml) as ContentData;
  const artworks = data.content.artworks;

  return (
    <Container className="py-5">
      <header className="text-center mb-5">
        <h1 className="display-3 fw-bold mb-4">Genuary 2026</h1>
        <div className="intro-text mx-auto" style={{ maxWidth: '800px' }}>
          <p className="lead">
            Genuary is a month-long creative coding challenge that takes place every January.
            Each day presents a unique prompt, encouraging artists and coders to explore new
            ideas and push the boundaries of generative art.
          </p>
          <p>
            Below are my contributions for Genuary 2026, showcasing a variety of creative
            coding experiments. Each piece can be viewed interactively, and the source code
            is available for those interested in learning more about how they work.
          </p>
        </div>
      </header>

      <Row className="g-4">
        {artworks.map((artwork) => {
          let imagePath: string;
          try {
            imagePath = new URL(`./assets/images/${artwork.image}`, import.meta.url).href;
          } catch {
            imagePath = '';
          }
          return (
            <Col key={artwork.name} xs={12} md={6} lg={4}>
              <GenuaryCard
                name={artwork.name}
                title={artwork.title}
                subtitle={artwork.subtitle}
                timestamp={artwork.timestamp}
                image={imagePath}
                alt={artwork.alt}
                body={artwork.body}
                tryit={artwork.tryit}
                source={artwork.source}
              />
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}

export default App;
