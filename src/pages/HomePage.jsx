import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Trophy, Clock, Sparkles, TrendingUp, Star, Zap, ChevronRight } from 'lucide-react';
import api from '../services/api';

const HomePage = ({ onGameSelect }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGames = async () => {
      try {
        setGames([
        {
          id: 1,
          slug: 'otos',
          name: 'Ötös Lottó',
          description: 'Válassz 5 számot 90-ből! Magyarország egyik legnépszerűbb lottójátéka.',
          jackpot: '2.5 milliárd Ft',
          nextDraw: 'Szombat',
          ticketPrice: '400',
          logo: '/images/otos.png',
          color: '#10b981',
        },
        {
          id: 2,
          slug: 'skandi',
          name: 'Skandináv Lottó',
          description: 'Válassz 7 számot 35-ből! A skandinávok szerencsejátéka.',
          jackpot: '180 millió Ft',
          nextDraw: 'Szerda, Szombat',
          ticketPrice: '400',
          logo: '/images/skandi.png',
          color: '#1e40af',
        },
        {
          id: 3,
          slug: 'eurojack',
          name: 'Eurojackpot',
          description: 'Európa legnagyobb lottója! 5+2 szám, hatalmas nyeremények.',
          jackpot: '90 millió €',
          nextDraw: 'Péntek, Kedd',
          ticketPrice: '820',
          logo: '/images/eurojack.png',
          color: '#ca8a04',
        },
        {
          id: 4,
          slug: 'joker',
          name: 'Joker',
          description: '6 számjegyű szerencseszám! Játszd az ötös lottóval vagy önállóan.',
          jackpot: '100 millió Ft',
          nextDraw: 'Szerda, Szombat',
          ticketPrice: '400',
          logo: '/images/joker.png',
          color: '#dc2626',
        },
        {
          id: 5,
          slug: 'keno',
          name: 'Kenó',
          description: 'Válassz 1-20 számot 80-ból! Napi sorsolás, azonnali nyeremény.',
          jackpot: '1 milliárd Ft',
          nextDraw: 'Napi 10x',
          ticketPrice: '350',
          logo: '/images/keno.png',
          color: '#db2777',
        },
        {
          id: 6,
          slug: 'hatos',
          name: 'Hatos Lottó',
          description: 'Válassz 6 számot 45-ből! A klasszikus magyar lottójáték.',
          jackpot: '500 millió Ft',
          nextDraw: 'Vasárnap',
          ticketPrice: '400',
          logo: '/images/hatos.png',
          color: '#7c3aed',
        },
      ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);

  return (
    <Container fluid className="py-4">
      {/* Hero Banner */}
      <div className="hero-gradient rounded-4 text-white p-5 mb-5 position-relative overflow-hidden">
        <Row className="align-items-center">
          <Col lg={8}>
            <Badge bg="white" text="dark" className="mb-3">
              <Sparkles size={16} className="me-1" /> Új játékosoknak 5000 Ft bónusz!
            </Badge>
            <h1 className="display-4 fw-bold mb-3">Próbáld ki a szerencséd!</h1>
            <p className="lead mb-4">
              Játssz a legnépszerűbb lottójátékokkal és nyerj hatalmas összegeket.<br />
              Egyszerű, gyors és biztonságos online fogadás.
            </p>
            <div className="d-flex gap-3">
              <Button variant="light" size="lg">Játék indítása</Button>
              <Button variant="outline-light" size="lg">Hogyan működik?</Button>
            </div>
          </Col>
        </Row>
      </div>

      <h2 className="mb-4 fw-bold">Válassz játékot</h2>

      <Row className="g-4">
        {games.map(game => (
          <Col md={6} lg={4} key={game.id}>
            <Card className="h-100 shadow-sm border-0 game-card" onClick={() => onGameSelect(game)} style={{ cursor: 'pointer' }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <img src={game.logo} alt={game.name} style={{ height: '50px' }} className="me-3" />
                  <h4 className="fw-bold mb-0">{game.name}</h4>
                </div>
                <p className="text-muted">{game.description}</p>

                <div className="mt-4 pt-3 border-top">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Főnyeremény:</span>
                    <strong>{game.jackpot}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Következő sorsolás:</span>
                    <strong>{game.nextDraw}</strong>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-end mt-4">
                  <div>
                    <span className="fs-3 fw-bold text-primary">{game.ticketPrice}</span>
                    <span className="text-muted"> / szelvény</span>
                  </div>
                  <Button variant="primary" className="rounded-pill">
                    <Zap size={18} className="me-2" /> Játék
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default HomePage;