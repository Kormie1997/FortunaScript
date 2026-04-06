import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Tabs, Tab } from 'react-bootstrap';
import { LogOut, User, Ticket, History, Settings, CreditCard, Edit3, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import PaymentModel from '../components/PaymentModel';

const AccountPage = ({ user, onLogout, onBalanceUpdate }) => {
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showTopUp, setShowTopUp] = useState(false);

  //Szelvények betöltése
  useEffect(() => {
    if (activeTab === 'tickets') {
      setLoadingTickets(true);
      api.user.getTickets()
        .then(data => setTickets(Array.isArray(data) ? data : []))
        .catch(() => toast.error('Nem sikerült betölteni a szelvényeket'))
        .finally(() => setLoadingTickets(false));
    }
  }, [activeTab]);

  //Tranzakciók betöltése
  useEffect(() => {
    if (activeTab === 'history') {
      setLoadingTransactions(true);
      api.user.getTransactions()
        .then(data => setTransactions(Array.isArray(data) ? data : []))
        .catch(() => toast.error('Nem sikerült betölteni az előzményeket'))
        .finally(() => setLoadingTransactions(false));
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
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">Saját fiók</h1>
        <Button variant="outline-danger" onClick={onLogout}>
          <LogOut size={18} className="me-2" /> Kijelentkezés
        </Button>
      </div>

      {/* Info kártyák */}
      <Row className="g-4 mb-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm card-orange text-white h-100">
            <Card.Body>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white bg-opacity-20 p-3 rounded-3">
                  <User size={32} />
                </div>
                <div>
                  <p className="opacity-75 mb-1">Üdvözlünk,</p>
                  <h3 className="fw-bold mb-0">{user?.username || 'Felhasználó'}</h3>
                  <p className="opacity-75 mb-0 small">{user?.email}</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="border-0 shadow-sm card-green text-white h-100">
            <Card.Body>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white bg-opacity-20 p-3 rounded-3">
                  <CreditCard size={32} />
                </div>
                <div className="flex-grow-1">
                  <p className="opacity-75 mb-1">Egyenleged</p>
                  <h2 className="fw-bold mb-0">{(user?.balance || 0).toLocaleString()} Ft</h2>
                </div>
                {/* ✅ Feltöltés gomb */}
                <Button variant="light" className="text-dark fw-medium" onClick={() => setShowTopUp(true)}>
                  <CreditCard size={16} className="me-1" /> Feltöltés
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabok */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white border-0 pb-0">
          <Tabs activeKey={activeTab} onSelect={setActiveTab}>
            <Tab eventKey="tickets" title={<span><Ticket size={16} className="me-1" />Szelvényeim</span>} />
            <Tab eventKey="history" title={<span><History size={16} className="me-1" />Előzmények</span>} />
            <Tab eventKey="settings" title={<span><Settings size={16} className="me-1" />Beállítások</span>} />
          </Tabs>
        </Card.Header>

        <Card.Body className="p-4">

          {/* SZELVÉNYEK */}
          {activeTab === 'tickets' && (
            loadingTickets ? (
              <div className="text-center py-5">
                <div className="spinner-border text-warning" role="status" />
              </div>
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
                        <p className="text-muted small mb-1">🔢 Számok: <strong>{ticket.fieldsNumbers || '-'}</strong></p>
                        <p className="text-muted small mb-0">
                          📅 {ticket.boughtAt ? new Date(ticket.boughtAt).toLocaleString('hu-HU') : '-'}
                        </p>
                      </div>
                      <div className="text-end">
                        <p className="fw-bold mb-1">{(ticket.totalPrice || 0).toLocaleString()} Ft</p>
                        {ticket.winAmount > 0 && (
                          <p className="text-success fw-bold mb-0">+{ticket.winAmount.toLocaleString()} Ft</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ELŐZMÉNYEK */}
          {activeTab === 'history' && (
            loadingTransactions ? (
              <div className="text-center py-5">
                <div className="spinner-border text-warning" role="status" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <History size={60} className="opacity-25 mb-3" />
                <p>Nincs még tranzakció</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {transactions.map(t => {
                  const amount = parseFloat(t.amount || 0);
                  const isPositive = amount > 0;
                  return (
                    <div key={t.id} className="border rounded-3 p-3 d-flex justify-content-between align-items-center">
                      <div>
                        <p className="fw-medium mb-1">{getTransactionLabel(t.type)}</p>
                        <p className="text-muted small mb-1">{t.description || ''}</p>
                        <p className="text-muted small mb-0">
                          {new Date(t.createdAt).toLocaleString('hu-HU')}
                        </p>
                      </div>
                      <div className="text-end">
                        <p className={`fw-bold fs-5 mb-1 ${isPositive ? 'text-success' : 'text-danger'}`}>
                          {isPositive ? '+' : ''}{amount.toLocaleString()} Ft
                        </p>
                        <p className="text-muted small mb-0">
                          Egyenleg: {parseFloat(t.balanceAfter || 0).toLocaleString()} Ft
                        </p>
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
                  <div className="bg-primary bg-opacity-10 p-2 rounded-2">
                    <User size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="fw-medium mb-0">Felhasználónév</p>
                    {editField === 'username' ? (
                      <div className="d-flex gap-2 mt-1">
                        <input type="text" className="form-control form-control-sm"
                          value={editValue} onChange={e => setEditValue(e.target.value)} />
                        <Button size="sm" variant="success" onClick={handleSave}>Mentés</Button>
                        <Button size="sm" variant="outline-secondary" onClick={() => setEditField(null)}>Mégse</Button>
                      </div>
                    ) : (
                      <p className="text-muted small mb-0">{user?.username}</p>
                    )}
                  </div>
                </div>
                {editField !== 'username' && (
                  <Button variant="outline-secondary" size="sm"
                    onClick={() => { setEditField('username'); setEditValue(user?.username || ''); }}>
                    <Edit3 size={16} className="me-1" /> Módosítás
                  </Button>
                )}
              </div>

              {/* Email */}
              <div className="border rounded-3 p-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 rounded-2" style={{ background: '#f3e8ff' }}>
                    <Mail size={20} style={{ color: '#7c3aed' }} />
                  </div>
                  <div>
                    <p className="fw-medium mb-0">Email cím</p>
                    {editField === 'email' ? (
                      <div className="d-flex gap-2 mt-1">
                        <input type="email" className="form-control form-control-sm"
                          value={editValue} onChange={e => setEditValue(e.target.value)} />
                        <Button size="sm" variant="success" onClick={handleSave}>Mentés</Button>
                        <Button size="sm" variant="outline-secondary" onClick={() => setEditField(null)}>Mégse</Button>
                      </div>
                    ) : (
                      <p className="text-muted small mb-0">{user?.email}</p>
                    )}
                  </div>
                </div>
                {editField !== 'email' && (
                  <Button variant="outline-secondary" size="sm"
                    onClick={() => { setEditField('email'); setEditValue(user?.email || ''); }}>
                    <Edit3 size={16} className="me-1" /> Módosítás
                  </Button>
                )}
              </div>

              {/* Jelszó */}
              <div className="border rounded-3 p-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 rounded-2" style={{ background: '#fee2e2' }}>
                    <Lock size={20} style={{ color: '#dc2626' }} />
                  </div>
                  <div>
                    <p className="fw-medium mb-0">Jelszó</p>
                    <p className="text-muted small mb-0">••••••••</p>
                  </div>
                </div>
                <Button variant="outline-secondary" size="sm"
                  onClick={() => toast.info('Jelszó módosítás hamarosan!')}>
                  <Edit3 size={16} className="me-1" /> Módosítás
                </Button>
              </div>

              <div className="border rounded-3 p-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 rounded-2" style={{ background: '#dcfce7' }}>
                    <CreditCard size={20} style={{ color: '#16a34a' }} />
                  </div>
                  <div>
                    <p className="fw-medium mb-0">Egyenleg feltöltés</p>
                    <p className="text-muted small mb-0">Jelenlegi egyenleg: {(user?.balance || 0).toLocaleString()} Ft</p>
                  </div>
                </div>
                <Button variant="success" size="sm" onClick={() => setShowTopUp(true)}>
                  <CreditCard size={16} className="me-1" /> Feltöltés
                </Button>
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
