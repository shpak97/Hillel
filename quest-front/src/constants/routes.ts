// Єдине джерело правди - базові шляхи (без початкового слешу)
export const ROUTE_PATHS = {
  home: '', // index route
  games: 'games',
  gameDetail: ':slug', // динамічний параметр
  contacts: 'contacts',
} as const;

// Функції для генерації повних шляхів (з /)
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
