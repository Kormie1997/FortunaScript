import { useState } from 'react';
import { X, ShoppingCart, Trash2, Play } from 'lucide-react';
import { Button, Badge } from 'react-bootstrap';
import { toast } from 'sonner';

function Cart({ cart, onClose, onRemove, onClear, onCheckout, user }) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalPrice = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error('A kosár üres!');
    if (getTotalPrice() > (user?.balance || 0)) return toast.error('Nincs elegendő egyenleged!');

    setIsCheckingOut(true);
    try {
      await onCheckout();
      toast.success('Sikeres vásárlás!');
      onClose();
    } catch (err) {
      toast.error('Hiba történt a vásárlás során!');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
    >
      <div
        className="bg-white rounded-4 shadow d-flex flex-column w-100"
        style={{ maxWidth: '520px', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-warning bg-opacity-25 p-2 rounded-3">
              <ShoppingCart size={22} className="text-warning" />
            </div>
            <div>
              <h5 className="fw-bold mb-0">Kosár</h5>
              <small className="text-muted">{getTotalItems()} tétel</small>
            </div>
          </div>
          <Button variant="light" className="rounded-3" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        {/* Tételek */}
        <div className="flex-grow-1 overflow-auto p-3">
          {cart.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <ShoppingCart size={64} className="opacity-25 mb-3" />
              <p className="fs-5">A kosár üres</p>
              <small>Adj hozzá szelvényeket!</small>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {cart.map((item, index) => (
                <div key={index} className="bg-light rounded-3 p-3">
                  <div className="d-flex align-items-start justify-content-between gap-3">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <img src={item.gameLogo} alt={item.gameName} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                        <span className="fw-medium">{item.gameName}</span>
                      </div>
                      <p className="text-muted small mb-1">
                        {item.type === 'panel' && `Mező: ${item.numbers.join(', ')}`}
                        {item.type === 'joker' && `Joker: ${item.numbers}`}
                        {item.type === 'extra' && `Gépi: ${item.numbers.join(', ')}`}
                      </p>
                      <small className="text-muted">{item.price} Ft × {item.quantity}</small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold">{(item.price * item.quantity).toLocaleString()} Ft</span>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="rounded-3"
                        onClick={() => onRemove(index)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-top p-3">
            <div className="d-flex justify-content-between mb-1 small text-muted">
              <span>Egyenleged:</span>
              <span className="fw-medium text-dark">{(user?.balance || 0).toLocaleString()} Ft</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-muted">Összesen:</span>
              <span className="fs-4 fw-bold text-warning">{getTotalPrice().toLocaleString()} Ft</span>
            </div>

            {getTotalPrice() > (user?.balance || 0) && (
              <p className="text-danger small text-center mb-2">Nincs elegendő egyenleged!</p>
            )}

            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                className="flex-grow-1"
                onClick={onClear}
              >
                <Trash2 size={16} className="me-1" /> Törlés
              </Button>
              <Button
                variant="warning"
                className="flex-grow-1 fw-bold"
                onClick={handleCheckout}
                disabled={isCheckingOut || getTotalPrice() > (user?.balance || 0)}
              >
                {isCheckingOut ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                ) : (
                  <Play size={16} className="me-1" />
                )}
                Fizetés
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;