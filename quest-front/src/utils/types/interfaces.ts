import type { TGameComplexity } from "./types";
export interface IIconProps {
    color?: string;
    className?: string;
    width?: number | string;
    height?: number | string;
  }

export interface IGame {
    id: string;
    title: string;
    minPlayersCount: number;
    maxPlayersCount: number;
    complexity: TGameComplexity;
    category: string;
    imageSmall: string;
    imageLarge: string;
    description: string;
    time: string;
  }


