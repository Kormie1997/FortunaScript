import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { ArrowLeft, Trash2, Zap, RefreshCw, ShoppingCart, Play } from 'lucide-react';
import { toast } from 'sonner';

const PRICE_PER_PANEL = 400;
const JOKER_PRICE = 300;

function LotteryTicket({ game, onBack }) {
  const [panels, setPanels] = useState([]);
  const [extraPanels, setExtraPanels] = useState([]);
  const [jokerNumbers, setJokerNumbers] = useState(['', '', '']);
  const [extraGames, setExtraGames] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializálás
  useEffect(() => {
    const initialPanels = Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      numbers: [],
      isLocked: false
    }));
    setPanels(initialPanels);
  }, [game]);

  const MAX_NUMBERS = 5;
  const NUMBER_RANGE = 90;

  const toggleNumber = (panelId, num) => {
    setPanels(prev => prev.map(panel => {
      if (panel.id !== panelId || panel.isLocked) return panel;

      if (panel.numbers.includes(num)) {
        return { ...panel, numbers: panel.numbers.filter(n => n !== num) };
      }
      if (panel.numbers.length >= MAX_NUMBERS) {
        toast.info(`Maximum ${MAX_NUMBERS} szám választható!`);
        return panel;
      }
      return { ...panel, numbers: [...panel.numbers, num].sort((a, b) => a - b) };
    }));
  };

  const quickPick = (panelId) => {
    const random = Array.from({ length: NUMBER_RANGE }, (_, i) => i + 1)
      .sort(() => 0.5 - Math.random())
      .slice(0, MAX_NUMBERS)
      .sort((a, b) => a - b);

    setPanels(prev => prev.map(p => 
      p.id === panelId ? { ...p, numbers: random } : p
    ));
  };

  const clearPanel = (panelId) => {
    setPanels(prev => prev.map(p => p.id === panelId ? { ...p, numbers: [] } : p));
  };

  const generateExtra = () => {
    const count = Math.min(14, Math.max(0, parseInt(extraGames) || 0));
    if (count === 0) return toast.error('Adj meg legalább 1 gépi játékot!');

    const newExtras = Array.from({ length: count }, (_, i) => ({
      id: `extra-${Date.now()}-${i}`,
      numbers: Array.from({ length: NUMBER_RANGE }, (_, i) => i + 1)
        .sort(() => 0.5 - Math.random())
        .slice(0, MAX_NUMBERS)
        .sort((a, b) => a - b),
      isLocked: true
    }));

    setExtraPanels(newExtras);
    toast.success(`${count} gépi mező generálva!`);
  };

  const removeExtraPanel = (id) => {
    setExtraPanels(prev => prev.filter(p => p.id !== id));
  };

  const quickJoker = (idx) => {
    let num = '';
    for (let i = 0; i < 6; i++) num += Math.floor(Math.random() * 10);
    setJokerNumbers(prev => {
      const newNums = [...prev];
      newNums[idx] = num;
      return newNums;
    });
  };

  const getTotalPrice = () => {
    const filled = panels.filter(p => p.numbers.length === MAX_NUMBERS).length;
    const jokerCount = jokerNumbers.filter(n => n.length === 6).length;
    return (filled + extraPanels.length) * PRICE_PER_PANEL + jokerCount * JOKER_PRICE;
  };

  const handleAddToCart = () => {
    if (getTotalPrice() === 0) return toast.error('Tölts ki legalább egy mezőt!');
    toast.success('Kosárba téve!');
  };

  const handlePlay = () => {
    if (getTotalPrice() === 0) return toast.error('Tölts ki legalább egy mezőt!');
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success('Szelvény sikeresen leadva! Sok szerencsét!');
      setIsSubmitting(false);
    }, 800);
  };

  // Számrács renderelése (csak egyszer!)
  const renderNumberGrid = (panel) => (
    <Row className="g-2">
      {Array.from({ length: NUMBER_RANGE }, (_, i) => i + 1).map(num => {
        const isSelected = panel.numbers.includes(num);
        return (
          <Col xs={3} sm={2} md={1} key={num}>
            <Button
              variant={isSelected ? "danger" : "outline-secondary"}
              className="w-100 fw-bold py-2"
              onClick={() => toggleNumber(panel.id, num)}
              disabled={panel.isLocked}
            >
              {num}
            </Button>
          </Col>
        );
      })}
    </Row>
  );

  return (
    <Container fluid className="py-4">
      <Row className="mb-4 align-items-center">
        <Col xs="auto">
          <Button variant="outline-secondary" onClick={onBack}>
            <ArrowLeft size={20} /> Vissza
          </Button>
        </Col>
        <Col>
          <h1 className="fw-bold mb-0">{game.name}</h1>
        </Col>
      </Row>

      <Row>
        {/* Bal oldali Joker panel */}
        <Col lg={4} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Body>
              <div className="text-center mb-4">
                <h2 className="display-4 fw-black text-black mb-0">JOKER</h2>
                <p className="text-muted">{JOKER_PRICE} Ft/db</p>
              </div>

              {jokerNumbers.map((num, idx) => (
                <div key={idx} className="d-flex gap-2 mb-3">
                  <Form.Control
                    type="text"
                    maxLength={6}
                    value={num}
                    placeholder="------"
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setJokerNumbers(prev => {
                        const newNums = [...prev];
                        newNums[idx] = val;
                        return newNums;
                      });
                    }}
                  />
                  <Button variant="outline-success" onClick={() => quickJoker(idx)}>
                    <RefreshCw size={18} />
                  </Button>
                </div>
              ))}

              <hr className="my-4" />

              <Form.Group className="mb-3">
                <Form.Label>Gépi játékok (0-14)</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  max={14}
                  value={extraGames}
                  onChange={(e) => setExtraGames(Math.min(14, Math.max(0, parseInt(e.target.value) || 0)))}
                />
              </Form.Group>

              <Button variant="outline-primary" className="w-100 mb-4" onClick={generateExtra}>
                Generálás
              </Button>

              <div className="bg-light p-3 rounded mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <span>Kitöltött mezők:</span>
                  <strong>{panels.filter(p => p.numbers.length === MAX_NUMBERS).length}</strong>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Gépi játékok:</span>
                  <strong>{extraPanels.length}</strong>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Joker:</span>
                  <strong>{jokerNumbers.filter(n => n.length === 6).length}</strong>
                </div>
                <hr />
                <div className="fw-bold fs-5 text-danger">
                  Összesen: {getTotalPrice().toLocaleString()} Ft
                </div>
              </div>

              <Button variant="warning" size="lg" className="w-100 mb-2 text-dark fw-bold" onClick={handleAddToCart}>
                <ShoppingCart size={20} className="me-2" /> KOSÁRBA
              </Button>

              <Button variant="success" size="lg" className="w-100 fw-bold" onClick={handlePlay} disabled={isSubmitting}>
                {isSubmitting ? 'Küldés...' : 'MEGJÁTSZOM'}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Jobb oldali mezők */}
        <Col lg={8}>
          {panels.map((panel, idx) => (
            <Card key={panel.id} className="mb-4 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <strong>{idx + 1}. mező</strong>
                <div className="d-flex gap-2">
                  <Button size="sm" variant="outline-danger" onClick={() => clearPanel(panel.id)}>
                    <Trash2 size={16} /> Törlés
                  </Button>
                  <Button size="sm" variant="outline-primary" onClick={() => quickPick(panel.id)}>
                    <Zap size={16} /> Gyorstipp
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                {renderNumberGrid(panel)}
              </Card.Body>
            </Card>
          ))}

          {extraPanels.map((panel, idx) => (
            <Card key={panel.id} className="mb-4 border-success">
              <Card.Header className="bg-success text-white d-flex justify-content-between">
                <strong>Gépi {idx + 1}</strong>
                <Button size="sm" variant="light" onClick={() => removeExtraPanel(panel.id)}>
                  Törlés
                </Button>
              </Card.Header>
              <Card.Body>
                <Row className="g-2">
                  {panel.numbers.map(num => (
                    <Col xs={3} sm={2} md={1} key={num}>
                      <Button variant="success" className="w-100 fw-bold" disabled>
                        {num}
                      </Button>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          ))}
        </Col>
      </Row>
    </Container>
  );
}

export default LotteryTicket;