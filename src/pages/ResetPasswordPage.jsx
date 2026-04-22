import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Lock, CheckCircle, XCircle, Eye, EyeOff, Gem, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function ResetPasswordPage({ onGoToLogin }) {
  const [token, setToken]                     = useState('');
  const [userId, setUserId]                   = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [isLoading, setIsLoading]             = useState(false);
  const [status, setStatus]                   = useState('form');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    const u = params.get('userId');
    if (!t || !u) {
      setStatus('invalid');
    } else {
      setToken(t);
      setUserId(u);
    }
  }, []);

  const getPasswordStrength = (pwd) => {
    if (!pwd) return null;
    if (pwd.length < 6) return { label: 'Túl rövid', color: '#dc2626', width: '20%' };
    if (pwd.length < 8) return { label: 'Gyenge',    color: '#ea580c', width: '40%' };
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd))
      return { label: 'Közepes', color: '#f59e0b', width: '65%' };
    return { label: 'Erős', color: '#16a34a', width: '100%' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('A jelszónak legalább 6 karakter hosszúnak kell lennie!');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('A két jelszó nem egyezik!');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          userId:          parseInt(userId),
          newPassword,
          confirmPassword
        })
      });
      if (response.ok) {
        setStatus('success');
      } else {
        const data = await response.json().catch(() => ({}));
        toast.error(data.message || 'Érvénytelen vagy lejárt link!');
        setStatus('error');
      }
    } catch {
      toast.error('Szerverhiba — próbáld újra később!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center"
      style={{ background: 'linear-gradient(135deg, #fff7ed, #ffedd5, #fef9c3)' }}>
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
                <span className="text-dark">Lotto</span>
              </h1>
              <p className="text-muted d-flex align-items-center justify-content-center gap-2">
                <Sparkles size={16} className="text-warning" />
                Jelszó visszaállítása
                <Sparkles size={16} className="text-warning" />
              </p>
            </div>

            <Card className="border-0 rounded-4 overflow-hidden shadow-lg">
              <div className="card-top-bar" />
              <Card.Body className="p-4 p-md-5">

                {/* Érvénytelen link */}
                {status === 'invalid' && (
                  <div className="text-center py-2">
                    <XCircle size={56} color="#dc2626" className="mb-3" />
                    <h5 className="fw-bold text-danger mb-2">Érvénytelen link</h5>
                    <p className="text-muted mb-4">
                      Ez a jelszó visszaállítási link érvénytelen vagy lejárt.
                    </p>
                    <Button variant="warning" className="w-100 fw-bold" onClick={onGoToLogin}>
                      Vissza a bejelentkezéshez
                    </Button>
                  </div>
                )}

                {/* Form */}
                {status === 'form' && (
                  <>
                    <h4 className="fw-bold text-center mb-1">Új jelszó beállítása</h4>
                    <p className="text-muted text-center small mb-4">Add meg az új jelszavadat</p>

                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-medium small">Új jelszó</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <Lock size={16} className="text-muted" />
                          </span>
                          <Form.Control
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="border-start-0 border-end-0 ps-0"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            autoComplete="new-password"
                            required
                          />
                          <button type="button"
                            className="input-group-text bg-light border-start-0"
                            onClick={() => setShowPassword(!showPassword)}>
                            {showPassword
                              ? <EyeOff size={16} className="text-muted" />
                              : <Eye size={16} className="text-muted" />}
                          </button>
                        </div>
                        {/* Jelszó erősség */}
                        {strength && (
                          <div className="mt-2">
                            <div className="d-flex justify-content-between mb-1">
                              <small className="text-muted">Jelszó erőssége</small>
                              <small style={{ color: strength.color, fontWeight: 600 }}>{strength.label}</small>
                            </div>
                            <div className="rounded-pill overflow-hidden" style={{ height: '6px', background: '#e5e7eb' }}>
                              <div style={{ width: strength.width, height: '100%', background: strength.color, transition: 'width 0.3s' }} />
                            </div>
                          </div>
                        )}
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-medium small">Jelszó megerősítése</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <Lock size={16} className="text-muted" />
                          </span>
                          <Form.Control
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className={`border-start-0 ps-0 ${confirmPassword && confirmPassword !== newPassword ? 'is-invalid' : confirmPassword && confirmPassword === newPassword ? 'is-valid' : ''}`}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                            required
                          />
                          {confirmPassword && confirmPassword !== newPassword && (
                            <div className="invalid-feedback">A jelszavak nem egyeznek</div>
                          )}
                        </div>
                      </Form.Group>

                      <Button variant="warning" size="lg" className="w-100 fw-bold py-3 rounded-3"
                        type="submit" disabled={isLoading}>
                        {isLoading
                          ? <><Loader2 size={20} className="me-2 spin" />Mentés...</>
                          : <><Lock size={18} className="me-2" />Jelszó mentése</>}
                      </Button>
                    </Form>
                  </>
                )}

                {/* Siker */}
                {status === 'success' && (
                  <div className="text-center py-2">
                    <CheckCircle size={56} color="#16a34a" className="mb-3" />
                    <h5 className="fw-bold text-success mb-2">Jelszó megváltoztatva! 🎉</h5>
                    <p className="text-muted mb-4">
                      Az új jelszavaddal már be tudsz jelentkezni.
                    </p>
                    <Button variant="warning" className="w-100 fw-bold" onClick={onGoToLogin}>
                      Bejelentkezés →
                    </Button>
                  </div>
                )}

                {/* Hiba */}
                {status === 'error' && (
                  <div className="text-center py-2">
                    <XCircle size={56} color="#dc2626" className="mb-3" />
                    <h5 className="fw-bold text-danger mb-2">Lejárt link</h5>
                    <p className="text-muted mb-4">
                      Ez a link már nem érvényes. Kérj új jelszó visszaállítási emailt.
                    </p>
                    <Button variant="warning" className="w-100 fw-bold" onClick={onGoToLogin}>
                      Vissza a bejelentkezéshez
                    </Button>
                  </div>
                )}

              </Card.Body>
            </Card>

          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ResetPasswordPage;