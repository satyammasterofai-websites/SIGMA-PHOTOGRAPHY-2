import React, { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Plus, Trash2, Edit, Save, Copy, Eye, FileEdit, Settings, Server, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageForms() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'settings', 'data', 'custom_forms'), (snapshot) => {
      setForms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching custom forms:", error);
    });
    return () => unsub();
  }, []);

  const createDefaultForm = async () => {
    const defaultForm = {
      name: "Default Wedding Form",
      description: "Standard wedding form with bride, groom and events",
      familySettings: {
        brideEnabled: true,
        groomEnabled: true,
        brideFields: [
          { id: "bride_name", name: "Bride Name", type: "text", required: true },
          { id: "bride_father", name: "Bride Father Name", type: "text", required: true },
          { id: "bride_mother", name: "Bride Mother Name", type: "text", required: true },
          { id: "bride_gf", name: "Bride Grandfather Name (Optional)", type: "text", required: false }
        ],
        groomFields: [
          { id: "groom_name", name: "Groom Name", type: "text", required: true },
          { id: "groom_father", name: "Groom Father Name", type: "text", required: true },
          { id: "groom_mother", name: "Groom Mother Name", type: "text", required: true },
          { id: "groom_gf", name: "Groom Grandfather Name (Optional)", type: "text", required: false }
        ]
      },
      eventSettings: {
        enabled: true,
        eventTypes: ["Wedding Ceremony", "Haldi", "Mehendi", "Sangeet", "Reception"]
      },
      additionalFields: [
        { id: "invitation_from", name: "Invitation From (Bride/Groom Side)", type: "text", required: true },
        { id: "family_msg", name: "Family Message", type: "textarea", required: false },
        { id: "welcome_msg", name: "Welcome Message", type: "textarea", required: false },
        { id: "contact_number", name: "Contact Number", type: "text", required: true },
        { id: "rsvp_number", name: "RSVP Number", type: "text", required: true },
        { id: "instagram", name: "Instagram Handle (Optional)", type: "text", required: false }
      ],
      uploadSettings: {
        photoUploadEnabled: true,
        musicUploadEnabled: true,
        instructionUploadEnabled: true,
        maxFiles: 10
      },
      orderSettings: {
        allowWhatsapp: true,
        allowOnlinePayment: true
      }
    };

    try {
      if (forms.length === 0) {
        await addDoc(collection(db, 'settings', 'data', 'custom_forms'), defaultForm);
      } else {
        await addDoc(collection(db, 'settings', 'data', 'custom_forms'), { ...defaultForm, name: "New Form " + Math.floor(Math.random()*1000) });
      }
      toast.success("Form Template Created");
    } catch(err) {
      toast.error("Failed to create form");
    }
  };

  const deleteForm = async (id: string) => {
     try {
       await deleteDoc(doc(db, 'settings', 'data', 'custom_forms', id));
       toast.success("Form Template Deleted");
     } catch (err: any) {
       toast.error("Failed to delete: " + err.message);
     }
  }

  const [editingForm, setEditingForm] = useState<any>(null);

  const editForm = (form: any) => {
    // deep clone
    setEditingForm(JSON.parse(JSON.stringify(form)));
  };

  const saveForm = async () => {
    if (!editingForm || !editingForm.name) {
      toast.error("Form title is required");
      return;
    }
    try {
      const formRef = doc(db, 'settings', 'data', 'custom_forms', editingForm.id);
      await setDoc(formRef, editingForm);
      toast.success("Form settings saved");
      setEditingForm(null);
    } catch(err) {
      toast.error("Failed to save form");
    }
  };

  const updateField = (section: string, idx: number, key: string, val: any) => {
     const updated = { ...editingForm };
     if (section === 'bride') updated.familySettings.brideFields[idx][key] = val;
     if (section === 'groom') updated.familySettings.groomFields[idx][key] = val;
     if (section === 'additional') updated.additionalFields[idx][key] = val;
     setEditingForm(updated);
  };

  const removeField = (section: string, idx: number) => {
     const updated = { ...editingForm };
     if (section === 'bride') updated.familySettings.brideFields.splice(idx, 1);
     if (section === 'groom') updated.familySettings.groomFields.splice(idx, 1);
     if (section === 'additional') updated.additionalFields.splice(idx, 1);
     setEditingForm(updated);
  }

  const addField = (section: string) => {
     const updated = { ...editingForm };
     const newField = { id: "f_" + Math.random().toString(36).substring(7), name: "New Field", type: "text", required: false };
     if (section === 'bride') updated.familySettings.brideFields.push(newField);
     if (section === 'groom') updated.familySettings.groomFields.push(newField);
     if (section === 'additional') updated.additionalFields.push(newField);
     setEditingForm(updated);
  }

  const renderFieldList = (fields: any[], section: string, title: string) => (
    <div className="bg-gray-800 p-4 rounded-xl mb-6 border border-gray-700">
       <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={() => addField(section)} className="text-sm bg-indigo-500 hover:bg-indigo-600 px-3 py-1 rounded-lg text-white flex items-center gap-1">
             <Plus className="w-4 h-4" /> Add Field
          </button>
       </div>
       <div className="space-y-3">
          {fields.map((f, i) => (
             <div key={f.id || i} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-gray-900 p-3 rounded-lg border border-gray-800">
                <div className="flex-1">
                   <label className="text-xs text-gray-500 mb-1 block">Label</label>
                   <input type="text" value={f.name} onChange={e => updateField(section, i, 'name', e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm" />
                </div>
                <div className="w-full md:w-32">
                   <label className="text-xs text-gray-500 mb-1 block">Type</label>
                   <select value={f.type} onChange={e => updateField(section, i, 'type', e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm">
                      <option value="text">Text</option>
                      <option value="textarea">Textarea</option>
                      <option value="number">Number</option>
                      <option value="phone">Phone</option>
                      <option value="date">Date</option>
                   </select>
                </div>
                <div className="w-full md:w-24">
                   <label className="text-xs text-gray-500 mb-1 block">Min Length</label>
                   <input type="number" value={f.minLength || ''} onChange={e => updateField(section, i, 'minLength', e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm" placeholder="Any" />
                </div>
                <div className="w-full md:w-24">
                   <label className="text-xs text-gray-500 mb-1 block">Max Length</label>
                   <input type="number" value={f.maxLength || ''} onChange={e => updateField(section, i, 'maxLength', e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm" placeholder="Any" />
                </div>
                <div className="flex items-center gap-2 mt-4 md:mt-0 pt-2 md:pt-0">
                   <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input type="checkbox" checked={f.required} onChange={e => updateField(section, i, 'required', e.target.checked)} className="rounded bg-gray-800 border-gray-700 text-indigo-500 focus:ring-indigo-500" />
                      Required
                   </label>
                </div>
                <div className="mt-4 md:mt-0 md:ml-2 pt-2 md:pt-0">
                   <button onClick={() => removeField(section, i)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
             </div>
          ))}
          {fields.length === 0 && <p className="text-sm text-gray-500 py-2">No fields added.</p>}
       </div>
    </div>
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">Form Builder</h1>
        <button onClick={createDefaultForm} className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create New Form
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {forms.map((form, index) => (
          <div key={`${form.id}-${index}`} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex justify-between items-start">
               <div>
                 <h2 className="text-xl font-bold text-white flex items-center gap-2"><Server className="w-5 h-5 text-indigo-400"/> {form.name}</h2>
                 <p className="text-gray-400 text-sm mt-1">{form.description}</p>
                 <p className="text-gray-500 text-xs mt-2 font-mono">ID: {form.id}</p>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => editForm(form)} className="p-2 bg-gray-800 text-indigo-400 rounded-lg hover:bg-gray-700"><Edit className="w-4 h-4"/></button>
                 <button onClick={() => deleteForm(form.id)} className="p-2 bg-gray-800 text-red-400 rounded-lg hover:bg-gray-700"><Trash2 className="w-4 h-4"/></button>
               </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
               <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300">Events: {form.eventSettings?.enabled ? 'Yes' : 'No'}</span>
               <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300">Bride Sec: {form.familySettings?.brideEnabled ? 'Yes' : 'No'}</span>
               <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300">Groom Sec: {form.familySettings?.groomEnabled ? 'Yes' : 'No'}</span>
               <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300">Uploads: {form.uploadSettings?.photoUploadEnabled ? 'Yes' : 'No'}</span>
            </div>
          </div>
        ))}
      </div>

      {editingForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 w-full max-w-4xl max-h-[90vh] my-auto flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-2xl font-bold text-white">Edit Form Layout</h2>
               <button onClick={() => setEditingForm(null)} className="text-gray-400 hover:text-white bg-gray-800 p-2 rounded-full"><X className="w-5 h-5"/></button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
               
               {/* Basic Details */}
               <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4">Core Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="text-sm font-semibold text-gray-300 mb-1 block">Form Title</label>
                        <input type="text" value={editingForm.name} onChange={e => setEditingForm({...editingForm, name: e.target.value})} className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg" />
                     </div>
                     <div>
                        <label className="text-sm font-semibold text-gray-300 mb-1 block">Form Description</label>
                        <input type="text" value={editingForm.description} onChange={e => setEditingForm({...editingForm, description: e.target.value})} className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg" />
                     </div>
                  </div>
               </div>

               {/* Section Toggles */}
               <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4">Enabled Sections</h3>
                  <div className="flex flex-wrap gap-6">
                     <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                        <input type="checkbox" checked={editingForm.familySettings?.brideEnabled} onChange={e => setEditingForm({...editingForm, familySettings: {...editingForm.familySettings, brideEnabled: e.target.checked}})} className="rounded bg-gray-900 border-gray-700 text-indigo-500 focus:ring-indigo-500 w-5 h-5" />
                        Enable Bride Details
                     </label>
                     <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                        <input type="checkbox" checked={editingForm.familySettings?.groomEnabled} onChange={e => setEditingForm({...editingForm, familySettings: {...editingForm.familySettings, groomEnabled: e.target.checked}})} className="rounded bg-gray-900 border-gray-700 text-indigo-500 focus:ring-indigo-500 w-5 h-5" />
                        Enable Groom Details
                     </label>
                     <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                        <input type="checkbox" checked={editingForm.eventSettings?.enabled} onChange={e => setEditingForm({...editingForm, eventSettings: {...editingForm.eventSettings, enabled: e.target.checked}})} className="rounded bg-gray-900 border-gray-700 text-indigo-500 focus:ring-indigo-500 w-5 h-5" />
                        Enable Events System
                     </label>
                     <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                        <input type="checkbox" checked={editingForm.uploadSettings?.photoUploadEnabled} onChange={e => setEditingForm({...editingForm, uploadSettings: {...editingForm.uploadSettings, photoUploadEnabled: e.target.checked}})} className="rounded bg-gray-900 border-gray-700 text-indigo-500 focus:ring-indigo-500 w-5 h-5" />
                        Enable Photo Vault
                     </label>
                      <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                        <input type="checkbox" checked={editingForm.uploadSettings?.musicUploadEnabled} onChange={e => setEditingForm({...editingForm, uploadSettings: {...editingForm.uploadSettings, musicUploadEnabled: e.target.checked}})} className="rounded bg-gray-900 border-gray-700 text-indigo-500 focus:ring-indigo-500 w-5 h-5" />
                        Enable Music Vault
                     </label>
                  </div>
               </div>

               {/* Fields Editors */}
               {editingForm.familySettings?.brideEnabled && renderFieldList(editingForm.familySettings.brideFields || [], 'bride', 'Bride Details Fields')}
               {editingForm.familySettings?.groomEnabled && renderFieldList(editingForm.familySettings.groomFields || [], 'groom', 'Groom Details Fields')}
               
               {renderFieldList(editingForm.additionalFields || [], 'additional', 'Additional Info Fields')}

            </div>
               
            <div className="flex justify-end gap-2 pt-6 mt-2 border-t border-gray-800 shrink-0">
               <button onClick={() => setEditingForm(null)} className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors">Cancel</button>
               <button onClick={saveForm} className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl flex items-center gap-2 transition-colors"><Save className="w-4 h-4"/> Save Form Settings</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

