import type { Brand, Car, Color, CarModel } from '../types';

export type ListingFilterMode = 'rent' | 'sale';

export function carMatchesListingMode(car: Car, mode: ListingFilterMode): boolean {
  const lt = (car.listingType || 'RENT_ONLY').toUpperCase();
  return mode === 'sale' ? lt === 'SALE_ONLY' : lt === 'RENT_ONLY';
}

export function carsForListingMode(cars: Car[], mode: ListingFilterMode): Car[] {
  return cars.filter((c) => carMatchesListingMode(c, mode));
}

export function filterBrandsWithCars(
  brands: Brand[],
  cars: Car[],
  mode: ListingFilterMode
): Brand[] {
  const ids = new Set<number>();
  for (const car of carsForListingMode(cars, mode)) {
    const id = car.model?.brand?.id;
    if (id != null) ids.add(id);
  }
  return brands.filter((b) => ids.has(b.id));
}

export function filterColorsWithCars(
  colors: Color[],
  cars: Car[],
  mode: ListingFilterMode
): Color[] {
  const ids = new Set<number>();
  for (const car of carsForListingMode(cars, mode)) {
    const id = car.color?.id;
    if (id != null) ids.add(id);
  }
  return colors.filter((c) => ids.has(c.id));
}

/** Model có ít nhất một xe trong DB (tuỳ chọn lọc theo module thuê/bán). */
export function filterModelsWithCars(
  models: CarModel[],
  cars: Car[],
  mode?: ListingFilterMode
): CarModel[] {
  const pool = mode != null ? carsForListingMode(cars, mode) : cars;
  const ids = new Set<number>();
  for (const car of pool) {
    const id = car.model?.id;
    if (id != null) ids.add(id);
  }
  return models.filter((m) => ids.has(m.id));
}
