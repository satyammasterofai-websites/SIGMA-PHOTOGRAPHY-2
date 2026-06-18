import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, Play, Star, TrendingUp } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import VideoModal from '../components/VideoModal';
import { useSiteContent } from '../hooks/useSiteContent';

const defaultCategories = ['Wedding', 'Engagement', 'Birthday', 'Anniversary', 'Baby Shower', 'Housewarming', 'Corporate', 'Religious'];

export default function PremiumGallery() {
  const { categories: cmsCategories } = useSiteContent();
  const [templates, setTemplates] = useState<any[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'All';
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const navigate = useNavigate();

  const dynamicCategories = cmsCategories.length > 0 ? cmsCategories.map(c => c.name) : defaultCategories;
  const categories = ['All', ...dynamicCategories];

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const q = query(collection(db, 'templates'), where('status', '!=', 'Hidden'));
        const sn = await getDocs(q);
        const list = sn.docs.map(d => ({ id: d.id, ...d.data() }));
        // In case there are missing status fields, fallback to showing them
        setTemplates(list);
        setFilteredTemplates(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    let result = templates;
    if (activeCategory !== 'All') {
      result = result.filter(t => t.category === activeCategory);
    }
    if (searchQuery) {
      result = result.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (t.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredTemplates(result);
  }, [searchQuery, activeCategory, templates]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF0F5] via-[#FFE4E1] to-[#FFC0CB] flex flex-col">
      {activeVideo && <VideoModal url={activeVideo} onClose={() => setActiveVideo(null)} />}
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">Premium Video Gallery</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Discover our collection of cinematic invitations for your special moments.</p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-6 mb-12">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search templates by name or keyword..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-brand-purple shadow-sm"
              />
            </div>
            <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-4 rounded-xl font-medium whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-brand-purple text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Template Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
               {filteredTemplates.map(template => (
                 <div key={template.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 group flex flex-col">
                    <div className="relative aspect-video overflow-hidden bg-gray-100">
                      {(template.thumbnailBase64 || template.image) ? (
                        <img src={template.thumbnailBase64 || template.image} alt={template.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Preview</div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                         {template.isFeatured && (
                           <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                             <Star className="w-3 h-3 fill-current" /> Featured
                           </div>
                         )}
                         {template.isTrending && (
                           <div className="bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                             <TrendingUp className="w-3 h-3" /> Trending
                           </div>
                         )}
                         <div className="bg-white/90 backdrop-blur text-brand-purple text-xs font-bold px-3 py-1 rounded-full shadow-md w-fit">
                           {template.category}
                         </div>
                      </div>

                      {/* Video Quick View Overlay */}
                      {template.videoUrl && (
                        <button 
                          onClick={() => setActiveVideo(template.videoUrl)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-10 w-full"
                        >
                          <div className="w-16 h-16 bg-white/20 backdrop-blur border border-white/40 rounded-full flex items-center justify-center text-white transform scale-90 group-hover:scale-100 transition-transform">
                            <Play className="w-8 h-8 fill-white" />
                          </div>
                        </button>
                      )}
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="font-display font-bold text-xl text-gray-900 mb-2">{template.title}</h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{template.description}</p>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                        <div>
                           {template.discountPrice ? (
                             <div className="flex flex-col">
                               <span className="text-xs text-gray-400 line-through">₹{template.price}</span>
                               <span className="text-xl font-bold text-gray-900">₹{template.discountPrice}</span>
                             </div>
                           ) : (
                             <span className="text-xl font-bold text-gray-900">₹{template.price}</span>
                           )}
                        </div>
                        
                        <button 
                          onClick={() => navigate(`/checkout/${template.id}`, { state: { template } })}
                          className="px-6 py-2 bg-gray-900 hover:bg-brand-purple text-white font-medium rounded-xl transition-colors shadow-md shadow-gray-900/10 hover:shadow-brand-purple/20"
                        >
                          Customize & Order
                        </button>
                      </div>
                    </div>
                 </div>
               ))}
               {filteredTemplates.length === 0 && (
                 <div className="col-span-full py-20 text-center">
                   <p className="text-gray-500 text-lg">No templates found matching your criteria.</p>
                   <button onClick={() => {setSearchQuery(''); setActiveCategory('All');}} className="mt-4 text-brand-purple font-medium hover:underline">Clear Filters</button>
                 </div>
               )}
             </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
