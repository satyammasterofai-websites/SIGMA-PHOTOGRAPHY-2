import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { fileToBase64 } from '../../lib/utils';
import { ImagePlus, Save, Trash2, Plus, Edit, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SiteContentManagement() {
  const [activeTab, setActiveTab] = useState('logo');
  const [loading, setLoading] = useState(true);

  // Logo State
  const [logoBase64, setLogoBase64] = useState('');

  // Hero State
  const [hero, setHero] = useState({
    heading: '',
    subheading: '',
    buttonText: '',
    image: '',
    videoUrl: '',
    bgImage: ''
  });

  // Contact State
  const [contact, setContact] = useState({
    phone: '',
    whatsapp: '',
    email: '',
    office: '',
    instagram: '',
    mapUrl: '',
    otherLinks: ''
  });

  // About State
  const [about, setAbout] = useState({
    title: '',
    description: '',
    image: ''
  });

  // Features State
  const [features, setFeatures] = useState<any[]>([]);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const logoDoc = await getDoc(doc(db, 'content', 'logo'));
        if (logoDoc.exists()) setLogoBase64(logoDoc.data().image || '');

        const heroDoc = await getDoc(doc(db, 'content', 'hero'));
        if (heroDoc.exists()) setHero({ heading: '', subheading: '', buttonText: '', image: '', videoUrl: '', bgImage: '', ...heroDoc.data() });

        const contactDoc = await getDoc(doc(db, 'content', 'contact'));
        if (contactDoc.exists()) setContact({ phone: '', whatsapp: '', email: '', office: '', instagram: '', mapUrl: '', otherLinks: '', ...contactDoc.data() });

        const aboutDoc = await getDoc(doc(db, 'content', 'about'));
        if (aboutDoc.exists()) setAbout({ title: '', description: '', image: '', ...aboutDoc.data() });

        const featuresDoc = await getDoc(doc(db, 'content', 'features'));
        if (featuresDoc.exists()) setFeatures(featuresDoc.data().items || []);
      } catch (error) {
        console.error("Error fetching content:", error);
        toast.error("Failed to load content settings");
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (base64: string) => void) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setter(base64);
        toast.success("Image added to preview");
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const saveLogo = async () => {
    try {
      await setDoc(doc(db, 'content', 'logo'), { image: logoBase64 });
      toast.success("Logo saved successfully");
    } catch (e) {
      toast.error("Failed to save logo");
    }
  };

  const deleteLogo = async () => {
    setLogoBase64('');
    try {
      await setDoc(doc(db, 'content', 'logo'), { image: '' });
      toast.success("Logo deleted");
    } catch (e) {
      toast.error("Failed to delete logo");
    }
  };

  const saveHero = async () => {
    try {
      await setDoc(doc(db, 'content', 'hero'), hero);
      toast.success("Hero section saved");
    } catch (e) {
      toast.error("Failed to save hero section");
    }
  };

  const saveContact = async () => {
    try {
      await setDoc(doc(db, 'content', 'contact'), contact);
      toast.success("Contact info saved");
    } catch (e) {
      toast.error("Failed to save contact info");
    }
  };

  const saveAbout = async () => {
    try {
      await setDoc(doc(db, 'content', 'about'), about);
      toast.success("About section saved");
    } catch (e) {
      toast.error("Failed to save about section");
    }
  };

  const saveFeatures = async (updatedFeatures: any[]) => {
    try {
      await setDoc(doc(db, 'content', 'features'), { items: updatedFeatures });
      setFeatures(updatedFeatures);
      toast.success("Features saved");
    } catch (e) {
      toast.error("Failed to save features");
    }
  };

  const addFeature = () => {
    const newFeature = { id: Date.now().toString(), number: '', title: '', description: '', icon: '' };
    saveFeatures([...features, newFeature]);
  };

  const updateFeature = (index: number, key: string, value: string) => {
    const updated = [...features];
    updated[index][key] = value;
    setFeatures(updated);
  };

  const removeFeature = (index: number) => {
    const updated = [...features];
    updated.splice(index, 1);
    saveFeatures(updated);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-brand-navy">Website Content</h1>
        <p className="text-brand-slate mt-1">Manage all public-facing website content in real-time.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="lg:w-64 flex flex-col gap-2">
          {['logo', 'hero', 'contact', 'about', 'features'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 rounded-xl text-left font-medium capitalize transition-colors ${
                activeTab === tab ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
            >
              {tab} Management
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'logo' && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-4">Logo Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Upload New Logo (Base64)</label>
                  <div className="relative w-full h-48 rounded-xl border-2 border-dashed border-gray-700 bg-gray-800 flex items-center justify-center overflow-hidden hover:border-indigo-500 transition-colors group cursor-pointer">
                    <div className="flex flex-col items-center text-gray-500 group-hover:text-indigo-400 transition-colors">
                      <ImagePlus className="w-8 h-8 mb-2" />
                      <span className="text-sm">Click to upload</span>
                    </div>
                    <input 
                      type="file" accept="image/*" 
                      onChange={(e) => handleImageUpload(e, setLogoBase64)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button onClick={saveLogo} className="flex-1 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-medium transition-colors">
                      <Save className="w-4 h-4" /> Save Logo
                    </button>
                    <button onClick={deleteLogo} className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-6 py-3 rounded-xl font-medium transition-colors">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Live Preview</label>
                  <div className="w-full h-48 rounded-xl border border-gray-800 bg-black flex items-center justify-center overflow-hidden p-6 relative">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    {logoBase64 ? (
                      <img src={logoBase64} alt="Website Logo" className="max-h-full max-w-full object-contain relative z-10" />
                    ) : (
                      <span className="text-gray-600 relative z-10">No logo uploaded</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hero' && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-4">Hero Section Management</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Main Heading</label>
                    <input type="text" value={hero.heading} onChange={e => setHero({...hero, heading: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sub Heading</label>
                    <textarea rows={3} value={hero.subheading} onChange={e => setHero({...hero, subheading: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Button Text</label>
                    <input type="text" value={hero.buttonText} onChange={e => setHero({...hero, buttonText: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Video URL (YouTube/Vimeo preview)</label>
                    <input type="url" value={hero.videoUrl} onChange={e => setHero({...hero, videoUrl: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Hero Image / Thumbnail</label>
                    <div className="relative w-full h-32 rounded-xl border-2 border-dashed border-gray-700 bg-gray-800 flex items-center justify-center overflow-hidden cursor-pointer">
                      {hero.image ? <img src={hero.image} className="w-full h-full object-cover" alt="Hero" /> : <span className="text-gray-500">Upload Image</span>}
                      <input type="file" onChange={e => handleImageUpload(e, (b) => setHero({...hero, image: b}))} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Hero Background</label>
                    <div className="relative w-full h-24 rounded-xl border-2 border-dashed border-gray-700 bg-gray-800 flex items-center justify-center overflow-hidden cursor-pointer">
                      {hero.bgImage ? <img src={hero.bgImage} className="w-full h-full object-cover" alt="Hero BG" /> : <span className="text-gray-500">Upload Background</span>}
                      <input type="file" onChange={e => handleImageUpload(e, (b) => setHero({...hero, bgImage: b}))} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                  <button onClick={saveHero} className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-medium transition-colors mt-4">
                    <Save className="w-4 h-4" /> Save Hero Section
                  </button>
                </div>

                {/* Hero Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Live Preview Area</label>
                  <div className="w-full h-[600px] rounded-xl border border-gray-800 overflow-hidden relative shadow-inner bg-white">
                    {hero.bgImage && <img src={hero.bgImage} className="absolute inset-0 w-full h-full object-cover opacity-20" />}
                    <div className="p-6 relative z-10 flex flex-col h-full">
                       <h1 className="text-4xl font-bold font-display text-gray-900 leading-tight">
                         {hero.heading || "Your Heading Here"}
                       </h1>
                       <p className="mt-4 text-gray-600 text-sm max-w-sm">
                         {hero.subheading || "Your subheading will appear here giving context to your brand."}
                       </p>
                       <div className="mt-6">
                         <button className="bg-gray-900 text-white px-6 py-2 rounded-full text-sm">{hero.buttonText || "Call to Action"}</button>
                       </div>
                       <div className="mt-auto w-full h-48 bg-gray-200 rounded-2xl overflow-hidden relative shadow-xl">
                          {hero.image ? <img src={hero.image} className="w-full h-full object-cover"/> : <div className="absolute inset-0 flex items-center justify-center text-gray-400">Media Preview</div>}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <input type="text" value={contact.phone} onChange={e => setContact({...contact, phone: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">WhatsApp Number</label>
                  <input type="text" value={contact.whatsapp} onChange={e => setContact({...contact, whatsapp: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input type="email" value={contact.email} onChange={e => setContact({...contact, email: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Instagram Username</label>
                  <input type="text" value={contact.instagram} onChange={e => setContact({...contact, instagram: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Office Address</label>
                  <input type="text" value={contact.office} onChange={e => setContact({...contact, office: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Google Maps Embed URL</label>
                  <input type="url" value={contact.mapUrl} onChange={e => setContact({...contact, mapUrl: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2" placeholder="https://www.google.com/maps/embed?..." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Other Links</label>
                  <input type="text" value={contact.otherLinks} onChange={e => setContact({...contact, otherLinks: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2" />
                </div>
                <div className="md:col-span-2 mt-4">
                  <button onClick={saveContact} className="w-full md:w-auto px-8 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-medium transition-colors">
                    <Save className="w-4 h-4" /> Save Contact Info
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-4">About Section</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Section Title</label>
                      <input type="text" value={about.title} onChange={e => setAbout({...about, title: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                      <textarea rows={6} value={about.description} onChange={e => setAbout({...about, description: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">About Image (Base64)</label>
                      <div className="relative w-full h-32 rounded-xl border-2 border-dashed border-gray-700 bg-gray-800 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-500 transition-colors">
                        {about.image ? <img src={about.image} className="w-full h-full object-cover" alt="About" /> : <div className="text-gray-500 text-sm">Upload Image</div>}
                        <input type="file" onChange={e => handleImageUpload(e, (b) => setAbout({...about, image: b}))} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    </div>
                    <button onClick={saveAbout} className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-medium transition-colors mt-4">
                      <Save className="w-4 h-4" /> Save About Section
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Live Preview</label>
                    <div className="w-full rounded-xl border border-gray-800 bg-white p-6 shadow-sm">
                       <h3 className="text-2xl font-bold text-gray-900 mb-4">{about.title || "About Us Title"}</h3>
                       {about.image && <img src={about.image} className="w-full h-48 object-cover rounded-xl mb-4 shadow" />}
                       <p className="text-gray-600 text-sm whitespace-pre-wrap">{about.description || "Description preview..."}</p>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                <h2 className="text-xl font-bold text-white">Features Management</h2>
                <button onClick={addFeature} className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium transition-colors text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Feature
                </button>
              </div>

              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div key={feature.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 relative">
                    <button onClick={() => removeFeature(index)} className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors">
                      <X className="w-5 h-5"/>
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Feature Number / Tag</label>
                        <input type="text" value={feature.number || ''} onChange={e => updateFeature(index, 'number', e.target.value)} placeholder="01" className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Title</label>
                        <input type="text" value={feature.title || ''} onChange={e => updateFeature(index, 'title', e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                        <textarea rows={2} value={feature.description || ''} onChange={e => updateFeature(index, 'description', e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm resize-none" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-400 mb-1">Icon Upload (Base64)</label>
                        <div className="relative w-16 h-16 rounded border border-dashed border-gray-600 bg-gray-800 flex items-center justify-center overflow-hidden">
                           {feature.icon ? <img src={feature.icon} className="w-full h-full object-contain p-1" /> : <span className="text-[10px] text-gray-500">Upload</span>}
                           <input type="file" onChange={e => {
                              if (e.target.files && e.target.files[0]) {
                                fileToBase64(e.target.files[0]).then(b => {
                                  updateFeature(index, 'icon', b);
                                  saveFeatures([...features]);
                                });
                              }
                           }} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {features.length === 0 && <p className="text-gray-500 text-center py-4">No features added yet.</p>}
                
                {features.length > 0 && (
                  <button onClick={() => saveFeatures(features)} className="w-full md:w-auto px-8 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-medium transition-colors">
                    <Save className="w-4 h-4" /> Save Feature Updates
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
