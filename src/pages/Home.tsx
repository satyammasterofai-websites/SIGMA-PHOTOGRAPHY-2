import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HomeBanners from '../components/HomeBanners';
import TemplateCategories from '../components/TemplateCategories';
import ContactAndTestimonials from '../components/ContactAndTestimonials';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-cream selection:bg-brand-purple/30 selection:text-brand-purple font-sans overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <HomeBanners />
        <TemplateCategories />
        <ContactAndTestimonials />
      </main>
      <Footer />
    </div>
  );
}
