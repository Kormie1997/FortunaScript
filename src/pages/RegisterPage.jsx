import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Modal } from 'react-bootstrap';
import { User, Lock, Mail, ArrowLeft, Sparkles, Loader2, CheckCircle, Gem } from 'lucide-react';
import { toast } from 'sonner';

const RegisterPage = ({ onLoginClick, onRegister }) => {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: ''
  });
  const [isLoading, setIsLoading]       = useState(false);
  const [showSuccess, setShowSuccess]   = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.username.length < 3) {
      return toast.error('A felhasználónévnek legalább 3 karakter hosszúnak kell lennie!');
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error('A jelszavak nem egyeznek!');
    }
    if (formData.password.length < 6) {
      return toast.error('A jelszónak legalább 6 karakter hosszúnak kell lennie!');
    }

    setIsLoading(true);
    const success = await onRegister({
      username: formData.username,
      email:    formData.email,
      password: formData.password
    });

    if (success) {
      setShowSuccess(true);
    }
    setIsLoading(false);
  };

  const passwordsMatch = formData.confirmPassword &&
    formData.password === formData.confirmPassword;

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
                Csatlakozz a nyertesekhez!
                <Sparkles size={16} className="text-warning" />
              </p>
            </div>

            {/* Kártya */}
            <Card className="border-0 rounded-4 overflow-hidden shadow-lg">
              <div className="card-top-bar" />
              <Card.Body className="p-4 p-md-5">
                <div className="d-flex align-items-center mb-3">
                  <Button variant="link" className="p-0 me-3 text-muted" onClick={onLoginClick}>
                    <ArrowLeft size={22} />
                  </Button>
                  <h3 className="fw-bold mb-0">Regisztráció</h3>
                </div>
                <p className="text-muted small mb-4">Hozz létre egy új fiókot</p>

                <Form onSubmit={handleSubmit}>
                  {/* Felhasználónév */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium small">Felhasználónév</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <User size={16} className="text-muted" />
                      </span>
                      <Form.Control
                        name="username" type="text"
                        placeholder="felhasznalonev"
                        className="border-start-0 ps-0"
                        value={formData.username}
                        onChange={handleChange}
                        autoComplete="username"
                        required
                      />
                    </div>
                  </Form.Group>

                  {/* Email */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium small">Email cím</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <Mail size={16} className="text-muted" />
                      </span>
                      <Form.Control
                        name="email" type="email"
                        placeholder="email@pelda.hu"
                        className="border-start-0 ps-0"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        required
                      />
                    </div>
                  </Form.Group>

                  {/* Jelszó */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium small">Jelszó</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <Lock size={16} className="text-muted" />
                      </span>
                      <Form.Control
                        name="password" type="password"
                        placeholder="••••••••"
                        className="border-start-0 ps-0"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                      />
                    </div>
                    {formData.password && formData.password.length < 6 && (
                      <small className="text-danger">Legalább 6 karakter szükséges</small>
                    )}
                  </Form.Group>

                  {/* Jelszó megerősítése */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium small">Jelszó megerősítése</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <Lock size={16} className="text-muted" />
                      </span>
                      <Form.Control
                        name="confirmPassword" type="password"
                        placeholder="••••••••"
                        className={`border-start-0 ps-0 ${formData.confirmPassword ? (passwordsMatch ? 'is-valid' : 'is-invalid') : ''}`}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                      />
                      {formData.confirmPassword && !passwordsMatch && (
                        <div className="invalid-feedback">A jelszavak nem egyeznek</div>
                      )}
                    </div>
                  </Form.Group>

                  <Button variant="warning" size="lg" className="w-100 fw-bold py-3 rounded-3"
                    type="submit" disabled={isLoading}>
                    {isLoading
                      ? <><Loader2 size={20} className="me-2 spin" />Regisztráció...</>
                      : 'Regisztráció'}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <span className="text-muted small">Már van fiókod? </span>
                  <Button variant="link" className="text-warning fw-bold p-0 small text-decoration-none"
                    onClick={onLoginClick}>
                    Jelentkezz be
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/*Sikeres regisztráció modal */}
      <Modal show={showSuccess} onHide={() => {}} centered backdrop="static">
        <Modal.Body className="text-center p-5">
          <div className="mb-4">
            <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #16a34a, #15803d)' }}>
              <CheckCircle size={44} color="white" />
            </div>
          </div>
          <h4 className="fw-bold mb-2">Sikeres regisztráció! 🎉</h4>
          <p className="text-muted mb-2">
            Üdvözlünk a Fortuna Script családjában, <strong>{formData.username}</strong>!
          </p>
          <p className="text-muted small mb-4">
            Küldtünk egy megerősítő emailt a <strong>{formData.email}</strong> címre.
            Kattints a linkre az email megerősítéséhez, majd már be is léphetsz!
          </p>
          <div className="p-3 rounded-3 mb-4" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <p className="text-success small mb-0">
              📧 Nézd meg a spam mappát is, ha nem érkezik meg pár percen belül!
            </p>
          </div>
          <Button variant="warning" size="lg" className="w-100 fw-bold rounded-3"
            onClick={onLoginClick}>
            Bejelentkezés →
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default RegisterPage;