import type { MeasureUnit } from '@/shared/model/measure-unit';

export type Ingredient = {
  uuid: string;
  restaurantId: string;
  name: string;
  baseUnit: MeasureUnit;
  isActive: boolean;
};

export type CreateIngredientPayload = {
  name: string;
  baseUnit: MeasureUnit;
};

export type UpdateIngredientPayload = {
  name?: string;
  baseUnit?: MeasureUnit;
  isActive?: boolean;
};
