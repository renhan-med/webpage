/** Names of the RenHan equipment pictograms; each maps to `./<name>.svg`. */
export const pictogramNames = [
  // Products
  'wheelchair',
  'rollator',
  'walking-frame',
  'crutches',
  'cane',
  'care-bed',
  'hoist',
  'transfer',
  'orthosis',
  'wrist-brace',
  'compression',
  'cushion',
  'mattress',
  'grab-rail',
  'shower-chair',
  'stool',
  'bath-board',
  'ramp',
  // Departments
  'mobility',
  'rehab-care',
  'ortho-comfort',
  'bathroom',
  'rental',
  'advice',
  'funding',
  'home-safety',
  'sales',
] as const;

export type PictogramName = (typeof pictogramNames)[number];
