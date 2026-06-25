export const MEASURE_UNITS = [
  'G',
  'KG',
  'ML',
  'L',
  'PCS',
  'PORTION',
] as const;

export type MeasureUnit = (typeof MEASURE_UNITS)[number];

export const MEASURE_UNIT_LABELS: Record<MeasureUnit, string> = {
  G: 'грами (г)',
  KG: 'кілограми (кг)',
  ML: 'мілілітри (мл)',
  L: 'літри (л)',
  PCS: 'штуки (шт)',
  PORTION: 'порція',
};

export function getMeasureUnitLabel(unit: MeasureUnit): string {
  return MEASURE_UNIT_LABELS[unit] ?? unit;
}
