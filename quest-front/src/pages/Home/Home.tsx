import Main from "../../components/Main/Main";
import frontPageBg from "../../assets/front-page-bg.jpg";
import Subtitle from "../../components/Typografy/Subtitle";
import Title from "../../components/Typografy/Title";
import HomeContent from "./components/HomeContent";



export default function Home() {
  return (
    <Main backgroundImage={frontPageBg} className="pt-30.5 pb-36.75">
      <Subtitle>Ігри у Львові</Subtitle>
      <Title>В яку гру зіграємо?</Title>
      <HomeContent />
    </Main>
  );
}
