import { motion } from 'motion/react';
import { PlayCircle } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import { Link } from 'react-router-dom';

const defaultCategories = [
  { name: 'Wedding', price: '2,999', image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800' },
  { name: 'Engagement', price: '1,999', image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800' },
  { name: 'Birthday', price: '999', image: 'https://images.unsplash.com/photo-1530103862676-de8896b10404?auto=format&fit=crop&q=80&w=800' },
  { name: 'Anniversary', price: '1,499', image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=800' },
  { name: 'Baby Shower', price: '1,299', image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800' },
  { name: 'Housewarming', price: '1,499', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800' },
];

export default function TemplateCategories() {
  const { categories } = useSiteContent();
  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <section id="templates" className="py-24 bg-white w-full">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-sm font-bold tracking-widest text-brand-indigo uppercase">Masterpieces Collection</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mt-4 mb-4">
              Explore Our Signature <br/>Templates
            </h2>
            <p className="text-gray-600 text-lg">
              Cinematic quality designs crafted to match the elegance of your finest moments.
            </p>
          </div>
          <Link to="/gallery" className="self-start md:self-end px-6 py-3 rounded-full border-2 border-gray-900 text-gray-900 font-medium hover:bg-gray-900 hover:text-white transition-all text-center inline-block">
            View All Designs
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayCategories.map((cat, index) => (
            <motion.div
              key={cat.id || cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group rounded-3xl overflow-hidden glassmorphism-dark relative block"
            >
               {/* Background Image Image */}
              <div className="absolute inset-0 bg-gray-900">
                <img 
                  src={cat.image || 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800'} 
                  alt={cat.name} 
                  className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 h-[400px] p-8 flex flex-col justify-end hover:cursor-default">
                
                {/* Bottom info */}
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-3xl font-display font-bold text-white mb-2">{cat.name}</h3>
                  <p className="text-gray-300 text-sm mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 line-clamp-2">
                    {cat.description || `Explore our premium ${cat.name.toLowerCase()} invitation templates.`}
                  </p>
                  
                  <div className="w-full py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gradient-brand hover:text-white hover:shadow-lg hover:shadow-brand-purple/50 transition-all transform opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 duration-300 delay-150 inline-block text-center cursor-pointer">
                    View Templates
                  </div>
                </div>

              </div>
              <Link to={`/gallery?category=${encodeURIComponent(cat.name)}`} className="absolute inset-0 z-20 cursor-pointer"></Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
