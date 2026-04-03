import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Tabs, Tab } from 'react-bootstrap';
import { LogOut, User, Ticket, History, Settings, CreditCard, Edit3, Bell, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const AccountPage = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // const [ticketsData, transactionsData] = await Promise.all([
      //   api.user.getTickets(),
      //   api.user.getTransactions()
      // ]);
      // setTickets(ticketsData);
      // setTransactions(transactionsData);
    } catch (err) {
      console.error(err);
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

      <Row className="g-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm card-orange text-white h-100">
            <Card.Body>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white bg-opacity-20 p-3 rounded-3">
                  <User size={32} />
                </div>
                <div>
                  <p className="opacity-75 mb-1">Üdvözlünk,</p>
                  <h3 className="fw-bold">{user?.username || 'Felhasználó'}</h3>
                  <p className="opacity-75">{user?.email}</p>
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
                  <h2 className="fw-bold mb-0">{user?.balance?.toLocaleString() || '0'} Ft</h2>
                </div>
                <Button variant="light" className="text-dark">Feltöltés</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mt-4 shadow-sm border-0">
        <Card.Header className="bg-white border-0">
          <Tabs activeKey={activeTab} onSelect={setActiveTab}>
            <Tab eventKey="tickets" title={<span><Ticket size={16} className="me-1" /> Szelvényeim</span>} />
            <Tab eventKey="history" title={<span><History size={16} className="me-1" /> Előzmények</span>} />
            <Tab eventKey="settings" title={<span><Settings size={16} className="me-1" /> Beállítások</span>} />
          </Tabs>
        </Card.Header>

        <Card.Body>
          {activeTab === 'tickets' && (
            <div className="text-center py-5 text-muted">
              <Ticket size={60} className="opacity-25 mb-3" />
              <p>Még nincsenek szelvényeid</p>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="text-center py-5 text-muted">
              <History size={60} className="opacity-25 mb-3" />
              <p>Nincs még tranzakció</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <p className="text-center py-5 text-muted">Beállítások hamarosan (backend csatlakoztatása után)</p>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AccountPage;