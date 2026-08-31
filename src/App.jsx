import { MenuProvider } from './components/MenuContext'
import { CartProvider } from './components/CartContext'
import { LocationProvider } from './components/LocationContext'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import SCurveMenuSection from './components/SCurveMenuSection'
import MenuBoardSection from './components/MenuBoardSection'
import FooterSection from './components/FooterSection'
import MobileBottomBar from './components/MobileBottomBar'
import CartDrawer from './components/CartDrawer'
import SplashScreen from './components/SplashScreen'
import MenuEditor from './components/MenuEditor'

export default function App() {
  return (
    <LocationProvider>
      <MenuProvider>
        <CartProvider>
          <SplashScreen />
          <Header />
          <main>
            <HeroSection />
            <SCurveMenuSection />
            <MenuBoardSection />
          </main>
          <FooterSection />
          <MobileBottomBar />
          <CartDrawer />
          <MenuEditor />
        </CartProvider>
      </MenuProvider>
    </LocationProvider>
  )
}
