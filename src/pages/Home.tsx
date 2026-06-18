import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HomeBanners from '../components/HomeBanners';
import TemplateCategories from '../components/TemplateCategories';
import ContactAndTestimonials from '../components/ContactAndTestimonials';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen font-sans overflow-x-hidden selection:bg-brand-purple/30 selection:text-brand-purple text-brand-navy">
      <Navbar />
      <main className="bg-gradient-to-b from-[#FFF0F5] via-[#FFE4E1] to-[#FFC0CB]">
        <Hero />
        <HomeBanners />
        <TemplateCategories />
        <ContactAndTestimonials />
      </main>
      <Footer />
    </div>
  );
}
