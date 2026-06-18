export type Table = {
  uuid: string;
  restaurantId: string;
  label: string;
  zone: string;
  seats: number;
  isActive: boolean;
  menuUuids: string[];
};

export type CreateTablePayload = {
  label: string;
  zone: string;
  seats: number;
};

export type UpdateTablePayload = Partial<CreateTablePayload> & {
  isActive?: boolean;
  menuUuids?: string[];
};
