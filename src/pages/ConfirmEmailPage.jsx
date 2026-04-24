import { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';

function ConfirmEmailPage({ onGoToLogin }) {
  const [status, setStatus]   = useState('loading');
  const [message, setMessage] = useState('');
  const calledRef             = useRef(false); 

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    const userId = params.get('userId');

    if (!token || !userId) {
      setStatus('invalid');
      setMessage('Érvénytelen megerősítő link.');
      return;
    }

    fetch(`/api/auth/confirm-email?userId=${userId}&token=${token}`)
      .then(async res => {
        const text = await res.text();
        if (res.ok) {
          setStatus('success');
          setMessage('Email sikeresen megerősítve! Most már bejelentkezhetsz.');
        } else {
          setStatus('error');
          setMessage(text || 'Érvénytelen vagy lejárt token.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Szerverhiba — próbáld újra később.');
      });
  }, []);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: 'linear-gradient(135deg, #fff7ed, #ffedd5, #fef9c3)' }}>
      <div className="bg-white rounded-4 shadow-lg p-5 text-center" style={{ maxWidth: '440px', width: '100%' }}>

        {/* Logo */}
        <div className="mb-4">
          <div>
            <img src="public/images/fslogo.png" style={{width: '300px'}} alt="" />
          </div>
        </div>

        {status === 'loading' && (
          <>
            <div className="d-flex justify-content-center mb-3">
              <div className="spinner-border text-warning" style={{ width: '48px', height: '48px' }} role="status" />
            </div>
            <h5 className="fw-bold mb-2">Email megerősítése...</h5>
            <p className="text-muted">Kérjük várjon!</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="d-flex justify-content-center mb-3">
              <CheckCircle size={64} color="#16a34a" />
            </div>
            <h5 className="fw-bold mb-2 text-success">Sikeres megerősítés! 🎉</h5>
            <p className="text-muted mb-4">{message}</p>
            <button
              className="btn fw-bold px-5 py-2 text-white w-100"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', border: 'none', borderRadius: '12px' }}
              onClick={onGoToLogin}
            >
              Bejelentkezés
            </button>
          </>
        )}

        {(status === 'error' || status === 'invalid') && (
          <>
            <div className="d-flex justify-content-center mb-3">
              <XCircle size={64} color="#dc2626" />
            </div>
            <h5 className="fw-bold mb-2 text-danger">Hiba történt</h5>
            <p className="text-muted mb-4">{message}</p>
            <button
              className="btn btn-outline-secondary w-100 fw-bold"
              style={{ borderRadius: '12px' }}
              onClick={onGoToLogin}
            >
              Vissza a bejelentkezéshez
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ConfirmEmailPage;