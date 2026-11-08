import { SHOTS as CAL } from './cal.js';
import { SHOTS_A } from './segA.js';
export function SHOTS() { return (location.search.includes('cal') ? CAL : [...SHOTS_A]); }
