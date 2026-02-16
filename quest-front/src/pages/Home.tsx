import Main from '../components/Main/Main'
import frontPageBg from '../assets/front-page-bg.jpg'

export default function Home() {
  return (
    <Main backgroundImage={frontPageBg} className="pt-30.5 pb-36.75">
      <h1>Home Page</h1>
      {/* Тут будуть таби з get параметром ?cat=cat-name */}
    </Main>
  )
}
