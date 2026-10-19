import type { Household } from './types';
/** Local display boundary only; not authentication on a shared browser profile. */
export const visibleHouseholds = (households: Household[], role: string) => role === 'Pendamping' ? households.filter(h=>h.companionConsent) : households;
