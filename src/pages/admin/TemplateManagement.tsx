import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { fileToBase64 } from '../../lib/utils';
import { Plus, Edit, Trash2, ImagePlus, Eye, Star, TrendingUp, Play, ShoppingBag, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { isFileNameDuplicate, registerFileName } from '../../lib/fileRegistry';

export default function TemplateManagement() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Wedding');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailBase64, setThumbnailBase64] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [status, setStatus] = useState('Active');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [advancePayment,
      setAdvancePayment] = useState('');
  const [baseOrdersCount, setBaseOrdersCount] = useState<number>(100);
  const [language, setLanguage] = useState('None');
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom Fields
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [formId, setFormId] = useState('');
  const [availableForms, setAvailableForms] = useState<any[]>([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'templates'));
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      // Backfill displayId if missing
      const toUpdate = list.filter(t => !t.displayId);
      if (toUpdate.length > 0) {
        let maxId = 0;
        list.forEach(t => {
          if (t.displayId) {
            const num = parseInt(t.displayId, 10);
            if (!isNaN(num) && num > maxId) maxId = num;
          }
        });
        
        for (const t of toUpdate) {
          maxId++;
          const nextId = String(maxId).padStart(5, '0');
          t.displayId = nextId;
          updateDoc(doc(db, 'templates', t.id), { displayId: nextId }).catch(console.error);
        }
      }

      setTemplates(list);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    const fetchCategories = async () => {
      try {
        const catDoc = await getDoc(doc(db, 'content', 'categories'));
        if (catDoc.exists() && catDoc.data().items) {
          setCategories(catDoc.data().items.map((item: any) => item.name));
        }
        
        const formsSnap = await getDocs(collection(db, 'settings', 'data', 'custom_forms'));
        const fList: any[] = [];
        formsSnap.forEach((d) => {
          fList.push({ id: d.id, ...d.data() });
        });
        setAvailableForms(fList);
      } catch (err) {}
    };
    fetchCategories();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const isDuplicate = await isFileNameDuplicate(file.name);
      if (isDuplicate) {
        toast.error(`A file named "${file.name}" has already been uploaded.`);
        return;
      }
      await registerFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setThumbnailBase64(compressedBase64);
          toast.success("Image compressed and loaded");
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const openForm = (template: any = null) => {
    if (template) {
      setEditingId(template.id);
      setTitle(template.title || '');
      setCategory(template.category || 'Wedding');
      setPrice(template.price || '');
      setDiscountPrice(template.discountPrice || '');
      setDescription(template.description || '');
      setThumbnailBase64(template.thumbnailBase64 || '');
      setVideoUrl(template.videoUrl || '');
      setStatus(template.status || 'Active');
      setIsFeatured(template.isFeatured || false);
      setIsTrending(template.isTrending || false);
      setAdvancePayment(template.advancePayment || '');
      setBaseOrdersCount(template.baseOrdersCount ?? 100);
      setLanguage(template.language || 'None');
      setCustomFields(template.customFields || []);
      setFormId(template.formId || '');
    } else {
      setEditingId(null);
      setTitle('');
      setCategory(categories.length > 0 ? categories[0] : 'Wedding');
      setPrice('');
      setDiscountPrice('');
      setDescription('');
      setThumbnailBase64('');
      setVideoUrl('');
      setStatus('Active');
      setIsFeatured(false);
      setIsTrending(false);
      setAdvancePayment('');
      setBaseOrdersCount(100);
      setLanguage('None');
    setLanguage('None');
      setCustomFields([]);
      setFormId('');
    }
    setNewFieldName('');
    setIsModalOpen(true);
  };

  const updateCustomField = (id: string, key: string, val: any) => {
    setCustomFields(customFields.map(f => f.id === id ? { ...f, [key]: val } : f));
  };

  const addCustomField = () => {
    if (newFieldName.trim()) {
      setCustomFields([...customFields, { id: Date.now().toString(), name: newFieldName.trim(), type: 'text', required: true }]);
      setNewFieldName('');
    }
  };

  const removeCustomField = (id: string) => {
    setCustomFields(customFields.filter(f => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thumbnailBase64) {
      toast.error('Please upload a thumbnail image');
      return;
    }
    
    // Check for duplicate template name/title
    const isDuplicate = templates.some(
      t => t.id !== editingId && t.title.toLowerCase().trim() === title.toLowerCase().trim()
    );
    
    if (isDuplicate) {
      toast.error("A template with this exact title already exists.");
      return;
    }
    
    try {
      let finalCategory = category;
      if (!categories.includes(category) && categories.length > 0) {
        finalCategory = categories[0];
      }
      
      const data = { 
        title, category: finalCategory, price, discountPrice, description, 
        thumbnailBase64, videoUrl, status, isFeatured, isTrending, advancePayment: advancePayment ? Number(advancePayment) : 0, 
        baseOrdersCount: Number(baseOrdersCount), language, customFields, formId 
      };
      
      if (editingId) {
        await updateDoc(doc(db, 'templates', editingId), data);
      } else {
        let maxId = 0;
        templates.forEach(t => {
          if (t.displayId) {
            const num = parseInt(t.displayId, 10);
            if (!isNaN(num) && num > maxId) maxId = num;
          }
        });
        const nextId = String(maxId + 1).padStart(5, '0');
        await addDoc(collection(db, 'templates'), { ...data, displayId: nextId });
      }
      
      setIsModalOpen(false);
      setShowSuccessPopup(true);
      fetchTemplates();
      
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save template");
    }
  };

  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteTemplateId) return;
    try {
      await deleteDoc(doc(db, 'templates', deleteTemplateId));
      toast.success("Template deleted successfully!");
      fetchTemplates();
      setDeleteTemplateId(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete template");
      setDeleteTemplateId(null);
    }
  };

  return (
    <div className="w-full">
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-gray-900 border border-green-500/30 rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl shadow-green-900/20 transform scale-100 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
            <p className="text-gray-300 mb-6">Template has been saved successfully and is now available in your templates list.</p>
            <button 
              onClick={() => setShowSuccessPopup(false)}
              className="w-full px-4 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 font-medium transition-colors"
            >
              Back to Templates
            </button>
          </div>
        </div>
      )}
      {deleteTemplateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-white mb-2">Delete Template</h3>
            <p className="text-gray-400 mb-6">Are you sure you want to delete this template? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteTemplateId(null)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-2xl md:text-3xl font-display font-bold text-brand-navy">Template Management</h1>
           <p className="text-brand-slate mt-1">Manage standard invitation packages and themes.</p>
        </div>
        <button 
          onClick={() => openForm()}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" /> Add Template
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
           <div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <>

            {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500"
          />
        </div>
      </div>
      
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto mb-6 pb-2 scrollbar-thin scrollbar-thumb-gray-800">
        <button
          onClick={() => setActiveTab('All')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'All' ? 'bg-indigo-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'}`}
        >
          All Categories
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === cat ? 'bg-indigo-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-800/50 text-gray-400 font-medium">
                <tr>
                  <th className="px-6 py-4">Thumbnail</th>
                  <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Orders</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {templates.filter(t => {
                  const matchesTab = activeTab === 'All' ? true : t.category === activeTab;
                  const searchLower = searchQuery.toLowerCase();
                  const matchesSearch = searchQuery === '' || 
                    (t.title || '').toLowerCase().includes(searchLower) || 
                    (t.category || '').toLowerCase().includes(searchLower) ||
                    (t.displayId || '').toLowerCase().includes(searchLower) ||
                    (t.id || '').toLowerCase().includes(searchLower);
                  return matchesTab && matchesSearch;
                }).map(template => (
                  <tr key={template.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                       <div className="w-16 h-12 rounded-lg bg-gray-800 overflow-hidden flex items-center justify-center">
                          {(template.thumbnailBase64 || template.image) ? (
                            <img src={template.thumbnailBase64 || template.image} alt={template.title} className="w-full h-full object-contain bg-white" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">No Img</div>
                          )}
                       </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">#{template.displayId || template.id.slice(-8)}</td>
                    <td className="px-6 py-4 font-medium text-gray-100">{template.title}</td>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-md text-xs font-medium">
                        {template.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">₹{template.price} {template.discountPrice && <span className="text-gray-500 line-through text-xs ml-1">₹{template.discountPrice}</span>}</td>
                    <td className="px-6 py-4 text-cyan-400 font-medium">
                      {(template.baseOrdersCount ?? 100) + (template.ordersCount || 0)}
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${template.status === 'Hidden' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                         {template.status || 'Active'}
                       </span>
                       <div className="flex gap-1 mt-1">
                         {template.isFeatured && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1 rounded">Featured</span>}
                         {template.isTrending && <span className="text-[10px] bg-pink-500/20 text-pink-500 px-1 rounded">Trending</span>}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openForm(template)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors mr-2">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTemplateId(template.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {templates.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No templates found. Add your first template.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
            </>
      )}

      {/* Modal / Form Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
           <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingId ? `Edit Template #${templates.find(t => t.id === editingId)?.displayId || editingId.slice(-8)}` : 'Add New Template'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-start gap-2 mb-4">
                   <label className="text-sm font-medium text-gray-300">Thumbnail Image (Base64, max 600KB)</label>
                   <div className="relative w-full min-h-[12rem] rounded-xl border-2 border-dashed border-gray-700 bg-gray-800 flex items-center justify-center overflow-hidden hover:border-indigo-500 transition-colors group cursor-pointer">
                      {thumbnailBase64 ? (
                        <>
                          <img src={thumbnailBase64} alt="Preview" className="w-full h-auto object-contain bg-white" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-sm">
                            Change Image
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-gray-500 group-hover:text-indigo-400 transition-colors">
                          <ImagePlus className="w-8 h-8 mb-2" />
                          <span className="text-sm">Click to upload</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                    <input 
                      type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. Royal Emerald Wedding"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select 
                      value={category} onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      {categories.length === 0 && <option value="Wedding">Wedding</option>}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Base Price (₹)</label>
                    <input 
                      type="number" required value={price} onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
                      placeholder="2999"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Discount Price (₹)</label>
                    <input 
                      type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
                      placeholder="1999"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Advance Payment (₹)</label>
                    <input 
                      type="number" value={advancePayment} onChange={(e) => setAdvancePayment(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. 500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Base Orders Count</label>
                    <input 
                      type="number" value={baseOrdersCount} onChange={(e) => setBaseOrdersCount(Number(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. 100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                    <select 
                      value={language} onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="None">None</option>
                      <option value="Hindi">Hindi</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                    <select 
                      value={status} onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Hidden">Hidden</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Video URL (YouTube/Vimeo/Instagram)</label>
                    <input 
                      type="url" required value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-2 text-gray-300 text-sm">
                    <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded border-gray-700" />
                    Mark as Featured
                  </label>
                  <label className="flex items-center gap-2 text-gray-300 text-sm">
                    <input type="checkbox" checked={isTrending} onChange={(e) => setIsTrending(e.target.checked)} className="rounded border-gray-700" />
                    Mark as Trending
                  </label>
                </div>

                {/* Custom Fields Section */}
                <div className="border border-gray-800 rounded-xl p-4 bg-gray-800/20">
                   <h3 className="text-lg font-bold text-white mb-4">Checkout Form Assignment</h3>
                   <p className="text-sm text-gray-400 mb-4">Select the custom form users will fill out when ordering this template. Create new forms in the Form Builder.</p>
                   
                   <div className="mb-4">
                      <select 
                        value={formId} 
                        onChange={(e) => setFormId(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2"
                      >
                         <option value="">Legacy Simple Form (Uses fields below)</option>
                         {availableForms.map(f => (
                           <option key={f.id} value={f.id}>{f.name}</option>
                         ))}
                      </select>
                   </div>
                   
                   {!formId && (
                     <>
                       <div className="flex gap-2 mb-4">
                         <input type="text" value={newFieldName} onChange={e => setNewFieldName(e.target.value)} placeholder="e.g. Venue Details" className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2" />
                         <button type="button" onClick={addCustomField} className="bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium">Add Field</button>
                       </div>
                       
                       <div className="space-y-3">
                         {customFields.map((field) => (
                           <div key={field.id} className="flex flex-col gap-2 bg-gray-800 p-3 rounded-lg text-sm text-gray-300">
                             <div className="flex justify-between items-center">
                               <input type="text" value={field.name} onChange={e => updateCustomField(field.id, 'name', e.target.value)} className="bg-gray-700 text-white px-2 py-1 rounded" />
                               <button type="button" onClick={() => removeCustomField(field.id)} className="text-red-400 p-1 hover:bg-red-400/10 rounded">
                                 <Trash2 className="w-4 h-4" />
                               </button>
                             </div>
                             <div className="flex gap-2">
                               <select value={field.type || 'text'} onChange={e => updateCustomField(field.id, 'type', e.target.value)} className="bg-gray-700 text-white px-2 py-1 rounded text-xs flex-1">
                                 <option value="text">Text</option>
                                 <option value="textarea">Textarea</option>
                                 <option value="phone">Phone</option>
                                 <option value="number">Number</option>
                                 <option value="date">Date</option>
                               </select>
                               <input type="number" placeholder="Min" value={field.minLength || ''} onChange={e => updateCustomField(field.id, 'minLength', e.target.value)} className="bg-gray-700 text-white px-2 py-1 rounded text-xs w-16" />
                               <input type="number" placeholder="Max" value={field.maxLength || ''} onChange={e => updateCustomField(field.id, 'maxLength', e.target.value)} className="bg-gray-700 text-white px-2 py-1 rounded text-xs w-16" />
                               <label className="flex items-center gap-1 text-xs">
                                 <input type="checkbox" checked={field.required} onChange={e => updateCustomField(field.id, 'required', e.target.checked)} />
                                 Req
                               </label>
                             </div>
                           </div>
                         ))}
                         {customFields.length === 0 && <p className="text-sm text-gray-500 text-center py-2">No custom fields defined.</p>}
                       </div>
                     </>
                   )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea 
                    rows={4} required value={description} onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 resize-none"
                    placeholder="Describe the template's vibe..."
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-800">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="px-6 py-2.5 rounded-xl text-sm font-medium text-indigo-500 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" /> Quick Preview
                  </button>
                  <button 
                    type="submit"

                    className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-lg"
                  >
                    {editingId ? 'Save Changes' : 'Create Template'}
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}

      {/* Quick Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-gray-100 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative my-8">
            <button
              onClick={() => setIsPreviewModalOpen(false)}
              className="absolute top-4 right-4 z-20 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-4">
                <h3 className="text-center font-bold text-gray-800 mb-4 uppercase tracking-widest text-xs">Preview Mode</h3>
                
                {/* Template Card Preview */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group flex flex-col pointer-events-none">
                  <div className="relative overflow-hidden bg-gray-100 flex items-center justify-center">
                    {thumbnailBase64 ? (
                      <img
                        src={thumbnailBase64}
                        alt={title || 'Template'}
                        className="w-full h-auto object-contain bg-white"
                      />
                    ) : (
                      <div className="w-full aspect-[4/5] flex items-center justify-center text-gray-400">
                        No Preview Image
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {isFeatured && (
                        <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <Star className="w-3 h-3 fill-current" /> Featured
                        </div>
                      )}
                      {isTrending && (
                        <div className="bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <TrendingUp className="w-3 h-3" /> Trending
                        </div>
                      )}
                      <div className="bg-white/90 backdrop-blur text-brand-purple text-xs font-bold px-3 py-1 rounded-full shadow-md w-fit">
                        {category || 'Category'}
                      </div>
                      {language && language !== 'None' && (
                        <span className="px-3 py-1 bg-white/90 backdrop-blur text-brand-navy text-xs font-bold rounded-full shadow-lg w-fit text-gray-800">
                          {language}
                        </span>
                      )}
                    </div>
                    
                    {/* Video Play Button */}
                    {videoUrl && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-10 w-full">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur border border-white/40 rounded-full flex items-center justify-center text-white transform scale-90 group-hover:scale-100 transition-transform">
                          <Play className="w-8 h-8 fill-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex flex-col flex-1 pr-2 mb-2">
                      <span className="text-xs font-mono text-gray-400 mb-0.5">
                        #{editingId ? (templates.find(t => t.id === editingId)?.displayId || editingId.slice(-8)) : 'Preview'}
                      </span>
                      <h3 className="font-display font-bold text-xl text-gray-900 line-clamp-1">
                        {title || 'Template Title'}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-purple bg-brand-purple/5 w-fit px-2.5 py-1 rounded-full">
                        <ShoppingBag className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-indigo-600">{baseOrdersCount || 100} Orders</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                      {description || 'Template description will appear here...'}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <div className="flex flex-col">
                        {discountPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{price}
                          </span>
                        )}
                        <span className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          ₹{discountPrice || price || '0'}
                        </span>
                      </div>
                      {advancePayment && advancePayment !== "0" && Number(advancePayment) !== 0 && (
                         <span className="block text-xs font-semibold text-orange-600 mt-1">
                           Advance: ₹{advancePayment}
                         </span>
                      )}
                    </div>
                  </div>
                </div>
                
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
