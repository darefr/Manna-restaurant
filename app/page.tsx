import LoadingScreen from '@/components/LoadingScreen'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import SignatureDishes from '@/components/SignatureDishes'
import About from '@/components/About'
import Menu from '@/components/Menu'
import WhatsAppOrderForm from '@/components/WhatsAppOrderForm'
import Gallery from '@/components/Gallery'
import Reviews from '@/components/Reviews'
import Instagram from '@/components/Instagram'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import PremiumFeatures from '@/components/PremiumFeatures'
import { getCurrentUser } from '@/lib/auth'
import { getHomepageGallery } from '@/lib/gallery-data'
import { getPublicMenuForDisplay } from '@/lib/menu-data'
import { getAboutContent, getOpeningHours, getRestaurantInfo } from '@/lib/settings'

// The navbar reflects the signed-in visitor and every section reads live CMS
// data, so this page must be rendered per request rather than prerendered.
export const dynamic = 'force-dynamic'

export default async function Home() {
  // Read live CMS data so admin edits appear on the public homepage.
  const [user, menu, gallery, info, hours, about] = await Promise.all([
    getCurrentUser(),
    getPublicMenuForDisplay(),
    getHomepageGallery(),
    getRestaurantInfo(),
    getOpeningHours(),
    getAboutContent(),
  ])

  return (
    <>
      <LoadingScreen />
      <PremiumFeatures />
      <Navbar user={user} />
      <main>
        <Hero />
        <SignatureDishes />
        <About content={about} />
        <Menu menu={menu} />
        <WhatsAppOrderForm menu={menu} />
        <Gallery shots={gallery} />
        <Reviews />
        <Instagram />
        <Contact info={info} hours={hours} />
      </main>
      <Footer info={info} />
    </>
  )
}
