import { describe, expect, it } from 'vitest';

import { LANDING_TREATMENT_IDS, TREATMENTS, isTreatment, toTreatment } from '../src/treatment.js';

describe('treatments', () => {
  it('keeps the browser ids, which users have persisted, as canonical', () => {
    expect(TREATMENTS).toEqual(['default', 'solid', 'duotone', 'midtone', 'halftone']);
  });

  it('maps every landing id onto a canonical one', () => {
    expect(Object.keys(LANDING_TREATMENT_IDS)).toEqual(['stroke', 'solid', 'dual', 'midtone', 'halftone']);
    expect(toTreatment('stroke')).toBe('default');
    expect(toTreatment('dual')).toBe('duotone');
    for (const id of Object.values(LANDING_TREATMENT_IDS)) expect(isTreatment(id)).toBe(true);
  });

  it('passes canonical ids through and rejects unknown ones', () => {
    for (const id of TREATMENTS) expect(toTreatment(id)).toBe(id);
    expect(toTreatment('toString')).toBeUndefined();
    expect(toTreatment('nope')).toBeUndefined();
  });
});
