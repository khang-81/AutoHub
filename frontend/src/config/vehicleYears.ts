/** Trần hợp lý cho xe mới / đời kế tiếp; không vượt quá mức backend (@Max). */
const ABSOLUTE_MAX_MODEL_YEAR = 2030;

export const MIN_MODEL_YEAR = 2005;

export function getMaxModelYear(): number {
  return Math.min(ABSOLUTE_MAX_MODEL_YEAR, new Date().getFullYear() + 1);
}
