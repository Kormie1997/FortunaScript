import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Tabs, Tab, Form, Spinner, InputGroup, Modal } from 'react-bootstrap';
import { 
  Shield, Users, Ticket, TrendingUp, DollarSign, Search, Ban, CheckCircle, 
  BarChart3, Pause, RotateCcw, Database, AlertTriangle, Settings, RefreshCw, 
  CreditCard, Activity, Calendar, Award 
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

// Játéktípus magyar neve
const GAME_LABELS = {
  Lottery5:     'Ötös Lottó',
  Lottery6:     'Hatoslottó',
  Scandinavian: 'Skandináv',
  Eurojackpot:  'Eurojackpot',
  Joker:        'Joker',
  Keno:         'Kenó',
};

const MONTH_NAMES = ['Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún', 'Júl', 'Aug', 'Sze', 'Okt', 'Nov', 'Dec'];

// Stat kártya komponens
const StatCard = ({ title, value, sub, icon: Icon, gradient, delay = 0 }) => (
  <Card className="border-0 shadow-sm text-white h-100" style={{ background: gradient }}>
    <Card.Body>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <p className="opacity-75 small mb-1">{title}</p>
          <h3 className="fw-bold mb-0">{value ?? '–'}</h3>
          {sub && <small className="opacity-75">{sub}</small>}
        </div>
        <div className="bg-white bg-opacity-25 p-2 rounded-3">
          <Icon size={24} />
        </div>
      </div>
    </Card.Body>
  </Card>
);

const AdminPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);
  
  // Admin feltöltés modal
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpUser, setTopUpUser] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);
  
  const [systemStatus, setSystemStatus] = useState({
    maintenance: false,
    drawLocked: false,
  });

  // ========== STATISZTIKÁK (bővítve) ==========
  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadStats();
    }
  }, [activeTab]);

  // ========== FELHASZNÁLÓK ==========
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  // ========== 3. FÁZIS: SZELVÉNYEK ==========
  useEffect(() => {
    if (activeTab === 'tickets') {
      loadTickets();
    }
  }, [activeTab]);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const data = await api.admin.getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
      toast.error('Nem sikerült betölteni a statisztikákat');
    } finally {
      setLoadingStats(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await api.admin.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Nem sikerült betölteni a felhasználókat');
    } finally {
      setLoadingUsers(false);
    }
  };

  // ✅ 3. fázis: Szelvények betöltése
  const loadTickets = async () => {
    setLoadingTickets(true);
    try {
      const data = await api.admin.getTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Nem sikerült betölteni a szelvényeket');
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleBanUser = async (userId, currentStatus) => {
    try {
      await api.admin.banUser(userId, currentStatus === 'banned');
      toast.success(currentStatus === 'banned' ? 'Felhasználó feloldva!' : 'Felhasználó kitiltva!');
      loadUsers();
    } catch (err) {
      toast.error('Hiba a tiltás során');
    }
  };

  const handleAdminTopUp = async () => {
    const amount = parseInt(topUpAmount);
    if (!amount || amount <= 0) return toast.error('Adj meg érvényes összeget!');

    setTopUpLoading(true);
    try {
      await api.admin.addBalance(topUpUser.id, amount);
      toast.success(`${amount.toLocaleString()} Ft jóváírva ${topUpUser.username} fiókjára!`);
      setShowTopUp(false);
      setTopUpAmount('');
      loadUsers();
    } catch (err) {
      toast.error('Feltöltés sikertelen');
    } finally {
      setTopUpLoading(false);
    }
  };

  const toggleMaintenance = async () => {
    try {
      await api.admin.toggleMaintenance();
      setSystemStatus(prev => ({ ...prev, maintenance: !prev.maintenance }));
      toast.info('Karbantartási mód megváltozott');
    } catch (err) {
      toast.error('Hiba történt');
    }
  };

  const toggleDrawLock = async () => {
    try {
      await api.admin.toggleDrawLock();
      setSystemStatus(prev => ({ ...prev, drawLocked: !prev.drawLocked }));
      toast.info('Sorsolás állapota megváltozott');
    } catch (err) {
      toast.error('Hiba történt');
    }
  };

  const runBackup = async () => {
    try {
      await api.admin.backup();
      toast.success('Biztonsági mentés elindítva');
    } catch (err) {
      toast.error('Mentés sikertelen');
    }
  };

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="p-3 rounded-3 text-white" style={{ background: 'linear-gradient(135deg, #dc2626, #ea580c)' }}>
            <Shield size={28} />
          </div>
          <div>
            <h1 className="fw-bold mb-0">Admin Felület</h1>
            <p className="text-muted mb-0">Üdvözlünk, {user?.username}!</p>
          </div>
        </div>
        <Badge bg="danger" className="fs-6 px-4 py-2">ADMIN</Badge>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white border-0 pb-0">
          <Tabs activeKey={activeTab} onSelect={setActiveTab}>
            <Tab eventKey="dashboard" title={<span><BarChart3 size={16} className="me-1" />Áttekintés</span>} />
            <Tab eventKey="users"     title={<span><Users size={16} className="me-1" />Felhasználók</span>} />
            <Tab eventKey="tickets"   title={<span><Ticket size={16} className="me-1" />Szelvények</span>} />
            <Tab eventKey="settings"  title={<span><Settings size={16} className="me-1" />Beállítások</span>} />
          </Tabs>
        </Card.Header>

        <Card.Body className="p-4">

          {/* ── 3. FÁZIS: DASHBOARD (bővített statisztikákkal) ── */}
          {activeTab === 'dashboard' && (
            <>
              {loadingStats ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="warning" />
                  <p className="text-muted mt-2">Statisztikák betöltése...</p>
                </div>
              ) : stats ? (
                <>
                  {/* Fő statisztika kártyák */}
                  <Row className="g-3 mb-4">
                    <Col md={3}>
                      <StatCard
                        title="Összes felhasználó"
                        value={stats.totalUsers}
                        sub={`${stats.activeUsers} aktív · ${stats.newToday || 0} mai új`}
                        icon={Users}
                        gradient="linear-gradient(135deg, #3b82f6, #1d4ed8)"
                      />
                    </Col>
                    <Col md={3}>
                      <StatCard
                        title="Összes szelvény"
                        value={stats.totalTickets?.toLocaleString()}
                        sub={`${stats.activeTickets} aktív · ${stats.ticketsToday || 0} mai`}
                        icon={Ticket}
                        gradient="linear-gradient(135deg, #10b981, #059669)"
                      />
                    </Col>
                    <Col md={3}>
                      <StatCard
                        title="Mai bevétel"
                        value={`${(stats.todayRevenue || 0).toLocaleString()} Ft`}
                        sub={`Heti: ${(stats.weekRevenue || 0).toLocaleString()} Ft`}
                        icon={TrendingUp}
                        gradient="linear-gradient(135deg, #f59e0b, #ea580c)"
                      />
                    </Col>
                    <Col md={3}>
                      <StatCard
                        title="Összes bevétel"
                        value={`${(stats.totalRevenue || 0).toLocaleString()} Ft`}
                        sub={`Kifizetett: ${(stats.totalPayouts || 0).toLocaleString()} Ft`}
                        icon={DollarSign}
                        gradient="linear-gradient(135deg, #8b5cf6, #6d28d9)"
                      />
                    </Col>
                  </Row>

                  <Row className="g-4 mb-4">
                    {/* ✅ Játékonkénti bontás (3. fázis új) */}
                    <Col md={6}>
                      <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-bottom">
                          <h6 className="fw-bold mb-0">
                            <Activity size={16} className="me-2 text-primary" />
                            Játékonkénti statisztika
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          {stats.gameStats?.length > 0 ? (
                            <div className="d-flex flex-column gap-3">
                              {stats.gameStats.map((g, i) => {
                                const maxCount = Math.max(...stats.gameStats.map(x => x.count));
                                const pct = maxCount > 0 ? (g.count / maxCount) * 100 : 0;
                                return (
                                  <div key={i}>
                                    <div className="d-flex justify-content-between mb-1">
                                      <span className="fw-medium small">{GAME_LABELS[g.gameType] || g.gameType}</span>
                                      <div className="text-end">
                                        <span className="small fw-bold">{g.count} szelvény</span>
                                        <span className="text-muted small ms-2">{(g.revenue || 0).toLocaleString()} Ft</span>
                                      </div>
                                    </div>
                                    <div className="progress" style={{ height: '8px' }}>
                                      <div
                                        className="progress-bar"
                                        style={{
                                          width: `${pct}%`,
                                          background: 'linear-gradient(90deg, #f59e0b, #ea580c)'
                                        }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-muted text-center py-3">Nincs adat</p>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* ✅ Havi bevétel bontás (3. fázis új) */}
                    <Col md={6}>
                      <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-bottom">
                          <h6 className="fw-bold mb-0">
                            <Calendar size={16} className="me-2 text-success" />
                            Havi bevétel (utolsó 6 hónap)
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          {stats.monthlyRevenue?.length > 0 ? (
                            <div className="d-flex flex-column gap-3">
                              {stats.monthlyRevenue.map((m, i) => {
                                const maxRev = Math.max(...stats.monthlyRevenue.map(x => x.revenue));
                                const pct = maxRev > 0 ? (m.revenue / maxRev) * 100 : 0;
                                return (
                                  <div key={i}>
                                    <div className="d-flex justify-content-between mb-1">
                                      <span className="fw-medium small">
                                        {MONTH_NAMES[m.month - 1]} {m.year}
                                      </span>
                                      <div className="text-end">
                                        <span className="small fw-bold">{(m.revenue || 0).toLocaleString()} Ft</span>
                                        <span className="text-muted small ms-2">{m.count} tranzakció</span>
                                      </div>
                                    </div>
                                    <div className="progress" style={{ height: '8px' }}>
                                      <div
                                        className="progress-bar bg-success"
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-muted text-center py-3">Nincs elég adat</p>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {/* Pénzügyi összesítő (bővítve) */}
                  <Row>
                    <Col md={12}>
                      <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom">
                          <h6 className="fw-bold mb-0">
                            <DollarSign size={16} className="me-2 text-warning" />
                            Pénzügyi összesítő
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          <Row className="g-3">
                            {[
                              { label: 'Összes bevétel', value: stats.totalRevenue, color: 'success' },
                              { label: 'Havi bevétel', value: stats.monthRevenue, color: 'primary' },
                              { label: 'Kifizetett nyeremények', value: stats.totalPayouts, color: 'warning' },
                              { label: 'Rendszerben lévő Ft', value: stats.totalBalance, color: 'info' },
                            ].map((item, i) => (
                              <Col md={3} key={i}>
                                <div className={`border border-${item.color} rounded-3 p-3 text-center`}>
                                  <p className="text-muted small mb-1">{item.label}</p>
                                  <h5 className={`fw-bold text-${item.color} mb-0`}>
                                    {(item.value || 0).toLocaleString()} Ft
                                  </h5>
                                </div>
                              </Col>
                            ))}
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </>
              ) : (
                <div className="text-center py-5">
                  <AlertTriangle size={48} className="text-muted mb-3" />
                  <p className="text-muted">Nem sikerült betölteni a statisztikákat</p>
                  <Button variant="outline-warning" size="sm" onClick={loadStats}>
                    <RefreshCw size={14} className="me-1" /> Újrapróbálkozás
                  </Button>
                </div>
              )}
            </>
          )}

          {/* ── FELHASZNÁLÓK (2. fázis) ── */}
          {activeTab === 'users' && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Felhasználók kezelése</h5>
                <div className="d-flex gap-2">
                  <InputGroup style={{ width: '280px' }}>
                    <InputGroup.Text><Search size={16} /></InputGroup.Text>
                    <Form.Control
                      placeholder="Keresés névre vagy emailre..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                  <Button variant="outline-secondary" onClick={loadUsers} title="Frissítés">
                    <RefreshCw size={16} />
                  </Button>
                </div>
              </div>

              {loadingUsers ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="warning" />
                  <p className="text-muted mt-2">Felhasználók betöltése...</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-5">
                      <Users size={48} className="text-muted mb-3" />
                      <p className="text-muted">Nincs találat a keresésre</p>
                    </div>
                  ) : (
                    filteredUsers.map(u => (
                      <div key={u.id} className="border rounded-3 p-3 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                            style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #f59e0b, #ea580c)', flexShrink: 0 }}
                          >
                            {u.username?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-medium">{u.username}</span>
                              {u.roles?.includes('admin') && <Badge bg="danger" className="small">Admin</Badge>}
                              {!u.emailConfirmed && <Badge bg="warning" text="dark" className="small">Email nem megerősített</Badge>}
                            </div>
                            <p className="text-muted small mb-0">{u.email}</p>
                            <p className="text-muted small mb-0">
                              Regisztráció: {new Date(u.createdAt).toLocaleDateString('hu-HU')}
                              {u.lastLoginAt && ` · Utolsó belépés: ${new Date(u.lastLoginAt).toLocaleDateString('hu-HU')}`}
                            </p>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-3">
                          <div className="text-end">
                            <p className="fw-bold mb-0">{(u.balance || 0).toLocaleString()} Ft</p>
                            <Badge bg={u.status === 'active' ? 'success' : 'danger'}>
                              {u.status === 'active' ? 'Aktív' : 'Kitiltva'}
                            </Badge>
                          </div>
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => { setTopUpUser(u); setShowTopUp(true); }}
                              title="Egyenleg feltöltés"
                            >
                              <CreditCard size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant={u.status === 'banned' ? 'outline-success' : 'outline-danger'}
                              onClick={() => handleBanUser(u.id, u.status)}
                              title={u.status === 'banned' ? 'Feloldás' : 'Kitiltás'}
                            >
                              {u.status === 'banned' ? <CheckCircle size={14} /> : <Ban size={14} />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}

          {/* ── 3. FÁZIS: SZELVÉNYEK ── */}
          {activeTab === 'tickets' && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Összes szelvény</h5>
                <Button variant="outline-secondary" size="sm" onClick={loadTickets}>
                  <RefreshCw size={16} className="me-1" /> Frissítés
                </Button>
              </div>

              {loadingTickets ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="warning" />
                  <p className="text-muted mt-2">Szelvények betöltése...</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {tickets.length === 0 ? (
                    <div className="text-center py-5">
                      <Ticket size={48} className="text-muted mb-3" />
                      <p className="text-muted">Még nincsenek szelvények a rendszerben</p>
                    </div>
                  ) : (
                    tickets.map(t => (
                      <div key={t.id} className="border rounded-3 p-3 d-flex justify-content-between align-items-center">
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="fw-bold text-primary small">{t.ticketCode}</span>
                            <Badge bg={t.status === 'active' ? 'warning' : t.status === 'won' ? 'success' : 'secondary'} text={t.status === 'active' ? 'dark' : undefined}>
                              {t.status === 'active' ? 'Aktív' : t.status === 'won' ? 'Nyertes 🎉' : 'Lejátszva'}
                            </Badge>
                          </div>
                          <p className="text-muted small mb-0">
                            👤 {t.username} · 🎮 {GAME_LABELS[t.gameType] || t.gameType} · 🔢 {t.fieldsNumbers || '-'}
                          </p>
                          <p className="text-muted small mb-0">
                            📅 {new Date(t.boughtAt).toLocaleString('hu-HU')}
                          </p>
                        </div>
                        <div className="text-end">
                          <p className="fw-bold mb-0">{(t.totalPrice || 0).toLocaleString()} Ft</p>
                          {t.totalWinAmount > 0 && (
                            <p className="text-success small fw-bold mb-0">+{t.totalWinAmount.toLocaleString()} Ft</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}

          {/* ── BEÁLLÍTÁSOK ── */}
          {activeTab === 'settings' && (
            <div className="d-flex flex-column gap-3">
              <h5 className="fw-bold mb-2">Rendszer beállítások</h5>

              <div className="border rounded-3 p-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 rounded-2" style={{ background: '#fee2e220' }}>
                    <AlertTriangle size={20} style={{ color: '#dc2626' }} />
                  </div>
                  <div>
                    <p className="fw-medium mb-0">Karbantartási mód</p>
                    <p className="text-muted small mb-0">Az oldal karbantartási üzemmódba kapcsol</p>
                  </div>
                </div>
                <Button 
                  variant={systemStatus.maintenance ? "success" : "danger"} 
                  size="sm"
                  onClick={toggleMaintenance}
                >
                  {systemStatus.maintenance ? "Kikapcsolás" : "Bekapcsolás"}
                </Button>
              </div>

              <div className="border rounded-3 p-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 rounded-2" style={{ background: '#2563eb20' }}>
                    <Database size={20} style={{ color: '#2563eb' }} />
                  </div>
                  <div>
                    <p className="fw-medium mb-0">Biztonsági mentés</p>
                    <p className="text-muted small mb-0">Adatbázis manuális mentése</p>
                  </div>
                </div>
                <Button variant="outline-secondary" size="sm" onClick={runBackup}>
                  <Database size={14} className="me-1" /> Mentés indítása
                </Button>
              </div>

              <div className="border rounded-3 p-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 rounded-2" style={{ background: '#ea580c20' }}>
                    <Pause size={20} style={{ color: '#ea580c' }} />
                  </div>
                  <div>
                    <p className="fw-medium mb-0">Sorsolás zárolása</p>
                    <p className="text-muted small mb-0">Új szelvények vásárlásának ideiglenes tiltása</p>
                  </div>
                </div>
                <Button 
                  variant={systemStatus.drawLocked ? "success" : "warning"} 
                  size="sm"
                  onClick={toggleDrawLock}
                >
                  {systemStatus.drawLocked ? "Zárolás feloldása" : "Zárolás"}
                </Button>
              </div>
            </div>
          )}

        </Card.Body>
      </Card>

      {/* Admin TopUp Modal */}
      <Modal show={showTopUp} onHide={() => setShowTopUp(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            <CreditCard size={20} className="me-2 text-success" />
            Egyenleg feltöltés — {topUpUser?.username}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">
            Jelenlegi egyenleg: <strong>{(topUpUser?.balance || 0).toLocaleString()} Ft</strong>
          </p>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {[1000, 5000, 10000, 20000, 50000].map(q => (
              <Button 
                key={q} 
                size="sm" 
                variant={topUpAmount === String(q) ? 'warning' : 'outline-secondary'}
                onClick={() => setTopUpAmount(String(q))}
              >
                {q.toLocaleString()} Ft
              </Button>
            ))}
          </div>
          <InputGroup>
            <Form.Control
              type="number"
              min={1}
              placeholder="Egyéni összeg"
              value={topUpAmount}
              onChange={e => setTopUpAmount(e.target.value)}
            />
            <InputGroup.Text>Ft</InputGroup.Text>
          </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowTopUp(false)}>Mégse</Button>
          <Button variant="success" className="fw-bold" onClick={handleAdminTopUp} disabled={topUpLoading}>
            {topUpLoading ? <Spinner size="sm" animation="border" className="me-1" /> : <CreditCard size={16} className="me-1" />}
            Jóváírás
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminPage;