export const ALL_GAMES_TAB = 'Всі Ігри' as const;
export type TCategory = typeof ALL_GAMES_TAB | string;

export type TGameComplexity = 'Легкий' | 'Середній' | 'Складний';
export interface IGame {
    id: string;
    title: string;
    image: string;
    minPlayersCount: number;
    maxPlayersCount: number;
    complexity: TGameComplexity;
    category: string;
  }