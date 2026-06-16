import { motion } from 'motion/react';
import { useSiteContent } from '../hooks/useSiteContent';

export default function HomeBanners() {
  const { banners } = useSiteContent();

  if (!banners || banners.length === 0) return null;

  return (
    <section className="py-12 bg-white flex overflow-hidden w-full border-t border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 w-full hidden md:block">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {banners.slice(0, 4).map((banner: any, i: number) => (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl overflow-hidden aspect-[4/3] bg-gray-100"
              >
                 <img src={banner.image} alt="Banner" className="w-full h-full object-cover" />
              </motion.div>
           ))}
        </div>
      </div>
      {/* Mobile Scroll */}
      <div className="flex md:hidden overflow-x-auto gap-4 px-6 snap-x pb-4">
        {banners.map((banner: any) => (
           <div key={banner.id} className="snap-center min-w-[80vw] h-48 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
               <img src={banner.image} alt="Banner" className="w-full h-full object-cover" />
           </div>
        ))}
      </div>
    </section>
  );
}
