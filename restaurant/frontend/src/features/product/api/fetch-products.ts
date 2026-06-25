import { serverFetch } from '@/shared/api/server-api';
import type { Product } from '@/features/product/model/types';

export async function fetchProductsForRestaurant(
  restaurantUuid: string,
): Promise<Product[]> {
  const result = await serverFetch<Product[]>(
    `/restaurants/${restaurantUuid}/products`,
  );

  if (!result.ok || !result.data) {
    return [];
  }

  return result.data;
}

export async function fetchProductByUuid(
  restaurantUuid: string,
  productUuid: string,
): Promise<Product | null> {
  const result = await serverFetch<Product>(
    `/restaurants/${restaurantUuid}/products/${productUuid}`,
  );

  if (!result.ok || !result.data) {
    return null;
  }

  return result.data;
}
