import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Trash2, 
  Plus, 
  Image as ImageIcon, 
  Edit2, 
  X, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  Globe, 
  GripVertical, 
  Move, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fileToBase64 } from '../../lib/utils';
import { isFileNameDuplicate, registerFileName } from '../../lib/fileRegistry';

export default function ManageCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [newCatOrder, setNewCatOrder] = useState('');
  
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatImage, setEditCatImage] = useState('');
  const [editCatOrder, setEditCatOrder] = useState('');

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [websiteInvitationHidden, setWebsiteInvitationHidden] = useState(false);

  // Free Drag and Drop / Press and Hold States
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [holdingIndex, setHoldingIndex] = useState<number | null>(null);
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100
  const [isDragging, setIsDragging] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdProgressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPointerDownRef = useRef(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "config"), (doc) => {
      if (doc.exists()) {
        setWebsiteInvitationHidden(doc.data().websiteInvitationHidden === true);
      }
    });
    return () => unsub();
  }, []);

  const toggleWebsiteInvitation = async () => {
    const next = !websiteInvitationHidden;
    setWebsiteInvitationHidden(next);
    try {
      localStorage.setItem("sigma_hide_website_invitation", next.toString());
      await setDoc(doc(db, "settings", "config"), { websiteInvitationHidden: next }, { merge: true });
      toast.success(
        next
          ? "Website Invitation category is now HIDDEN from visitors"
          : "Website Invitation category is now UNHIDDEN and visible to visitors",
        { icon: next ? "👁️‍🗨️" : "✨" }
      );
    } catch (e) {
      toast.error("Failed to update visibility");
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'content', 'template_categories', 'items'), async (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.name && String(data.name).trim() !== '' && String(data.name) !== 'undefined') {
          list.push({ id: doc.id, ...data });
        }
      });
      list.sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 9999;
        const orderB = typeof b.order === 'number' ? b.order : 9999;
        return orderA - orderB;
      });
      setCategories(list);

      // Auto-recover missing categories from templates
      try {
        const tSnap = await getDocs(collection(db, 'templates'));
        const templateCats = new Set<string>();
        tSnap.forEach(t => {
           if (t.data().category) templateCats.add(String(t.data().category).trim());
        });
        const existingCats = new Set(list.map(c => (c.name || '').trim().toLowerCase()));
        
        for (const tc of templateCats) {
           if (tc && !existingCats.has(tc.toLowerCase())) {
              // Recover it
              await addDoc(collection(db, 'content', 'template_categories', 'items'), {
                 name: tc,
                 order: list.length + 1,
                 image: ''
              });
              existingCats.add(tc.toLowerCase());
           }
        }
      } catch (err) {
        console.error("Failed to recover categories", err);
      }

    }, (error) => {
      console.error("Error fetching categories:", error);
    });
    return () => unsub();
  }, []);

  // -------------------------------------------------------------
  // PRESS & HOLD + FREE DRAG & DROP ENGINE
  // -------------------------------------------------------------
  const clearHoldTimers = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdProgressIntervalRef.current) {
      clearInterval(holdProgressIntervalRef.current);
      holdProgressIntervalRef.current = null;
    }
  };

  const startHoldTimer = (index: number, e: React.PointerEvent | React.TouchEvent | React.MouseEvent) => {
    // If clicking action buttons or inputs, do not start drag
    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, a, select, [data-no-drag="true"]')) {
      return;
    }

    clearHoldTimers();
    isPointerDownRef.current = true;
    setHoldingIndex(index);
    setHoldProgress(0);

    const startTime = Date.now();
    const HOLD_DURATION = 200; // 200ms quick response threshold

    holdProgressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / HOLD_DURATION) * 100));
      setHoldProgress(progress);
      if (progress >= 100) {
        if (holdProgressIntervalRef.current) {
          clearInterval(holdProgressIntervalRef.current);
          holdProgressIntervalRef.current = null;
        }
      }
    }, 20);

    holdTimerRef.current = setTimeout(() => {
      if (isPointerDownRef.current) {
        setIsDragging(true);
        setDraggedIndex(index);
        setHoldingIndex(null);
        setHoldProgress(100);

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(35);
        }
        toast('Ready to reposition! Drag and drop to any place.', {
          id: 'drag-active-toast',
          icon: '✋',
          duration: 2000,
        });
      }
    }, HOLD_DURATION);
  };

  const cancelHold = () => {
    isPointerDownRef.current = false;
    clearHoldTimers();
    if (!isDragging) {
      setHoldingIndex(null);
      setHoldProgress(0);
    }
  };

  const resetDragState = () => {
    isPointerDownRef.current = false;
    clearHoldTimers();
    setDraggedIndex(null);
    setDragOverIndex(null);
    setIsDragging(false);
    setHoldingIndex(null);
    setHoldProgress(0);
  };

  // HTML5 Drag Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    setDraggedIndex(index);
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropTargetIndex: number) => {
    e.preventDefault();
    const sourceIndex = draggedIndex !== null ? draggedIndex : parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(sourceIndex) && sourceIndex !== dropTargetIndex) {
      reorderCategories(sourceIndex, dropTargetIndex);
    } else {
      resetDragState();
    }
  };

  const handleDragEnd = () => {
    resetDragState();
  };

  // Touch Drag Handlers (for mobile/tablet touch screens)
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || draggedIndex === null) return;
    const touch = e.touches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const card = elem?.closest('[data-category-index]');
    if (card) {
      const idx = parseInt(card.getAttribute('data-category-index') || '-1', 10);
      if (idx >= 0 && idx !== dragOverIndex) {
        setDragOverIndex(idx);
      }
    }
  };

  const handleTouchEnd = () => {
    if (isDragging && draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      reorderCategories(draggedIndex, dragOverIndex);
    } else {
      resetDragState();
    }
  };

  // Reorder categories array and sync sequence to Firestore
  const reorderCategories = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
      resetDragState();
      return;
    }

    const currentList = [...categories];
    const [movedCat] = currentList.splice(fromIndex, 1);
    currentList.splice(toIndex, 0, movedCat);

    // Reassign sequential orders 1, 2, 3...
    const updatedList = currentList.map((cat, idx) => ({
      ...cat,
      order: idx + 1
    }));

    // Instant UI update for zero latency
    setCategories(updatedList);
    setIsSavingOrder(true);
    resetDragState();

    try {
      // Save all orders to Firestore
      const updatePromises = updatedList.map((cat, idx) =>
        setDoc(
          doc(db, 'content', 'template_categories', 'items', cat.id),
          { order: idx + 1 },
          { merge: true }
        )
      );
      await Promise.all(updatePromises);
      toast.success(`Position updated! "${movedCat.name}" is now Position #${toIndex + 1}`, {
        icon: '🎯'
      });
    } catch (err: any) {
      console.error("Failed to persist category order:", err);
      toast.error("Failed to save reordered positions to database");
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1920;
          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
          setNewCatImage(compressedBase64);
          toast.success("Image selected and compressed");
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(newCatName || "").trim()) {
      toast.error("Category name required");
      return;
    }
    
    // Check for duplicate category name
    const isDuplicate = (categories || []).some(
      (cat: any) => (cat.name || '').toLowerCase() === (newCatName || '').toLowerCase().trim()
    );
    
    if (isDuplicate) {
      toast.error("A category with this exact name already exists.");
      return;
    }

    const parsedNewOrder = newCatOrder !== '' ? parseInt(newCatOrder, 10) : null;
    if (parsedNewOrder !== null) {
      const isOrderDuplicate = (categories || []).some(
        (cat: any) => cat.order === parsedNewOrder
      );
      if (isOrderDuplicate) {
        toast.error("This order number already exists. Please choose a different order.");
        return;
      }
    }

    try {
      const newCat = {
        name: (newCatName || "").trim(),
        image: newCatImage,
        order: parsedNewOrder !== null ? parsedNewOrder : (categories.length > 0 ? Math.max(...categories.map(c => c.order || 0)) + 1 : 1)
      };
      await addDoc(collection(db, 'content', 'template_categories', 'items'), newCat);
      toast.success("Sub Template Category added");
      setNewCatName('');
      setNewCatImage('');
      setNewCatOrder('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to add category");
    }
  };

  const confirmDelete = async () => {
    if(!deleteId) return;
    const catToDelete = categories.find(c => c.id === deleteId);
    if (!catToDelete) return;

    try {
      const q = query(collection(db, 'templates'), where('category', '==', catToDelete.name));
      const sn = await getDocs(q);
      if (!sn.empty) {
        toast.error(`Cannot delete! ${sn.docs.length} templates are using this category.`);
        setDeleteId(null);
        return;
      }

      await deleteDoc(doc(db, 'content', 'template_categories', 'items', deleteId));
      toast.success("Category deleted");
      setDeleteId(null);
    } catch (err: any) {
      toast.error("Failed to delete category");
      setDeleteId(null);
    }
  };

  const startEdit = (cat: any) => {
    setEditCatOrder(cat.order?.toString() || '0');
    setEditingCatId(cat.id);
    setEditCatName(cat.name);
    setEditCatImage(cat.image || '');
  };

  const cancelEdit = () => {
    setEditingCatId(null);
    setEditCatName('');
    setEditCatImage('');
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1920;
          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          setEditCatImage(canvas.toDataURL('image/jpeg', 0.85));
          toast.success("Image updated");
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const saveEdit = async () => {
    if (!(editCatName || "").trim() || !editingCatId) return;
    
    const isDuplicate = (categories || []).some(
      (cat: any) => cat.id !== editingCatId && (cat.name || '').toLowerCase() === (editCatName || '').toLowerCase().trim()
    );
    if (isDuplicate) {
      toast.error("Another category with this name already exists.");
      return;
    }

    const parsedOrder = editCatOrder !== '' ? parseInt(editCatOrder, 10) : null;
    if (parsedOrder !== null) {
      const isOrderDuplicate = (categories || []).some(
        (cat: any) => cat.id !== editingCatId && cat.order === parsedOrder
      );
      if (isOrderDuplicate) {
        toast.error("This order number already exists. Please choose a different order.");
        return;
      }
    }

    try {
      await setDoc(doc(db, 'content', 'template_categories', 'items', editingCatId), {
        name: (editCatName || "").trim(),
        image: editCatImage,
        order: parsedOrder !== null ? parsedOrder : (categories.find(c => c.id === editingCatId)?.order || 0)
      }, { merge: true });
      toast.success("Category updated");
      cancelEdit();
    } catch (e: any) {
      toast.error(e.message || "Failed to update category");
    }
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    reorderCategories(index, index - 1);
  };

  const moveDown = async (index: number) => {
    if (index === categories.length - 1) return;
    reorderCategories(index, index + 1);
  };

  return (
    <div 
      className="w-full"
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-white mb-2">Delete Sub Template</h3>
            <p className="text-gray-400 mb-6">Are you sure you want to delete this sub template? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header and Reset Action */}
      <div className="mb-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Manage Sub Templates (Categories)</h1>
          <p className="text-brand-slate">Add, reorder, and position category sections. Drag & drop to freely change positions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={async () => {
              if (categories.length === 0) return;
              try {
                setIsSavingOrder(true);
                let idx = 1;
                for (const c of categories) {
                   await updateDoc(doc(db, 'content', 'template_categories', 'items', c.id), { order: idx++ });
                }
                toast.success("All positions & numbering reset sequentially (1, 2, 3...)");
              } catch (err) {
                toast.error("Failed to reset orders");
              } finally {
                setIsSavingOrder(false);
              }
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
            title="Reset orders to 1, 2, 3... sequentially"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All Orders (1, 2, 3...)
          </button>
        </div>
      </div>

      {/* Interactive Free Drag & Drop Notice Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-purple-950/50 to-indigo-950/60 border border-indigo-500/30 rounded-2xl p-4 mb-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30 text-indigo-300 mt-0.5">
              <Move className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-sm">
                  Free Drag & Drop Categorization Active
                </h3>
                {isSavingOrder && (
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full animate-pulse border border-emerald-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Syncing to website...
                  </span>
                )}
              </div>
              <p className="text-gray-300 text-xs mt-1">
                <strong className="text-indigo-300">Press & hold</strong> any category card for 0.2s (or grab the grip handle) and freely drag it to any position you want. The position and numbering (<span className="text-indigo-300 font-bold">#1, #2, #3...</span>) will immediately update and show on the live website!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs font-bold text-indigo-300 bg-indigo-900/50 px-3 py-1.5 rounded-lg border border-indigo-500/30">
              Total {categories.length} Categories
            </span>
          </div>
        </div>
      </div>

      {/* Add New Category Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-medium text-white mb-4">Add New Category</h2>
        <form onSubmit={addCategory} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-24">
            <label className="block text-sm text-gray-400 mb-1">Order #</label>
            <input 
              type="number" 
              value={newCatOrder} 
              onChange={e => setNewCatOrder(e.target.value)} 
              placeholder="e.g. 1"
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-1">Category Name</label>
            <input 
              type="text" 
              value={newCatName} 
              onChange={e => setNewCatName(e.target.value)} 
              placeholder="e.g. Wedding"
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg"
            />
          </div>
          <div className="w-full md:w-auto">
            <label className="block text-sm text-gray-400 mb-1">Thumbnail Preview</label>
            <div className="relative h-10 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center overflow-hidden w-40 cursor-pointer">
              {newCatImage ? (
                <img src={newCatImage} alt="Preview" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-xs text-gray-500">Upload Image</span>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
          <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 h-10 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500"
          />
        </div>
        {searchQuery !== '' && (
          <p className="text-xs text-amber-400 mt-2">
            💡 Showing filtered categories. Clear the search input to freely drag & reorder across all categories.
          </p>
        )}
      </div>

      {/* Categories Grid with Press-and-Hold Drag & Drop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(categories || [])
          .filter(cat => searchQuery === '' || (cat.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()))
          .map((cat, index) => {
            const isWebsiteCat = (cat.name || '').trim().toLowerCase() === 'website invitation';
            const isItemDragged = draggedIndex === index;
            const isItemDragOver = dragOverIndex === index && draggedIndex !== index;
            const isItemHolding = holdingIndex === index && !isDragging;

            return (
              <div
                key={`${cat.id}-${index}`}
                data-category-index={index}
                draggable={searchQuery === ''}
                onPointerDown={(e) => searchQuery === '' && startHoldTimer(index, e)}
                onPointerUp={cancelHold}
                onPointerCancel={cancelHold}
                onPointerLeave={cancelHold}
                onDragStart={(e) => searchQuery === '' && handleDragStart(e, index)}
                onDragOver={(e) => searchQuery === '' && handleDragOver(e, index)}
                onDragEnter={(e) => {
                  e.preventDefault();
                  if (searchQuery === '' && dragOverIndex !== index) setDragOverIndex(index);
                }}
                onDrop={(e) => searchQuery === '' && handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`bg-gray-900 border rounded-2xl p-4 relative group transition-all duration-200 select-none ${
                  isItemDragged
                    ? 'opacity-40 border-dashed border-2 border-indigo-400 scale-95 shadow-inner'
                    : isItemDragOver
                    ? 'border-2 border-emerald-400 ring-4 ring-emerald-400/30 bg-emerald-950/20 scale-[1.02] shadow-2xl z-30'
                    : isItemHolding
                    ? 'border-amber-400 ring-4 ring-amber-400/30 scale-[1.01] shadow-xl'
                    : 'border-gray-800 hover:border-gray-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {/* Visual Holding Feedback Progress */}
                {isItemHolding && (
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-gray-800 rounded-t-2xl overflow-hidden z-20">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-indigo-500 transition-all duration-75"
                      style={{ width: `${holdProgress}%` }}
                    />
                  </div>
                )}

                {/* Drop Slot Indicator when hovered */}
                {isItemDragOver && (
                  <div className="mb-3 py-1.5 px-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" /> Drop Here → Place at Position #{index + 1}
                  </div>
                )}

                {/* For Website Invitation: Show visibility badge & Hide/Unhide button */}
                {isWebsiteCat && (
                  <div data-no-drag="true" className="mb-3 p-2 rounded-xl bg-gray-800/80 border border-gray-700/60 flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      !websiteInvitationHidden
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}>
                      {!websiteInvitationHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {!websiteInvitationHidden ? "LIVE on Website" : "HIDDEN from Visitors"}
                    </span>
                    <button
                      onClick={toggleWebsiteInvitation}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        !websiteInvitationHidden
                          ? "bg-rose-600 hover:bg-rose-700 text-white"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                      title={!websiteInvitationHidden ? "Hide from website" : "Unhide and show on website"}
                    >
                      {!websiteInvitationHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {!websiteInvitationHidden ? "Hide" : "Unhide"}
                    </button>
                  </div>
                )}

                {/* Top Action Bar: Drag Grip + Position # + Action Buttons */}
                <div className="flex items-center justify-between mb-3 pt-1">
                  {/* Grip & Position Numbering Badge */}
                  <div 
                    className="flex items-center gap-2 cursor-grab active:cursor-grabbing p-1 -ml-1 rounded-lg hover:bg-gray-800/80 transition-colors"
                    title="Press and hold or drag to replace position"
                  >
                    <GripVertical className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 shadow-sm flex items-center gap-1">
                        #{index + 1}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hidden sm:inline">
                        Position {index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Actions (Move Up/Down, Edit, Delete) */}
                  <div data-no-drag="true" className="flex items-center gap-1.5 z-20">
                    {searchQuery === '' && (
                      <>
                        <button 
                          onClick={() => moveUp(index)} 
                          disabled={index === 0} 
                          className={`p-1.5 rounded-lg transition-colors ${
                            index === 0 
                              ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed' 
                              : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'
                          }`} 
                          title="Move Up 1 position"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => moveDown(index)} 
                          disabled={index === categories.length - 1} 
                          className={`p-1.5 rounded-lg transition-colors ${
                            index === categories.length - 1 
                              ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed' 
                              : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'
                          }`} 
                          title="Move Down 1 position"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    <button 
                      onClick={() => startEdit(cat)} 
                      className="bg-indigo-600/80 hover:bg-indigo-600 text-white p-1.5 rounded-lg transition-colors shadow-sm" 
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setDeleteId(cat.id)} 
                      className="bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-lg transition-colors shadow-sm" 
                      title="Delete Sub Template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {editingCatId === cat.id ? (
                  <div data-no-drag="true" className="flex flex-col gap-3 mt-4 relative z-30">
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        value={editCatOrder} 
                        onChange={e => setEditCatOrder(e.target.value)} 
                        className="w-20 bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm"
                        placeholder="Order"
                      />
                      <input 
                        type="text" 
                        value={editCatName} 
                        onChange={e => setEditCatName(e.target.value)} 
                        className="flex-1 bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center overflow-hidden w-20 cursor-pointer">
                        {editCatImage ? (
                          <img src={editCatImage} alt="Preview" className="max-w-full max-h-full object-contain" />
                        ) : (
                          <span className="text-[10px] text-gray-500">Image</span>
                        )}
                        <input type="file" accept="image/*" onChange={handleEditImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                      <div className="flex gap-2 flex-1">
                        <button onClick={saveEdit} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm flex-1">Save</button>
                        <button onClick={cancelEdit} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm"><X className="w-4 h-4"/></button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="h-40 w-full mb-3 bg-gray-800/80 rounded-xl overflow-hidden flex items-center justify-center relative mt-1 border border-gray-700/50">
                      {/* Corner Number Badge on Thumbnail */}
                      <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 bg-black/75 backdrop-blur-md rounded-md border border-white/20 text-white font-black text-[11px] tracking-wider shadow">
                        #{String(index + 1).padStart(2, "0")}
                      </div>

                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="max-w-full max-h-full object-contain" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-500" />
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <h3 className="text-white font-bold text-base line-clamp-1">
                        {cat.name}
                      </h3>
                      <span className="text-[11px] text-gray-400 font-mono bg-gray-800 px-2 py-0.5 rounded border border-gray-700/60 shrink-0">
                        Pos #{index + 1}
                      </span>
                    </div>

                    {/* Drag Helper Tip on Card Footer */}
                    <div className="mt-3 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400">
                      <span className="flex items-center gap-1 group-hover:text-indigo-300 transition-colors">
                        <GripVertical className="w-3.5 h-3.5" /> Hold & drag to replace
                      </span>
                      <span className="text-gray-400 font-semibold">
                        Order: {cat.order ?? index + 1}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        {(!categories || categories.length === 0) && (
          <p className="text-gray-500 col-span-3 text-center py-8">No categories added yet.</p>
        )}
      </div>
    </div>
  );
}
