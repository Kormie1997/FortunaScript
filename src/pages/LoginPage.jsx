import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Modal } from 'react-bootstrap';
import { User, Lock, Mail, ArrowLeft, Sparkles, Loader2, Gem, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage = ({ onRegisterClick, onLogin }) => {
  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [showForgot, setShowForgot]     = useState(false);
  const [forgotEmail, setForgotEmail]   = useState('');
  const [forgotSent, setForgotSent]     = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Add meg a felhasználóneved és jelszavad!');
      return;
    }
    setIsLoading(true);
    const success = await onLogin({ username, password });
    if (success) {
      toast.success('Sikeres belépés! Üdv újra! 👋');
    } else {
      toast.error('Hibás felhasználónév vagy jelszó!');
    }
    setIsLoading(false);
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return toast.error('Add meg az email címed!');
    setForgotLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      if (response.ok) {
        setForgotSent(true);
      } else {
        toast.error('Hiba történt, próbáld újra!');
      }
    } catch {
      toast.error('Szerverhiba, próbáld újra később!');
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgot = () => {
    setShowForgot(false);
    setForgotSent(false);
    setForgotEmail('');
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #fff7ed, #ffedd5, #fef9c3)' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={5}>
            {/* Logo */}
            <div className="text-center mb-4">
              <div className="logo-box mx-auto mb-3">
                <Gem size={40} color="white" />
              </div>
              <h1 className="display-5 fw-bold">
                <span className="gradient-text">Fortuna</span>
                <span className="text-dark"> Lotto</span>
              </h1>
              <p className="text-muted d-flex align-items-center justify-content-center gap-2">
                <Sparkles size={16} className="text-warning" />
                A szerencse hozzád szól!
                <Sparkles size={16} className="text-warning" />
              </p>
            </div>

            {/* Kártya */}
            <Card className="border-0 rounded-4 overflow-hidden shadow-lg">
              <div className="card-top-bar" />
              <Card.Body className="p-4 p-md-5">
                <h3 className="text-center fw-bold mb-1">Bejelentkezés</h3>
                <p className="text-center text-muted mb-4 small">Add meg a felhasználóneved és jelszavad</p>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium small">Felhasználónév</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <User size={16} className="text-muted" />
                      </span>
                      <Form.Control
                        type="text"
                        placeholder="felhasznalonev"
                        className="border-start-0 ps-0"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        disabled={isLoading}
                        autoComplete="username"
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <Form.Label className="fw-medium small mb-0">Jelszó</Form.Label>
                      <Button variant="link" className="p-0 text-warning small text-decoration-none"
                        onClick={() => setShowForgot(true)}>
                        Elfelejtetted?
                      </Button>
                    </div>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <Lock size={16} className="text-muted" />
                      </span>
                      <Form.Control
                        type="password"
                        placeholder="••••••••"
                        className="border-start-0 ps-0"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        disabled={isLoading}
                        autoComplete="current-password"
                      />
                    </div>
                  </Form.Group>

                  <Button variant="warning" size="lg" className="w-100 fw-bold py-3 rounded-3"
                    type="submit" disabled={isLoading}>
                    {isLoading
                      ? <><Loader2 size={20} className="me-2 spin" />Bejelentkezés...</>
                      : 'Bejelentkezés'}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <span className="text-muted small">Még nincs fiókod? </span>
                  <Button variant="link" className="text-warning fw-bold p-0 small text-decoration-none"
                    onClick={onRegisterClick}>
                    Regisztrálj most
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Elfelejtett jelszó modal */}
      <Modal show={showForgot} onHide={closeForgot} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5">Jelszó visszaállítása</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2 pb-4 px-4">
          {!forgotSent ? (
            <>
              <p className="text-muted small mb-3">
                Add meg a regisztrált email címedet és küldünk egy visszaállítási linket.
              </p>
              <Form onSubmit={handleForgot}>
                <div className="input-group mb-3">
                  <span className="input-group-text bg-light border-end-0">
                    <Mail size={16} className="text-muted" />
                  </span>
                  <Form.Control
                    type="email"
                    placeholder="email@pelda.hu"
                    className="border-start-0 ps-0"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <Button type="submit" variant="warning" className="w-100 fw-bold" disabled={forgotLoading}>
                  {forgotLoading
                    ? <><Loader2 size={16} className="me-2 spin" />Küldés...</>
                    : 'Link küldése'}
                </Button>
              </Form>
            </>
          ) : (
            <div className="text-center py-3">
              <CheckCircle size={52} color="#16a34a" className="mb-3" />
              <h6 className="fw-bold mb-2">Email elküldve! 📧</h6>
              <p className="text-muted small mb-4">
                Ha a megadott email regisztrálva van, hamarosan megérkezik a visszaállítási link.
                <br /><strong>Nézd meg a spam mappát is!</strong>
              </p>
              <Button variant="outline-secondary" className="w-100" onClick={closeForgot}>
                Rendben
              </Button>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default LoginPage;