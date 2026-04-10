import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Zap, RefreshCw, ShoppingCart, Play, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const PRICE_PER_PANEL = 400;
const JOKER_PRICE     = 300;
const MAX_NUMBERS     = 5;
const NUMBER_RANGE    = 90;
const MAX_EXTRA       = 14;
const MAX_JOKER       = 3;

function LotteryTicket({ game, onBack, user, onAddToCart }) {
  const [panels, setPanels]             = useState([]);
  const [extraPanels, setExtraPanels]   = useState([]);
  const [jokerNumbers, setJokerNumbers] = useState(['', '', '']);
  const [extraGames, setExtraGames]     = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jokerErrors, setJokerErrors]   = useState(['', '', '']);

  useEffect(() => {
    setPanels(Array.from({ length: 6 }, (_, i) => ({
      id: i + 1, numbers: [], isLocked: false
    })));
  }, [game]);

  const toggleNumber = (panelId, num) => {
    setPanels(prev => prev.map(panel => {
      if (panel.id !== panelId || panel.isLocked) return panel;
      if (panel.numbers.includes(num))
        return { ...panel, numbers: panel.numbers.filter(n => n !== num) };
      if (panel.numbers.length >= MAX_NUMBERS) {
        toast.info(`Maximum ${MAX_NUMBERS} szám választható!`);
        return panel;
      }
      return { ...panel, numbers: [...panel.numbers, num].sort((a, b) => a - b) };
    }));
  };

  const quickPick = (panelId) => {
    const random = Array.from({ length: NUMBER_RANGE }, (_, i) => i + 1)
      .sort(() => 0.5 - Math.random())
      .slice(0, MAX_NUMBERS)
      .sort((a, b) => a - b);
    setPanels(prev => prev.map(p => p.id === panelId ? { ...p, numbers: random } : p));
  };

  const clearPanel = (panelId) => {
    setPanels(prev => prev.map(p => p.id === panelId ? { ...p, numbers: [] } : p));
  };

  const generateExtra = () => {
    const count = Math.min(MAX_EXTRA, Math.max(0, parseInt(extraGames) || 0));
    if (count === 0) return toast.error('Adj meg legalább 1 gépi játékot!');
    if (count > MAX_EXTRA) return toast.error(`Maximum ${MAX_EXTRA} gépi játék adható meg!`);

    const newExtras = Array.from({ length: count }, (_, i) => ({
      id: `extra-${Date.now()}-${i}`,
      numbers: Array.from({ length: NUMBER_RANGE }, (_, i) => i + 1)
        .sort(() => 0.5 - Math.random())
        .slice(0, MAX_NUMBERS)
        .sort((a, b) => a - b),
      isLocked: true
    }));
    setExtraPanels(newExtras);
    toast.success(`${count} gépi mező generálva!`);
  };

  const removeExtraPanel = (id) => setExtraPanels(prev => prev.filter(p => p.id !== id));

  const handleJokerChange = (idx, value) => {
    const val = value.replace(/\D/g, '').slice(0, 6);
    setJokerNumbers(prev => { const n = [...prev]; n[idx] = val; return n; });

    const newErrors = [...jokerErrors];
    if (val.length > 0 && val.length < 6) {
      newErrors[idx] = 'Pontosan 6 számjegy szükséges';
    } else {
      newErrors[idx] = '';
    }
    setJokerErrors(newErrors);
  };

  const quickJoker = (idx) => {
    let num = '';
    for (let i = 0; i < 6; i++) num += Math.floor(Math.random() * 10);
    setJokerNumbers(prev => { const n = [...prev]; n[idx] = num; return n; });
    const newErrors = [...jokerErrors];
    newErrors[idx] = '';
    setJokerErrors(newErrors);
  };

  const getFilledCount = () => panels.filter(p => p.numbers.length === MAX_NUMBERS).length;
  const getJokerCount  = () => jokerNumbers.filter(n => n.length === 6).length;
  const getTotalPrice  = () =>
    (getFilledCount() + extraPanels.length) * PRICE_PER_PANEL + getJokerCount() * JOKER_PRICE;

  const validateBeforeAction = () => {
    const filled    = getFilledCount();
    const extras    = extraPanels.length;
    const jokers    = getJokerCount();
    const totalPrice = getTotalPrice();

    if (filled === 0 && extras === 0 && jokers === 0) {
      toast.error('Tölts ki legalább egy mezőt!');
      return false;
    }

    const partialJoker = jokerNumbers.some(n => n.length > 0 && n.length < 6);
    if (partialJoker) {
      toast.error('A Joker mezőknek pontosan 6 számjegyesnek kell lenniük!');
      return false;
    }

    if (totalPrice <= 0) {
      toast.error('Érvénytelen összeg!');
      return false;
    }

    if (totalPrice > (user?.balance || 0)) {
      toast.error(
        `Nincs elegendő egyenleg! Szükséges: ${totalPrice.toLocaleString()} Ft, ` +
        `elérhető: ${(user?.balance || 0).toLocaleString()} Ft`
      );
      return false;
    }

    return true;
  };

  const buildTicketsPayload = () => {
    const tickets = [];

    panels.forEach(panel => {
      if (panel.numbers.length === MAX_NUMBERS) {
        tickets.push({
          gameId:   game.id || 1,
          gameName: game.name,
          type:     'panel',
          numbers:  panel.numbers,
          price:    PRICE_PER_PANEL,
          quantity: 1
        });
      }
    });

    extraPanels.forEach(panel => {
      tickets.push({
        gameId:   game.id || 1,
        gameName: game.name,
        type:     'extra',
        numbers:  panel.numbers,
        price:    PRICE_PER_PANEL,
        quantity: 1
      });
    });

    jokerNumbers.forEach(num => {
      if (num.length === 6) {
        tickets.push({
          gameId:   6,
          gameName: 'Joker',
          type:     'joker',
          numbers:  num,
          price:    JOKER_PRICE,
          quantity: 1
        });
      }
    });

    return tickets;
  };

  const resetForm = () => {
    setPanels(prev => prev.map(p => ({ ...p, numbers: [] })));
    setExtraPanels([]);
    setJokerNumbers(['', '', '']);
    setJokerErrors(['', '', '']);
    setExtraGames(0);
  };

  const handleAddToCart = () => {
    if (!validateBeforeAction()) return;
    const tickets = buildTicketsPayload();
    if (tickets.length === 0) return;
    tickets.forEach(ticket => onAddToCart?.(ticket));
    toast.success(`${tickets.length} szelvény kosárba helyezve!`);
    resetForm();
  };

  const handlePlay = async () => {
    if (!validateBeforeAction()) return;

    const tickets = buildTicketsPayload();
    if (tickets.length === 0) return;

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
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach(err => toast.error(err));
        } else {
          toast.error(data.message || 'Vásárlási hiba történt!');
        }
        return;
      }

      toast.success(`${data.ticketsBought} szelvény sikeresen leadva! Sok szerencsét! 🍀`);
      resetForm();
    } catch {
      toast.error('Szerverhiba — próbáld újra!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderNumberGrid = (panel) => (
    <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(15, 1fr)', display: 'grid' }}>
      {Array.from({ length: NUMBER_RANGE }, (_, i) => i + 1).map(num => {
        const isSelected = panel.numbers.includes(num);
        const canSelect  = panel.numbers.length < MAX_NUMBERS || isSelected;
        return (
          <button
            key={num}
            onClick={() => toggleNumber(panel.id, num)}
            disabled={panel.isLocked || (!canSelect && !isSelected)}
            className={`
              aspect-square rounded-md font-medium text-xs transition-all border
              flex items-center justify-center
              ${isSelected
                ? 'bg-red-600 text-white border-red-600'
                : panel.isLocked
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : canSelect
                    ? 'bg-white text-gray-700 border-gray-300 hover:bg-amber-50 hover:border-amber-400'
                    : 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
              }
            `}
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
          {/* Joker */}
          <div className="text-center mb-4">
            <img src="/images/joker.png" alt="Joker"
              style={{ height: '48px', maxWidth: '100px', objectFit: 'contain' }}
              className="mx-auto d-block" />
            <p className="text-sm text-gray-500 mt-1">{JOKER_PRICE} Ft/db</p>
          </div>

          {jokerNumbers.map((num, idx) => (
            <div key={idx} className="mb-2">
              <div className="joker-row">
                <input
                  type="text"
                  maxLength={6}
                  value={num}
                  onChange={(e) => handleJokerChange(idx, e.target.value)}
                  placeholder="------"
                  className={`joker-input flex-1 px-3 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
                    jokerErrors[idx]
                      ? 'border-red-400 focus:border-red-500'
                      : num.length === 6
                        ? 'border-green-400 focus:border-green-500'
                        : 'border-gray-200 focus:border-amber-500'
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

          <hr className="my-4" />

          {/* Gépi */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gépi játékok (0-{MAX_EXTRA})
            </label>
            <input
              type="number" min={0} max={MAX_EXTRA} value={extraGames}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                if (val > MAX_EXTRA) {
                  toast.warning(`Maximum ${MAX_EXTRA} gépi játék adható meg!`);
                  setExtraGames(MAX_EXTRA);
                } else {
                  setExtraGames(Math.max(0, val));
                }
              }}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
            />
            <button onClick={generateExtra}
              className="w-full mt-2 px-4 py-2 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 font-medium">
              Generálás
            </button>
          </div>

          <hr className="my-4" />

          {/* Összesítő */}
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
                Nincs elegendő egyenleg! Hiányzik: {(totalPrice - (user?.balance || 0)).toLocaleString()} Ft
              </p>
            </div>
          )}

          {/* Gombok */}
          <button
            onClick={handleAddToCart}
            disabled={totalPrice === 0 || insufficientFunds}
            className="btn-yellow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-5 h-5" /> KOSÁRBA
          </button>
          <button
            onClick={handlePlay}
            disabled={isSubmitting || totalPrice === 0 || insufficientFunds}
            className="btn-green flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
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
                      panel.numbers.length === MAX_NUMBERS
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {panel.numbers.length}/{MAX_NUMBERS}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => clearPanel(panel.id)}
                    className="px-3 py-1.5 border border-gray-300 text-gray-600 text-sm rounded-md hover:bg-gray-100 flex items-center gap-1">
                    <Trash2 className="w-4 h-4" /> Törlés
                  </button>
                  <button onClick={() => quickPick(panel.id)}
                    className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 flex items-center gap-1">
                    <Zap className="w-4 h-4" /> Gyorstipp
                  </button>
                </div>
              </div>
              <div className="selected-numbers">
                Kiválasztott: {panel.numbers.length > 0 ? panel.numbers.join(', ') : '-'}
                {panel.numbers.length === MAX_NUMBERS && <span className="check">✓</span>}
              </div>
              {renderNumberGrid(panel)}
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
