import Main from '../../components/Main/Main';
import frontPageBg from '../../assets/front-page-bg.jpg';
import Subtitle from '../../components/Typografy/Subtitle';
import Title from '../../components/Typografy/Title';
import GameCardsGrid from './components/GameCardsGrid';
import type { IGame, TCategory } from '../../utils/types/game';
import { ALL_GAMES_TAB } from '../../utils/types/game';
import Tabs from './components/Tabs';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

const MOCK_GAMES: IGame[] = [
  { id: '1', title: 'Game 1', image: 'games/game-1.png', minPlayersCount: 2, maxPlayersCount: 5, complexity: 'Легкий', category: 'Пригодне' },
  { id: '2', title: 'Game 2', image: 'games/game-1.png', minPlayersCount: 2, maxPlayersCount: 5, complexity: 'Середній', category: 'Страшне' },
  { id: '3', title: 'Game 3', image: 'games/game-1.png', minPlayersCount: 2, maxPlayersCount: 5, complexity: 'Складний', category: 'Містичне' },
  { id: '4', title: 'Game 4', image: 'games/game-1.png', minPlayersCount: 2, maxPlayersCount: 5, complexity: 'Легкий', category: 'Детективне' },
  { id: '5', title: 'Game 5', image: 'games/game-1.png', minPlayersCount: 2, maxPlayersCount: 5, complexity: 'Середній', category: 'Sci-Fi' },
  { id: '6', title: 'Game 6', image: 'games/game-1.png', minPlayersCount: 2, maxPlayersCount: 5, complexity: 'Складний', category: 'Пригодне' },
  { id: '7', title: 'Game 7', image: 'games/game-1.png', minPlayersCount: 2, maxPlayersCount: 5, complexity: 'Легкий', category: 'Пригодне' },
  { id: '8', title: 'Game 8', image: 'games/game-1.png', minPlayersCount: 2, maxPlayersCount: 5, complexity: 'Середній', category: 'Пригодне' },
  { id: '9', title: 'Game 9', image: 'games/game-1.png', minPlayersCount: 2, maxPlayersCount: 5, complexity: 'Складний', category: 'Пригодне' },
  { id: '10', title: 'Game 10', image: 'games/game-1.png', minPlayersCount: 2, maxPlayersCount: 5, complexity: 'Легкий', category: 'Пригодне' },
];

const fetchGames = async (): Promise<IGame[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return MOCK_GAMES;
};

function HomeContent() {
  const [data, setData] = useState<IGame[] | null>(null);

  useEffect(() => {
    fetchGames().then(setData);
  }, []);

  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');

  if (!data) return <div>Loading...</div>;

  const categories: TCategory[] = [ALL_GAMES_TAB, ...new Set(data.map((g) => g.category))];
  const isValidCategory = (cat: string) =>
    cat === ALL_GAMES_TAB || data.some((g) => g.category === cat);

  const activeTab: TCategory =
    categoryFromUrl && isValidCategory(categoryFromUrl) ? categoryFromUrl : ALL_GAMES_TAB;

  const handleTabChange = (tab: TCategory) => {
    setSearchParams(tab === ALL_GAMES_TAB ? {} : { category: tab });
  };

  const filteredGames =
    activeTab === ALL_GAMES_TAB ? data : data.filter((g) => g.category === activeTab);

  return (
    <>
      <Tabs buttons={categories} activeTab={activeTab} onTabChange={handleTabChange} />
      <GameCardsGrid games={filteredGames} />
    </>
  );
}

export default function Home() {
  return (
    <Main backgroundImage={frontPageBg} className="pt-30.5 pb-36.75">
      <Subtitle>Ігри у Львові</Subtitle>
      <Title>В яку гру зіграємо?</Title>
      <HomeContent />
    </Main>
  );
}
