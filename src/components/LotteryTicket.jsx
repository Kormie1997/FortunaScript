import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Zap, RefreshCw, ShoppingCart, Play } from 'lucide-react';
import { toast } from 'sonner';

const PRICE_PER_PANEL = 400;
const JOKER_PRICE = 300;
const MAX_NUMBERS = 5;
const NUMBER_RANGE = 90;

function LotteryTicket({ game, onBack, user, onAddToCart }) {
  const [panels, setPanels] = useState([]);
  const [extraPanels, setExtraPanels] = useState([]);
  const [jokerNumbers, setJokerNumbers] = useState(['', '', '']);
  const [extraGames, setExtraGames] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setPanels(Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      numbers: [],
      isLocked: false
    })));
  }, [game]);

  //Szám kiválasztás
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

  //Gyorstipp
  const quickPick = (panelId) => {
    const random = Array.from({ length: NUMBER_RANGE }, (_, i) => i + 1)
      .sort(() => 0.5 - Math.random())
      .slice(0, MAX_NUMBERS)
      .sort((a, b) => a - b);
    setPanels(prev => prev.map(p => p.id === panelId ? { ...p, numbers: random } : p));
  };

  //Törlés
  const clearPanel = (panelId) => {
    setPanels(prev => prev.map(p => p.id === panelId ? { ...p, numbers: [] } : p));
  };

  //Gépi generálás
  const generateExtra = () => {
    const count = Math.min(14, Math.max(0, parseInt(extraGames) || 0));
    if (count === 0) return toast.error('Adj meg legalább 1 gépi játékot!');
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

  //Joker
  const quickJoker = (idx) => {
    let num = '';
    for (let i = 0; i < 6; i++) num += Math.floor(Math.random() * 10);
    setJokerNumbers(prev => {
      const n = [...prev];
      n[idx] = num;
      return n;
    });
  };

  //Ár számítás
  const getFilledCount = () => panels.filter(p => p.numbers.length === MAX_NUMBERS).length;
  const getJokerCount = () => jokerNumbers.filter(n => n.length === 6).length;
  const getTotalPrice = () =>
    (getFilledCount() + extraPanels.length) * PRICE_PER_PANEL + getJokerCount() * JOKER_PRICE;

  //Payload
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
    setExtraGames(0);
  };

  // Kosárba
  const handleAddToCart = () => {
    if (getTotalPrice() === 0)
      return toast.error('Tölts ki legalább egy mezőt!');

    const tickets = buildTicketsPayload();
    if (tickets.length === 0) return;

    tickets.forEach(ticket => onAddToCart?.(ticket));
    resetForm();
  };

  // Közvetlen vásárlás (megjátszom)
  const handlePlay = async () => {
    if (getTotalPrice() === 0)
      return toast.error('Tölts ki legalább egy mezőt!');

    const tickets = buildTicketsPayload();
    if (tickets.length === 0) return;

    const totalPrice = getTotalPrice();
    if (totalPrice > (user?.balance || 0))
      return toast.error('Nincs elegendő egyenleged!');

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

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Vásárlási hiba');
      }

      toast.success('Szelvény sikeresen leadva! Sok szerencsét! 🍀');
      resetForm();
    } catch (error) {
      toast.error(error.message || 'Hiba történt a vásárlás során!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderNumberGrid = (panel) => (
    <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(15, 1fr)', display: 'grid' }}>
      {Array.from({ length: NUMBER_RANGE }, (_, i) => i + 1).map(num => {
        const isSelected = panel.numbers.includes(num);
        const canSelect = panel.numbers.length < MAX_NUMBERS || isSelected;
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
            <img src="/images/joker.png" alt="Joker" style={{ height: '48px', maxWidth: '100px', objectFit: 'contain' }} className="mx-auto d-block" />
            <p className="text-sm text-gray-500 mt-1">{JOKER_PRICE} Ft/db</p>
          </div>

          {jokerNumbers.map((num, idx) => (
            <div key={idx} className="joker-row">
              <input
                type="text"
                maxLength={6}
                value={num}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setJokerNumbers(prev => { const n = [...prev]; n[idx] = val; return n; });
                }}
                placeholder="------"
                className="joker-input flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
              />
              <button onClick={() => quickJoker(idx)} className="px-3 py-2 border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          ))}

          <hr className="my-4" />

          {/* Gépi sorsolás */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Gépi játékok (0-14)</label>
            <input
              type="number" min={0} max={14} value={extraGames}
              onChange={(e) => setExtraGames(Math.min(14, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
            />
            <button onClick={generateExtra} className="w-full mt-2 px-4 py-2 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 font-medium">
              Generálás
            </button>
          </div>

          <hr className="my-4" />

          {/* Összesítő */}
          <div className="price-box">
            <div>KITÖLTÖTT MEZŐK: <span>{getFilledCount()}</span></div>
            <div>GÉPI JÁTÉKOK: <span>{extraPanels.length}</span></div>
            <div>JOKER: <span>{getJokerCount()}</span></div>
            <div>ÁR ÖSSZESEN: <span>{getTotalPrice().toLocaleString()} Ft</span></div>
          </div>

          {/* Gombok */}
          <button onClick={handleAddToCart} className="btn-yellow flex items-center justify-center gap-2">
            <ShoppingCart className="w-5 h-5" /> KOSÁRBA
          </button>
          <button onClick={handlePlay} disabled={isSubmitting} className="btn-green flex items-center justify-center gap-2 disabled:opacity-50">
            {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
            MEGJÁTSZOM
          </button>
        </div>

        {/* Mezők */}
        <div className="ticket-main">
          {panels.map((panel, idx) => (
            <div key={panel.id} className={`ticket-panel ${panel.isLocked ? 'locked' : ''}`}>
              <div className="ticket-header">
                <strong>{idx + 1}. mező</strong>
                <div className="flex gap-2">
                  <button onClick={() => clearPanel(panel.id)} className="px-3 py-1.5 border border-gray-300 text-gray-600 text-sm rounded-md hover:bg-gray-100 flex items-center gap-1">
                    <Trash2 className="w-4 h-4" /> Törlés
                  </button>
                  <button onClick={() => quickPick(panel.id)} className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 flex items-center gap-1">
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
                <button onClick={() => removeExtraPanel(panel.id)} className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 flex items-center gap-1">
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
