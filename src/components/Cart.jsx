import { useState } from 'react';
import { X, ShoppingCart, Trash2, Play, AlertCircle } from 'lucide-react';
import { Button, Badge, Alert } from 'react-bootstrap';
import { toast } from 'sonner';

function Cart({ cart, onClose, onRemove, onClear, onCheckout, user }) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [backendErrors, setBackendErrors] = useState([]);
  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalPrice = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const validateCart = () => {
    if (cart.length === 0) {
      toast.error('A kosár üres!');
      return false;
    }

    const totalPrice = getTotalPrice();

    if (totalPrice <= 0) {
      toast.error('Érvénytelen végösszeg!');
      return false;
    }

    if (totalPrice > (user?.balance || 0)) {
      toast.error(`Nincs elegendő egyenleg! Szükséges: ${totalPrice.toLocaleString()} Ft, rendelkezésre áll: ${(user?.balance || 0).toLocaleString()} Ft`);
      return false;
    }

    // Minden item ellenőrzése
    for (const item of cart) {
      if (!item.gameName) {
        toast.error('Érvénytelen szelvény: hiányzó játéknév');
        return false;
      }
      if (item.price <= 0) {
        toast.error(`Érvénytelen ár: ${item.gameName}`);
        return false;
      }
      if (item.quantity <= 0 || item.quantity > 20) {
        toast.error(`Érvénytelen mennyiség: ${item.gameName}`);
        return false;
      }
      if (item.type === 'panel' && (!item.numbers || item.numbers.length === 0)) {
        toast.error(`Hiányzó számok: ${item.gameName}`);
        return false;
      }
      if (item.type === 'joker' && (!item.numbers || item.numbers.length !== 6)) {
        toast.error('Joker: pontosan 6 számjegy szükséges!');
        return false;
      }
    }

    return true;
  };

  const handleCheckout = async () => {
    setBackendErrors([]);

    // ✅ Frontend validáció először
    if (!validateCart()) return;

    setIsCheckingOut(true);
    try {
      await onCheckout();
      toast.success('Sikeres vásárlás! 🎉');
      onClose();
    } catch (err) {
      const message = err.message || 'Hiba történt a vásárlás során!';

      if (err.errors && Array.isArray(err.errors)) {
        setBackendErrors(err.errors);
        toast.error('Validációs hiba — nézd meg a részleteket!');
      } else {
        toast.error(message);
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  const insufficientBalance = getTotalPrice() > (user?.balance || 0);

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
          {backendErrors.length > 0 && (
            <Alert variant="danger" className="mb-3">
              <div className="fw-bold mb-2">
                <AlertCircle size={16} className="me-1" />
                Vásárlási hibák:
              </div>
              <ul className="mb-0 ps-3">
                {backendErrors.map((err, i) => (
                  <li key={i} className="small">{err}</li>
                ))}
              </ul>
            </Alert>
          )}

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
                        {item.gameLogo && (
                          <img
                            src={item.gameLogo}
                            alt={item.gameName}
                            style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                          />
                        )}
                        <span className="fw-medium">{item.gameName}</span>
                        <Badge bg={
                          item.type === 'panel' ? 'primary' :
                          item.type === 'joker' ? 'danger' : 'success'
                        } className="small">
                          {item.type === 'panel' ? 'Mező' : item.type === 'joker' ? 'Joker' : 'Gépi'}
                        </Badge>
                      </div>
                      <p className="text-muted small mb-1">
                        {item.type === 'panel' && Array.isArray(item.numbers) && `🔢 ${item.numbers.join(', ')}`}
                        {item.type === 'joker' && `🃏 ${item.numbers}`}
                        {item.type === 'extra' && Array.isArray(item.numbers) && `🤖 ${item.numbers.join(', ')}`}
                      </p>
                      <small className="text-muted">{item.price.toLocaleString()} Ft × {item.quantity}</small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold">{(item.price * item.quantity).toLocaleString()} Ft</span>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="rounded-3"
                        onClick={() => {
                          onRemove(index);
                          setBackendErrors([]);
                        }}
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
              <span className={`fw-medium ${insufficientBalance ? 'text-danger' : 'text-dark'}`}>
                {(user?.balance || 0).toLocaleString()} Ft
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted">Összesen:</span>
              <span className={`fs-4 fw-bold ${insufficientBalance ? 'text-danger' : 'text-success'}`}>
                {getTotalPrice().toLocaleString()} Ft
              </span>
            </div>

            {insufficientBalance && (
              <Alert variant="danger" className="py-2 px-3 mb-2 small">
                <AlertCircle size={14} className="me-1" />
                Hiányzó egyenleg: <strong>{(getTotalPrice() - (user?.balance || 0)).toLocaleString()} Ft</strong>
              </Alert>
            )}

            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                className="flex-grow-1"
                onClick={() => { onClear(); setBackendErrors([]); }}
                disabled={isCheckingOut}
              >
                <Trash2 size={16} className="me-1" /> Törlés
              </Button>
              <Button
                variant="danger"
                className="flex-grow-1 fw-bold"
                onClick={handleCheckout}
                disabled={isCheckingOut || insufficientBalance}
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
