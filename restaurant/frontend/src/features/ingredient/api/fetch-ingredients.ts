import { serverFetch } from '@/shared/api/server-api';
import type { Ingredient } from '@/features/ingredient/model/types';

export async function fetchIngredientsForRestaurant(
  restaurantUuid: string,
): Promise<Ingredient[]> {
  const result = await serverFetch<Ingredient[]>(
    `/restaurants/${restaurantUuid}/ingredients`,
  );

  if (!result.ok || !result.data) {
    return [];
  }

  return result.data;
}

export async function fetchIngredientByUuid(
  restaurantUuid: string,
  ingredientUuid: string,
): Promise<Ingredient | null> {
  const result = await serverFetch<Ingredient>(
    `/restaurants/${restaurantUuid}/ingredients/${ingredientUuid}`,
  );

  if (!result.ok || !result.data) {
    return null;
  }

  return result.data;
}
