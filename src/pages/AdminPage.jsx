import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Tabs, Tab, Form, Spinner, InputGroup, Modal, Alert } from 'react-bootstrap';
import { 
  Shield, Users, Ticket, TrendingUp, DollarSign, Search, Ban, CheckCircle, 
BarChart3, Pause, RotateCcw, Database, AlertTriangle, Settings, RefreshCw, 
CreditCard, Activity, Calendar, Award, Play, Plus, Eye, ToggleLeft, ToggleRight, Zap, Trophy, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';


//Játéktípus magyar neve
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
  const [draws, setDraws]                   = useState([]);
  const [loadingDraws, setLoadingDraws]     = useState(false);
  const [drawFilter, setDrawFilter]         = useState('all');
  const [showCreateDraw, setShowCreateDraw] = useState(false);
  const [executingDrawId, setExecutingDrawId] = useState(null);
  const [newDraw, setNewDraw]               = useState({ gameType: 'Lottery5', drawDate: '', ticketPrice: 400 });
  const [createLoading, setCreateLoading]   = useState(false);
  const [showResults, setShowResults]     = useState(false);
  const [drawResults, setDrawResults]     = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDraw, setDeletingDraw]       = useState(null);
  const [deleteLoading, setDeleteLoading]     = useState(false);

  const GAME_COLORS = {
  Lottery5: '#10b981', Lottery6: '#7c3aed', Scandinavian: '#1d4ed8',
  Eurojackpot: '#ca8a04', Joker: '#dc2626', Keno: '#db2777',
  };

  const GAME_PRICES = {
    Lottery5: 400, Lottery6: 250, Scandinavian: 200,
    Eurojackpot: 750, Joker: 300, Keno: 100,
  };

  //STATISZTIKÁK
  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadStats();
    }
  }, [activeTab]);

  //FELHASZNÁLÓK
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

  useEffect(() => {
  if (activeTab === 'draws') loadDraws();
  }, [activeTab]);

  useEffect(() => {
  if (activeTab === 'draws') loadDraws();
  }, [drawFilter]);

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

  //Szelvények betöltése
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

  const loadDraws = async () => {
  setLoadingDraws(true);
  try {
    const filters = drawFilter === 'active'
      ? { isDrawn: false, isActive: true }
      : drawFilter === 'completed'
        ? { isDrawn: true }
        : {};
    const data = await api.draws.getAll(filters);
    setDraws(Array.isArray(data) ? data : []);
  } catch { toast.error('Nem sikerült betölteni a sorsolásokat'); }
  finally { setLoadingDraws(false); }
};

const handleCreateDraw = async () => {
  if (!newDraw.drawDate) return toast.error('Add meg a sorsolás dátumát!');
  if (new Date(newDraw.drawDate) <= new Date()) return toast.error('A dátumnak jövőbelinek kell lennie!');

  setCreateLoading(true);
  try {
    await api.draws.create({
      gameType:    newDraw.gameType,
      drawDate:    new Date(newDraw.drawDate).toISOString(),
      ticketPrice: parseFloat(newDraw.ticketPrice)
    });
    toast.success('Sorsolás sikeresen létrehozva!');
    setShowCreateDraw(false);
    setNewDraw({ gameType: 'Lottery5', drawDate: '', ticketPrice: 400 });
    loadDraws();
  } catch (err) { toast.error(err.message || 'Hiba a létrehozás során'); }
  finally { setCreateLoading(false); }
};

const handleToggleActive = async (drawId) => {
  try {
    await api.draws.toggleActive(drawId);
    toast.success('Sorsolás státusza megváltozott!');
    loadDraws();
  } catch (err) { toast.error(err.message || 'Hiba'); }
};

const handleExecuteDraw = async (drawId, gameType) => {
  const confirmed = window.confirm(
    `Biztosan le akarod húzni a(z) ${GAME_LABELS[gameType] || gameType} sorsolást? Ez nem visszavonható!`
  );
  if (!confirmed) return;

  setExecutingDrawId(drawId);
  try {
    const result = await api.draws.execute(drawId);
    toast.success(`✅ Sorsolás kész! ${result.winnerCount} nyertes, ${(result.totalPayout || 0).toLocaleString()} Ft kiosztva.`);
    loadDraws();
    loadStats();
  } catch (err) {
    toast.error(err.message || 'Sorsolási hiba!');
  } finally {
    setExecutingDrawId(null);
  }
};

  const isPastDue = (drawDate) => new Date(drawDate) <= new Date();

  const handleDeleteDraw = (draw) => {
  setDeletingDraw(draw);
  setShowDeleteModal(true);
};

const confirmDeleteDraw = async () => {
  if (!deletingDraw) return;
  setDeleteLoading(true);
  try {
    await api.draws.delete(deletingDraw.id);
    toast.success('Sorsolás sikeresen törölve!');
    setShowDeleteModal(false);
    setDeletingDraw(null);
    loadDraws();
  } catch (err) {
    toast.error(err.message || 'Törlési hiba!');
  } finally {
    setDeleteLoading(false);
  }
};

  const handleViewResults = async (drawId) => {
    setShowResults(true);
    setDrawResults(null);
    setLoadingResults(true);
    try {
      const data = await api.draws.getResults(drawId);
      setDrawResults(data);
    } catch (err) {
      toast.error('Nem sikerült betölteni az eredményeket');
      setShowResults(false);
    } finally {
      setLoadingResults(false);
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
            <Tab eventKey="draws" title={<span><Zap size={16} className="me-1"/>Sorsolások</span>} />
          </Tabs>
        </Card.Header>

        <Card.Body className="p-4">

          {/*DASHBOARD*/}
          {activeTab === 'dashboard' && (
            <>
              {loadingStats ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="warning" />
                  <p className="text-muted mt-2">Statisztikák betöltése...</p>
                </div>
              ) : stats ? (
                <>
                  {/*Fő statisztika kártyák*/}
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
                    {/*Játékonkénti bontás*/}
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

                    {/*Havi bevétel bontás*/}
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

                  {/*Pénzügyi összesítő*/}
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

          {/*SORSOLÁSOK TAB*/}
          {activeTab === 'draws' && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h5 className="fw-bold mb-0">Sorsolások kezelése</h5>
                <div className="d-flex gap-2 flex-wrap">
                  {['all','active','completed'].map(f => (
                    <Button key={f} size="sm"
                      variant={drawFilter === f ? 'warning' : 'outline-secondary'}
                      onClick={() => setDrawFilter(f)}>
                      {f === 'all' ? 'Összes' : f === 'active' ? '🟢 Aktív' : '✅ Lezárt'}
                    </Button>
                  ))}
                  <Button size="sm" variant="outline-secondary" onClick={loadDraws}>
                    <RefreshCw size={14}/>
                  </Button>
                  <Button size="sm" variant="success" className="fw-bold"
                    onClick={() => setShowCreateDraw(true)}>
                    <Plus size={14} className="me-1"/> Új sorsolás
                  </Button>
                </div>
              </div>

              {loadingDraws ? (
                <div className="text-center py-5"><Spinner animation="border" variant="warning"/></div>
              ) : draws.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <Zap size={48} className="opacity-25 mb-3"/>
                  <p>Nincs sorsolás</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {draws.map(draw => {
                    const isExecuting = executingDrawId === draw.id;
                    const canExecute = !draw.isDrawn && draw.isActive;
                    const color       = GAME_COLORS[draw.gameType] || '#6b7280';
                    return (
                      <div key={draw.id} className="border rounded-3 p-3">
                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                          <div className="d-flex align-items-center gap-3">
                            <div className="rounded-3 p-2 text-white d-flex align-items-center justify-content-center"
                              style={{ background: color, minWidth: '42px', height: '42px' }}>
                              <Zap size={20}/>
                            </div>
                            <div>
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <span className="fw-bold">{GAME_LABELS[draw.gameType] || draw.gameType}</span>
                                <Badge bg={draw.isDrawn ? 'secondary' : draw.isActive ? 'success' : 'warning'}
                                  text={!draw.isDrawn && !draw.isActive ? 'dark' : undefined}>
                                  {draw.isDrawn ? 'Lezárva' : draw.isActive ? 'Aktív' : 'Inaktív'}
                                </Badge>
                                {canExecute && <Badge bg="danger">⚡ Sorsolható!</Badge>}
                              </div>
                              <p className="text-muted small mb-0">
                                📅 {new Date(draw.drawDate).toLocaleString('hu-HU')}
                                {' · '}💰 {draw.ticketPrice} Ft/szelvény
                                {' · '}🎟️ {draw.ticketCount || 0} szelvény
                              </p>
                              {draw.isDrawn && draw.winningNumbers && (
                                <p className="small mb-0 mt-1">
                                  🏆 Nyerőszámok: <strong className="text-success">{draw.winningNumbers}</strong>
                                  {' · '}Kifizetés: <strong>{(draw.totalPayout||0).toLocaleString()} Ft</strong>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="d-flex gap-2 align-items-center flex-wrap">
                            {!draw.isDrawn && (
                              <Button size="sm"
                                variant={draw.isActive ? 'outline-warning' : 'outline-success'}
                                onClick={() => handleToggleActive(draw.id)}>
                                {draw.isActive ? <ToggleRight size={16}/> : <ToggleLeft size={16}/>}
                                {draw.isActive ? ' Deaktivál' : ' Aktivál'}
                              </Button>
                            )}
                            {canExecute && (
                              <Button size="sm" variant="danger" className="fw-bold"
                                onClick={() => handleExecuteDraw(draw.id, draw.gameType)}
                                disabled={isExecuting}>
                                {isExecuting
                                  ? <><Spinner size="sm" animation="border" className="me-1"/>Sorsolás...</>
                                  : <><Play size={14} className="me-1"/>Sorsolás indítása</>}
                              </Button> 
                            )}
                            {draw.isDrawn && (
                            <Button size="sm" variant="outline-primary"
                              onClick={() => handleViewResults(draw.id)}>
                              <Eye size={14} className="me-1"/> Eredmények
                            </Button>
                            )}
                            {!draw.isDrawn && (
                              <Button size="sm" variant="danger"
                                onClick={() => handleDeleteDraw(draw)}
                                title="Sorsolás törlése">
                                <Trash2 size={14} />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold text-danger">
                <Trash2 size={20} className="me-2"/>Sorsolás törlése
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Alert variant="danger" className="mb-3">
                <strong>⚠️ Figyelem!</strong> Ez a művelet nem visszavonható!
              </Alert>
              <p className="mb-1">Biztosan törölni szeretnéd ezt a sorsolást?</p>
              <p className="fw-bold mb-0">
                {GAME_LABELS[deletingDraw?.gameType] || deletingDraw?.gameType} — {deletingDraw && new Date(deletingDraw.drawDate).toLocaleString('hu-HU')}
              </p>
              {(deletingDraw?.ticketCount > 0) && (
                <Alert variant="warning" className="mt-3 mb-0 small">
                  ⚠️ Ehhez a sorsoláshoz <strong>{deletingDraw.ticketCount} szelvény</strong> tartozik — azok is törlésre kerülnek!
                </Alert>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>Mégse</Button>
              <Button variant="danger" className="fw-bold" onClick={confirmDeleteDraw} disabled={deleteLoading}>
                {deleteLoading
                  ? <Spinner size="sm" animation="border" className="me-1"/>
                  : <Trash2 size={16} className="me-1"/>}
                Törlés
              </Button>
            </Modal.Footer>
          </Modal>
          {/*FELHASZNÁLÓK*/}
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

          {/*SZELVÉNYEK*/}
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

          {/*BEÁLLÍTÁSOK*/}
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

      {/*Admin TopUp Modal*/}
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
      {/*Új sorsolás Modal*/}
      <Modal show={showCreateDraw} onHide={() => setShowCreateDraw(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            <Plus size={20} className="me-2 text-success"/>Új sorsolás
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium small">Játéktípus</Form.Label>
            <Form.Select value={newDraw.gameType}
              onChange={e => setNewDraw(p => ({
                ...p, gameType: e.target.value,
                ticketPrice: GAME_PRICES[e.target.value] || 400
              }))}>
              {Object.entries(GAME_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-medium small">Sorsolás dátuma</Form.Label>
            <Form.Control type="datetime-local" value={newDraw.drawDate}
              min={new Date(Date.now() + 60*60*1000).toISOString().slice(0,16)}
              onChange={e => setNewDraw(p => ({ ...p, drawDate: e.target.value }))}/>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-medium small">Szelvény ára</Form.Label>
            <InputGroup>
              <Form.Control type="number" min={1} value={newDraw.ticketPrice}
                onChange={e => setNewDraw(p => ({ ...p, ticketPrice: e.target.value }))}/>
              <InputGroup.Text>Ft</InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Alert variant="info" className="small mb-0">
            ℹ️ Létrehozás után aktiválni kell hogy lehessen rá szelvényt venni.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowCreateDraw(false)}>Mégse</Button>
          <Button variant="success" className="fw-bold" onClick={handleCreateDraw} disabled={createLoading}>
            {createLoading
              ? <Spinner size="sm" animation="border" className="me-1"/>
              : <Plus size={16} className="me-1"/>}
            Létrehozás
          </Button>
        </Modal.Footer>
      </Modal>
      {/*Eredmények Modal*/}
    <Modal show={showResults} onHide={() => setShowResults(false)} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">
          <Trophy size={20} className="me-2 text-warning"/>
          Sorsolás eredményei
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loadingResults ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="warning"/>
          </div>
        ) : drawResults ? (
          <>
            {/* Összefoglaló */}
            <div className="p-3 rounded-3 mb-4" style={{ background: 'linear-gradient(135deg, #fef3c7, #fff7ed)' }}>
              <Row className="g-3 text-center">
                <Col xs={6} md={3}>
                  <p className="text-muted small mb-1">Játék</p>
                  <p className="fw-bold mb-0">{GAME_LABELS[drawResults.gameType] || drawResults.gameType}</p>
                </Col>
                <Col xs={6} md={3}>
                  <p className="text-muted small mb-1">Nyerőszámok</p>
                  <p className="fw-bold mb-0 text-success">{drawResults.winningNumbers}</p>
                </Col>
                <Col xs={6} md={3}>
                  <p className="text-muted small mb-1">Összes szelvény</p>
                  <p className="fw-bold mb-0">{drawResults.totalTickets}</p>
                </Col>
                <Col xs={6} md={3}>
                  <p className="text-muted small mb-1">Kifizetés</p>
                  <p className="fw-bold mb-0 text-danger">{(drawResults.totalPayout || 0).toLocaleString()} Ft</p>
                </Col>
              </Row>
            </div>

            {/* Nyertesek */}
            <h6 className="fw-bold mb-3">
              🏆 Nyertesek ({drawResults.winnerCount})
            </h6>
            {drawResults.winners?.length > 0 ? (
              <div className="d-flex flex-column gap-2">
                {drawResults.winners.map((w, i) => (
                  <div key={i} className="border border-success rounded-3 p-3 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="fw-bold text-success">#{i + 1}</span>
                        <span className="fw-medium">👤 {w.username}</span>
                        <span className="text-muted small">{w.ticketCode}</span>
                      </div>
                      <p className="text-muted small mb-0">
                        🔢 Számok: <strong>{w.fieldsNumbers}</strong>
                        {' · '}
                        🎯 Találat: <strong>{w.matchesNumbers}</strong>
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="fw-bold text-success fs-5 mb-0">
                        +{(w.totalWinAmount || 0).toLocaleString()} Ft
                      </p>
                      <small className="text-muted">
                        {w.isPaidOut ? '✅ Kifizetve' : '⏳ Folyamatban'}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                <Trophy size={40} className="opacity-25 mb-2"/>
                <p>Ennél a sorsolásnál nem volt nyertes</p>
              </div>
            )}
          </>
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={() => setShowResults(false)}>
          Bezárás
        </Button>
      </Modal.Footer>
    </Modal>
    </Container>
  );
};

export default AdminPage;