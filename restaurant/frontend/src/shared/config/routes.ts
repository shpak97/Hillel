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
} as const;

export const PUBLIC_ROUTES: string[] = [
  ROUTES.login,
  ROUTES.registration,
  ROUTES.verifyEmail,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
];

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
    { label: 'QR-коди', disabled: true },
    { label: 'Замовлення', disabled: true },
    { label: 'Оплати', disabled: true },
  ];
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = getAdminNavItems();
