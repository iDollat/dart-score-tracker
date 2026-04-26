// Standardowy układ sektorów na tarczy darta zaczynając od góry (sektor 20)
// idąc zgodnie z ruchem wskazówek zegara.
export const SECTORS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

// Promienie liczone w jednostkach SVG (viewBox 0..400, środek 200,200, R=200)
export const R = {
  bullseye: 8,      // 50
  bull: 20,         // 25
  tripleInner: 110,
  tripleOuter: 122,
  doubleInner: 180,
  doubleOuter: 192, // krawędź pola punktowanego
  board: 200,
};

export type Ring = "MISS" | "SINGLE" | "DOUBLE" | "TRIPLE" | "BULL" | "BULLSEYE";

export interface DartHit {
  sector: number;   // 0 dla bull/miss
  ring: Ring;
  score: number;
  label: string;    // np. "T20", "D16", "5", "BULL", "50", "MISS"
  x: number;        // współrzędne w viewBox
  y: number;
  angle?: number;   // kąt względem góry tarczy, zgodnie z ruchem wskazówek zegara
  radius?: number;  // odległość od środka tarczy w jednostkach SVG
}

/**
 * Oblicza trafienie na podstawie współrzędnych w viewBox 400x400
 * (środek tarczy = (200, 200)).
 */
export function computeHit(x: number, y: number): DartHit {
  const dx = x - 200;
  const dy = y - 200;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Kąt: 0° to góra (sektor 20), rośnie zgodnie z ruchem wskazówek zegara
  // atan2 zwraca kąt w radianach, gdzie 0 = wschód, rośnie przeciwnie do zegara.
  let angleDeg = Math.atan2(dy, dx) * (180 / Math.PI); // -180..180, 0 na wschodzie
  // Konwersja: 0° na górze, w prawo
  angleDeg = angleDeg + 90; // teraz 0 = góra, rośnie zgodnie z zegarem
  if (angleDeg < 0) angleDeg += 360;

  if (dist <= R.bullseye) {
    return { sector: 0, ring: "BULLSEYE", score: 50, label: "50 (Bullseye)", x, y, angle: angleDeg, radius: dist };
  }
  if (dist <= R.bull) {
    return { sector: 0, ring: "BULL", score: 25, label: "25 (Bull)", x, y, angle: angleDeg, radius: dist };
  }
  if (dist > R.doubleOuter) {
    return { sector: 0, ring: "MISS", score: 0, label: "Pudło", x, y, angle: angleDeg, radius: dist };
  }

  // Każdy sektor ma 18°. Sektor 20 jest wyśrodkowany na 0°, więc jego zakres to -9..+9.
  const shifted = (angleDeg + 9) % 360;
  const idx = Math.floor(shifted / 18);
  const sector = SECTORS[idx];

  let ring: Ring = "SINGLE";
  let score = sector;
  let label = String(sector);

  if (dist >= R.tripleInner && dist <= R.tripleOuter) {
    ring = "TRIPLE";
    score = sector * 3;
    label = `T${sector}`;
  } else if (dist >= R.doubleInner && dist <= R.doubleOuter) {
    ring = "DOUBLE";
    score = sector * 2;
    label = `D${sector}`;
  }

  return { sector, ring, score, label, x, y, angle: angleDeg, radius: dist };
}