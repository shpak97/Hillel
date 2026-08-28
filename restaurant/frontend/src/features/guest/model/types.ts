export type GuestRestaurantHeaderResponse = {
  slug: string;
  title: string;
};

export type GuestRestaurantResponse = GuestRestaurantHeaderResponse & {
  currency: string;
};

export type GuestQrResponse = {
  restaurant: GuestRestaurantHeaderResponse;
  qrCode: {
    uuid: string;
    name: string;
  };
  menus: {
    menuId: string;
    menuName: string;
    selectTable: boolean;
    sortOrder: number;
    url: string;
  }[];
};

export type GuestMenuItem = {
  uuid: string;
  name: string;
  description: string | null;
  photo: string | null;
  totalPrice: number;
  sortOrder: number;
};

export type GuestMenuSection = {
  uuid: string;
  name: string;
  sortOrder: number;
  items: GuestMenuItem[];
};

export type GuestMenuResponse = {
  restaurant: GuestRestaurantResponse;
  menu: {
    uuid: string;
    name: string;
    description: string | null;
    photo: string | null;
  };
  sections: GuestMenuSection[];
  hours: {
    isOpenNow: boolean;
  };
};

export type GuestTableResponse = {
  restaurant: GuestRestaurantHeaderResponse;
  table: {
    uuid: string;
    label: string;
  };
  menus: {
    menuId: string;
    menuName: string;
    sortOrder: number;
    url: string;
  }[];
};
