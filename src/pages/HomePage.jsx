import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Sparkles, Zap, Gem, Mail, Phone} from 'lucide-react';
import api from '../services/api';

const HomePage = ({ onGameSelect, onInfoSelect }) => {
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
          logo: '/images/hatos.jpg',
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
              <Button variant="light" size="lg" className="fw-bold"
                onClick={() => {
                  const random = games[Math.floor(Math.random() * games.length)];
                  onGameSelect(random);
                }}>
                Játék indítása
              </Button>
              <Button variant="outline-light" size="lg"
                onClick={() => onInfoSelect('hogyan-mukodik')}>
                Hogyan működik?
              </Button>
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
                  <Button variant="warning" className="rounded-pill fw-bold">
                    <Zap size={18} className="me-2" /> Játék
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
       <footer className="bg-dark text-white mt-5 pt-5 pb-3 rounded-4">
        <Container>
          <Row className="g-4 mb-4">
            <Col md={4}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="p-2 rounded-2" style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>
                  <Gem size={20} color="white" />
                </div>
                <span className="fw-bold fs-5">Fortuna Lotto</span>
              </div>
              <p className="text-white-50 small">
                Magyarország megbízható online lottó platformja. Játssz felelősségteljesen!
              </p>
            </Col>

            <Col md={2}>
            <h6 className="fw-bold mb-3 text-warning">Játékok</h6>
            <ul className="list-unstyled">
              {games.map(game => (
                <li key={game.id} className="mb-2">
                  <span
                    className="text-white-50 small"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onGameSelect(game)}
                    onMouseEnter={e => e.target.style.color = '#f59e0b'}
                    onMouseLeave={e => e.target.style.color = ''}
                  >
                    {game.name}
                  </span>
                </li>
              ))}
            </ul>
          </Col>

            <Col md={3}>
            <h6 className="fw-bold mb-3 text-warning">Információk</h6>
            <ul className="list-unstyled">
              {[
                { label: 'Játékszabályok',          key: 'jatekszabalyok' },
                { label: 'Nyeremények kifizetése',  key: 'nyeremenyek'    },
                { label: 'Felelős játék',           key: 'felelosjatek'   },
                { label: 'Adatvédelmi irányelvek',  key: 'adatvedelem'    },
                { label: 'Felhasználási feltételek',key: 'feltetelek'     },
                { label: 'GYIK',                    key: 'gyik'           },
              ].map(item => (
                <li key={item.key} className="mb-2">
                  <span
                    className="text-white-50 small"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onInfoSelect(item.key)}
                    onMouseEnter={e => e.target.style.color = '#f59e0b'}
                    onMouseLeave={e => e.target.style.color = ''}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </Col>

            <Col md={3}>
              <h6 className="fw-bold mb-3 text-warning">Kapcsolat</h6>
              <ul className="list-unstyled">
                <li className="mb-2 d-flex align-items-center gap-2 text-white-50 small">
                  <Mail size={14} /> fortunalotto343@gmail.com
                </li>
                <li className="mb-2 d-flex align-items-center gap-2 text-white-50 small">
                  <Phone size={14} /> +36 1 234 5678
                </li>
              </ul>
              <div className="mt-3 p-2 rounded-2 border border-secondary">
                <p className="text-white-50 small mb-0">
                  ⚠️ A szerencsejáték kizárólag 18 éven felülieknek ajánlott!
                </p>
              </div>
            </Col>
          </Row>

          <hr className="border-secondary" />
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <p className="text-white-50 small mb-0">© {new Date().getFullYear()} Fortuna Lotto. Minden jog fenntartva.</p>
            <p className="text-white-50 small mb-0">🔒 Biztonságos és titkosított kapcsolat</p>
          </div>
        </Container>
      </footer>
    </Container>
  );
};

export default HomePage;