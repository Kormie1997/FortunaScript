import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Zap, RefreshCw, ShoppingCart, Play, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const KENO_BASE_PRICE = 350;  
const KENO_RANGE      = 80;   
const MAX_FIELDS      = 6;    
const JOKER_PRICE     = 300;
const MAX_JOKER       = 3;

// Tét szorzók
const BET_MULTIPLIERS = [1, 2, 3, 4, 5];

// Játéktípus: hány számot kell kiválasztani (1-10)
const GAME_TYPES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function KenoTicket({ game, onBack, user, onAddToCart }) {
  const [panels, setPanels]             = useState([]);
  const [gameType, setGameType]         = useState(5);   // default: 5 szám
  const [betMultiplier, setBetMultiplier] = useState(1); // default: 1x
  const [jokerNumbers, setJokerNumbers] = useState(['', '', '']);
  const [jokerErrors, setJokerErrors]   = useState(['', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mezők inicializálása
  useEffect(() => {
    setPanels(Array.from({ length: MAX_FIELDS }, (_, i) => ({
      id: i + 1,
      numbers: [],
      isLocked: false
    })));
  }, []);

  // Ha változik a játéktípus, töröljük a túl sok számot
  useEffect(() => {
    setPanels(prev => prev.map(p => ({
      ...p,
      numbers: p.numbers.slice(0, gameType)
    })));
  }, [gameType]);

  //Szám toggle
  const toggleNumber = (panelId, num) => {
    setPanels(prev => prev.map(panel => {
      if (panel.id !== panelId || panel.isLocked) return panel;
      if (panel.numbers.includes(num))
        return { ...panel, numbers: panel.numbers.filter(n => n !== num) };
      if (panel.numbers.length >= gameType) {
        toast.info(`Maximum ${gameType} szám választható!`);
        return panel;
      }
      return { ...panel, numbers: [...panel.numbers, num].sort((a, b) => a - b) };
    }));
  };

  //Gyorstipp
  const quickPick = (panelId) => {
    const random = Array.from({ length: KENO_RANGE }, (_, i) => i + 1)
      .sort(() => 0.5 - Math.random())
      .slice(0, gameType)
      .sort((a, b) => a - b);
    setPanels(prev => prev.map(p => p.id === panelId ? { ...p, numbers: random } : p));
  };

  const clearPanel = (panelId) => {
    setPanels(prev => prev.map(p => p.id === panelId ? { ...p, numbers: [] } : p));
  };

  //Joker
  const handleJokerChange = (idx, value) => {
    const val = value.replace(/\D/g, '').slice(0, 6);
    setJokerNumbers(prev => { const n = [...prev]; n[idx] = val; return n; });
    const newErrors = [...jokerErrors];
    newErrors[idx] = val.length > 0 && val.length < 6 ? 'Pontosan 6 számjegy szükséges' : '';
    setJokerErrors(newErrors);
  };

  const quickJoker = (idx) => {
    let num = '';
    for (let i = 0; i < 6; i++) num += Math.floor(Math.random() * 10);
    setJokerNumbers(prev => { const n = [...prev]; n[idx] = num; return n; });
    const newErrors = [...jokerErrors]; newErrors[idx] = '';
    setJokerErrors(newErrors);
  };

  //Ár számítás
  const getFilledCount = () => panels.filter(p => p.numbers.length === gameType).length;
  const getJokerCount  = () => jokerNumbers.filter(n => n.length === 6).length;
  const getPanelPrice  = () => KENO_BASE_PRICE * betMultiplier;
  const getTotalPrice  = () =>
    getFilledCount() * getPanelPrice() + getJokerCount() * JOKER_PRICE;

  //Validáció
  const validateBeforeAction = () => {
    if (getFilledCount() === 0 && getJokerCount() === 0) {
      toast.error('Tölts ki legalább egy mezőt!');
      return false;
    }
    const partialJoker = jokerNumbers.some(n => n.length > 0 && n.length < 6);
    if (partialJoker) {
      toast.error('A Joker mezőknek pontosan 6 számjegyesnek kell lenniük!');
      return false;
    }
    const totalPrice = getTotalPrice();
    if (totalPrice > (user?.balance || 0)) {
      toast.error(`Nincs elegendő egyenleg! Szükséges: ${totalPrice.toLocaleString()} Ft`);
      return false;
    }
    return true;
  };

  //Payload
  const buildTicketsPayload = () => {
    const tickets = [];
    panels.forEach(panel => {
      if (panel.numbers.length === gameType) {
        tickets.push({
          gameId:   game.id || 5,
          gameName: game.name,
          type:     'panel',
          numbers:  panel.numbers,
          price:    getPanelPrice(),
          quantity: 1,
          // Extra Kenó infók
          kenoGameType:    gameType,
          kenoBetMultiplier: betMultiplier,
        });
      }
    });
    jokerNumbers.forEach(num => {
      if (num.length === 6) {
        tickets.push({
          gameId: 6, gameName: 'Joker', type: 'joker',
          numbers: num, price: JOKER_PRICE, quantity: 1
        });
      }
    });
    return tickets;
  };

  const resetForm = () => {
    setPanels(prev => prev.map(p => ({ ...p, numbers: [] })));
    setJokerNumbers(['', '', '']);
    setJokerErrors(['', '', '']);
  };

  //Kosárba
  const handleAddToCart = () => {
    if (!validateBeforeAction()) return;
    const tickets = buildTicketsPayload();
    tickets.forEach(t => onAddToCart?.(t));
    toast.success(`${tickets.length} szelvény kosárba helyezve!`);
    resetForm();
  };

  //Megjátszom
  const handlePlay = async () => {
    if (!validateBeforeAction()) return;
    const tickets = buildTicketsPayload();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/tickets/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ tickets })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors))
          data.errors.forEach(err => toast.error(err));
        else toast.error(data.message || 'Vásárlási hiba!');
        return;
      }
      toast.success(`${data.ticketsBought} szelvény leadva! Sok szerencsét! 🍀`);
      resetForm();
    } catch {
      toast.error('Szerverhiba — próbáld újra!');
    } finally {
      setIsSubmitting(false);
    }
  };

  //Számrács
  const renderNumberGrid = (panel) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', gap: '3px', marginTop: '8px' }}>
      {Array.from({ length: KENO_RANGE }, (_, i) => i + 1).map(num => {
        const isSelected = panel.numbers.includes(num);
        const canSelect  = panel.numbers.length < gameType || isSelected;
        return (
          <button
            key={num}
            onClick={() => toggleNumber(panel.id, num)}
            disabled={panel.isLocked || (!canSelect && !isSelected)}
            className={`
              aspect-square rounded font-medium text-xs transition-all border
              flex items-center justify-center
              ${isSelected
                ? 'bg-pink-600 text-white border-pink-600 font-bold'
                : canSelect
                  ? 'bg-white text-gray-700 border-gray-300 hover:bg-pink-50 hover:border-pink-400'
                  : 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
              }
            `}
            style={{ minHeight: '28px' }}
          >
            {num}
          </button>
        );
      })}
    </div>
  );

  const totalPrice       = getTotalPrice();
  const insufficientFunds = totalPrice > 0 && totalPrice > (user?.balance || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4">
          <img src={game.logo} alt={game.name} style={{ height: '48px', maxWidth: '120px', objectFit: 'contain' }} />
          <div>
            <h1 className="text-2xl font-bold">{game.name}</h1>
            <p className="text-gray-600 text-sm">{game.description}</p>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="ticket-wrapper">

        {/* Sidebar */}
        <div className="ticket-sidebar">

          {/* Játéktípus */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Játéktípus (hány szám)</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
              {GAME_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setGameType(t)}
                  className={`py-1.5 text-sm font-bold rounded border-2 transition-all ${
                    gameType === t
                      ? 'bg-pink-600 text-white border-pink-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-pink-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Tét szorzó */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Tét</p>
            <div className="flex gap-1">
              {BET_MULTIPLIERS.map(m => (
                <button
                  key={m}
                  onClick={() => setBetMultiplier(m)}
                  className={`flex-1 py-1.5 text-sm font-bold rounded border-2 transition-all ${
                    betMultiplier === m
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400'
                  }`}
                >
                  {m}x
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              Szelvény ára: {getPanelPrice().toLocaleString()} Ft
            </p>
          </div>

          <hr className="my-3" />

          {/* Joker */}
          <div className="text-center mb-3">
            <img src="/images/joker.png" alt="Joker"
              style={{ height: '40px', maxWidth: '90px', objectFit: 'contain' }}
              className="mx-auto d-block" />
            <p className="text-sm text-gray-500 mt-1">{JOKER_PRICE} Ft/db</p>
          </div>

          {jokerNumbers.map((num, idx) => (
            <div key={idx} className="mb-2">
              <div className="joker-row">
                <input
                  type="text" maxLength={6} value={num}
                  onChange={e => handleJokerChange(idx, e.target.value)}
                  placeholder="------"
                  className={`joker-input flex-1 px-3 py-2 border-2 rounded-lg focus:outline-none ${
                    jokerErrors[idx] ? 'border-red-400' : num.length === 6 ? 'border-green-400' : 'border-gray-200 focus:border-amber-500'
                  }`}
                />
                <button onClick={() => quickJoker(idx)}
                  className="px-3 py-2 border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              {jokerErrors[idx] && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {jokerErrors[idx]}
                </p>
              )}
            </div>
          ))}

          <hr className="my-3" />

          {/* Összesítő */}
          <div className="price-box">
            <div>KITÖLTÖTT MEZŐK: <span>{getFilledCount()}</span></div>
            <div>JOKER: <span>{getJokerCount()}</span></div>
            <div>TÉT: <span>{betMultiplier}x ({getPanelPrice().toLocaleString()} Ft/mező)</span></div>
            <div>ÁR ÖSSZESEN: <span className={insufficientFunds ? 'text-red-500' : ''}>
              {totalPrice.toLocaleString()} Ft
            </span></div>
          </div>

          {insufficientFunds && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-xs flex items-center gap-1">
                <AlertCircle size={12} />
                Hiányzik: {(totalPrice - (user?.balance || 0)).toLocaleString()} Ft
              </p>
            </div>
          )}

          <button onClick={handleAddToCart}
            disabled={totalPrice === 0 || insufficientFunds}
            className="btn-yellow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <ShoppingCart className="w-5 h-5" /> KOSÁRBA
          </button>
          <button onClick={handlePlay}
            disabled={isSubmitting || totalPrice === 0 || insufficientFunds}
            className="btn-green flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
            MEGJÁTSZOM
          </button>
        </div>

        {/* Mezők */}
        <div className="ticket-main">
          {panels.map((panel, idx) => (
            <div key={panel.id} className={`ticket-panel ${panel.isLocked ? 'locked' : ''}`}>
              <div className="ticket-header">
                <div className="flex items-center gap-2">
                  <strong>{idx + 1}. mező</strong>
                  {panel.numbers.length > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      panel.numbers.length === gameType
                        ? 'bg-green-100 text-green-700'
                        : 'bg-pink-100 text-pink-700'
                    }`}>
                      {panel.numbers.length}/{gameType}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => clearPanel(panel.id)}
                    className="px-3 py-1.5 border border-gray-300 text-gray-600 text-sm rounded-md hover:bg-gray-100 flex items-center gap-1">
                    <Trash2 className="w-4 h-4" /> Törlés
                  </button>
                  <button onClick={() => quickPick(panel.id)}
                    className="px-3 py-1.5 bg-pink-500 text-white text-sm rounded-md hover:bg-pink-600 flex items-center gap-1">
                    <Zap className="w-4 h-4" /> Gyorstipp
                  </button>
                </div>
              </div>
              <div className="selected-numbers">
                Kiválasztott: {panel.numbers.length > 0 ? panel.numbers.join(', ') : '-'}
                {panel.numbers.length === gameType && <span className="check">✓</span>}
              </div>
              {renderNumberGrid(panel)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default KenoTicket;