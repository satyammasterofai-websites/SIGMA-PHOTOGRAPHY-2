import React, { useState, useEffect, useRef } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Plus, Trash2, Edit, Save, X, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ManageSelfVideoTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoTime, setVideoTime] = useState(0);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const updateTime = () => setVideoTime(video.currentTime);
    video.addEventListener('timeupdate', updateTime);
    return () => video.removeEventListener('timeupdate', updateTime);
  }, [editingTemplate?.videoUrl]);

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    setDraggingId(id);
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setEditingTemplate((prev: any) => {
      const arr = prev.textFields.map((tf: any) => 
        tf.id === draggingId ? { ...tf, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : tf
      );
      return { ...prev, textFields: arr };
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingId) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setDraggingId(null);
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'settings', 'data', 'selfVideoTemplates')), (snapshot) => {
      setTemplates(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async (template: any) => {
    try {
      if (template.id) {
        const { id, ...data } = template;
        await updateDoc(doc(db, 'settings', 'data', 'selfVideoTemplates', id), data);
        toast.success('Template updated');
      } else {
        await addDoc(collection(db, 'settings', 'data', 'selfVideoTemplates'), { ...template, createdAt: new Date().toISOString() });
        toast.success('Template created');
      }
      setEditingTemplate(null);
    } catch (e) {
      toast.error('Failed to save template');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this template?')) {
      try {
        await deleteDoc(doc(db, 'settings', 'data', 'selfVideoTemplates', id));
        toast.success('Deleted');
      } catch (e) {
        toast.error('Failed to delete');
      }
    }
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const toastId = toast.loading('Uploading...');
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${ext}`;
      const storageRef = ref(storage, 'templates/' + fileName);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setEditingTemplate((prev: any) => ({ ...prev, [field]: url }));
      toast.success('Uploaded successfully', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Upload failed', { id: toastId });
    }
  };

  const createNewTemplate = () => {
    setEditingTemplate({
      title: 'New Video Template',
      videoUrl: '',
      thumbnailUrl: '',
      published: false,
      textFields: []
    });
  };

  const addTextField = () => {
    setEditingTemplate((prev: any) => ({
      ...prev,
      textFields: [
        ...prev.textFields,
        {
          id: Math.random().toString(36).substring(7),
          label: 'Groom Name',
          defaultText: 'Rahul',
          x: 50,
          y: 50,
          fontSize: 32,
          fontFamily: 'Arial',
          color: '#ffffff',
          startTime: 0,
          endTime: 5,
          animation: 'fade'
        }
      ]
    }));
  };

  const updateTextField = (idx: number, key: string, value: any) => {
    setEditingTemplate((prev: any) => {
      const arr = [...prev.textFields];
      arr[idx] = { ...arr[idx], [key]: value };
      return { ...prev, textFields: arr };
    });
  };

  const removeTextField = (idx: number) => {
    setEditingTemplate((prev: any) => {
      const arr = [...prev.textFields];
      arr.splice(idx, 1);
      return { ...prev, textFields: arr };
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 text-brand-navy">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Self Video Editor Templates</h1>
        <button onClick={createNewTemplate} className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create New
        </button>
      </div>

      {editingTemplate ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{editingTemplate.id ? 'Edit Template' : 'New Template'}</h2>
            <div className="flex gap-2">
              <button onClick={() => setEditingTemplate(null)} className="px-4 py-2 border border-gray-200 rounded-xl">Cancel</button>
              <button onClick={() => handleSave(editingTemplate)} className="px-4 py-2 bg-indigo-500 text-white rounded-xl">Save</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input type="text" value={editingTemplate.title} onChange={e => setEditingTemplate({ ...editingTemplate, title: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2" />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editingTemplate.published} onChange={e => setEditingTemplate({ ...editingTemplate, published: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-indigo-600" />
                <span className="font-medium">Published (Visible to users)</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Video URL (MP4)</label>
              <input type="text" value={editingTemplate.videoUrl} onChange={e => setEditingTemplate({ ...editingTemplate, videoUrl: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 mb-2" />
              <input type="file" accept="video/mp4" onChange={e => uploadFile(e, 'videoUrl')} className="text-sm" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
              <input type="text" value={editingTemplate.thumbnailUrl} onChange={e => setEditingTemplate({ ...editingTemplate, thumbnailUrl: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 mb-2" />
              <input type="file" accept="image/*" onChange={e => uploadFile(e, 'thumbnailUrl')} className="text-sm" />
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Text Placeholders</h3>
              <button onClick={addTextField} className="bg-white border border-gray-200 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-gray-50">
                <Plus className="w-4 h-4" /> Add Field
              </button>
            </div>

            <div className="space-y-4">
              {editingTemplate.textFields?.map((tf: any, i: number) => (
                <div key={tf.id} className="bg-white p-4 rounded-xl border border-gray-200 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Label (e.g. Groom Name)</label>
                    <input type="text" value={tf.label} onChange={e => updateTextField(i, 'label', e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Default Text</label>
                    <input type="text" value={tf.defaultText} onChange={e => updateTextField(i, 'defaultText', e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">X Pos (%)</label>
                    <input type="number" value={tf.x} onChange={e => updateTextField(i, 'x', Number(e.target.value))} className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Y Pos (%)</label>
                    <input type="number" value={tf.y} onChange={e => updateTextField(i, 'y', Number(e.target.value))} className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm" />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Font Family</label>
                    <select value={tf.fontFamily} onChange={e => updateTextField(i, 'fontFamily', e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm">
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="'Great Vibes', cursive">Great Vibes</option>
                      <option value="'Cinzel', serif">Cinzel</option>
                      <option value="'Dancing Script', cursive">Dancing Script</option>
                      <option value="'Montserrat', sans-serif">Montserrat</option>
                      <option value="'Lora', serif">Lora</option>
                      <option value="'Pacifico', cursive">Pacifico</option>
                      <option value="'Oswald', sans-serif">Oswald</option>
                      <option value="'Playfair Display', serif">Playfair Display</option>
                      <option value="'Roboto', sans-serif">Roboto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Font Size (px)</label>
                    <input type="number" value={tf.fontSize} onChange={e => updateTextField(i, 'fontSize', Number(e.target.value))} className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Color</label>
                    <input type="color" value={tf.color} onChange={e => updateTextField(i, 'color', e.target.value)} className="w-full h-8 border border-gray-200 rounded-lg p-0 cursor-pointer" />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Time (s)</label>
                    <input type="number" value={tf.startTime} onChange={e => updateTextField(i, 'startTime', Number(e.target.value))} className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Time (s)</label>
                    <input type="number" value={tf.endTime} onChange={e => updateTextField(i, 'endTime', Number(e.target.value))} className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Animation</label>
                    <select value={tf.animation} onChange={e => updateTextField(i, 'animation', e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm">
                      <option value="none">None</option>
                      <option value="fade">Fade In/Out</option>
                      <option value="slide-up">Slide Up</option>
                      <option value="scale">Scale</option>
                    </select>
                  </div>
                  <div className="col-span-2 flex items-end">
                    <button onClick={() => removeTextField(i)} className="text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-medium w-full flex justify-center items-center gap-1">
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              ))}
              {(!editingTemplate.textFields || editingTemplate.textFields.length === 0) && (
                <div className="text-center text-gray-500 py-4">No text fields added yet.</div>
              )}
            </div>
            
            {editingTemplate.videoUrl && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h4 className="font-bold mb-2">Live Video Preview (Interactive)</h4>
                <p className="text-sm text-gray-500 mb-4">Play the video to see when text appears. Drag text to reposition it.</p>
                <div 
                  ref={containerRef}
                  className="relative bg-black rounded-lg overflow-hidden select-none" 
                  style={{ aspectRatio: '16/9', maxHeight: '500px' }}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                >
                  <video ref={videoRef} src={editingTemplate.videoUrl || undefined} controls className="w-full h-full object-contain pointer-events-auto" onError={(e) => console.log("Video source not supported yet")} />
                  {editingTemplate.textFields?.map((tf: any) => {
                    const isVisible = videoTime >= (tf.startTime || 0) && videoTime <= (tf.endTime || 9999);
                    return (
                      <div 
                        key={tf.id}
                        onPointerDown={(e) => handlePointerDown(e, tf.id)}
                        className={`absolute whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2 drop-shadow-md cursor-move ${isVisible ? 'opacity-100' : 'opacity-30 border border-dashed border-white/50'}`}
                        style={{
                          left: `${tf.x}%`,
                          top: `${tf.y}%`,
                          fontSize: `${tf.fontSize}px`,
                          fontFamily: tf.fontFamily,
                          color: tf.color,
                          zIndex: draggingId === tf.id ? 20 : 10,
                          pointerEvents: 'auto',
                          padding: '4px 8px',
                          background: draggingId === tf.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                          borderRadius: '4px'
                        }}
                      >
                        {tf.defaultText}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : ( 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(t => (
            <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="aspect-video bg-gray-100 relative">
                {t.thumbnailUrl ? (
                  <img src={t.thumbnailUrl} alt={t.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Thumbnail</div>
                )}
                {!t.published && (
                  <span className="absolute top-2 right-2 bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-lg">Draft</span>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-lg mb-2">{t.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{t.textFields?.length || 0} Text Fields</p>
                <div className="mt-auto flex justify-end gap-2">
                  <button onClick={() => setEditingTemplate(t)} className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {templates.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p>No video templates yet.</p>
              <button onClick={createNewTemplate} className="mt-4 text-indigo-600 font-medium hover:underline">Create your first template</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
