export type QrCodeMenu = {
  menuId: string;
  menuName: string;
  selectTable: boolean;
  sortOrder: number;
};

export type QrCode = {
  uuid: string;
  restaurantId: string;
  name: string;
  isActive: boolean;
  url: string;
  menus: QrCodeMenu[];
};

export type QrCodeMenuInput = {
  menuId: string;
  selectTable: boolean;
};

export type QrImagePayload = {
  url: string;
  pngDataUrl: string;
  svg: string;
};
