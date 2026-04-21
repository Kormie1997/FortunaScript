import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Tabs, Tab, Alert, Spinner } from 'react-bootstrap';
import { LogOut, User, Ticket, History, Settings, CreditCard, Edit3, Lock, Mail, CheckCircle, XCircle, RefreshCw, Shield } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import PaymentModel from '../components/PaymentModel';

const AccountPage = ({ user, onLogout, onBalanceUpdate }) => {
  const [activeTab, setActiveTab]           = useState('tickets');
  const [tickets, setTickets]               = useState([]);
  const [transactions, setTransactions]     = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [loadingTx, setLoadingTx]           = useState(false);
  const [editField, setEditField]           = useState(null);
  const [editValue, setEditValue]           = useState('');
  const [showTopUp, setShowTopUp]           = useState(false);

  //Email megerősítés
  const [emailStatus, setEmailStatus]       = useState(null); // null | loading | confirmed | unconfirmed
  const [resendLoading, setResendLoading]   = useState(false);
  const [resendSent, setResendSent]         = useState(false);

  //Jelszó módosítás
  const [currentPassword, setCurrentPassword]   = useState('');
  const [newPassword, setNewPassword]           = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading]   = useState(false);

  //Szelvények
  useEffect(() => {
    if (activeTab === 'tickets') {
      setLoadingTickets(true);
      api.user.getTickets()
        .then(data => setTickets(Array.isArray(data) ? data : []))
        .catch(() => toast.error('Nem sikerült betölteni a szelvényeket'))
        .finally(() => setLoadingTickets(false));
    }
  }, [activeTab]);

  //Tranzakciók
  useEffect(() => {
    if (activeTab === 'history') {
      setLoadingTx(true);
      api.user.getTransactions()
        .then(data => setTransactions(Array.isArray(data) ? data : []))
        .catch(() => toast.error('Nem sikerült betölteni az előzményeket'))
        .finally(() => setLoadingTx(false));
    }
  }, [activeTab]);

  //Email státusz betöltése
  useEffect(() => {
    if (activeTab === 'security') {
      setEmailStatus('loading');
      fetch('/api/auth/email-status', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
        .then(r => r.json())
        .then(data => setEmailStatus(data.isConfirmed ? 'confirmed' : 'unconfirmed'))
        .catch(() => setEmailStatus('unconfirmed'));
    }
  }, [activeTab]);

  //Profil mentés
  const handleSave = async () => {
    try {
      await api.user.updateProfile(
        editField === 'username' ? { username: editValue } : { email: editValue }
      );
      toast.success('Sikeresen módosítva!');
      setEditField(null);
    } catch {
      toast.error('Nem sikerült a módosítás!');
    }
  };

  //Email újraküldés
  const handleResendConfirmation = async () => {
    setResendLoading(true);
    try {
      const response = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        setResendSent(true);
        toast.success('Megerősítő email elküldve!');
      } else {
        toast.error('Hiba a küldés során');
      }
    } catch {
      toast.error('Szerverhiba');
    } finally {
      setResendLoading(false);
    }
  };

  //Jelszó módosítás
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Az új jelszónak legalább 6 karakter hosszúnak kell lennie!');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('A két jelszó nem egyezik!');
      return;
    }
    setPasswordLoading(true);
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (response.ok) {
        toast.success('Jelszó sikeresen megváltoztatva!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        const data = await response.json().catch(() => ({}));
        toast.error(data.message || 'Hibás jelenlegi jelszó!');
      }
    } catch {
      toast.error('Szerverhiba');
    } finally {
      setPasswordLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <span className="badge bg-warning text-dark">Aktív</span>;
      case 'drawn':  return <span className="badge bg-secondary">Lejátszva</span>;
      case 'won':    return <span className="badge bg-success">Nyertes! 🎉</span>;
      default:       return <span className="badge bg-light text-dark">{status}</span>;
    }
  };

  const getTransactionLabel = (type) => {
    switch (type) {
      case 'ticket_purchase': return '🎟️ Szelvényvásárlás';
      case 'deposit':         return '💳 Egyenleg feltöltés';
      case 'admin_topup':     return '🔧 Admin feltöltés';
      case 'demo_topup':      return '💰 Demo feltöltés';
      case 'win_payout':      return '🏆 Nyeremény';
      default:                return type;
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">Saját fiók</h1>
        <Button variant="outline-danger" onClick={onLogout}>
          <LogOut size={18} className="me-2" /> Kijelentkezés
        </Button>
      </div>

      <Row className="g-4 mb-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm text-white h-100"
            style={{ background: 'linear-gradient(135deg, #fb923c, #ea580c)' }}>
            <Card.Body>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white bg-opacity-20 p-3 rounded-3">
                  <User size={32} color="black" />
                  <i class="bi bi-person-fill-check"></i>
                </div>
                <div>
                  <p className="opacity-75 mb-1">Üdvözlünk,</p>
                  <h3 className="fw-bold mb-0">{user?.username}</h3>
                  <p className="opacity-75 mb-0 small">{user?.email}</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm text-white h-100"
            style={{ background: 'linear-gradient(135deg, #18af78, #035c3e)' }}>
            <Card.Body>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white bg-opacity-20 p-3 rounded-3">
                  <CreditCard size={32} color="black" />
                  <i class="bi bi-credit-card-2-back-fill"></i>
                </div>
                <div className="flex-grow-1">
                  <p className="opacity-75 mb-1">Egyenleged</p>
                  <h2 className="fw-bold mb-0">{(user?.balance || 0).toLocaleString()} Ft</h2>
                </div>
                <Button variant="light" className="text-dark fw-medium" onClick={() => setShowTopUp(true)}>
                  <CreditCard size={16} className="me-1" /> Feltöltés
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white border-0 pb-0">
          <Tabs activeKey={activeTab} onSelect={setActiveTab}>
            <Tab eventKey="tickets"  title={<span><Ticket size={16} className="me-1" />Szelvényeim</span>} />
            <Tab eventKey="history"  title={<span><History size={16} className="me-1" />Előzmények</span>} />
            <Tab eventKey="settings" title={<span><Settings size={16} className="me-1" />Beállítások</span>} />
            <Tab eventKey="security" title={<span><Shield size={16} className="me-1" />Biztonság</span>} />
          </Tabs>
        </Card.Header>

        <Card.Body className="p-4">

          {/* SZELVÉNYEK */}
          {activeTab === 'tickets' && (
            loadingTickets ? (
              <div className="text-center py-5"><Spinner animation="border" variant="warning" /></div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <Ticket size={60} className="opacity-25 mb-3" />
                <p>Még nincsenek szelvényeid</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {tickets.map(ticket => (
                  <div key={ticket.id} className="border rounded-3 p-3 bg-light">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="fw-bold text-primary">{ticket.ticketCode}</span>
                          {getStatusBadge(ticket.status)}
                        </div>
                        <p className="text-muted small mb-1">🎮 {ticket.gameType || 'Lottó'}</p>
                        <p className="text-muted small mb-1">🔢 <strong>{ticket.fieldsNumbers || '-'}</strong></p>
                        <p className="text-muted small mb-0">📅 {ticket.boughtAt ? new Date(ticket.boughtAt).toLocaleString('hu-HU') : '-'}</p>
                      </div>
                      <div className="text-end">
                        <p className="fw-bold mb-1">{(ticket.totalPrice || 0).toLocaleString()} Ft</p>
                        {ticket.winAmount > 0 && <p className="text-success fw-bold mb-0">+{ticket.winAmount.toLocaleString()} Ft</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ELŐZMÉNYEK */}
          {activeTab === 'history' && (
            loadingTx ? (
              <div className="text-center py-5"><Spinner animation="border" variant="warning" /></div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <History size={60} className="opacity-25 mb-3" />
                <p>Nincs még tranzakció</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {transactions.map(t => {
                  const amount = parseFloat(t.amount || 0);
                  const isPos  = amount > 0;
                  return (
                    <div key={t.id} className="border rounded-3 p-3 d-flex justify-content-between align-items-center">
                      <div>
                        <p className="fw-medium mb-1">{getTransactionLabel(t.type)}</p>
                        <p className="text-muted small mb-1">{t.description}</p>
                        <p className="text-muted small mb-0">{new Date(t.createdAt).toLocaleString('hu-HU')}</p>
                      </div>
                      <div className="text-end">
                        <p className={`fw-bold fs-5 mb-1 ${isPos ? 'text-success' : 'text-danger'}`}>
                          {isPos ? '+' : ''}{amount.toLocaleString()} Ft
                        </p>
                        <p className="text-muted small mb-0">Egyenleg: {parseFloat(t.balanceAfter || 0).toLocaleString()} Ft</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* BEÁLLÍTÁSOK */}
          {activeTab === 'settings' && (
            <div className="d-flex flex-column gap-3">
              {/* Felhasználónév */}
              <div className="border rounded-3 p-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-2"><User size={20} className="text-primary" /></div>
                  <div>
                    <p className="fw-medium mb-0">Felhasználónév</p>
                    {editField === 'username' ? (
                      <div className="d-flex gap-2 mt-1">
                        <input type="text" className="form-control form-control-sm" value={editValue} onChange={e => setEditValue(e.target.value)} />
                        <Button size="sm" variant="success" onClick={handleSave}>Mentés</Button>
                        <Button size="sm" variant="outline-secondary" onClick={() => setEditField(null)}>Mégse</Button>
                      </div>
                    ) : <p className="text-muted small mb-0">{user?.username}</p>}
                  </div>
                </div>
                {editField !== 'username' && (
                  <Button variant="outline-secondary" size="sm" onClick={() => { setEditField('username'); setEditValue(user?.username || ''); }}>
                    <Edit3 size={16} className="me-1" /> Módosítás
                  </Button>
                )}
              </div>

              {/* Email */}
              <div className="border rounded-3 p-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 rounded-2" style={{ background: '#f3e8ff' }}><Mail size={20} style={{ color: '#7c3aed' }} /></div>
                  <div>
                    <p className="fw-medium mb-0">Email cím</p>
                    {editField === 'email' ? (
                      <div className="d-flex gap-2 mt-1">
                        <input type="email" className="form-control form-control-sm" value={editValue} onChange={e => setEditValue(e.target.value)} />
                        <Button size="sm" variant="success" onClick={handleSave}>Mentés</Button>
                        <Button size="sm" variant="outline-secondary" onClick={() => setEditField(null)}>Mégse</Button>
                      </div>
                    ) : <p className="text-muted small mb-0">{user?.email}</p>}
                  </div>
                </div>
                {editField !== 'email' && (
                  <Button variant="outline-secondary" size="sm" onClick={() => { setEditField('email'); setEditValue(user?.email || ''); }}>
                    <Edit3 size={16} className="me-1" /> Módosítás
                  </Button>
                )}
              </div>

              {/* Feltöltés */}
              <div className="border rounded-3 p-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 rounded-2" style={{ background: '#dcfce7' }}><CreditCard size={20} style={{ color: '#16a34a' }} /></div>
                  <div>
                    <p className="fw-medium mb-0">Egyenleg feltöltés</p>
                    <p className="text-muted small mb-0">Jelenlegi: {(user?.balance || 0).toLocaleString()} Ft</p>
                  </div>
                </div>
                <Button variant="success" size="sm" onClick={() => setShowTopUp(true)}>
                  <CreditCard size={16} className="me-1" /> Feltöltés
                </Button>
              </div>
            </div>
          )}

          {/* ✅ BIZTONSÁG TAB */}
          {activeTab === 'security' && (
            <div className="d-flex flex-column gap-4">

              {/* Email megerősítés státusz */}
              <div>
                <h6 className="fw-bold mb-3">Email megerősítés</h6>
                {emailStatus === 'loading' && (
                  <div className="d-flex align-items-center gap-2 text-muted">
                    <Spinner size="sm" animation="border" /> Ellenőrzés...
                  </div>
                )}
                {emailStatus === 'confirmed' && (
                  <Alert variant="success" className="d-flex align-items-center gap-2">
                    <CheckCircle size={20} />
                    <div>
                      <strong>Email megerősítve!</strong>
                      <p className="mb-0 small">{user?.email} — sikeresen megerősítve</p>
                    </div>
                  </Alert>
                )}
                {emailStatus === 'unconfirmed' && (
                  <Alert variant="warning">
                    <div className="d-flex align-items-start gap-2">
                      <XCircle size={20} className="flex-shrink-0 mt-1" />
                      <div className="flex-grow-1">
                        <strong>Email nincs megerősítve</strong>
                        <p className="mb-2 small">{user?.email} — még nem erősítetted meg az email címedet</p>
                        {resendSent ? (
                          <p className="text-success small mb-0">
                            <CheckCircle size={14} className="me-1" />
                            Email elküldve! Ellenőrizd a postafiókod (spam mappa is).
                          </p>
                        ) : (
                          <Button size="sm" variant="warning" className="fw-bold"
                            onClick={handleResendConfirmation} disabled={resendLoading}>
                            {resendLoading
                              ? <Spinner size="sm" animation="border" className="me-1" />
                              : <RefreshCw size={14} className="me-1" />}
                            Megerősítő email újraküldése
                          </Button>
                        )}
                      </div>
                    </div>
                  </Alert>
                )}
              </div>

              {/* Jelszó módosítás */}
              <div>
                <h6 className="fw-bold mb-3">Jelszó módosítása</h6>
                <form onSubmit={handlePasswordChange} className="d-flex flex-column gap-3" style={{ maxWidth: '400px' }}>
                  <div>
                    <label className="form-label small fw-medium">Jelenlegi jelszó</label>
                    <div className="position-relative">
                      <Lock size={16} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input type="password" className="form-control ps-5"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        required />
                    </div>
                  </div>
                  <div>
                    <label className="form-label small fw-medium">Új jelszó</label>
                    <div className="position-relative">
                      <Lock size={16} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input type="password" className="form-control ps-5"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required />
                    </div>
                  </div>
                  <div>
                    <label className="form-label small fw-medium">Új jelszó megerősítése</label>
                    <div className="position-relative">
                      <Lock size={16} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input type="password"
                        className={`form-control ps-5 ${confirmNewPassword && confirmNewPassword !== newPassword ? 'is-invalid' : ''}`}
                        placeholder="••••••••"
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                        required />
                      {confirmNewPassword && confirmNewPassword !== newPassword && (
                        <div className="invalid-feedback">A jelszavak nem egyeznek</div>
                      )}
                    </div>
                  </div>
                  <Button type="submit" variant="danger" className="fw-bold align-self-start px-4" disabled={passwordLoading}>
                    {passwordLoading ? <Spinner size="sm" animation="border" className="me-2" /> : <Lock size={16} className="me-2" />}
                    Jelszó módosítása
                  </Button>
                </form>
              </div>
            </div>
          )}

        </Card.Body>
      </Card>

      <PaymentModel
        show={showTopUp}
        onHide={() => setShowTopUp(false)}
        onSuccess={(newBalance) => onBalanceUpdate?.(newBalance)}
      />
    </Container>
  );
};

export default AccountPage;