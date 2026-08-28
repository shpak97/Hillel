export type RestaurantStatus = 'active' | 'setup';

export type Restaurant = {
  uuid: string;
  slug: string;
  title: string;
  description: string;
  address: string | null;
  photos: string[];
  timezone: string;
  currency: string;
  isActive: boolean;
  deactivatedAt: string | null;
  ownerId: number;
  status: RestaurantStatus;
};
