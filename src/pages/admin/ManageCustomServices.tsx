import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Plus, Save, Trash2, Edit, X, Globe, Eye, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { fileToBase64HD } from '../../lib/utils';
import { format } from 'date-fns';

export default function ManageCustomServices() {
  const [activeTab, setActiveTab] = useState<'content' | 'enquiries'>('content');
  const [enquiries, setEnquiries] = useState<any[]>([]);
  
  const [settings, setSettings] = useState({
    enabled: true,
    title: "NEW SERVICE – Website Development",
    description: "Premium high-converting digital solutions tailored for your business success.",
    badgeLine: "Premium Services",
    services: [{
       id: "1",
       title: "Website Development",
       description: "Get a custom built, responsive and modern website designed exclusively for your brand and business growth.",
       buttonText: "Create Now",
       whatsappNumber: "9162478070",
       image: ""
    }] as any[]
  });
  const [loading, setLoading] = useState(true);

  // Form state for creating/editing service
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const [currentService, setCurrentService] = useState({
    id: "",
    title: "",
    description: "",
    buttonText: "Create Now",
    whatsappNumber: "919011985955",
    image: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const docRef = await getDoc(doc(db, "content", "custom_services"));
      if (docRef.exists()) {
        const data = docRef.data();
        if (!data.services || data.services.length === 0) {
           data.services = [{
             id: "1",
             title: "Website Development",
             description: "Get a custom built, responsive and modern website designed exclusively for your brand and business growth.",
             buttonText: "Create Now",
             whatsappNumber: "9162478070",
             image: ""
           }];
        }
        setSettings(prev => ({ ...prev, ...data }));
      } else {
        // Init default data
        await setDoc(doc(db, "content", "custom_services"), settings);
      }

      // Fetch enquiries from orders collection
      const enqSnap = await getDocs(query(collection(db, "orders"), where("type", "==", "service_enquiry")));
      const enqData = enqSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      enqData.sort((a: any, b: any) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setEnquiries(enqData);
    } catch(e) {
      toast.error("Failed to load custom services.");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (updatedSettings = settings) => {
    try {
      await setDoc(doc(db, "content", "custom_services"), updatedSettings);
      setSettings(updatedSettings);
      toast.success("Settings saved successfully.");
    } catch(e) {
      toast.error("Failed to save settings.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const toastId = toast.loading("Processing image...");
      try {
        const b64 = await fileToBase64HD(e.target.files[0]);
        setCurrentService({ ...currentService, image: b64 });
        toast.success("Image uploaded", { id: toastId });
      } catch (err) {
        toast.error("Image upload failed", { id: toastId });
      }
    }
  };

  const openForm = (index: number | null = null) => {
    if (index !== null) {
      setEditingIndex(index);
      setCurrentService(settings.services[index]);
    } else {
      setEditingIndex(null);
      setCurrentService({
        id: Date.now().toString(),
        title: "",
        description: "",
        buttonText: "Create Now",
        whatsappNumber: "919011985955",
        image: ""
      });
    }
    setIsModalOpen(true);
  };

  const saveService = () => {
    if(!currentService.title || !currentService.description) {
      toast.error("Title and description are required");
      return;
    }
    let updatedServices = [...settings.services];
    if (editingIndex !== null) {
      updatedServices[editingIndex] = currentService;
    } else {
      updatedServices.push(currentService);
    }
    const newSettings = { ...settings, services: updatedServices };
    saveSettings(newSettings);
    setIsModalOpen(false);
  };

  const deleteService = (index: number) => {
      if(!confirm("Are you sure you want to delete this service?")) return;
      let updatedServices = [...settings.services];
      updatedServices.splice(index, 1);
      const newSettings = { ...settings, services: updatedServices };
      saveSettings(newSettings);
  };

  const deleteEnquiry = async (id: string) => {
    if(!confirm("Are you sure you want to delete this enquiry?")) return;
    try {
      await deleteDoc(doc(db, "orders", id));
      setEnquiries(enquiries.filter(e => e.id !== id));
      toast.success("Enquiry deleted");
    } catch(e) {
      toast.error("Failed to delete enquiry");
    }
  };

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div className="w-full">
      <div className="mb-8 flex justify-between items-center bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white">Premium Services</h1>
          <p className="text-gray-400 mt-1">Manage custom service cards and client enquiries.</p>
        </div>
        <div className="flex bg-gray-800 rounded-lg p-1">
           <button 
             onClick={() => setActiveTab('content')}
             className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'content' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}
           >
             Content Layout
           </button>
           <button 
             onClick={() => setActiveTab('enquiries')}
             className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'enquiries' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}
           >
             Enquiries ({enquiries.length})
           </button>
        </div>
      </div>

      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-4 flex justify-between items-center">
              Section Settings
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-gray-400">Enable Section</span>
                <input 
                  type="checkbox" 
                  checked={settings.enabled}
                  onChange={(e) => saveSettings({ ...settings, enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-500"
                />
              </label>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Badge Text</label>
                  <input type="text" value={settings.badgeLine} onChange={e => setSettings({...settings, badgeLine: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Section Title</label>
                  <input type="text" value={settings.title} onChange={e => setSettings({...settings, title: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2" />
               </div>
               <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Section Description</label>
                  <textarea rows={2} value={settings.description} onChange={e => setSettings({...settings, description: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 resize-none" />
               </div>
               <div className="md:col-span-2 flex justify-end">
                  <button onClick={() => saveSettings(settings)} className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-xl flex items-center gap-2">
                     <Save className="w-4 h-4"/> Save Settings
                  </button>
               </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
              <h2 className="text-xl font-bold text-white">Service Cards</h2>
              <button 
                onClick={() => openForm()}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl transition-colors text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Service
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {settings.services.map((svc: any, idx: number) => (
                 <div key={idx} className="bg-gray-800 rounded-xl p-5 border border-gray-700 relative group">
                    <div className="absolute top-4 right-4 flex gap-2">
                       <button onClick={() => openForm(idx)} className="p-2 bg-gray-700 rounded-md hover:bg-indigo-500 text-gray-300 hover:text-white transition-colors">
                          <Edit className="w-4 h-4" />
                       </button>
                       <button onClick={() => deleteService(idx)} className="p-2 bg-gray-700 rounded-md hover:bg-red-500 text-gray-300 hover:text-white transition-colors">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                    {svc.image ? (
                        <img src={svc.image} className="w-12 h-12 object-contain mb-4 rounded-lg bg-white p-1" />
                    ) : (
                       <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center mb-4"><Globe className="w-6 h-6 text-gray-400" /></div>
                    )}
                    <h3 className="text-lg font-bold text-white mb-2">{svc.title}</h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{svc.description}</p>
                    <div className="text-xs text-gray-500 flex flex-col gap-1">
                       <span>Button: {svc.buttonText}</span>
                       <span>WA: {svc.whatsappNumber}</span>
                    </div>
                 </div>
               ))}
               {settings.services.length === 0 && (
                 <div className="col-span-1 md:col-span-2 lg:col-span-3 py-10 text-center text-gray-500 border border-dashed border-gray-700 rounded-xl">
                    No services created. Add one to display the new section to users.
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'enquiries' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
           {enquiries.length === 0 ? (
             <div className="py-20 text-center text-gray-500">
               No enquiries received yet.
             </div>
           ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                   <thead className="text-xs uppercase bg-gray-800 text-gray-500">
                      <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Service Required</th>
                        <th className="px-6 py-4">WhatsApp</th>
                        <th className="px-6 py-4">Budget</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody>
                      {enquiries.map((enq) => (
                        <tr key={enq.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                           <td className="px-6 py-4 whitespace-nowrap">
                              {enq.createdAt ? format(enq.createdAt.toDate(), 'PPP p') : 'Unknown'}
                           </td>
                           <td className="px-6 py-4">
                              <div className="text-white font-medium">{enq.fullName}</div>
                              <div className="text-xs">{enq.email}</div>
                           </td>
                           <td className="px-6 py-4">
                              <span className="bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-md text-xs border border-indigo-500/20">{enq.serviceTitle}</span>
                              <div className="mt-1 text-xs">{enq.websiteType === "Other" ? enq.otherWebsiteType : enq.websiteType}</div>
                           </td>
                           <td className="px-6 py-4">{enq.whatsapp}</td>
                           <td className="px-6 py-4 whitespace-nowrap">{enq.budget}</td>
                           <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                              {/* Simple details expansion not strictly required, admin receives WhatsApp mostly */}
                              <button onClick={() => deleteEnquiry(enq.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}
        </div>
      )}

      {/* Modal for adding/editing service */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900 sticky top-0 z-10">
                 <h2 className="text-xl font-bold text-white">{editingIndex !== null ? 'Edit Service' : 'Add New Service'}</h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 space-y-5">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Service Title *</label>
                      <input type="text" value={currentService.title} onChange={e => setCurrentService({...currentService, title: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2" placeholder="e.g. App Development" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Button Text</label>
                      <input type="text" value={currentService.buttonText} onChange={e => setCurrentService({...currentService, buttonText: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">WhatsApp Number (For Form Submissions)</label>
                      <input type="text" value={currentService.whatsappNumber} onChange={e => setCurrentService({...currentService, whatsappNumber: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2" placeholder="e.g. 919011985955" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Form Dropdown Options (Comma separated)</label>
                      <input type="text" value={(currentService as any).options || ""} onChange={e => setCurrentService({...currentService, options: e.target.value} as any)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2" placeholder="e.g. E-commerce, Portfolio, App" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-400 mb-1">Service Icon/Image (Optional)</label>
                      <div className="flex items-center gap-4">
                         {currentService.image && <img src={currentService.image} className="w-12 h-12 object-contain bg-white rounded-lg" />}
                         <div className="relative">
                            <button className="bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm transition-colors">
                               {currentService.image ? 'Change Image' : 'Upload Image'}
                            </button>
                            <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                         </div>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-gray-400 mb-1">Service Description *</label>
                       <textarea rows={3} value={currentService.description} onChange={e => setCurrentService({...currentService, description: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 resize-none" />
                    </div>
                 </div>
              </div>
              <div className="p-6 border-t border-gray-800 flex justify-end gap-3 sticky bottom-0 bg-gray-900">
                 <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
                 <button onClick={saveService} className="bg-indigo-500 hover:bg-indigo-600 px-6 py-2 rounded-xl text-white font-medium flex items-center gap-2">
                   <Save className="w-4 h-4" /> Save Service
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
