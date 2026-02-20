import { useParams } from 'react-router'
import Main from '../components/Main/Main'

export default function GameDetail() {
  const { slug } = useParams<{ slug: string }>()
  
  return (
    <Main>
      <h1>Game Detail: {slug}</h1>
    </Main>
  )
}
