import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router';
import Main from '../../components/Main/Main';
import Subtitle from '../../components/Typografy/Subtitle';
import { MOCK_GAMES } from '../../utils/constants/constants';
import type { IGame } from '../../utils/types/interfaces';
import Title from '../../components/Typografy/Title';
import GameInfo from '../../components/GameInfo';
import TextWithIcon from '../../components/Typografy/TextWithIcon';
import PersonIcon from '../../assets/icons/PersonIcon';
import PuzzleIcon from '../../assets/icons/Puzzle';
import TimeIcon from '../../assets/icons/Time';
import Button from '../../components/Button';
import { useSearchParams } from 'react-router';
import Popup from './components/Popup';

const fetchGame = async (id: IGame['id']): Promise<IGame | undefined> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return MOCK_GAMES.find((game) => game.id === id);
};

export default function GameDetail() {
  const { slug } = useParams<{ slug?: string }>();
  const [game, setGame] = useState<IGame | null | 'not-found'>(null);
  const [searchParams, setSearchParams] = useSearchParams();


  useEffect(() => {
    if (!slug) return;

    fetchGame(slug).then((result) => {
      setGame(result ?? 'not-found');
    });
  }, [slug]);

  if (!slug || game === 'not-found') {
    return <Navigate to="/404" replace />;
  }

  if (!game) {
    return (
      <Main className="pt-30.5 pb-36.75">
        <p>Завантаження...</p>
      </Main>
    );
  }

  const { category, title, minPlayersCount, maxPlayersCount, complexity, time, description, imageLarge } = game;

  return (
    <Main backgroundImage={imageLarge} className="pt-30.5 pb-36.75">
      <Subtitle className='mb-2'>{category}</Subtitle>
      <Title className='text-8xl mb-10'>{title}</Title>
      <GameInfo size='large' className='text-accent mb-6.5'>
          <TextWithIcon>
            <PersonIcon width={19} height={24} className="text-inherit" />
            {`${minPlayersCount} - ${maxPlayersCount} осіб`}
            </TextWithIcon>
          <TextWithIcon>
            <PuzzleIcon width={24} height={24} className="text-inherit" />
            {complexity}
            </TextWithIcon>
            <TextWithIcon>
            <TimeIcon width={24} height={24} className="text-inherit" />
            {time}
            </TextWithIcon>
        </GameInfo>
        <div className='text-base mb-10'>{description}</div>
        <Button onClick={() => setSearchParams({ booking: 'true' })} type='button'>
          Взяти участь
        </Button>
        {searchParams.get('booking') && <Popup />}
    </Main>
  );
}
