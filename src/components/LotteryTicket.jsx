import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Zap, RefreshCw, ShoppingCart, Play, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const GAME_CONFIGS = {
  'Ötös Lottó':     { maxNumbers: 5,  numberRange: 90, gridCols: 15, pricePerPanel: 400 },
  'Hatos Lottó':    { maxNumbers: 6,  numberRange: 45, gridCols: 9,  pricePerPanel: 400 },
  'Skandináv Lottó':{ maxNumbers: 7,  numberRange: 35, gridCols: 7,  pricePerPanel: 400 },
  'Eurojackpot':    { maxNumbers: 5,  numberRange: 50, gridCols: 10, pricePerPanel: 820, bonusNumbers: 2, bonusRange: 12 },
  'Joker':          { maxNumbers: 6,  numberRange: 10, gridCols: 10, pricePerPanel: 300, isDigitGame: true },
};

const DEFAULT_CONFIG = { maxNumbers: 5, numberRange: 90, gridCols: 15, pricePerPanel: 400 };
const JOKER_PRICE    = 300;
const MAX_EXTRA      = 14;
const MAX_FIELDS     = 6;

// ✅ Reszponzív oszlopszám számítás
const getGridCols = (maxCols) => {
  const w = window.innerWidth;
  if (w <= 360) return Math.min(maxCols, 6);
  if (w <= 480) return Math.min(maxCols, 7);
  if (w <= 576) return Math.min(maxCols, 9);
  if (w <= 768) return Math.min(maxCols, 10);
  if (w <= 1024) return Math.min(maxCols, 12);
  return maxCols;
};

function LotteryTicket({ game, onBack, user, onAddToCart }) {
  const config = GAME_CONFIGS[game?.name] || DEFAULT_CONFIG;

  const [panels, setPanels]             = useState([]);
  const [extraPanels, setExtraPanels]   = useState([]);
  const [jokerNumbers, setJokerNumbers] = useState(['', '', '']);
  const [jokerErrors, setJokerErrors]   = useState(['', '', '']);
  const [extraGames, setExtraGames]     = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bonusNumbers, setBonusNumbers] = useState({});
  // ✅ Ablak méret figyelése
  const [windowWidth, setWindowWidth]   = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setPanels(Array.from({ length: MAX_FIELDS }, (_, i) => ({ id: i + 1, numbers: [], isLocked: false })));
    setExtraPanels([]);
    setJokerNumbers(['', '', '']);
    setJokerErrors(['', '', '']);
    setBonusNumbers({});
    setExtraGames(0);
  }, [game]);

  //Szám toggle
  const toggleNumber = (panelId, num) => {
    setPanels(prev => prev.map(panel => {
      if (panel.id !== panelId || panel.isLocked) return panel;
      if (panel.numbers.includes(num))
        return { ...panel, numbers: panel.numbers.filter(n => n !== num) };
      if (panel.numbers.length >= config.maxNumbers) {
        toast.info(`Maximum ${config.maxNumbers} szám választható!`);
        return panel;
      }
      return { ...panel, numbers: [...panel.numbers, num].sort((a, b) => a - b) };
    }));
  };

  //Eurojackpot bónusz toggle — mezőnként
  const toggleBonusNumber = (panelId, num) => {
    const current = bonusNumbers[panelId] || [];
    if (current.includes(num)) {
      setBonusNumbers(prev => ({ ...prev, [panelId]: current.filter(n => n !== num) }));
    } else {
      if (current.length >= (config.bonusNumbers || 0)) {
        toast.info(`Maximum ${config.bonusNumbers} bónusz szám választható!`);
        return;
      }
      setBonusNumbers(prev => ({ ...prev, [panelId]: [...current, num].sort((a, b) => a - b) }));
    }
  };

  //Gyorstipp
  const quickPick = (panelId) => {
    const min   = config.isDigitGame ? 0 : 1;
    const range = Array.from({ length: config.numberRange }, (_, i) => i + min);
    const random = range.sort(() => 0.5 - Math.random()).slice(0, config.maxNumbers).sort((a, b) => a - b);
    setPanels(prev => prev.map(p => p.id === panelId ? { ...p, numbers: random } : p));

    if (config.bonusNumbers) {
      const bonus = Array.from({ length: config.bonusRange || 12 }, (_, i) => i + 1)
        .sort(() => 0.5 - Math.random()).slice(0, config.bonusNumbers).sort((a, b) => a - b);
      setBonusNumbers(prev => ({ ...prev, [panelId]: bonus }));
    }
  };

  const clearPanel = (panelId) => {
    setPanels(prev => prev.map(p => p.id === panelId ? { ...p, numbers: [] } : p));
    if (config.bonusNumbers)
      setBonusNumbers(prev => ({ ...prev, [panelId]: [] }));
  };

  //Gépi generálás
  const generateExtra = () => {
    const count = Math.min(MAX_EXTRA, Math.max(0, parseInt(extraGames) || 0));
    if (count === 0) return toast.error('Adj meg legalább 1 gépi játékot!');
    const min = config.isDigitGame ? 0 : 1;
    const newExtras = Array.from({ length: count }, (_, i) => ({
      id: `extra-${Date.now()}-${i}`,
      numbers: Array.from({ length: config.numberRange }, (_, j) => j + min)
        .sort(() => 0.5 - Math.random()).slice(0, config.maxNumbers).sort((a, b) => a - b),
      isLocked: true
    }));
    setExtraPanels(newExtras);
    toast.success(`${count} gépi mező generálva!`);
  };

  const removeExtraPanel = (id) => setExtraPanels(prev => prev.filter(p => p.id !== id));

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
    const e = [...jokerErrors]; e[idx] = ''; setJokerErrors(e);
  };

  //Ár számítás
  const isPanelFilled = (panel) => {
    if (config.bonusNumbers) {
      const bonus = bonusNumbers[panel.id] || [];
      return panel.numbers.length === config.maxNumbers && bonus.length === config.bonusNumbers;
    }
    return panel.numbers.length === config.maxNumbers;
  };

  const getFilledCount = () => panels.filter(p => isPanelFilled(p)).length;
  const getJokerCount  = () => jokerNumbers.filter(n => n.length === 6).length;
  const getTotalPrice  = () =>
    (getFilledCount() + extraPanels.length) * config.pricePerPanel + getJokerCount() * JOKER_PRICE;

  //Validáció
  const validateBeforeAction = () => {
    if (getFilledCount() === 0 && extraPanels.length === 0 && getJokerCount() === 0) {
      toast.error('Tölts ki legalább egy mezőt!'); return false;
    }
    if (jokerNumbers.some(n => n.length > 0 && n.length < 6)) {
      toast.error('A Joker mezőknek pontosan 6 számjegyesnek kell lenniük!'); return false;
    }
    if (getTotalPrice() > (user?.balance || 0)) {
      toast.error(`Nincs elegendő egyenleg! Szükséges: ${getTotalPrice().toLocaleString()} Ft`); return false;
    }
    return true;
  };

  //Payload
  const buildTicketsPayload = () => {
    const tickets = [];
    panels.forEach(panel => {
      if (isPanelFilled(panel)) {
        let numbers = panel.numbers;
        if (config.bonusNumbers) {
          const bonus = bonusNumbers[panel.id] || [];
          numbers = `${panel.numbers.join(';')}+${bonus.join(';')}`;
        }
        tickets.push({ gameId: game.id || 1, gameName: game.name, type: 'panel', numbers, price: config.pricePerPanel, quantity: 1 });
      }
    });
    extraPanels.forEach(panel => {
      tickets.push({ gameId: game.id || 1, gameName: game.name, type: 'extra', numbers: panel.numbers, price: config.pricePerPanel, quantity: 1 });
    });
    jokerNumbers.forEach(num => {
      if (num.length === 6)
        tickets.push({ gameId: 6, gameName: 'Joker', type: 'joker', numbers: num, price: JOKER_PRICE, quantity: 1 });
    });
    return tickets;
  };

  const resetForm = () => {
    setPanels(prev => prev.map(p => ({ ...p, numbers: [] })));
    setExtraPanels([]); setJokerNumbers(['', '', '']); setJokerErrors(['', '', '']);
    setBonusNumbers({}); setExtraGames(0);
  };

  const handleAddToCart = () => {
  if (!validateBeforeAction()) return;
  const tickets = buildTicketsPayload();
  if (!tickets.length) return;
  tickets.forEach(t => onAddToCart?.(t));
  toast.success(`${tickets.length} szelvény kosárba helyezve!`); 
  resetForm();
};

  const handlePlay = async () => {
    if (!validateBeforeAction()) return;
    const tickets = buildTicketsPayload();
    if (!tickets.length) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/tickets/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ tickets })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) data.errors.forEach(err => toast.error(err));
        else toast.error(data.message || 'Vásárlási hiba történt!');
        return;
      }
      toast.success(`${data.ticketsBought} szelvény sikeresen leadva! Sok szerencsét! 🍀`);
      resetForm();
    } catch { toast.error('Szerverhiba — próbáld újra!'); }
    finally { setIsSubmitting(false); }
  };

  // ✅ Számrács — reszponzív oszlopszámmal
  const renderNumberGrid = (panel) => {
    const min  = config.isDigitGame ? 0 : 1;
    const nums = Array.from({ length: config.numberRange }, (_, i) => i + min);
    const cols = getGridCols(config.gridCols);
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: windowWidth <= 576 ? '2px' : '3px',
        marginTop: '8px',
        width: '100%'
      }}>
        {nums.map(num => {
          const isSelected = panel.numbers.includes(num);
          const canSelect  = panel.numbers.length < config.maxNumbers || isSelected;
          return (
            <button
              key={num}
              onClick={() => toggleNumber(panel.id, num)}
              disabled={panel.isLocked || (!canSelect && !isSelected)}
              className={`
                aspect-square rounded font-medium transition-all border
                flex items-center justify-center
                ${isSelected
                  ? 'bg-red-600 text-white border-red-600 font-bold'
                  : panel.isLocked
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : canSelect
                      ? 'bg-white text-gray-700 border-gray-300 hover:bg-amber-50 hover:border-amber-400'
                      : 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
                }
              `}
              style={{
                fontSize: windowWidth <= 480 ? '10px' : windowWidth <= 768 ? '11px' : '12px',
                minHeight: windowWidth <= 480 ? '24px' : '28px'
              }}
            >
              {num}
            </button>
          );
        })}
      </div>
    );
  };

  // ✅ Eurojackpot bónusz rács — mezőnként külön
  const renderBonusGrid = (panelId) => {
    if (!config.bonusNumbers) return null;
    const current = bonusNumbers[panelId] || [];
    const bonusCols = windowWidth <= 576 ? 6 : 12;
    return (
      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm font-medium text-amber-800 mb-2">
          🌟 Bónusz számok ({current.length}/{config.bonusNumbers}) — válassz {config.bonusNumbers} számot 1–{config.bonusRange} közül
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${bonusCols}, minmax(0, 1fr))`, gap: '3px' }}>
          {Array.from({ length: config.bonusRange || 12 }, (_, i) => i + 1).map(num => {
            const isSelected = current.includes(num);
            const canSelect  = current.length < (config.bonusNumbers || 0) || isSelected;
            return (
              <button key={num} onClick={() => toggleBonusNumber(panelId, num)}
                disabled={!canSelect && !isSelected}
                className={`aspect-square rounded text-xs font-medium border transition-all
                  ${isSelected ? 'bg-amber-500 text-white border-amber-500'
                    : canSelect ? 'bg-white border-amber-300 hover:bg-amber-100'
                    : 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'}`}
                style={{ minHeight: '28px' }}>
                {num}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const totalPrice        = getTotalPrice();
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

      <div className="ticket-wrapper">
        {/* Sidebar */}
        <div className="ticket-sidebar">
          <div className="text-center mb-4">
            <img src="/images/joker.png" alt="Joker"
              style={{ height: '48px', maxWidth: '100px', objectFit: 'contain' }}
              className="mx-auto d-block" />
            <p className="text-sm text-gray-500 mt-1">{JOKER_PRICE} Ft/db</p>
          </div>

          {jokerNumbers.map((num, idx) => (
            <div key={idx} className="mb-2">
              <div className="joker-row" style={{ display: 'flex', gap: '6px', width: '100%' }}>
                <input
                  type="text"
                  maxLength={6}
                  value={num}
                  onChange={e => handleJokerChange(idx, e.target.value)}
                  placeholder="------"
                  style={{ flex: 1, minWidth: 0 }}
                  className={`joker-input px-3 py-2 border-2 rounded-lg focus:outline-none ${
                    jokerErrors[idx] ? 'border-red-400' : num.length === 6 ? 'border-green-400' : 'border-gray-200 focus:border-amber-500'
                  }`}
                />
                <button
                  onClick={() => quickJoker(idx)}
                  style={{ flexShrink: 0 }}
                  className="px-2 py-2 border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50">
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

          <hr className="my-4" />

          <div className="mb-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }} className="mb-2">
              <label className="text-sm font-medium text-gray-700 flex-shrink-0">
                Gépi játékok (0-{MAX_EXTRA})
              </label>
              <input type="number" min={0} max={MAX_EXTRA} value={extraGames}
                onChange={e => setExtraGames(Math.min(MAX_EXTRA, Math.max(0, parseInt(e.target.value) || 0)))}
                style={{ width: '60px', flexShrink: 0 }}
                className="px-2 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" />
            </div>
            <button onClick={generateExtra}
              className="w-full px-4 py-2 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 font-medium">
              Generálás
            </button>
          </div>

          <hr className="my-4" />

          <div className="price-box">
            <div>KITÖLTÖTT MEZŐK: <span>{getFilledCount()}</span></div>
            <div>GÉPI JÁTÉKOK: <span>{extraPanels.length}</span></div>
            <div>JOKER: <span>{getJokerCount()}</span></div>
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
            className="btn-green flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-black">
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
                      isPanelFilled(panel) ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {panel.numbers.length}/{config.maxNumbers}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => clearPanel(panel.id)}
                    className="px-3 py-1.5 border border-gray-300 text-red-500 text-gray-600 text-sm rounded-md hover:bg-gray-100 flex items-center gap-1">
                    <Trash2 className="w-4 h-4" /> Törlés
                  </button>
                  <button onClick={() => quickPick(panel.id)}
                    className="px-3 py-1.5 bg-blue-500 text-black text-sm rounded-md hover:bg-blue-600 flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    <span className="hidden sm:inline">Gyorstipp</span>
                  </button>
                </div>
              </div>
              <div className="selected-numbers">
                Kiválasztott: {panel.numbers.length > 0 ? panel.numbers.join(', ') : '-'}
                {isPanelFilled(panel) && <span className="check">✓</span>}
              </div>
              {renderNumberGrid(panel)}
              {/*Eurojackpot: minden mezőhöz saját bónusz */}
              {renderBonusGrid(panel.id)}
            </div>
          ))}

          {extraPanels.map((panel, idx) => (
            <div key={panel.id} className="ticket-panel locked">
              <div className="ticket-header">
                <strong>Gépi {idx + 1}</strong>
                <button onClick={() => removeExtraPanel(panel.id)}
                  className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 flex items-center gap-1">
                  <Trash2 className="w-4 h-4" /> Törlés
                </button>
              </div>
              <div className="selected-numbers">{panel.numbers.join(', ')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LotteryTicket;