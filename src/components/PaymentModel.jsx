import { useState, useRef, useEffect } from 'react';
import { Modal as Model, Button, Row, Col, Form, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'sonner';
import { CreditCard, Lock, CheckCircle, XCircle, Loader } from 'lucide-react';

//Tesztkártyák
const TEST_CARDS = {
  '4111111111111111': { brand: 'visa', name: 'Visa teszt', success: true },
  '4242424242424242': { brand: 'visa', name: 'Visa teszt 2', success: true },
  '5555555555554444': { brand: 'mastercard', name: 'Mastercard teszt', success: true },
  '5105105105105100': { brand: 'mastercard', name: 'Mastercard teszt 2', success: true },
  '4000000000000002': { brand: 'visa', name: 'Visa - Elutasított', success: false },
  '5200828282828210': { brand: 'mastercard', name: 'MC - Elutasított', success: false },
};

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

//Gyors kitöltés két kártyával
const QUICK_FILL_CARDS = [
  { id: 'visa', name: 'Visa teszt', cardNumber: '4111 1111 1111 1111', brand: 'visa', variant: 'primary' },
  { id: 'mastercard', name: 'Mastercard teszt', cardNumber: '5555 5555 5555 4444', brand: 'mastercard', variant: 'danger' }
];

const detectBrand = (number) => {
  const clean = number.replace(/\s/g, '');
  if (clean.startsWith('4')) return 'visa';
  if (clean.startsWith('5')) return 'mastercard';
  return null;
};

const formatCardNumber = (value) => {
  const clean = value.replace(/\D/g, '').slice(0, 16);
  return clean.match(/.{1,4}/g)?.join(' ') || clean;
};

const formatExpiry = (value) => {
  const clean = value.replace(/\D/g, '').slice(0, 4);
  if (clean.length >= 2) return clean.slice(0, 2) + '/' + clean.slice(2);
  return clean;
};

function PaymentModel({ show, onHide, onSuccess }) {
  const [step, setStep] = useState('amount');
  const [amount, setAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [selectedQuickCard, setSelectedQuickCard] = useState(null);
  const abortControllerRef = useRef(null);

  const brand = detectBrand(cardNumber);

  //Állapotok visszaállítása, amikor a modal bezárul
  useEffect(() => {
    if (!show) {
      // Kis késleltetéssel, hogy a bezárási animáció lefusson
      const timer = setTimeout(() => {
        setStep('amount');
        setAmount('');
        setCardNumber('');
        setCardName('');
        setExpiry('');
        setCvv('');
        setErrors({});
        setProcessing(false);
        setSelectedQuickCard(null);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [show]);

  //Egyszerűsített handleClose - csak bezár
  const handleClose = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    onHide();
  };

  const validateAmount = () => {
    const parsed = parseInt(amount);
    if (!parsed || parsed < 100) {
      setErrors({ amount: 'Minimum 100 Ft szükséges' });
      return false;
    }
    return true;
  };

  //Gyors kitöltés függvény kijelöléssel
  const handleQuickFill = (card) => {
    // Ha ugyanazt a kártyát választjuk ki, töröljük a kijelölést és az adatokat
    if (selectedQuickCard === card.id) {
      setSelectedQuickCard(null);
      setCardNumber('');
      setCardName('');
      setExpiry('');
      setCvv('');
    } else {
      // Egyébként töltsük ki az adatokat
      setSelectedQuickCard(card.id);
      setCardNumber(card.cardNumber);
      setCardName('TESZT FELHASZNÁLÓ');
      setExpiry('12/28');
      setCvv('123');
    }
    setErrors(prev => ({ ...prev, cardNumber: null, cardName: null, expiry: null, cvv: null }));
  };

  const validateCardNumber = (number) => {
    const clean = number.replace(/\s/g, '');
    if (clean.length === 16) {
      const testCard = TEST_CARDS[clean];
      if (testCard && !testCard.success) {
        setErrors(prev => ({ ...prev, cardNumber: 'Ez a kártya elutasításra van állítva' }));
        return false;
      }
    }
    return true;
  };

  const validateCard = () => {
    const newErrors = {};
    const clean = cardNumber.replace(/\s/g, '');

    if (clean.length !== 16) newErrors.cardNumber = 'Érvénytelen kártyaszám';
    if (!cardName.trim() || cardName.trim().length < 3) newErrors.cardName = 'Add meg a kártyabirtokos nevét';

    const [month, year] = expiry.split('/');
    const now = new Date();
    const expMonth = parseInt(month);
    const expYear = parseInt('20' + year);
    if (!month || !year || expMonth < 1 || expMonth > 12 ||
        expYear < now.getFullYear() ||
        (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
      newErrors.expiry = 'Érvénytelen lejárati dátum';
    }

    if (cvv.length < 3 || cvv.length > 4) newErrors.cvv = 'CVV: 3 vagy 4 számjegy';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePay = async () => {
    if (!validateCard()) return;

    setStep('processing');
    setProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const clean = cardNumber.replace(/\s/g, '');
    const card = TEST_CARDS[clean];
    const isSuccess = card ? card.success : Math.random() > 0.2;

    if (isSuccess) {
      abortControllerRef.current = new AbortController();
      const timeoutId = setTimeout(() => abortControllerRef.current.abort(), 15000);

      try {
        const response = await fetch('/api/balance/topup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ amount: parseInt(amount) }),
          signal: abortControllerRef.current.signal
        });

        clearTimeout(timeoutId);
        abortControllerRef.current = null;

        if (!response.ok) throw new Error();
        const data = await response.json();
        setStep('success');
        onSuccess?.(data.newBalance);
      } catch (error) {
        clearTimeout(timeoutId);
        abortControllerRef.current = null;
        if (error.name === 'AbortError') {
          toast.error('A szerver nem válaszol, próbáld újra később');
          setStep('card');
        } else {
          setStep('failed');
        }
      } finally {
        setProcessing(false);
      }
    } else {
      setProcessing(false);
      setStep('failed');
    }
  };

  //Stílusok a kártya brandhez
  const cardGradient = brand === 'mastercard'
    ? 'bg-danger'
    : 'bg-primary';

  return (
    <Model show={show} onHide={step !== 'processing' ? handleClose : undefined} centered size="md">
      <Model.Body className="p-0">
        <style>{`
          .card-preview {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          .quick-card-btn-active {
            background: linear-gradient(135deg, #f59e0b, #ea580c) !important;
            border-color: #f59e0b !important;
            color: white !important;
          }
        `}</style>

        {/*Összeg*/}
        {step === 'amount' && (
          <>
            <div className="bg-dark text-white p-4">
              <div className="d-flex align-items-center gap-2 mb-1">
                <CreditCard size={20} />
                <span className="fw-bold fs-5">Egyenleg feltöltés</span>
              </div>
              <p className="text-white-50 small mb-0">Biztonságos bankkártyás fizetés</p>
            </div>

            <div className="p-4">
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted small">Gyors választás</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {QUICK_AMOUNTS.map(q => (
                    <Button
                      key={q}
                      variant={amount === String(q) ? "warning" : "outline-secondary"}
                      size="sm"
                      onClick={() => setAmount(String(q))}
                      className="rounded-pill px-3"
                    >
                      {q.toLocaleString()} Ft
                    </Button>
                  ))}
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Egyéni összeg</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type="number"
                    size="lg"
                    placeholder="pl. 15 000"
                    value={amount}
                    isInvalid={!!errors.amount}
                    onChange={e => { setAmount(e.target.value); setErrors({}); }}
                    onKeyDown={e => e.key === 'Enter' && validateAmount() && setStep('card')}
                  />
                  <span className="input-group-text fw-bold">Ft</span>
                  <Form.Control.Feedback type="invalid">{errors.amount}</Form.Control.Feedback>
                </div>
              </Form.Group>

              {/* Tesztkártyák */}
              <Alert variant="success" className="small mb-3">
                <div className="fw-bold mb-1">🧪 Tesztkártyák:</div>
                <div>✅ Sikeres: <code>4111 1111 1111 1111</code> vagy <code>5555 5555 5555 4444</code></div>
                <div>❌ Elutasított: <code>4000 0000 0000 0002</code></div>
              </Alert>

              {/*Gyors kitöltés - kijelölhető gombok */}
              <div className="mb-4">
                <small className="text-muted">⚡ Gyors kitöltés (kattints a kiválasztáshoz):</small>
                <div className="d-flex gap-2 mt-1">
                  {QUICK_FILL_CARDS.map(card => (
                    <Button
                      key={card.id}
                      size="sm"
                      variant={selectedQuickCard === card.id ? "warning" : `outline-${card.variant}`}
                      className={`fw-semibold ${selectedQuickCard === card.id ? 'quick-card-btn-active' : ''}`}
                      onClick={() => handleQuickFill(card)}
                    >
                      {selectedQuickCard === card.id && '✓ '}
                      {card.name}
                    </Button>
                  ))}
                </div>
                {selectedQuickCard && (
                  <div className="mt-2 small text-muted">
                    ✨ A(z) "{QUICK_FILL_CARDS.find(c => c.id === selectedQuickCard)?.name}" kártya beállítva
                  </div>
                )}
              </div>

              <div className="d-flex gap-2">
                <Button variant="outline-secondary" className="flex-grow-1" onClick={handleClose}>
                  Mégse
                </Button>
                <Button
                  variant="warning"
                  className="flex-grow-1 fw-semibold"
                  onClick={() => validateAmount() && setStep('card')}
                >
                  Tovább → {amount ? `${parseInt(amount).toLocaleString()} Ft` : ''}
                </Button>
              </div>
            </div>
          </>
        )}

        {/*Kártya adatok*/}
        {step === 'card' && (
          <>
            <div className={`${cardGradient} p-4`}>
              {/* Kártya preview */}
              <div className="card-preview">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div className="small text-white-50 text-uppercase tracking-wide">
                    {brand === 'mastercard' ? 'Mastercard' : brand === 'visa' ? 'Visa' : 'Bankkártya'}
                  </div>
                  <div className="fs-4">
                    {brand === 'mastercard' ? '🔴🟠' : brand === 'visa' ? '💳' : '💳'}
                  </div>
                </div>
                <div className="fs-5 mb-3 font-monospace" style={{ letterSpacing: '2px', opacity: cardNumber ? 1 : 0.5 }}>
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>
                <Row>
                  <Col>
                    <div className="small text-white-50 text-uppercase">Kártyabirtokos</div>
                    <div className="small fw-semibold" style={{ opacity: cardName ? 1 : 0.5 }}>
                      {cardName.toUpperCase() || 'TELJES NÉV'}
                    </div>
                  </Col>
                  <Col>
                    <div className="small text-white-50 text-uppercase">Lejárat</div>
                    <div className="small fw-semibold" style={{ opacity: expiry ? 1 : 0.5 }}>
                      {expiry || 'HH/ÉÉ'}
                    </div>
                  </Col>
                  <Col className="text-end">
                    <div className="small text-white-50">Összeg</div>
                    <div className="fw-bold">{parseInt(amount).toLocaleString()} Ft</div>
                  </Col>
                </Row>
              </div>
            </div>

            <div className="p-4">
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small">Kártyaszám</Form.Label>
                <Form.Control
                  type="text"
                  inputMode="numeric"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  isInvalid={!!errors.cardNumber}
                  aria-label="Kártyaszám"
                  aria-invalid={!!errors.cardNumber}
                  onChange={e => {
                    const formatted = formatCardNumber(e.target.value);
                    setCardNumber(formatted);
                    setErrors(prev => ({ ...prev, cardNumber: null }));
                    validateCardNumber(formatted);
                    // Ha kézzel módosítják, töröljük a kijelölést
                    if (selectedQuickCard) setSelectedQuickCard(null);
                  }}
                  maxLength={19}
                />
                <Form.Control.Feedback type="invalid">{errors.cardNumber}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small">Kártyabirtokos neve</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Kovács János"
                  value={cardName}
                  isInvalid={!!errors.cardName}
                  onChange={e => {
                    setCardName(e.target.value);
                    setErrors(prev => ({ ...prev, cardName: null }));
                    if (selectedQuickCard) setSelectedQuickCard(null);
                  }}
                />
                <Form.Control.Feedback type="invalid">{errors.cardName}</Form.Control.Feedback>
              </Form.Group>

              <Row className="g-3 mb-4">
                <Col xs={6}>
                  <Form.Label className="fw-semibold small">Lejárat</Form.Label>
                  <Form.Control
                    type="text"
                    inputMode="numeric"
                    placeholder="HH/ÉÉ"
                    value={expiry}
                    isInvalid={!!errors.expiry}
                    onChange={e => {
                      setExpiry(formatExpiry(e.target.value));
                      setErrors(prev => ({ ...prev, expiry: null }));
                      if (selectedQuickCard) setSelectedQuickCard(null);
                    }}
                    maxLength={5}
                  />
                  <Form.Control.Feedback type="invalid">{errors.expiry}</Form.Control.Feedback>
                </Col>
                <Col xs={6}>
                  <Form.Label className="fw-semibold small">CVV</Form.Label>
                  <Form.Control
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    placeholder="•••"
                    value={cvv}
                    isInvalid={!!errors.cvv}
                    onChange={e => {
                      setCvv(e.target.value.replace(/\D/g, '').slice(0, 4));
                      setErrors(prev => ({ ...prev, cvv: null }));
                      if (selectedQuickCard) setSelectedQuickCard(null);
                    }}
                    maxLength={4}
                  />
                  <Form.Control.Feedback type="invalid">{errors.cvv}</Form.Control.Feedback>
                </Col>
              </Row>

              <div className="d-flex align-items-center gap-2 mb-3 text-muted small">
                <Lock size={14} />
                <span>256-bites SSL titkosítás — adataid biztonságban vannak</span>
              </div>

              <div className="d-flex gap-2">
                <Button variant="outline-secondary" onClick={() => setStep('amount')} disabled={processing}>
                  ← Vissza
                </Button>
                <Button
                  variant="success"
                  className="flex-grow-1 fw-semibold py-2"
                  onClick={handlePay}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Spinner as="span" size="sm" animation="border" className="me-2" />
                      Feldolgozás...
                    </>
                  ) : (
                    <>
                      <Lock size={16} className="me-2" />
                      Fizetés: {parseInt(amount).toLocaleString()} Ft
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {/*Feldolgozás*/}
        {step === 'processing' && (
          <div className="text-center py-5 px-4">
            <div className="bg-warning bg-gradient rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
              <Spinner animation="border" variant="light" style={{ width: '36px', height: '36px' }} />
            </div>
            <h5 className="fw-bold mb-2">Fizetés feldolgozása...</h5>
            <p className="text-muted">Kérjük várjon, ne zárja be az ablakot</p>
            <div className="d-flex justify-content-center gap-2 mt-3">
              {['Azonosítás', 'Ellenőrzés', 'Jóváírás'].map(s => (
                <span key={s} className="badge bg-light text-dark">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/*Sikeres vásárlás*/}
        {step === 'success' && (
          <div className="text-center py-5 px-4">
            <div className="bg-success bg-gradient rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '80px', height: '80px', animation: 'pulse 0.5s ease' }}>
              <CheckCircle size={40} color="white" />
            </div>
            <h4 className="fw-bold mb-2">Sikeres fizetés! 🎉</h4>
            <p className="text-muted mb-1">
              <strong>{parseInt(amount).toLocaleString()} Ft</strong> jóváírva az egyenlegedre
            </p>
            <p className="text-muted small mb-4">
              Kártya: •••• •••• •••• {cardNumber.replace(/\s/g, '').slice(-4)}
            </p>
            <Button variant="success" className="fw-bold px-5" onClick={handleClose}>
              Bezárás
            </Button>
          </div>
        )}

        {/*Hiba*/}
        {step === 'failed' && (
          <div className="text-center py-5 px-4">
            <div className="bg-danger bg-gradient rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
              <XCircle size={40} color="white" />
            </div>
            <h4 className="fw-bold mb-2">Fizetés elutasítva</h4>
            <p className="text-muted mb-4">
              A kártya ellenőrzése sikertelen. Ellenőrizze az adatokat vagy próbáljon másik kártyával.
            </p>
            <div className="d-flex gap-2 justify-content-center">
              <Button variant="outline-secondary" onClick={handleClose}>Mégse</Button>
              <Button variant="warning" className="fw-bold" onClick={() => { setStep('card'); setErrors({}); }}>
                Próbálja újra
              </Button>
            </div>
          </div>
        )}

      </Model.Body>
    </Model>
  );
}

export default PaymentModel;