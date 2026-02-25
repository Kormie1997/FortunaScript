import React, { useState } from "react";
import otosLogo from "/otoslotto.png";
import jokerLogo from "/joker.png";
import szzrtLogo from "/szzrt.png";
import paperBg from "/paper.jpg";

const cellSize = 32;

// Segédsorsjegy szám generálása (7 jegyű)
const generateTicketNumber = () => {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
};

// 5 véletlen szám generálása 1–90 között
const generateQuickPick = () => {
  const nums = new Set();
  while (nums.size < 5) {
    nums.add(Math.floor(1 + Math.random() * 90));
  }
  return Array.from(nums).sort((a, b) => a - b);
};

// Gyakori számok listája okos gyorstipphez
const frequentNumbers = [3, 7, 10, 13, 21, 23, 27, 33, 42, 44, 45, 52, 56, 59, 72, 79];

// Okos gyorstipp – főleg gyakori számokból
const generateSmartQuickPick = () => {
  const nums = new Set();
  while (nums.size < 5 && nums.size < frequentNumbers.length) {
    const idx = Math.floor(Math.random() * frequentNumbers.length);
    nums.add(frequentNumbers[idx]);
  }
  while (nums.size < 5) {
    nums.add(Math.floor(1 + Math.random() * 90));
  }
  return Array.from(nums).sort((a, b) => a - b);
};

// 6 számjegyű Joker generálása
const generateJoker = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export default function App() {
  // 6 mező
  const [grids, setGrids] = useState([[], [], [], [], [], []]);

  // Sorsolások száma (1, 5, folyamatos)
  const [drawCount, setDrawCount] = useState("1");

  // Joker főkapcsoló
  const [jokerEnabled, setJokerEnabled] = useState(false);

  // Joker mezők (max 3)
  const [jokerFields, setJokerFields] = useState([
    {
      active: true,
      custom: false,
      number: generateJoker(),
      customValue: "",
    },
  ]);

  // Plusz gépi játékok (max 14)
  const [extraMachineCount, setExtraMachineCount] = useState(0);
  const [extraMachinePlays, setExtraMachinePlays] = useState([]);

  // Segédsorsjegy szám (frontend dísz)
  const [ticketNumberh] = useState(generateTicketNumber());

  // Joker mező hozzáadása
  const addJokerField = () => {
    if (jokerFields.length >= 3) return;
    setJokerFields((prev) => [
      ...prev,
      {
        active: true,
        custom: false,
        number: generateJoker(),
        customValue: "",
      },
    ]);
  };

  // Joker mező frissítése
  const refreshJoker = (index) => {
    setJokerFields((prev) =>
      prev.map((j, i) =>
        i === index ? { ...j, number: generateJoker() } : j
      )
    );
  };

  // Joker mező törlése
  const deleteJoker = (index) => {
    setJokerFields((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  // Joker mező pipája (játékban / nem)
  const toggleJokerActive = (index) => {
    setJokerFields((prev) =>
      prev.map((j, i) =>
        i === index ? { ...j, active: !j.active } : j
      )
    );
  };

  // Joker mező saját szám opció
  const toggleCustomJoker = (index) => {
    setJokerFields((prev) =>
      prev.map((j, i) =>
        i === index
          ? { ...j, custom: !j.custom, customValue: "" }
          : j
      )
    );
  };

  // Joker mező saját szám bevitel
  const updateCustomJoker = (index, value) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 6);
    setJokerFields((prev) =>
      prev.map((j, i) =>
        i === index ? { ...j, customValue: cleaned } : j
      )
    );
  };

  // Plusz gépi játékok generálása (MAX 14)
  const generateExtraMachinePlays = () => {
    const count = Number(extraMachineCount);
    if (!count || count <= 0) {
      setExtraMachinePlays([]);
      return;
    }
    const plays = Array.from({ length: count }, () => generateQuickPick());
    setExtraMachinePlays(plays);
  };

  // Egy plusz gépi játék törlése
  const deleteExtraMachinePlay = (index) => {
    setExtraMachinePlays((prev) => prev.filter((_, i) => i !== index));
  };

  // Szám kiválasztása mezőben
  const toggleNumber = (gridIndex, num) => {
    setGrids((prev) =>
      prev.map((grid, i) => {
        if (i !== gridIndex) return grid;
        if (grid.includes(num)) {
          return grid.filter((n) => n !== num);
        } else {
          if (grid.length >= 5) return grid;
          return [...grid, num].sort((a, b) => a - b);
        }
      })
    );
  };

  // Gyorstipp egy mezőre
  const quickPickGrid = (gridIndex) => {
    const picked = generateQuickPick();
    setGrids((prev) =>
      prev.map((grid, i) => (i === gridIndex ? picked : grid))
    );
  };

  // Okos gyorstipp egy mezőre
  const smartQuickPickGrid = (gridIndex) => {
    const picked = generateSmartQuickPick();
    setGrids((prev) =>
      prev.map((grid, i) => (i === gridIndex ? picked : grid))
    );
  };

  // Mező törlése
  const clearGrid = (gridIndex) => {
    setGrids((prev) => prev.map((grid, i) => (i === gridIndex ? [] : grid)));
  };

  // Összes mező gyorstipp
  const quickPickAllGrids = () => {
    setGrids((prev) => prev.map(() => generateQuickPick()));
  };

  // Mező komponens
const LottoGrid = ({
  index,
  selected,
  onToggle,
  onQuickPick,
  onSmartQuickPick,
  onClear,
}) => {
  return (
    <div
      style={{
        border: "2px solid red",
        padding: 12,
        borderRadius: 6,
        background: "rgba(255,255,255,0.85)",
        marginBottom: 20,
      }}
    >
      {/* FEJLÉC – itt írjuk ki a kiválasztott számokat */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <h3 style={{ margin: 0, color: "red" }}>
          {index + 1}. mező: {selected.join(", ")}
        </h3>

        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => onQuickPick(index)}
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              border: "1px solid red",
              background: "#fff0f0",
              color: "red",
              fontSize: 12,
            }}
          >
            ⚡ Gyorstipp
          </button>

          <button
            onClick={() => onSmartQuickPick(index)}
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              border: "1px solid purple",
              background: "#f8f0ff",
              color: "purple",
              fontSize: 12,
            }}
          >
            ✨ Okos
          </button>

          <button
            onClick={() => onClear(index)}
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              border: "1px solid gray",
              background: "#f5f5f5",
              color: "black",
              fontSize: 12,
            }}
          >
            ✖ Törlés
          </button>
        </div>
      </div>

      {/* SZÁMOK RÁCSA */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(15, 1fr)",
        }}
      >
        {Array.from({ length: 90 }, (_, i) => i + 1).map((num) => {
          const isSelected = selected.includes(num);
          return (
            <div
              key={num}
              onClick={() => onToggle(index, num)}
              style={{
                width: cellSize,
                height: cellSize,
                border: "1px solid red",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                background: isSelected ? "#e0f0ff" : "#fff",
                color: isSelected ? "darkblue" : "black",
                fontWeight: isSelected ? "bold" : "normal",
                transition: "0.5s",
              }}
            >
              {isSelected ? "X" : num}
            </div>
          );
        })}
      </div>
    </div>
  );
};
  // Beküldés
  const handleSubmit = () => {
    const invalid = grids.some((g) => g.length !== 5);
    if (invalid) {
      alert("Minden mezőben pontosan 5 számot kell választani!");
      return;
    }

    for (const j of jokerFields) {
      if (j.custom && j.customValue.length !== 6) {
        alert("A saját Joker számnak 6 számjegyűnek kell lennie!");
        return;
      }
    }

    alert("Szelvény beküldve!");
  };

  return (
    <div
      style={{
        fontFamily: "'Arial Narrow', sans-serif",
        padding: 20,
        maxWidth: 1100,
        margin: "0 auto",
        backgroundImage: `url(${paperBg})`,
        backgroundSize: "cover",
      }}
    >
{/* FEJLÉC */}
<div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  }}
>
  {/* Bal oldali SZZRT logó */}
  <img
    src={szzrtLogo}
    alt="SZZRT"
    style={{
      height: 100,
      position: "absolute",
      left: 20,
      top: "50%",
      transform: "translateY(-50%)",
    }}
  />

  {/* Középen az Ötöslottó logó */}
  <img
    src={otosLogo}
    alt="Ötöslottó"
    style={{
      height: 160,
    }}
  />

  {/* Jobb oldali felirat – két sor, méretarányosan */}
  <div
    style={{
      position: "absolute",
      right: 20,
      top: "50%",
      transform: "translateY(-50%)",
      textAlign: "right",
      lineHeight: "1.0",
      whiteSpace: "nowrap",
      color: "#008000",
      fontFamily: "'Montserrat', sans-serif",
    }}
  >
    <div
      style={{
        fontSize: 46,       // nagyobb, mint az alsó sor
        fontWeight: 800,    // extra vastag
        marginBottom: 2,
      }}
    >
      NORMÁL
    </div>

    <div
      style={{
        fontSize: 24,
        fontWeight: 600,
      }}
    >
      SEGÉDSORSJEGY
    </div>
  </div>
</div>

      {/* KÉT OSZLOP */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: 20,
        }}
      >
        {/* BAL OLDALI PANEL – három külön doboz */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* SORSOLÁSOK SZÁMA DOBOZ */}
          <div
            style={{
              padding: 16,
              border: "2px solid red",
              borderRadius: 6,
              background: "rgba(255,255,255,0.85)",
            }}
          >
            <h3 style={{ color: "red", marginBottom: 10 }}>
              Sorsolások száma
            </h3>

            <label style={{ display: "flex", gap: 10, marginBottom: 6 }}>
              <input
                type="radio"
                name="drawCount"
                checked={drawCount === "1"}
                onChange={() => setDrawCount("1")}
              />
              1 hetes
            </label>

            <label style={{ display: "flex", gap: 10, marginBottom: 6 }}>
              <input
                type="radio"
                name="drawCount"
                checked={drawCount === "5"}
                onChange={() => setDrawCount("5")}
              />
              5 hetes
            </label>

            <label style={{ display: "flex", gap: 10 }}>
              <input
                type="radio"
                name="drawCount"
                checked={drawCount === "cont"}
                onChange={() => setDrawCount("cont")}
              />
              Folyamatos
            </label>
          </div>

          {/* JOKER DOBOZ */}
          <div
            style={{
              padding: 16,
              border: "2px solid red",
              borderRadius: 6,
              background: "rgba(255,255,255,0.85)",
            }}
          >
            {/* Joker logó */}
            <div style={{ textAlign: "center", marginBottom: 10 }}>
              <img src={jokerLogo} alt="Joker" style={{ height: 50 }} />
            </div>

            {/* Joker főkapcsoló */}
            <label
              style={{
                display: "flex",
                gap: 10,
                marginBottom: 10,
                fontSize: 18,
              }}
            >
              <input
                type="checkbox"
                checked={jokerEnabled}
                onChange={(e) => setJokerEnabled(e.target.checked)}
              />
              Szeretnék Jokert is játszani
            </label>

            {/* Joker mezők */}
            {jokerEnabled &&
              jokerFields.map((j, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid red",
                    padding: 10,
                    borderRadius: 6,
                    marginBottom: 10,
                    background: "#fff",
                  }}
                >
                  {/* Joker mező fejléc */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <label style={{ display: "flex", gap: 6 }}>
                      <input
                        type="checkbox"
                        checked={j.active}
                        onChange={() => toggleJokerActive(index)}
                      />
                      Játékban
                    </label>

                    <div style={{ display: "flex", gap: 10 }}>
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() => refreshJoker(index)}
                        title="Új Joker szám"
                      >
                        🔄
                      </span>

                      {jokerFields.length > 1 && (
                        <span
                          style={{ cursor: "pointer" }}
                          onClick={() => deleteJoker(index)}
                          title="Joker mező törlése"
                        >
                          🗑
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Automatikus vagy saját Joker */}
                  {!j.custom ? (
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: "bold",
                        letterSpacing: 4,
                        textAlign: "center",
                        marginBottom: 6,
                      }}
                    >
                      {j.number}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={j.customValue}
                      onChange={(e) =>
                        updateCustomJoker(index, e.target.value)
                      }
                      maxLength={6}
                      placeholder="Saját Joker"
                      style={{
                        width: "100%",
                        padding: 6,
                        fontSize: 20,
                        textAlign: "center",
                        border: "1px solid red",
                        borderRadius: 4,
                        marginBottom: 6,
                      }}
                    />
                  )}

                  <label style={{ display: "flex", gap: 6 }}>
                    <input
                      type="checkbox"
                      checked={j.custom}
                      onChange={() => toggleCustomJoker(index)}
                    />
                    Saját Joker szám
                  </label>
                </div>
              ))}

            {/* Joker hozzáadása */}
            {jokerEnabled && jokerFields.length < 3 && (
              <button
                onClick={addJokerField}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid red",
                  background: "#fff0f0",
                  color: "red",
                  cursor: "pointer",
                  marginTop: 10,
                }}
              >
                + További Joker hozzáadása
              </button>
            )}

            {jokerEnabled && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  color: "gray",
                  textAlign: "center",
                }}
              >
                Legfeljebb 3 Joker mező játszható
              </div>
            )}
          </div>

                    {/* PLUSZ GÉPI JÁTÉKOK DOBOZ */}
          <div
            style={{
              padding: 16,
              border: "2px solid red",
              borderRadius: 6,
              background: "rgba(255,255,255,0.85)",
            }}
          >
            <h3 style={{ color: "red", marginBottom: 10 }}>
              Plusz gépi játékok
            </h3>

            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <span>Hány plusz gépi mezőt kérsz?</span>

              <select
                value={extraMachineCount}
                onChange={(e) => setExtraMachineCount(e.target.value)}
                style={{
                  padding: 4,
                  borderRadius: 4,
                  border: "1px solid red",
                }}
              >
                {Array.from({ length: 15 }, (_, i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>

              <button
                onClick={generateExtraMachinePlays}
                style={{
                  padding: "4px 10px",
                  borderRadius: 4,
                  border: "1px solid red",
                  background: "#fff0f0",
                  color: "red",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              >
                Gépi játékok generálása
              </button>
            </div>

            {extraMachinePlays.length > 0 && (
              <div style={{ marginTop: 10 }}>
                {extraMachinePlays.map((combo, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 8px",
                      border: "1px solid #ccc",
                      borderRadius: 4,
                      marginBottom: 6,
                      background: "#fff",
                    }}
                  >
                    <span style={{ fontSize: 14 }}>
                      {combo.join(" - ")}
                    </span>

                    <button
                      onClick={() => deleteExtraMachinePlay(index)}
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        border: "1px solid gray",
                        background: "#f5f5f5",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Törlés
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* JOBB OLDAL – SZÁMMEZŐK */}
        <div>
          <button
            onClick={quickPickAllGrids}
            style={{
              marginBottom: 10,
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid red",
              background: "#ffecec",
              color: "red",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Összes mező gyorstipp ⚡
          </button>

          {grids.map((selected, i) => (
            <LottoGrid
              key={i}
              index={i}
              selected={selected}
              onToggle={toggleNumber}
              onQuickPick={quickPickGrid}
              onSmartQuickPick={smartQuickPickGrid}
              onClear={clearGrid}
              
            />
          ))}

          <button
            onClick={handleSubmit}
            style={{
              marginTop: 20,
              padding: "12px 24px",
              borderRadius: 6,
              border: "none",
              backgroundColor: "red",
              color: "white",
              cursor: "pointer",
              fontSize: 20,
              fontWeight: "bold",
              width: "100%",
            }}
          >
            Szelvény beküldése
          </button>
        </div>
      </div>
    </div>
  );
}
