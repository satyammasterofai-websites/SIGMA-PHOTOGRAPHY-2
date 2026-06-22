import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HomeBanners from '../components/HomeBanners';
import TemplateCategories from '../components/TemplateCategories';
import ContactAndTestimonials from '../components/ContactAndTestimonials';
import CustomServicesSection from '../components/CustomServicesSection';
import Footer from '../components/Footer';
import { useSiteContent } from '../hooks/useSiteContent';

export default function Home() {
  const { loading } = useSiteContent();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 rounded-full border-4 border-brand-purple border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans overflow-x-hidden selection:bg-brand-purple/30 selection:text-brand-purple text-brand-navy">
      <Navbar />
      <main className="bg-gradient-to-b from-[#FFF0F5] via-[#FFE4E1] to-[#FFC0CB]">
        <HomeBanners />
        <Hero />
        <TemplateCategories />
        <ContactAndTestimonials />
        <CustomServicesSection />
      </main>
      <Footer />
    </div>
  );
}
