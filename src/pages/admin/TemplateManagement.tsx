import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { fileToBase64 } from '../../lib/utils';
import { Plus, Edit, Trash2, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TemplateManagement() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const [advancePayment, setAdvancePayment] = useState('');
  const [baseOrdersCount, setBaseOrdersCount] = useState<number>(100);
  
  // Custom Fields
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [formId, setFormId] = useState('');
  const [availableForms, setAvailableForms] = useState<any[]>([]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'templates'));
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
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
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setThumbnailBase64(base64);
        toast.success("Image converted to Base64");
      } catch (error: any) {
        toast.error(error.message);
      }
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
    
    try {
      let finalCategory = category;
      if (!categories.includes(category) && categories.length > 0) {
        finalCategory = categories[0];
      }
      
      const data = { 
        title, category: finalCategory, price, discountPrice, description, 
        thumbnailBase64, videoUrl, status, isFeatured, isTrending, advancePayment: advancePayment ? Number(advancePayment) : 0, 
        baseOrdersCount: Number(baseOrdersCount), customFields, formId 
      };
      
      if (editingId) {
        await updateDoc(doc(db, 'templates', editingId), data);
        toast.success('Template updated!');
      } else {
        await addDoc(collection(db, 'templates'), data);
        toast.success('Template created!');
      }
      setIsModalOpen(false);
      fetchTemplates();
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
      toast.success("Template deleted");
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
           <h1 className="text-2xl md:text-3xl font-display font-bold text-white">Template Management</h1>
           <p className="text-gray-400 mt-1">Manage standard invitation packages and themes.</p>
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
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-800/50 text-gray-400 font-medium">
                <tr>
                  <th className="px-6 py-4">Thumbnail</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Orders</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {templates.map(template => (
                  <tr key={template.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                       <div className="w-16 h-12 rounded-lg bg-gray-800 overflow-hidden">
                          {(template.thumbnailBase64 || template.image) ? (
                            <img src={template.thumbnailBase64 || template.image} alt={template.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">No Img</div>
                          )}
                       </div>
                    </td>
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
      )}

      {/* Modal / Form Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
           <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingId ? 'Edit Template' : 'Add New Template'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-start gap-2 mb-4">
                   <label className="text-sm font-medium text-gray-300">Thumbnail Image (Base64, max 600KB)</label>
                   <div className="relative w-full h-48 md:w-64 rounded-xl border-2 border-dashed border-gray-700 bg-gray-800 flex items-center justify-center overflow-hidden hover:border-indigo-500 transition-colors group cursor-pointer">
                      {thumbnailBase64 ? (
                        <>
                          <img src={thumbnailBase64} alt="Preview" className="w-full h-full object-cover" />
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
    </div>
  );
}
