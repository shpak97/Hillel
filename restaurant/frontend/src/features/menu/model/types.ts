export type Menu = {
  uuid: string;
  restaurantId: string;
  name: string;
  description: string | null;
  photo: string | null;
  isActive: boolean;
  tableUuids: string[];
};

export type CreateMenuPayload = {
  name: string;
  description?: string;
};

export type UpdateMenuPayload = Partial<CreateMenuPayload> & {
  isActive?: boolean;
  tableUuids?: string[];
  removePhoto?: boolean;
};
