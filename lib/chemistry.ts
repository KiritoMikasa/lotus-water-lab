export type MineralKey = 'mg' | 'ca' | 'k' | 'na';
export type Minerals = Record<MineralKey, number>;

// Assumes the salts are anhydrous only where named; the four salts below are the exact hydrates/forms.
export const SALTS = {
  mg: { label: 'Magnesium', formula: 'MgCl₂·6H₂O', gramsIn50ml: 9.1, molarMass: 203.30, ionMass: 24.305 },
  ca: { label: 'Calcium', formula: 'CaCl₂·2H₂O', gramsIn50ml: 6.6, molarMass: 147.014, ionMass: 40.078 },
  k: { label: 'Potassium', formula: 'KHCO₃', gramsIn50ml: 4.5, molarMass: 100.115, ionMass: 39.0983 },
  na: { label: 'Sodium', formula: 'NaHCO₃', gramsIn50ml: 3.8, molarMass: 84.0066, ionMass: 22.98977 },
} as const;

export const DROPS_PER_ML = 20;
export const DEFAULT_RO_TDS = 12;

export function ionMgPerDrop(key: MineralKey) {
  const s = SALTS[key];
  return (s.gramsIn50ml * 1000 * (s.ionMass / s.molarMass)) / 50 / DROPS_PER_ML;
}

export function calculate(drops: Minerals, liters = 1, roTds = DEFAULT_RO_TDS) {
  const volume = Math.max(liters, 0.001);
  const mg = drops.mg * ionMgPerDrop('mg') / volume;
  const ca = drops.ca * ionMgPerDrop('ca') / volume;
  const k = drops.k * ionMgPerDrop('k') / volume;
  const na = drops.na * ionMgPerDrop('na') / volume;
  const hardness = ca * 2.497 + mg * 4.118; // ppm as CaCO3
  const alkalinity = k * (61.016 / SALTS.k.ionMass) * (50 / 61.016) + na * (61.016 / SALTS.na.ionMass) * (50 / 61.016); // ppm as CaCO3
  const hco3 = k * (61.016 / SALTS.k.ionMass) + na * (61.016 / SALTS.na.ionMass);
  return { mg, ca, k, na, hardness, alkalinity, hco3, estimatedTds: roTds + mg + ca + k + na };
}

export const STARTER_PROFILES = [
  { name: 'Balanced Filter', drops: { mg: 6, ca: 3, k: 2, na: 1 }, note: 'Soft, magnesium-led starting point for everyday filter coffee.' },
  { name: 'Bright Filter', drops: { mg: 7, ca: 2, k: 2, na: 0 }, note: 'A softer, Mg-forward profile to experiment with light/fruity coffees.' },
  { name: 'Structured Filter', drops: { mg: 4, ca: 5, k: 1, na: 1 }, note: 'More calcium relative to magnesium for a different structure/clarity balance.' },
  { name: 'Tea', drops: { mg: 3, ca: 2, k: 1, na: 0 }, note: 'Light mineralisation intended as a tea starting point.' },
  { name: 'Drinking / Sparkling', drops: { mg: 2, ca: 2, k: 0, na: 0 }, note: 'Low-dose drinking water profile.' },
];
