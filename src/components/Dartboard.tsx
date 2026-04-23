import { useEffect, useMemo, useRef, useState } from "react";
import { computeHit, R, SECTORS, type DartHit } from "@/lib/dartboard";

interface Props {
  onHit: (hit: DartHit) => void;
  recentHits: DartHit[]; // bieżącej tury
  disabled?: boolean;
}

// Generuje ścieżkę SVG dla wycinka (annulus segment) między r1 i r2 oraz kątami a1..a2 (deg, 0=góra, CW)
function annulusSegment(cx: number, cy: number, r1: number, r2: number, a1: number, a2: number) {
  const toXY = (r: number, a: number) => {
    const rad = ((a - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const;
  };
  const [x1o, y1o] = toXY(r2, a1);
  const [x2o, y2o] = toXY(r2, a2);
  const [x1i, y1i] = toXY(r1, a1);
  const [x2i, y2i] = toXY(r1, a2);
  const large = a2 - a1 > 180 ? 1 : 0;
  return `M ${x1o} ${y1o} A ${r2} ${r2} 0 ${large} 1 ${x2o} ${y2o} L ${x2i} ${y2i} A ${r1} ${r1} 0 ${large} 0 ${x1i} ${y1i} Z`;
}

const LONG_PRESS_MS = 350;

export function Dartboard({ onHit, recentHits, disabled }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [aim, setAim] = useState<{ x: number; y: number } | null>(null); // współrzędne w viewBox
  const longPressTimer = useRef<number | null>(null);
  const pressActive = useRef(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const movedAfterPress = useRef(false);

  // Konwersja współrzędnych klienta -> viewBox (0..400)
  const toSvgCoords = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 200, y: 200 };
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 400;
    const y = ((clientY - rect.top) / rect.height) * 400;
    return { x, y };
  };

  const cancelLongPress = () => {
    if (longPressTimer.current !== null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    e.preventDefault();
    const pt = toSvgCoords(e.clientX, e.clientY);
    pointerStart.current = pt;
    pressActive.current = true;
    movedAfterPress.current = false;

    const isTouch = e.pointerType === "touch" || e.pointerType === "pen";
    if (isTouch) {
      longPressTimer.current = window.setTimeout(() => {
        setAim(pt);
      }, LONG_PRESS_MS);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pressActive.current) return;
    const pt = toSvgCoords(e.clientX, e.clientY);
    movedAfterPress.current = true;
    if (aim) {
      setAim(pt);
    } else if (e.pointerType === "touch") {
      // jeśli ruch przed long-press — anuluj, traktujemy jako scroll? trzymamy precyzyjny
      // Nic nie robimy: long-press timer dalej leci, jeśli aktywuje, wejdzie w aim.
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pressActive.current || disabled) {
      cancelLongPress();
      pressActive.current = false;
      return;
    }
    cancelLongPress();
    pressActive.current = false;

    if (aim) {
      // Tryb celowania — zatwierdź pozycję celownika
      const hit = computeHit(aim.x, aim.y);
      onHit(hit);
      setAim(null);
      return;
    }

    // Zwykłe kliknięcie / tap
    const pt = toSvgCoords(e.clientX, e.clientY);
    const hit = computeHit(pt.x, pt.y);
    onHit(hit);
  };

  const handlePointerCancel = () => {
    cancelLongPress();
    pressActive.current = false;
    setAim(null);
  };

  useEffect(() => () => cancelLongPress(), []);

  // Statyczne sektory (memo)
  const sectorPaths = useMemo(() => {
    const items: { d: string; fill: string; key: string }[] = [];
    SECTORS.forEach((sector, i) => {
      // Każdy sektor zajmuje 18°. Sektor w indeksie i wyśrodkowany w (i*18)°
      const a1 = i * 18 - 9;
      const a2 = i * 18 + 9;
      const evenSector = i % 2 === 0;

      // Single dolny (od bull do triple inner)
      items.push({
        key: `s1-${i}`,
        d: annulusSegment(200, 200, R.bull, R.tripleInner, a1, a2),
        fill: evenSector ? "hsl(var(--board-cream))" : "hsl(var(--board-black))",
      });
      // Triple
      items.push({
        key: `t-${i}`,
        d: annulusSegment(200, 200, R.tripleInner, R.tripleOuter, a1, a2),
        fill: evenSector ? "hsl(var(--board-red))" : "hsl(var(--board-green))",
      });
      // Single górny
      items.push({
        key: `s2-${i}`,
        d: annulusSegment(200, 200, R.tripleOuter, R.doubleInner, a1, a2),
        fill: evenSector ? "hsl(var(--board-cream))" : "hsl(var(--board-black))",
      });
      // Double
      items.push({
        key: `d-${i}`,
        d: annulusSegment(200, 200, R.doubleInner, R.doubleOuter, a1, a2),
        fill: evenSector ? "hsl(var(--board-red))" : "hsl(var(--board-green))",
      });
    });
    return items;
  }, []);

  const sectorNumbers = useMemo(() => {
    return SECTORS.map((sector, i) => {
      const angle = i * 18;
      const rad = ((angle - 90) * Math.PI) / 180;
      const r = R.doubleOuter + 14;
      const x = 200 + r * Math.cos(rad);
      const y = 200 + r * Math.sin(rad);
      return { sector, x, y, key: `n-${i}` };
    });
  }, []);

  return (
    <div className="relative w-full max-w-[520px] mx-auto select-none no-touch-callout">
      <svg
        ref={svgRef}
        viewBox="0 0 400 430"
        className="w-full h-auto block"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        style={{ touchAction: "none" }}
      >
        {/* Pierścień zewnętrzny / korpus */}
        <circle cx="200" cy="200" r="210" fill="hsl(var(--board-black))" />
        <circle cx="200" cy="200" r="200" fill="hsl(var(--board-wire))" />

        {sectorPaths.map((s) => (
          <path key={s.key} d={s.d} fill={s.fill} stroke="hsl(var(--board-wire))" strokeWidth="0.5" />
        ))}

        {/* Bull / Bullseye */}
        <circle cx="200" cy="200" r={R.bull} fill="hsl(var(--board-green))" stroke="hsl(var(--board-wire))" strokeWidth="0.6" />
        <circle cx="200" cy="200" r={R.bullseye} fill="hsl(var(--board-red))" stroke="hsl(var(--board-wire))" strokeWidth="0.6" />

        {/* Numery sektorów */}
        {sectorNumbers.map((n) => (
          <text
            key={n.key}
            x={n.x}
            y={n.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="14"
            fontWeight="700"
            fontFamily="Oswald, Inter, sans-serif"
            fill="hsl(var(--board-cream))"
          >
            {n.sector}
          </text>
        ))}

        {/* Trafienia bieżącej tury (X) */}
        {recentHits.map((h, i) => (
          <g key={i} className="pointer-events-none">
            <circle cx={h.x} cy={h.y} r="6" fill="hsl(var(--accent))" opacity="0.25" />
            <line x1={h.x - 6} y1={h.y - 6} x2={h.x + 6} y2={h.y + 6} stroke="hsl(var(--accent))" strokeWidth="2.4" strokeLinecap="round" />
            <line x1={h.x - 6} y1={h.y + 6} x2={h.x + 6} y2={h.y - 6} stroke="hsl(var(--accent))" strokeWidth="2.4" strokeLinecap="round" />
          </g>
        ))}

        {/* Lupa / zoom z celownikiem (tryb precyzyjny) */}
        {aim && <ZoomLens cx={aim.x} cy={aim.y} />}

        {/* Etykieta trybu precyzyjnego */}
        {aim && (
          <text x="200" y="420" textAnchor="middle" fontSize="14" fontFamily="Oswald, Inter, sans-serif" fill="hsl(var(--accent))" fontWeight="700">
            CELOWANIE — puść aby trafić
          </text>
        )}
      </svg>
    </div>
  );
}

function ZoomLens({ cx, cy }: { cx: number; cy: number }) {
  // Lupa: koło o promieniu 60 wyświetlone nad punktem celowania, pokazujące
  // powiększony fragment tarczy z celownikiem.
  // Pozycja lupy: nad palcem (cy - 90), ograniczona do viewBox.
  const lensR = 60;
  const lensCx = Math.max(lensR + 5, Math.min(400 - lensR - 5, cx));
  const lensCy = Math.max(lensR + 5, cy - 90);
  const zoom = 3;
  // viewBox wycinka = (cx - lensR/zoom, cy - lensR/zoom, 2*lensR/zoom)
  const sub = (lensR * 2) / zoom;
  const subX = cx - sub / 2;
  const subY = cy - sub / 2;

  return (
    <g className="pointer-events-none">
      <defs>
        <clipPath id="lens-clip">
          <circle cx={lensCx} cy={lensCy} r={lensR} />
        </clipPath>
      </defs>

      {/* Linia od palca do lupy */}
      <line x1={cx} y1={cy} x2={lensCx} y2={lensCy} stroke="hsl(var(--accent))" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />

      {/* Tło lupy */}
      <circle cx={lensCx} cy={lensCy} r={lensR + 2} fill="hsl(var(--background))" stroke="hsl(var(--accent))" strokeWidth="2" />

      {/* Powiększony obraz tarczy używamy <use> i transformacji */}
      <g clipPath="url(#lens-clip)">
        <g transform={`translate(${lensCx} ${lensCy}) scale(${zoom}) translate(${-cx} ${-cy})`}>
          <BoardClone />
        </g>
        {/* Celownik */}
        <line x1={lensCx - lensR + 6} y1={lensCy} x2={lensCx + lensR - 6} y2={lensCy} stroke="hsl(var(--accent))" strokeWidth="1" />
        <line x1={lensCx} y1={lensCy - lensR + 6} x2={lensCx} y2={lensCy + lensR - 6} stroke="hsl(var(--accent))" strokeWidth="1" />
        <circle cx={lensCx} cy={lensCy} r="10" fill="none" stroke="hsl(var(--accent))" strokeWidth="1.5" />
        <circle cx={lensCx} cy={lensCy} r="2" fill="hsl(var(--accent))" />
      </g>

      {/* Mały X w punkcie palca */}
      <circle cx={cx} cy={cy} r="14" fill="hsl(var(--accent) / 0.15)" stroke="hsl(var(--accent))" strokeWidth="1" />
    </g>
  );
}

// Klon zawartości tarczy — używany wewnątrz lupy.
function BoardClone() {
  const sectorPaths = useMemo(() => {
    const items: { d: string; fill: string; key: string }[] = [];
    SECTORS.forEach((_, i) => {
      const a1 = i * 18 - 9;
      const a2 = i * 18 + 9;
      const evenSector = i % 2 === 0;
      items.push({ key: `s1-${i}`, d: annulusSegment(200, 200, R.bull, R.tripleInner, a1, a2), fill: evenSector ? "hsl(var(--board-cream))" : "hsl(var(--board-black))" });
      items.push({ key: `t-${i}`, d: annulusSegment(200, 200, R.tripleInner, R.tripleOuter, a1, a2), fill: evenSector ? "hsl(var(--board-red))" : "hsl(var(--board-green))" });
      items.push({ key: `s2-${i}`, d: annulusSegment(200, 200, R.tripleOuter, R.doubleInner, a1, a2), fill: evenSector ? "hsl(var(--board-cream))" : "hsl(var(--board-black))" });
      items.push({ key: `d-${i}`, d: annulusSegment(200, 200, R.doubleInner, R.doubleOuter, a1, a2), fill: evenSector ? "hsl(var(--board-red))" : "hsl(var(--board-green))" });
    });
    return items;
  }, []);
  return (
    <>
      <circle cx="200" cy="200" r="200" fill="hsl(var(--board-wire))" />
      {sectorPaths.map((s) => (
        <path key={s.key} d={s.d} fill={s.fill} />
      ))}
      <circle cx="200" cy="200" r={R.bull} fill="hsl(var(--board-green))" />
      <circle cx="200" cy="200" r={R.bullseye} fill="hsl(var(--board-red))" />
    </>
  );
}
