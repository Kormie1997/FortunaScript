import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Tabs, Tab, Form } from 'react-bootstrap';
import { Shield, Users, Ticket, TrendingUp, DollarSign, Search, Ban, CheckCircle, BarChart3, Pause, RotateCcw, Database, AlertTriangle, Settings } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const AdminPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTickets: 0,
    todayRevenue: 0,
    jackpotPool: 0,
  });
  const [systemStatus, setSystemStatus] = useState({
    maintenance: false,
    drawLocked: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      // const [statsData, usersData] = await Promise.all([
      //   api.admin.getStats(),
      //   api.admin.getUsers()
      // ]);
      // setStats(statsData);
      // setUsers(usersData);
    } catch (err) {
      console.error(err);
      toast.error('Nem sikerült betölteni az admin adatokat');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId) => {
    try {
      await api.admin.banUser(userId);
      toast.success('Felhasználó státusza megváltozott');
      loadAdminData();
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

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="card-red text-white p-3 rounded-3">
            <Shield size={28} />
          </div>
          <div>
            <h1 className="fw-bold mb-0">Admin Felület</h1>
            <p className="text-muted mb-0">Üdvözlünk, {user?.username}!</p>
          </div>
        </div>
        <Badge bg="danger" className="fs-6 px-4 py-2">ADMIN</Badge>
      </div>

      {/* Statisztika kártyák */}
      <Row className="g-4 mb-5">
        <Col md={3}>
          <Card className="border-0 shadow-sm text-white card-blue">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <p className="opacity-75 small">Felhasználók</p>
                  <h3 className="fw-bold mb-0">{stats.totalUsers}</h3>
                  <small>{stats.activeUsers} aktív</small>
                </div>
                <Users size={42} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        {/* További stat kártyák hasonlóan... */}
      </Row>

      {/* A többi tab (users, tickets, settings) ugyanígy üresen várja az adatokat */}
      {/* ... (a korábbi verzióból a users és settings rész maradhat, csak az adatok helyén loading vagy üres állapot) */}

      {loading && <p>Adatok betöltése...</p>}
    </Container>
  );
};

export default AdminPage;