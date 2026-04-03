import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { User, Lock, Mail, ArrowLeft, Sparkles, Loader2, CheckCircle, Gem } from 'lucide-react';
import { toast } from 'sonner';

const RegisterPage = ({ onLoginClick, onRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('A jelszavak nem egyeznek!');
    }
    if (formData.password.length < 6) {
      return toast.error('A jelszónak legalább 6 karakter hosszúnak kell lennie!');
    }
    setIsLoading(true);
    const success = await onRegister({
      username: formData.username,
      email: formData.email,
      password: formData.password
    });
    if (success) setIsSuccess(true);
    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="min-vh-100 d-flex align-items-center bg-light">
        <Container>
          <Card className="mx-auto shadow" style={{ maxWidth: '420px' }}>
            <Card.Body className="text-center p-5">
              <CheckCircle size={80} className="text-success mx-auto mb-4" />
              <h3 className="fw-bold mb-2">Sikeres regisztráció!</h3>
              <p className="text-muted">Kérlek erősítsd meg az email címedet a kapott linkkel.</p>
              <Button variant="warning" size="lg" className="w-100 mt-4" onClick={onLoginClick}>
                Vissza a bejelentkezéshez
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

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
                <Sparkles size={18} /> Csatlakozz a nyertesekhez! <Sparkles size={18} />
              </p>
            </div>

            <Card className="border-0 rounded-4 overflow-hidden shadow">
              <div className="card-top-bar"></div>
              <Card.Body className="p-5">
                <div className="d-flex align-items-center mb-4">
                  <Button variant="link" className="p-0 me-3" onClick={onLoginClick}>
                    <ArrowLeft size={24} />
                  </Button>
                  <h3 className="mb-0">Regisztráció</h3>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Felhasználónév</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text"><User size={18} /></span>
                      <Form.Control name="username" type="text" placeholder="felhasznalonev"
                        value={formData.username} onChange={handleChange} required />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email cím</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text"><Mail size={18} /></span>
                      <Form.Control name="email" type="email" placeholder="email@pelda.hu"
                        value={formData.email} onChange={handleChange} required />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Jelszó</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text"><Lock size={18} /></span>
                      <Form.Control name="password" type="password" placeholder="••••••••"
                        value={formData.password} onChange={handleChange} required />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Jelszó megerősítése</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text"><Lock size={18} /></span>
                      <Form.Control name="confirmPassword" type="password" placeholder="••••••••"
                        value={formData.confirmPassword} onChange={handleChange} required />
                    </div>
                  </Form.Group>

                  <Button variant="warning" size="lg" className="w-100 fw-bold py-3"
                    type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <><Loader2 size={20} className="me-2 spin" />Regisztráció...</>
                    ) : 'Regisztráció'}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <span className="text-muted">Már van fiókod? </span>
                  <Button variant="link" className="text-warning fw-medium p-0" onClick={onLoginClick}>
                    Jelentkezz be
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RegisterPage;