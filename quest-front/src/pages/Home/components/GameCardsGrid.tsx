import GameCard from './GameCard'
import type { IGame } from '../../../utils/types/interfaces';

interface GameCardsGridProps {
  games: IGame[];
}

export default function GameCardsGrid({ games }: GameCardsGridProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {games.map((game) => (
        <GameCard key={game.id} {...game} />
      ))}
    </div>
  )
}