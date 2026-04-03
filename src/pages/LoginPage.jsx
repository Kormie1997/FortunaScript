import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { User, Lock, Mail, ArrowLeft, Sparkles, Loader2, Gem } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage = ({ onRegisterClick, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Add meg a felhasználóneved és jelszavad!');
      return;
    }
    setIsLoading(true);
    await onLogin({ username, password });
    setIsLoading(false);
  };

  const handleForgot = (e) => {
    e.preventDefault();
    if (!forgotEmail) return toast.error('Add meg az email címed!');
    toast.success('Jelszó-visszaállítási link elküldve!');
    setShowForgot(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={5}>
            <div className="text-center mb-5">
              <div className="logo-box mx-auto mb-3">
                <Gem size={40} color="white" />
              </div>
              <h1 className="display-5 fw-bold">
                <span className="gradient-text">Fortuna</span>
                <span className="text-dark"> Lotto</span>
              </h1>
              <p className="text-muted d-flex align-items-center justify-content-center gap-2">
                <Sparkles size={18} /> A szerencse hozzád szól! <Sparkles size={18} />
              </p>
            </div>

            <Card className="border-0 rounded-4 overflow-hidden shadow">
              <div className="card-top-bar"></div>
              <Card.Body className="p-5">
                <h3 className="text-center mb-1">Bejelentkezés</h3>
                <p className="text-center text-muted mb-4">Add meg a felhasználóneved és jelszavad</p>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Felhasználónév</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text"><User size={18} /></span>
                      <Form.Control
                        type="text"
                        placeholder="felhasznalonev"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <div className="d-flex justify-content-between">
                      <Form.Label>Jelszó</Form.Label>
                      <Button variant="link" className="p-0 text-warning" onClick={() => setShowForgot(true)}>
                        Elfelejtetted?
                      </Button>
                    </div>
                    <div className="input-group">
                      <span className="input-group-text"><Lock size={18} /></span>
                      <Form.Control
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </Form.Group>

                  <Button
                    variant="warning"
                    size="lg"
                    className="w-100 fw-bold py-3"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={20} className="me-2 spin" />
                        Bejelentkezés...
                      </>
                    ) : 'Bejelentkezés'}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <span className="text-muted">Még nincs fiókod? </span>
                  <Button variant="link" className="text-warning fw-medium p-0" onClick={onRegisterClick}>
                    Regisztrálj most
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {showForgot && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50 d-flex align-items-center justify-content-center" style={{ zIndex: 1050 }}>
          <Card className="w-100 shadow" style={{ maxWidth: '420px' }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <Button variant="link" className="p-0 me-3" onClick={() => setShowForgot(false)}>
                  <ArrowLeft size={24} />
                </Button>
                <h4 className="mb-0">Jelszó visszaállítása</h4>
              </div>
              <p className="text-muted">Add meg az email címedet, és küldünk egy linket.</p>
              <Form onSubmit={handleForgot}>
                <Form.Group className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text"><Mail size={18} /></span>
                    <Form.Control
                      type="email"
                      placeholder="email@pelda.hu"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>
                </Form.Group>
                <Button type="submit" variant="warning" className="w-100">Link küldése</Button>
              </Form>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LoginPage;