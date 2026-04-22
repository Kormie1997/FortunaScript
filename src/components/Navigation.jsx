import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { 
  Home, 
  User, 
  Wallet, 
  LogOut, 
  Shield, 
  ShoppingCart, 
  Menu,
  Sparkles   // ← EZ HIÁNYZOTT!
} from 'lucide-react';

const Navigation = ({ user, currentView, onViewChange, onLogout, cartCount, onCartClick }) => {
  const [expanded, setExpanded] = useState(false);
  const isAdmin = user?.roles?.includes('admin');

  return (
    <Navbar 
      expand="lg" 
      bg="white" 
      className="shadow-sm border-bottom sticky-top"
      expanded={expanded}
    >
      <Container>
        {/* Logo */}
        <Navbar.Brand 
          onClick={() => onViewChange('home')}
          className="d-flex align-items-center gap-2 cursor-pointer"
        >
          <div className="card-orange text-white p-2 rounded-2">
            <Sparkles size={24} />
          </div>
          <span className="fw-bold fs-4 gradient-text">FortunaLotto</span>
          </Navbar.Brand>

        <Navbar.Toggle onClick={() => setExpanded(!expanded)} />

        <Navbar.Collapse>
        <Nav className="me-auto">
          <Nav.Link 
            onClick={() => { onViewChange('home'); setExpanded(false); }}
            active={currentView === 'home'}
          >
            <Home size={18} className="me-1" /> Főoldal
          </Nav.Link>
          <Nav.Link 
            onClick={() => { onViewChange('account'); setExpanded(false); }}
            active={currentView === 'account'}
          >
            <User size={18} className="me-1" /> Fiókom
          </Nav.Link>
          {isAdmin && (
            <Nav.Link 
              onClick={() => { onViewChange('admin'); setExpanded(false); }}
              active={currentView === 'admin'}
            >
              <Shield size={18} className="me-1" /> Admin
            </Nav.Link>
          )}
        </Nav>

        {/* Mobilon szürkés elválasztó */}
        <div className={`d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2 ${expanded ? 'mt-3 pt-3 border-top' : ''}`}
          style={expanded ? { background: '#f8f9fa', borderRadius: '8px', padding: '12px' } : {}}>

          {/* Egyenleg */}
          <div className="d-flex align-items-center gap-2 bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
            <Wallet size={18} />
            <span className="fw-semibold">{user?.balance?.toLocaleString() || '0'} Ft</span>
          </div>

          {/* Kosár */}
          <Button 
            variant="outline-warning" 
            className="position-relative"
            onClick={() => { onCartClick(); setExpanded(false); }}
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle">
                {cartCount > 9 ? '9+' : cartCount}
              </Badge>
            )}
          </Button>

          {/* Kijelentkezés */}
          <Button 
            variant="outline-danger" 
            onClick={() => { onLogout(); setExpanded(false); }}
          >
            <LogOut size={18} className="me-1" /> Kilépés
          </Button>
        </div>
      </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;