import { useState, useEffect } from 'react';
import './App.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AccountPage from './pages/AccountPage';
import AdminPage from './pages/AdminPage';
import ConfirmEmailPage from './pages/ConfirmEmailPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import LotteryTicket from './components/LotteryTicket';
import Navigation from './components/Navigation';
import Cart from './components/Cart';
import { Toaster, toast } from 'sonner';
import InfoPage from './pages/InfoPage';

function App() {
  const [user, setUser]                   = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading]         = useState(true);
  const [currentView, setCurrentView]     = useState('home');
  const [selectedGame, setSelectedGame]   = useState(null);
  const [showRegister, setShowRegister]   = useState(false);
  const [cart, setCart]                   = useState([]);
  const [showCart, setShowCart]           = useState(false);
  const [specialRoute, setSpecialRoute]   = useState(null);
  const [infoPage, setInfoPage] = useState(null);

  useEffect(() => {
    const path   = window.location.pathname;
    const search = window.location.search;

    if (path === '/confirm-email') {
      setSpecialRoute('confirm-email');
      setIsLoading(false);
      return;
    }

    if (path === '/reset-password') {
      setSpecialRoute('reset-password');
      setIsLoading(false);
      return;
    }

    const token     = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedCart = localStorage.getItem('cart');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); }
      catch { localStorage.removeItem('cart'); }
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const goToLogin = () => {
    setSpecialRoute(null);
    window.history.replaceState({}, '', '/');
  };

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  const handleBalanceUpdate = (newBalance) => {
    const updatedUser = { ...user, balance: newBalance };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) return false;

      const data = await response.json();
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Regisztrációs hiba');
      }

      return true;
    } catch (err) {
      toast.error(err.message || 'Regisztrációs hiba történt');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCart([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setCurrentView('home');
    toast.info('Sikeres kijelentkezés!');
  };

  const addToCart = (item) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        i => i.gameId === item.gameId &&
          i.type === item.type &&
          JSON.stringify(i.numbers) === JSON.stringify(item.numbers)
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        toast.success('Mennyiség frissítve!');
        return updated;
      }
      toast.success('Hozzáadva a kosárhoz!');
      return [...prev, { ...item, id: Date.now() }];
    });
  };

  const removeFromCart = (index) => {
    setCart(prev => { const u = [...prev]; u.splice(index, 1); return u; });
    toast.info('Eltávolítva a kosárból');
  };

  const clearCart = () => { setCart([]); toast.info('Kosár kiürítve'); };

  const checkout = async () => {
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (totalPrice > (user?.balance || 0)) throw new Error('Nincs elegendő egyenleg');

    const tickets = cart.map(item => ({
      gameId: item.gameId, gameName: item.gameName, type: item.type,
      numbers: item.numbers, price: item.price, quantity: item.quantity
    }));

    const response = await fetch('/api/tickets/purchase', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ tickets })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      if (response.status === 403) throw new Error('A fiókod ki van tiltva! Lépj kapcsolatba az adminnal.');
      const error = new Error(err.message || 'Vásárlási hiba történt');
      error.errors = err.errors;
      throw error;
    }

    const data = await response.json();
    handleBalanceUpdate(data.newBalance ?? (user.balance - totalPrice));
    setCart([]);
    return true;
  };
  

  // ✅ Speciális route-ok
  if (specialRoute === 'confirm-email') {
    return (
      <>
        <Toaster position="top-right" richColors />
        <ConfirmEmailPage onGoToLogin={goToLogin} />
      </>
    );
  }

  if (specialRoute === 'reset-password') {
    return (
      <>
        <Toaster position="top-right" richColors />
        <ResetPasswordPage onGoToLogin={goToLogin} />
      </>
    );
  }

  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Betöltés...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <>
          <Toaster position="top-right" richColors />
          <RegisterPage onLoginClick={() => setShowRegister(false)} onRegister={register} />
        </>
      );
    }
    return (
      <>
        <Toaster position="top-right" richColors />
        <LoginPage onRegisterClick={() => setShowRegister(true)} onLogin={login} />
      </>
    );
  }

  const handleGameSelect = (game) => { setSelectedGame(game); setCurrentView('ticket'); };
  const handleBackFromGame = () => { setSelectedGame(null); setCurrentView('home'); };

  const renderView = () => {
    switch (currentView) {
      case 'home':    return infoPage
        ? <InfoPage page={infoPage} onBack={() => setInfoPage(null)} />
        : <HomePage onGameSelect={handleGameSelect} user={user} onInfoSelect={setInfoPage} />;
      case 'ticket':  return selectedGame
        ? <LotteryTicket game={selectedGame} onBack={handleBackFromGame} user={user} onAddToCart={addToCart} />
        : <HomePage onGameSelect={handleGameSelect} user={user} onInfoSelect={setInfoPage} />;
      case 'account': return <AccountPage user={user} onLogout={logout} onBalanceUpdate={handleBalanceUpdate} />;
      case 'admin':   return user?.roles?.includes('admin')
        ? <AdminPage user={user} />
        : <HomePage onGameSelect={handleGameSelect} user={user} onInfoSelect={setInfoPage} />;
      default:        return <HomePage onGameSelect={handleGameSelect} user={user} onInfoSelect={setInfoPage} />;
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Toaster position="top-right" richColors closeButton />
      <Navigation
        user={user}
        currentView={currentView === 'ticket' ? 'home' : currentView}
        onViewChange={setCurrentView}
        onLogout={logout}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setShowCart(true)}
      />
      <main className="container py-4">{renderView()}</main>  

      {showCart && (
        <Cart cart={cart} onClose={() => setShowCart(false)}
          onRemove={removeFromCart} onClear={clearCart}
          onCheckout={checkout} user={user} />
      )}
    </div>
  );
}

export default App;