import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { fileToBase64, formatTemplateDate, formatTemplateTime, formatTemplateDateTime, isNewlyCreated } from '../../lib/utils';
import { Plus, Edit, Trash2, ImagePlus, Eye, Star, TrendingUp, Play, ShoppingBag, X, Search, Globe, Calendar, Clock, ExternalLink, Sparkles, Layers, Check, FileText } from 'lucide-react';
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
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [status, setStatus] = useState('Active');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [advancePayment,
      setAdvancePayment] = useState('');
  const [couponOverrides, setCouponOverrides] = useState<Record<string, number>>({});
  const [globalCoupons, setGlobalCoupons] = useState<any[]>([]);
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

      // Backfill createdAt if missing so all templates have a date & time note
      const toUpdateDate = list.filter(t => !t.createdAt);
      if (toUpdateDate.length > 0) {
        toUpdateDate.forEach((t, idx) => {
          const estimatedDate = new Date(Date.now() - (toUpdateDate.length - idx) * 3600 * 1000 * 12).toISOString();
          t.createdAt = estimatedDate;
          updateDoc(doc(db, 'templates', t.id), { createdAt: estimatedDate }).catch(console.error);
        });
      }

      // Sort newest first
      list.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

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

        const settingsDoc = await getDoc(doc(db, 'settings', 'config'));
        if (settingsDoc.exists() && settingsDoc.data().coupons) {
          setGlobalCoupons(settingsDoc.data().coupons);
        }

      try {
        const catSnap = await getDocs(collection(db, 'content', 'template_categories', 'items'));
        const list: string[] = [];
        const cats: any[] = [];
        catSnap.forEach(doc => cats.push({ id: doc.id, ...doc.data() }));
        cats.sort((a, b) => {
          const orderA = typeof a.order === 'number' ? a.order : 9999;
          const orderB = typeof b.order === 'number' ? b.order : 9999;
          return orderA - orderB;
        });
        const seenNames = new Set<string>();
        cats.forEach(c => {
          const norm = (c.name || '').trim();
          if (norm && !seenNames.has(norm.toLowerCase())) {
            seenNames.add(norm.toLowerCase());
            list.push(norm);
          }
        });

        // Ensure "Website Invitation" is included as a prominent unique category
        if (!seenNames.has('website invitation')) {
          list.splice(1, 0, 'Website Invitation');
        }

        // Ensure standard categories exist if empty
        if (list.length === 0) {
          list.push('Wedding', 'Website Invitation', 'Engagement', 'Birthday', 'Reception', 'Anniversary', 'Baby Shower', 'Corporate Events');
        }

        setCategories(list);
        
        const formsSnap = await getDocs(collection(db, 'settings', 'data', 'custom_forms'));
        const fList: any[] = [];
        formsSnap.forEach((d) => {
          fList.push({ id: d.id, ...d.data() });
        });
        setAvailableForms(fList);
      } catch (err) {
        console.error("Error fetching categories or forms:", err);
      }
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
      setWebsiteUrl(template.websiteUrl || '');
      setStatus(template.status || 'Active');
      setIsFeatured(template.isFeatured || false);
      setIsTrending(template.isTrending || false);
      setAdvancePayment(template.advancePayment || '');
      setCouponOverrides(template.couponOverrides || {});
      setBaseOrdersCount(template.baseOrdersCount ?? 100);
      setLanguage(template.language || 'None');
      setCustomFields(template.customFields || []);
      setFormId(template.formId || '');
    } else {
      setEditingId(null);
      setTitle('');
      setCategory(activeTab !== 'All' ? activeTab : (categories.length > 0 ? categories[0] : 'Wedding'));
      setPrice('');
      setDiscountPrice('');
      setDescription('');
      setThumbnailBase64('');
      setVideoUrl('');
      setWebsiteUrl('');
      setStatus('Active');
      setIsFeatured(false);
      setIsTrending(false);
      setAdvancePayment('');
      setCouponOverrides({});
      setBaseOrdersCount(100);
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
    if ((newFieldName || "").trim()) {
      setCustomFields([...customFields, { id: Date.now().toString() + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2), name: (newFieldName || "").trim(), type: 'text', required: true }]);
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

    if (category === 'Website Invitation' && !(websiteUrl || '').trim()) {
      toast.error('Please enter the Website Invitation URL (Live Demo Link)');
      return;
    }

    if (category !== 'Website Invitation' && !(videoUrl || '').trim()) {
      toast.error('Please enter the Video URL');
      return;
    }
    
    // Check for duplicate template name/title
    const isDuplicate = templates.some(
      t => t.id !== editingId && (t.title || '').toLowerCase().trim() === (title || '').toLowerCase().trim()
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

      const now = new Date().toISOString();
      const existing = editingId ? templates.find(t => t.id === editingId) : null;
      const createdAt = existing?.createdAt || now;
      
      const data = { 
        title, 
        category: finalCategory, 
        price, 
        discountPrice, 
        description, 
        thumbnailBase64, 
        videoUrl: videoUrl || '', 
        websiteUrl: websiteUrl || '',
        status, 
        isFeatured, 
        isTrending, 
        advancePayment: advancePayment ? Number(advancePayment) : 0, 
        couponOverrides,
        baseOrdersCount: Number(baseOrdersCount), 
        language, 
        customFields, 
        formId,
        createdAt,
        updatedAt: now
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
          {/* Category Section Overview with Separate Template Counts */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Template Count by Section
              </h2>
              <span className="text-xs text-gray-500">
                Total: <strong className="text-indigo-400 font-semibold">{templates.length}</strong> templates across {categories.length} categories
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {/* All Categories Card */}
              <button 
                type="button"
                onClick={() => setActiveTab('All')}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  activeTab === 'All' 
                    ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-900/20' 
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span className="font-medium">All Sections</span>
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                </div>
                <div className="text-2xl font-bold text-white">{templates.length}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">Total Templates</div>
              </button>

              {/* Individual Category Cards with Count */}
              {categories.map(cat => {
                const count = templates.filter(t => (t.category || '').trim().toLowerCase() === cat.trim().toLowerCase()).length;
                const isWebsite = cat.toLowerCase() === 'website invitation';
                const isSelected = activeTab === cat;
                return (
                  <button 
                    key={cat}
                    type="button"
                    onClick={() => setActiveTab(cat)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected 
                        ? isWebsite
                          ? 'bg-purple-600/20 border-purple-500 shadow-md shadow-purple-900/20'
                          : 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-900/20'
                        : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span className="truncate font-medium">{cat}</span>
                      {isWebsite && <Globe className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />}
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-2xl font-bold ${isSelected ? 'text-white' : count > 0 ? 'text-gray-100' : 'text-gray-500'}`}>
                        {count}
                      </span>
                      <span className="text-[11px] text-gray-500">templates</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        isWebsite ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {isWebsite ? 'Interactive' : 'Standard'}
                      </span>
                      {isSelected && <span className="text-[10px] text-indigo-400 font-bold">Active</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates by title, category, display ID, or URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500"
              />
            </div>
          </div>
          
          {/* Category Tabs with Separate Count Badges */}
          <div className="flex gap-2 overflow-x-auto mb-6 pb-2 scrollbar-thin scrollbar-thumb-gray-800">
            <button
              onClick={() => setActiveTab('All')}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'All' 
                  ? 'bg-indigo-500 text-white shadow-md' 
                  : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800'
              }`}
            >
              <span>All Categories</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'All' ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-400'
              }`}>
                {templates.length}
              </span>
            </button>
            {categories.map(cat => {
              const count = templates.filter(t => (t.category || '').trim().toLowerCase() === cat.trim().toLowerCase()).length;
              const isSelected = activeTab === cat;
              const isWebsite = cat.toLowerCase() === 'website invitation';
              return (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                    isSelected 
                      ? isWebsite ? 'bg-purple-600 text-white shadow-md' : 'bg-indigo-500 text-white shadow-md' 
                      : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800'
                  }`}
                >
                  {isWebsite && <Globe className="w-3.5 h-3.5 text-purple-300" />}
                  <span>{cat}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
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
                    <th className="px-6 py-4">Created Date & Time</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Orders</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {templates.filter(t => {
                    const matchesTab = activeTab === 'All' ? true : (t.category || '').toLowerCase() === activeTab.toLowerCase();
                    const searchLower = (searchQuery || '').toLowerCase();
                    const matchesSearch = searchQuery === '' || 
                      (t.title || '').toLowerCase().includes(searchLower) || 
                      (t.category || '').toLowerCase().includes(searchLower) ||
                      (t.displayId || '').toLowerCase().includes(searchLower) ||
                      (t.websiteUrl || '').toLowerCase().includes(searchLower) ||
                      (t.id || '').toLowerCase().includes(searchLower);
                    return matchesTab && matchesSearch;
                  }).map(template => {
                    const isWebsite = (template.category || '').toLowerCase() === 'website invitation';
                    return (
                      <tr key={template.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                           <div className={`relative rounded-lg bg-gray-800 overflow-hidden flex items-center justify-center ${
                             isWebsite ? 'w-14 h-18 border border-purple-500/40' : 'w-16 h-12'
                           }`}>
                              {(template.thumbnailBase64 || template.image) ? (
                                <img src={template.thumbnailBase64 || template.image} alt={template.title} className="w-full h-full object-contain bg-white" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No Img</div>
                              )}
                              {isWebsite && (
                                <span className="absolute bottom-0 right-0 bg-purple-600 text-[9px] font-bold text-white px-1 py-0.2 rounded-tl">
                                  A4
                                </span>
                              )}
                           </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-500">#{template.displayId || template.id.slice(-8)}</td>
                        <td className="px-6 py-4 font-medium text-gray-100">
                          <div>{template.title}</div>
                          {template.websiteUrl && (
                            <a 
                              href={template.websiteUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 hover:underline mt-0.5"
                            >
                              <ExternalLink className="w-3 h-3" /> Live Website ↗
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-medium inline-flex items-center gap-1 ${
                            isWebsite ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' : 'bg-indigo-500/10 text-indigo-400'
                          }`}>
                            {isWebsite && <Globe className="w-3 h-3" />}
                            {template.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-gray-200 font-medium text-xs flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                              {formatTemplateDate(template.createdAt)}
                            </span>
                            <span className="text-gray-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                              <Clock className="w-3 h-3 text-gray-500" />
                              {formatTemplateTime(template.createdAt)}
                            </span>
                            {isNewlyCreated(template.createdAt) && (
                              <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" /> Newly Added
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          ₹{template.price} {template.discountPrice && <span className="text-gray-500 line-through text-xs ml-1">₹{template.discountPrice}</span>}
                        </td>
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
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button onClick={() => openForm(template)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors mr-2">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteTemplateId(template.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {templates.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
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
                   <div className="flex items-center justify-between w-full">
                     <label className="text-sm font-medium text-gray-300">
                       {category === 'Website Invitation' ? 'Thumbnail Image (A4 Portrait Format, max 800KB)' : 'Thumbnail Image (Base64, max 600KB)'}
                     </label>
                     {category === 'Website Invitation' && (
                       <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                         <Globe className="w-3 h-3" /> A4 Size Format (1:1.414)
                       </span>
                     )}
                   </div>
                   {category === 'Website Invitation' && (
                     <p className="text-xs text-purple-200/70">
                       Upload your website invitation mock/preview in A4 portrait ratio (210×297mm). This provides an elegant full-page showcase.
                     </p>
                   )}
                   <div className={`relative w-full rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors group cursor-pointer ${
                     category === 'Website Invitation' 
                       ? 'min-h-[16rem] max-h-[22rem] bg-gray-900 border-purple-500/50 hover:border-purple-400' 
                       : 'min-h-[12rem] bg-gray-800 border-gray-700 hover:border-indigo-500'
                   }`}>
                      {thumbnailBase64 ? (
                        <>
                          <img 
                            src={thumbnailBase64} 
                            alt="Preview" 
                            className={`h-auto object-contain bg-white ${
                              category === 'Website Invitation' ? 'max-h-[20rem] shadow-2xl rounded-md my-2' : 'w-full'
                            }`} 
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-sm font-medium">
                            Change {category === 'Website Invitation' ? 'A4 ' : ''}Image
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-gray-500 group-hover:text-indigo-400 transition-colors p-6 text-center">
                          <ImagePlus className="w-9 h-9 mb-2" />
                          <span className="text-sm font-medium">Click to upload thumbnail</span>
                          {category === 'Website Invitation' && (
                            <span className="text-xs text-purple-400 font-semibold mt-1">Recommended: A4 Portrait Dimensions</span>
                          )}
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
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-4">Coupon Overrides (Optional)</label>
                    <div className="space-y-3 bg-gray-900 p-4 rounded-xl border border-gray-700 max-h-60 overflow-y-auto">
                      {globalCoupons.length === 0 ? (
                        <p className="text-gray-500 text-sm">No global coupons found. Create them in settings.</p>
                      ) : (
                        globalCoupons.map((coupon, index) => (
                          <div key={`${coupon.id}-${index}`} className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gray-800 p-3 rounded-lg border border-gray-700 gap-3">
                            <span className="text-sm font-bold text-white">{coupon.code} <span className="text-gray-500 font-normal text-xs ml-2">(Default: {coupon.percentage}%)</span></span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">Override:</span>
                              <input 
                                type="number" 
                                placeholder={coupon.percentage}
                                value={couponOverrides[coupon.code] !== undefined ? couponOverrides[coupon.code] : ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCouponOverrides(prev => {
                                    const next = { ...prev };
                                    if (val === '') {
                                      delete next[coupon.code];
                                    } else {
                                      next[coupon.code] = Number(val);
                                    }
                                    return next;
                                  });
                                }}
                                className="w-20 bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 text-right"
                              />
                              <span className="text-sm text-gray-400">%</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
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
                  {category === 'Website Invitation' ? (
                    <div className="col-span-1 md:col-span-2 bg-purple-950/30 border border-purple-500/40 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-bold text-purple-300 flex items-center gap-2">
                          <Globe className="w-4 h-4 text-purple-400" />
                          Website Invitation Link (Live URL) <span className="text-red-400">*</span>
                        </label>
                        {websiteUrl && (
                          <a 
                            href={websiteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-purple-300 hover:text-white flex items-center gap-1 underline font-semibold"
                          >
                            Test Live Redirect <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-purple-200/70 mb-3">
                        When someone clicks to preview this template in the gallery, they will be redirected to this linked website.
                      </p>
                      <input 
                        type="url" 
                        required
                        value={websiteUrl} 
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className="w-full bg-gray-900 border border-purple-500/40 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="https://your-invitation-website.com"
                      />
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-400 mb-1">Optional Walkthrough / Teaser Video URL</label>
                        <input 
                          type="url" 
                          value={videoUrl} 
                          onChange={(e) => setVideoUrl(e.target.value)}
                          className="w-full bg-gray-900/80 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500"
                          placeholder="https://youtube.com/... (optional)"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Video URL (YouTube/Vimeo/Instagram)</label>
                      <input 
                        type="url" required value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
                        placeholder="https://youtube.com/..."
                      />
                    </div>
                  )}
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
                   <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                     <FileText className="w-5 h-5 text-indigo-400" />
                     Checkout Form Assignment
                   </h3>
                   <p className="text-sm text-gray-400 mb-4">
                     {category === 'Website Invitation' 
                       ? 'Configure the order details form required for creating this website invitation (same process as video templates: bride & groom names, event dates, venues, RSVP fields, etc.).'
                       : 'Select the custom form users will fill out when ordering this template. Create new forms in the Form Builder.'}
                   </p>
                   
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
                         {customFields.map((field, index) => (
                           <div key={`${field.id}-${index}`} className="flex flex-col gap-2 bg-gray-800 p-3 rounded-lg text-sm text-gray-300">
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 uppercase tracking-widest text-xs">Preview Mode</h3>
                  {category === 'Website Invitation' && (
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                      A4 Website Template
                    </span>
                  )}
                </div>
                
                {/* Template Card Preview */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group flex flex-col pointer-events-auto">
                  <div className={`relative overflow-hidden bg-gray-100 flex items-center justify-center ${
                    category === 'Website Invitation' ? 'aspect-[1/1.414]' : ''
                  }`}>
                    {thumbnailBase64 ? (
                      <img
                        src={thumbnailBase64}
                        alt={title || 'Template'}
                        className={`w-full h-auto object-contain bg-white ${
                          category === 'Website Invitation' ? 'max-h-[360px]' : ''
                        }`}
                      />
                    ) : (
                      <div className={`w-full flex items-center justify-center text-gray-400 ${
                        category === 'Website Invitation' ? 'aspect-[1/1.414]' : 'aspect-[4/5]'
                      }`}>
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
                      <div className="bg-white/90 backdrop-blur text-brand-purple text-xs font-bold px-3 py-1 rounded-full shadow-md w-fit flex items-center gap-1">
                        {category === 'Website Invitation' && <Globe className="w-3 h-3" />}
                        {category || 'Category'}
                      </div>
                      {language && language !== 'None' && (
                        <span className="px-3 py-1 bg-white/90 backdrop-blur text-brand-navy text-xs font-bold rounded-full shadow-lg w-fit text-gray-800">
                          {language}
                        </span>
                      )}
                    </div>
                    
                    {/* Website Redirect Preview or Video Play Button */}
                    {category === 'Website Invitation' && websiteUrl ? (
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-sm z-10 w-full text-white cursor-pointer"
                      >
                        <div className="w-16 h-16 bg-purple-600/90 backdrop-blur border border-purple-300/40 rounded-full flex items-center justify-center text-white transform scale-90 group-hover:scale-100 transition-transform shadow-xl mb-2">
                          <Globe className="w-8 h-8" />
                        </div>
                        <span className="text-xs font-bold bg-black/60 px-3 py-1 rounded-full flex items-center gap-1">
                          Test Live Website <ExternalLink className="w-3 h-3" />
                        </span>
                      </a>
                    ) : videoUrl ? (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-10 w-full">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur border border-white/40 rounded-full flex items-center justify-center text-white transform scale-90 group-hover:scale-100 transition-transform">
                          <Play className="w-8 h-8 fill-white" />
                        </div>
                      </div>
                    ) : null}
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex flex-col flex-1 pr-2 mb-2">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-mono text-gray-400">
                          #{editingId ? (templates.find(t => t.id === editingId)?.displayId || editingId.slice(-8)) : 'Preview'}
                        </span>
                        <span className="text-[11px] text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {formatTemplateDate(new Date().toISOString())}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-xl text-gray-900 ">
                        {title || 'Template Title'}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-purple bg-brand-purple/5 w-fit px-2.5 py-1 rounded-full">
                        <ShoppingBag className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-indigo-600">{baseOrdersCount || 100} Orders</span>
                      </div>
                      {category === 'Website Invitation' && websiteUrl && (
                        <a 
                          href={websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full font-semibold hover:bg-purple-100"
                        >
                          <ExternalLink className="w-3 h-3" /> Live Demo Link
                        </a>
                      )}
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
