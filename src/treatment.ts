// One vocabulary for icon treatments. The browser names them `default`, `solid`,
// `duotone`, `midtone`, `halftone`; the landing page used `stroke` and `dual` for the
// first and third. The browser's ids are canonical, because they are the ones persisted
// in users' settings; the landing's map onto them.

export const TREATMENTS = ['default', 'solid', 'duotone', 'midtone', 'halftone'] as const;

export type Treatment = (typeof TREATMENTS)[number];

/** The landing page's ids, mapped to the canonical ones. */
export const LANDING_TREATMENT_IDS = {
  stroke: 'default',
  solid: 'solid',
  dual: 'duotone',
  midtone: 'midtone',
  halftone: 'halftone',
} as const satisfies Record<string, Treatment>;

export type LandingTreatmentId = keyof typeof LANDING_TREATMENT_IDS;

export function isTreatment(v: unknown): v is Treatment {
  return typeof v === 'string' && (TREATMENTS as readonly string[]).includes(v);
}

/** A canonical id for either vocabulary, or undefined for an unknown one. */
export function toTreatment(id: string): Treatment | undefined {
  if (isTreatment(id)) return id;
  return Object.hasOwn(LANDING_TREATMENT_IDS, id) ? LANDING_TREATMENT_IDS[id as LandingTreatmentId] : undefined;
}
