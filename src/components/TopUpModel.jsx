import { useState } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import { CreditCard, Zap } from 'lucide-react';
import { toast } from 'sonner';

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

function TopUpModal({ show, onHide, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTopUp = async () => {
    const parsed = parseInt(amount);
    if (!parsed || parsed <= 0)
      return toast.error('Adj meg egy érvényes összeget!');

    setIsLoading(true);
    try {
      const response = await fetch('/api/balance/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: parsed })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Feltöltési hiba');
      }

      const data = await response.json();
      toast.success(`Sikeresen feltöltve! Új egyenleg: ${data.newBalance.toLocaleString()} Ft`);
      onSuccess?.(data.newBalance);
      setAmount('');
      onHide();
    } catch (err) {
      toast.error(err.message || 'Hiba történt a feltöltés során!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          <CreditCard size={22} className="me-2 text-success" />
          Egyenleg feltöltés
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 pb-4">
        {/* Gyors összegek */}
        <p className="text-muted small mb-2">Gyors választás:</p>
        <div className="d-flex flex-wrap gap-2 mb-3">
          {QUICK_AMOUNTS.map(q => (
            <Button
              key={q}
              variant={amount === String(q) ? 'warning' : 'outline-secondary'}
              size="sm"
              className="fw-medium"
              onClick={() => setAmount(String(q))}
            >
              {q.toLocaleString()} Ft
            </Button>
          ))}
        </div>

        {/* Egyéni összeg */}
        <Form.Group>
          <Form.Label className="fw-medium">Összeg</Form.Label>
          <InputGroup>
            <Form.Control
              type="number"
              min={1}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="pl. 5000"
              onKeyDown={e => e.key === 'Enter' && handleTopUp()}
            />
            <InputGroup.Text>Ft</InputGroup.Text>
          </InputGroup>
        </Form.Group>

        {amount && parseInt(amount) > 0 && (
          <div className="mt-3 p-3 bg-success bg-opacity-10 rounded-3 text-success fw-medium">
            <Zap size={16} className="me-1" />
            +{parseInt(amount).toLocaleString()} Ft kerül jóváírásra
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0 px-4">
        <Button variant="outline-secondary" onClick={onHide}>
          Mégse
        </Button>
        <Button
          variant="success"
          onClick={handleTopUp}
          disabled={isLoading || !amount || parseInt(amount) <= 0}
          className="fw-bold px-4"
        >
          {isLoading ? (
            <span className="spinner-border spinner-border-sm me-2" role="status" />
          ) : (
            <CreditCard size={16} className="me-2" />
          )}
          Feltöltés
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default TopUpModal;
