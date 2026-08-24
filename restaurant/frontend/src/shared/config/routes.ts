export const ROUTES = {
  home: '/',
  login: '/login',
  registration: '/registration',
  verifyEmail: '/verify-email',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  restaurants: '/restaurants',
  restaurantsNew: '/restaurants/new',
  restaurantEdit: (uuid: string) => `/restaurants/${uuid}/edit`,
  restaurantTables: (uuid: string) => `/restaurants/${uuid}/tables`,
  restaurantTableNew: (uuid: string) => `/restaurants/${uuid}/tables/new`,
  restaurantTableEdit: (restaurantUuid: string, tableUuid: string) =>
    `/restaurants/${restaurantUuid}/tables/${tableUuid}/edit`,
  restaurantMenus: (uuid: string) => `/restaurants/${uuid}/menus`,
  restaurantMenuNew: (uuid: string) => `/restaurants/${uuid}/menus/new`,
  restaurantMenuEdit: (restaurantUuid: string, menuUuid: string) =>
    `/restaurants/${restaurantUuid}/menus/${menuUuid}/edit`,
  restaurantIngredients: (uuid: string) => `/restaurants/${uuid}/ingredients`,
  restaurantIngredientNew: (uuid: string) =>
    `/restaurants/${uuid}/ingredients/new`,
  restaurantIngredientEdit: (restaurantUuid: string, ingredientUuid: string) =>
    `/restaurants/${restaurantUuid}/ingredients/${ingredientUuid}/edit`,
  restaurantProducts: (uuid: string) => `/restaurants/${uuid}/products`,
  restaurantProductNew: (uuid: string) => `/restaurants/${uuid}/products/new`,
  restaurantProductEdit: (restaurantUuid: string, productUuid: string) =>
    `/restaurants/${restaurantUuid}/products/${productUuid}/edit`,
  restaurantMenuItems: (uuid: string) => `/restaurants/${uuid}/menu-items`,
  restaurantMenuItemNew: (uuid: string) => `/restaurants/${uuid}/menu-items/new`,
  restaurantMenuItemEdit: (restaurantUuid: string, itemUuid: string) =>
    `/restaurants/${restaurantUuid}/menu-items/${itemUuid}/edit`,
  restaurantQrCodes: (uuid: string) => `/restaurants/${uuid}/qr-codes`,
  restaurantQrCodeNew: (uuid: string) => `/restaurants/${uuid}/qr-codes/new`,
  restaurantQrCodeEdit: (restaurantUuid: string, qrCodeUuid: string) =>
    `/restaurants/${restaurantUuid}/qr-codes/${qrCodeUuid}/edit`,
  restaurantOrders: (uuid: string) => `/restaurants/${uuid}/orders`,
  restaurantPayments: (uuid: string) => `/restaurants/${uuid}/payments`,
  guestRestaurant: (slug: string) => `/r/${slug}`,
  guestMenu: (slug: string, menuUuid: string, selectTable = false) =>
    `/r/${slug}/m/${menuUuid}?selectTable=${selectTable ? '1' : '0'}`,
  guestTable: (slug: string, tableUuid: string) => `/r/${slug}/t/${tableUuid}`,
  guestQr: (slug: string, qrUuid: string) => `/r/${slug}/q/${qrUuid}`,
  guestOrderResult: (slug: string, orderUuid: string) =>
    `/r/${slug}/orders/${orderUuid}/result`,
} as const;

export const PUBLIC_ROUTES: string[] = [
  ROUTES.login,
  ROUTES.registration,
  ROUTES.verifyEmail,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
];

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }

  return pathname === '/r' || pathname.startsWith('/r/');
}

export type AdminNavItem = {
  label: string;
  href?: string;
  disabled?: boolean;
};

export function getAdminNavItems(restaurantUuid?: string): AdminNavItem[] {
  return [
    { label: 'Дашборд', href: ROUTES.home },
    { label: 'Ресторани', href: ROUTES.restaurants },
    {
      label: 'Столи',
      href: restaurantUuid ? ROUTES.restaurantTables(restaurantUuid) : undefined,
      disabled: !restaurantUuid,
    },
    {
      label: 'Меню',
      href: restaurantUuid ? ROUTES.restaurantMenus(restaurantUuid) : undefined,
      disabled: !restaurantUuid,
    },
    {
      label: 'Інгредієнти',
      href: restaurantUuid
        ? ROUTES.restaurantIngredients(restaurantUuid)
        : undefined,
      disabled: !restaurantUuid,
    },
    {
      label: 'Продукти',
      href: restaurantUuid ? ROUTES.restaurantProducts(restaurantUuid) : undefined,
      disabled: !restaurantUuid,
    },
    {
      label: 'Позиції меню',
      href: restaurantUuid ? ROUTES.restaurantMenuItems(restaurantUuid) : undefined,
      disabled: !restaurantUuid,
    },
    {
      label: 'QR-коди',
      href: restaurantUuid ? ROUTES.restaurantQrCodes(restaurantUuid) : undefined,
      disabled: !restaurantUuid,
    },
    {
      label: 'Замовлення',
      href: restaurantUuid ? ROUTES.restaurantOrders(restaurantUuid) : undefined,
      disabled: !restaurantUuid,
    },
    {
      label: 'Оплати',
      href: restaurantUuid
        ? ROUTES.restaurantPayments(restaurantUuid)
        : undefined,
      disabled: !restaurantUuid,
    },
  ];
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = getAdminNavItems();
