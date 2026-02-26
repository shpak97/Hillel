import { Link } from "react-router";
import type { IGame } from "../../../utils/types/interfaces";
import PuzzleIcon from "../../../assets/icons/Puzzle";
import PersonIcon from "../../../assets/icons/PersonIcon";
import TextWithIcon from "../../../components/Typografy/TextWithIcon";
import GameInfo from "../../../components/GameInfo";
import { ROUTE_PATHS } from "../../../utils/constants/routes";



export default function GameCard({ id, title, imageSmall, minPlayersCount, maxPlayersCount, complexity }: IGame) {
  return (
    <Link
      to={`${ROUTE_PATHS.games}/${id}`}
      className='rounded-2xl py-5 px-8 min-h-[232px] w-full flex bg-cover bg-no-repeat items-end justify-end text-white hover:text-accent transition-colors'
      style={{
        backgroundImage: `url(${imageSmall})`,
      }}
    >
      <div>
        <div className=" text-2xl font-bold mb-3.75">{title}</div>
        <GameInfo>
          <TextWithIcon>
            <PersonIcon width={13} height={16} className="text-inherit" />
            {`${minPlayersCount} - ${maxPlayersCount} осіб`}
            </TextWithIcon>
          <TextWithIcon>
            <PuzzleIcon width={16} height={16} className="text-inherit" />
            {complexity}
            </TextWithIcon>
        </GameInfo>
      </div>
    </Link>
  );
}
