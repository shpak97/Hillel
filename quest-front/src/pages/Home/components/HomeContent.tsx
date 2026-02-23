import { useEffect, useState } from "react";
import { ALL_GAMES_TAB, MOCK_GAMES } from "../../../utils/constants/constants";
import type { TCategory } from "../../../utils/types/types";
import GameCardsGrid from "./GameCardsGrid";
import { useSearchParams } from "react-router";
import type { IGame } from "../../../utils/types/interfaces";
import Tabs from "./Tabs";

const fetchGames = async (): Promise<IGame[]> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return MOCK_GAMES;
  };
  

export default function HomeContent() {
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