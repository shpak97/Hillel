export type MenuItemProduct = {
  productId: string;
  productName: string;
  quantity: number;
  priceOverride: number | null;
  unitPrice: number;
  linePrice: number;
  sortOrder: number;
};

export type MenuItem = {
  uuid: string;
  restaurantId: string;
  name: string;
  description: string | null;
  photo: string | null;
  isActive: boolean;
  calculatedPrice: number;
  priceOverride: number | null;
  totalPrice: number;
  products: MenuItemProduct[];
};

export type SectionMenuItem = MenuItem & {
  sortOrder: number;
};

export type MenuItemProductRow = {
  productId: string;
  quantity: string;
  priceOverride: string;
};
