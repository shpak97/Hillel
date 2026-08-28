import { apiClient } from '@/shared/api/client';
import type { Restaurant } from '@/features/restaurant/model/types';

export async function fetchRestaurants(): Promise<Restaurant[]> {
  try {
    return await apiClient<Restaurant[]>('/restaurants', {
      method: 'GET',
      cache: 'no-store',
    });
  } catch {
    return [];
  }
}
