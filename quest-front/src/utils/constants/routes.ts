export const ROUTE_PATHS = {
  home: '',
  games: 'games',
  gameDetail: ':slug',
  contacts: 'contacts',
} as const;

export const getRoute = (path: string) => path === '' ? '/' : `/${path}`;

export const ROUTES = {
  home: getRoute(ROUTE_PATHS.home),
  games: getRoute(ROUTE_PATHS.games),
  contacts: getRoute(ROUTE_PATHS.contacts),
} as const;

export const NAVIGATION_ITEMS = [
  { label: 'Головна', path: ROUTES.home },
  { label: 'Контакти', path: ROUTES.contacts },
] as const;
