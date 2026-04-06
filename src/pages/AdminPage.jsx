import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Tabs, Tab, Form, Spinner } from 'react-bootstrap';
import { Shield, Users, Ticket, TrendingUp, DollarSign, Search, Ban, CheckCircle, BarChart3, Pause, RotateCcw, Database, AlertTriangle, Settings, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

// Stat kártya komponens
const StatCard = ({ title, value, sub, icon: Icon, gradient }) => (
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
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    maintenance: false,
    drawLocked: false,
  });

  //Dashboard statisztikák
  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadStats();
    }
  }, [activeTab]);

  //Felhasználók betöltése
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
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

  const handleBanUser = async (userId) => {
    try {
      await api.admin.banUser(userId);
      toast.success('Felhasználó státusza megváltozott');
      loadUsers();
    } catch (err) {
      toast.error('Hiba a tiltás során');
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

  // Szűrt felhasználók
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

      {/* Táblázatos nézet */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white border-0 pb-0">
          <Tabs activeKey={activeTab} onSelect={setActiveTab}>
            <Tab eventKey="dashboard" title={<span><BarChart3 size={16} className="me-1" />Áttekintés</span>} />
            <Tab eventKey="users"     title={<span><Users size={16} className="me-1" />Felhasználók</span>} />
            <Tab eventKey="settings"  title={<span><Settings size={16} className="me-1" />Beállítások</span>} />
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

                  {/* Pénzügyi összesítő (kisebb részlet) */}
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
                              { label: 'Összes bevétel',         value: stats.totalRevenue,  color: 'success' },
                              { label: 'Kifizetett nyeremények', value: stats.totalPayouts,  color: 'warning' },
                              { label: 'Rendszerben lévő Ft',    value: stats.totalBalance,  color: 'info' },
                            ].map((item, i) => (
                              <Col md={4} key={i}>
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

          {/*FELHASZNÁLÓK*/}
          {activeTab === 'users' && (
            <div className="text-center py-5">
              <Users size={48} className="text-muted mb-3" />
              <p className="text-muted">Felhasználókezelés fejlesztés alatt...</p>
              <small className="text-muted">(2. fázisban érkezik)</small>
            </div>
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
    </Container>
  );
};

export default AdminPage;