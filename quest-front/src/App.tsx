import { Suspense } from 'react'
import Header from './components/Header/Header'
import SiteLogo from './components/Header/components/SiteLogo'
import Navigation from './components/Header/components/Navigation'
import Phone from './components/Header/components/Phone'
import Footer from './components/Footer/Footer'
import { Outlet } from 'react-router'

function App() {
  return (
    <>
      <Header>
        <SiteLogo />
        <Navigation />
        <Phone />
      </Header>
      <Suspense fallback={<div>Loading...</div>}>
        <Outlet />
      </Suspense>
      <Footer />
    </>
  )
}

export default App
