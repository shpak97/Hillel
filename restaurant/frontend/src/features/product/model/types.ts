import type { MeasureUnit } from '@/shared/model/measure-unit';

export type ProductRecipeItem = {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: MeasureUnit;
};

export type Product = {
  uuid: string;
  restaurantId: string;
  name: string;
  description: string | null;
  photo: string | null;
  baseUnit: MeasureUnit;
  basePrice: number;
  isActive: boolean;
  recipe: ProductRecipeItem[];
};

export type RecipeRow = {
  ingredientId: string;
  quantity: string;
  unit: MeasureUnit;
};
