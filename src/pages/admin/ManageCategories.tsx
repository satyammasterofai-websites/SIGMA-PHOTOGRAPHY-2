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
  RotateCcw,
  Upload,
  Check,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Add Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [newCatOrder, setNewCatOrder] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  // Edit Category Modal State
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatImage, setEditCatImage] = useState('');
  const [editCatOrder, setEditCatOrder] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Website Invitation Visibility
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
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const draggedIndexRef = useRef<number | null>(null);
  const dragOverIndexRef = useRef<number | null>(null);

  // Sync website invitation visibility setting
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "config"), (docSnap) => {
      if (docSnap.exists()) {
        setWebsiteInvitationHidden(docSnap.data().websiteInvitationHidden === true);
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

  // Sync Categories from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'content', 'template_categories', 'items'), async (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.name && String(data.name).trim() !== '' && String(data.name) !== 'undefined') {
          list.push({ id: docSnap.id, ...data });
        }
      });
      list.sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 9999;
        const orderB = typeof b.order === 'number' ? b.order : 9999;
        return orderA - orderB;
      });
      setCategories(list);

      // Auto-recover missing categories from templates if needed
      try {
        const tSnap = await getDocs(collection(db, 'templates'));
        const templateCats = new Set<string>();
        tSnap.forEach(t => {
           if (t.data().category) templateCats.add(String(t.data().category).trim());
        });
        const existingCats = new Set(list.map(c => (c.name || '').trim().toLowerCase()));
        
        for (const tc of templateCats) {
           if (tc && !existingCats.has(tc.toLowerCase())) {
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

  const cancelHold = () => {
    isPointerDownRef.current = false;
    clearHoldTimers();
    if (!isDraggingRef.current) {
      setHoldingIndex(null);
      setHoldProgress(0);
    }
  };

  const resetDragState = () => {
    isPointerDownRef.current = false;
    clearHoldTimers();
    isDraggingRef.current = false;
    draggedIndexRef.current = null;
    dragOverIndexRef.current = null;
    setIsDragging(false);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setHoldingIndex(null);
    setHoldProgress(0);
  };

  const activateDrag = (index: number) => {
    clearHoldTimers();
    isDraggingRef.current = true;
    draggedIndexRef.current = index;
    dragOverIndexRef.current = index;
    setIsDragging(true);
    setDraggedIndex(index);
    setDragOverIndex(index);
    setHoldingIndex(null);
    setHoldProgress(100);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(35);
    }
  };

  // Called when user presses on the card body
  const handleCardPointerDown = (index: number, e: React.PointerEvent) => {
    if (searchQuery !== '') return;
    const target = e.target as HTMLElement;
    // Don't drag if clicking buttons, inputs, links, or controls
    if (target.closest('button, input, textarea, a, select, [data-no-drag="true"]')) {
      return;
    }

    clearHoldTimers();
    isPointerDownRef.current = true;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    setHoldingIndex(index);
    setHoldProgress(0);

    const startTime = Date.now();
    const HOLD_DURATION = 200; // 200ms hold threshold

    holdProgressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / HOLD_DURATION) * 100));
      setHoldProgress(progress);
      if (progress >= 100 && holdProgressIntervalRef.current) {
        clearInterval(holdProgressIntervalRef.current);
        holdProgressIntervalRef.current = null;
      }
    }, 20);

    holdTimerRef.current = setTimeout(() => {
      if (isPointerDownRef.current && !isDraggingRef.current) {
        activateDrag(index);
      }
    }, HOLD_DURATION);
  };

  // Immediate drag via Grip Handle
  const handleGripPointerDown = (index: number, e: React.PointerEvent) => {
    if (searchQuery !== '') return;
    e.stopPropagation();
    e.preventDefault();
    isPointerDownRef.current = true;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    activateDrag(index);
  };

  // Global Pointer Events Listener for seamless dragging across all devices
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      // If holding but not yet dragging, cancel if pointer moved > 12px (user is scrolling)
      if (isPointerDownRef.current && !isDraggingRef.current) {
        const dx = Math.abs(e.clientX - startXRef.current);
        const dy = Math.abs(e.clientY - startYRef.current);
        if (dx > 12 || dy > 12) {
          cancelHold();
          return;
        }
      }

      // If active dragging:
      if (isDraggingRef.current && draggedIndexRef.current !== null) {
        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        let foundIndex: number | null = null;
        for (const el of elements) {
          const card = el.closest('[data-category-index]');
          if (card) {
            const idxStr = card.getAttribute('data-category-index');
            if (idxStr !== null) {
              const parsed = parseInt(idxStr, 10);
              if (!isNaN(parsed)) {
                foundIndex = parsed;
                break;
              }
            }
          }
        }
        if (foundIndex !== null && foundIndex !== dragOverIndexRef.current) {
          dragOverIndexRef.current = foundIndex;
          setDragOverIndex(foundIndex);
        }
      }
    };

    const handleGlobalPointerUp = () => {
      if (isDraggingRef.current && draggedIndexRef.current !== null && dragOverIndexRef.current !== null) {
        const from = draggedIndexRef.current;
        const to = dragOverIndexRef.current;
        if (from !== to) {
          reorderCategories(from, to);
        } else {
          resetDragState();
        }
      } else {
        cancelHold();
      }
    };

    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, [categories]);

  // Reorder categories array and sync sequential numbering to Firestore
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

    // Instant UI update for zero lag
    setCategories(updatedList);
    setIsSavingOrder(true);
    resetDragState();

    try {
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

  const moveUp = async (index: number) => {
    if (index === 0) return;
    reorderCategories(index, index - 1);
  };

  const moveDown = async (index: number) => {
    if (index === categories.length - 1) return;
    reorderCategories(index, index + 1);
  };

  // -------------------------------------------------------------
  // ADD NEW CATEGORY
  // -------------------------------------------------------------
  const handleNewImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setNewCatImage(canvas.toDataURL("image/jpeg", 0.85));
          toast.success("Image selected and compressed");
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = (newCatName || "").trim();
    if (!trimmed) {
      toast.error("Category name required");
      return;
    }
    
    // Check for duplicate category name
    const isDuplicate = (categories || []).some(
      (cat: any) => (cat.name || '').toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      toast.error("A category with this exact name already exists.");
      return;
    }

    setIsAdding(true);
    const parsedNewOrder = newCatOrder !== '' ? parseInt(newCatOrder, 10) : (categories.length + 1);

    try {
      const newCat = {
        name: trimmed,
        image: newCatImage,
        order: !isNaN(parsedNewOrder) ? parsedNewOrder : categories.length + 1
      };
      await addDoc(collection(db, 'content', 'template_categories', 'items'), newCat);
      toast.success("Category added successfully!");
      setNewCatName('');
      setNewCatImage('');
      setNewCatOrder('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to add category");
    } finally {
      setIsAdding(false);
    }
  };

  // -------------------------------------------------------------
  // EDIT CATEGORY (MODAL-BASED FOR 100% RELIABILITY)
  // -------------------------------------------------------------
  const startEdit = (cat: any) => {
    setEditingCategory(cat);
    setEditCatName(cat.name || '');
    setEditCatImage(cat.image || '');
    setEditCatOrder((cat.order ?? (categories.indexOf(cat) + 1)).toString());
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditCatName('');
    setEditCatImage('');
    setEditCatOrder('');
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
    if (!editingCategory) return;
    const trimmedName = (editCatName || "").trim();
    if (!trimmedName) {
      toast.error("Category name is required");
      return;
    }

    const isDuplicate = (categories || []).some(
      (cat: any) => cat.id !== editingCategory.id && (cat.name || '').toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      toast.error("Another category with this exact name already exists.");
      return;
    }

    setIsSavingEdit(true);
    const oldName = editingCategory.name;
    const oldOrder = editingCategory.order ?? (categories.findIndex(c => c.id === editingCategory.id) + 1);
    const newOrderNum = editCatOrder !== '' ? parseInt(editCatOrder, 10) : oldOrder;

    try {
      // 1. Update category in content/template_categories/items
      await setDoc(doc(db, 'content', 'template_categories', 'items', editingCategory.id), {
        name: trimmedName,
        image: editCatImage,
        order: newOrderNum
      }, { merge: true });

      // 2. If name changed, update all templates using this category to keep consistency
      if (oldName && oldName.trim().toLowerCase() !== trimmedName.toLowerCase()) {
        try {
          const q = query(collection(db, 'templates'), where('category', '==', oldName));
          const snap = await getDocs(q);
          const updatePromises = snap.docs.map(tDoc =>
            updateDoc(doc(db, 'templates', tDoc.id), { category: trimmedName })
          );
          await Promise.all(updatePromises);
        } catch (tErr) {
          console.warn("Could not sync template categories:", tErr);
        }
      }

      // 3. If position / order was changed, smoothly move to that position and re-sequence
      if (!isNaN(newOrderNum) && newOrderNum !== oldOrder) {
        const currIdx = categories.findIndex(c => c.id === editingCategory.id);
        const targetIdx = Math.max(0, Math.min(categories.length - 1, newOrderNum - 1));
        if (currIdx !== -1 && currIdx !== targetIdx) {
          const list = [...categories];
          const [moved] = list.splice(currIdx, 1);
          list.splice(targetIdx, 0, { ...moved, name: trimmedName, image: editCatImage });
          const reordered = list.map((item, idx) => ({ ...item, order: idx + 1 }));
          setCategories(reordered);

          // Save new sequential orders
          const orderPromises = reordered.map((item, idx) =>
            setDoc(doc(db, 'content', 'template_categories', 'items', item.id), { order: idx + 1 }, { merge: true })
          );
          await Promise.all(orderPromises);
        }
      }

      toast.success(`Category "${trimmedName}" updated successfully!`, { icon: '✨' });
      cancelEdit();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to update category");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // -------------------------------------------------------------
  // DELETE CATEGORY
  // -------------------------------------------------------------
  const confirmDelete = async () => {
    if (!deleteId) return;
    const catToDelete = categories.find(c => c.id === deleteId);
    if (!catToDelete) return;

    setIsDeleting(true);
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
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Delete Sub Template</h3>
            <p className="text-gray-400 mb-6 text-sm">
              Are you sure you want to delete this category? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-gray-800 text-gray-300 hover:text-white rounded-xl hover:bg-gray-700 transition-colors cursor-pointer text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors cursor-pointer text-sm font-semibold flex items-center gap-1.5"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED EDIT CATEGORY MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-5">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-indigo-400" /> Edit Category
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Update category title, position, and thumbnail image.
                </p>
              </div>
              <button 
                onClick={cancelEdit}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                  Category Name <span className="text-red-400">*</span>
                </label>
                <input 
                  type="text" 
                  value={editCatName} 
                  onChange={e => setEditCatName(e.target.value)} 
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500"
                  placeholder="e.g. Wedding, Engagement, etc."
                />
              </div>

              {/* Position / Order Number */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                  Position / Order Number
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    value={editCatOrder} 
                    onChange={e => setEditCatOrder(e.target.value)} 
                    className="w-28 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
                    placeholder="1"
                    min="1"
                  />
                  <span className="text-xs text-gray-400">
                    Enter target position (e.g. 1 for first). It will automatically shift others.
                  </span>
                </div>
              </div>

              {/* Category Thumbnail Image */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                  Category Thumbnail Image
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-28 h-24 bg-gray-800 border border-gray-700 rounded-xl flex items-center justify-center overflow-hidden relative shrink-0">
                    {editCatImage ? (
                      <img src={editCatImage} alt="Preview" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-500" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="px-4 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Change Image
                      <input type="file" accept="image/*" onChange={handleEditImageUpload} className="hidden" />
                    </label>
                    {editCatImage && (
                      <button 
                        type="button"
                        onClick={() => setEditCatImage('')}
                        className="text-xs text-red-400 hover:text-red-300 text-left transition-colors"
                      >
                        Remove Image
                      </button>
                    )}
                    <span className="text-[11px] text-gray-500">
                      Auto-compressed for fast loading
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-800">
              <button 
                onClick={cancelEdit}
                className="px-4 py-2.5 bg-gray-800 text-gray-300 hover:text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={saveEdit}
                disabled={isSavingEdit}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-indigo-900/30"
              >
                {isSavingEdit ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header and Reset Action */}
      <div className="mb-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Manage Sub Templates (Categories)</h1>
          <p className="text-brand-slate text-sm">
            Freely drag & drop to reposition categories. Positions and numbering are managed only in admin panel.
          </p>
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
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            title="Reset orders to 1, 2, 3... sequentially"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Orders (1, 2, 3...)
          </button>
        </div>
      </div>

      {/* Interactive Free Drag & Drop Info Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-purple-950/50 to-indigo-950/60 border border-indigo-500/30 rounded-2xl p-4 mb-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30 text-indigo-300 mt-0.5">
              <Move className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-sm">
                  Free Drag & Drop Positioning Active
                </h3>
                {isSavingOrder && (
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full animate-pulse border border-emerald-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Syncing positions...
                  </span>
                )}
              </div>
              <p className="text-gray-300 text-xs mt-1">
                <strong className="text-indigo-300">Press & hold</strong> any category card for 0.2s (or grab the grip handle) and freely drag it to any position you want. The numbering & position (<span className="text-indigo-300 font-bold">#1, #2, #3...</span>) are tracked here in admin panel while the website renders clean categories in this exact order.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs font-bold text-indigo-300 bg-indigo-900/50 px-3 py-1.5 rounded-lg border border-indigo-500/30">
              Total: {categories.length} Categories
            </span>
          </div>
        </div>
      </div>

      {/* Add New Category Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 shadow-lg">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-indigo-400" /> Add New Category
        </h2>
        <form onSubmit={addCategory} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-24">
            <label className="block text-xs font-bold text-gray-400 mb-1">Position #</label>
            <input 
              type="number" 
              value={newCatOrder} 
              onChange={e => setNewCatOrder(e.target.value)} 
              placeholder={(categories.length + 1).toString()}
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-xl text-sm font-mono"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-400 mb-1">Category Name</label>
            <input 
              type="text" 
              value={newCatName} 
              onChange={e => setNewCatName(e.target.value)} 
              placeholder="e.g. Wedding"
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-xl text-sm"
            />
          </div>
          <div className="w-full md:w-auto">
            <label className="block text-xs font-bold text-gray-400 mb-1">Thumbnail Preview</label>
            <div className="relative h-10 bg-gray-800 border border-gray-700 rounded-xl flex items-center justify-center overflow-hidden w-40 cursor-pointer">
              {newCatImage ? (
                <img src={newCatImage} alt="Preview" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-xs text-gray-500">Upload Image</span>
              )}
              <input type="file" accept="image/*" onChange={handleNewImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isAdding}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 h-10 rounded-xl font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-900/20"
          >
            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add
          </button>
        </form>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500"
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
                key={cat.id || index}
                data-category-index={index}
                onPointerDown={(e) => handleCardPointerDown(index, e)}
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
                  {/* Grip & Position Numbering Badge (IN ADMIN PANEL ONLY) */}
                  <div 
                    onPointerDown={(e) => handleGripPointerDown(index, e)}
                    className="flex items-center gap-2 cursor-grab active:cursor-grabbing p-1 -ml-1 rounded-lg hover:bg-gray-800/80 transition-colors"
                    title="Drag grip or press & hold anywhere on card to reorder"
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
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
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
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
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

                    {/* Edit Category Button */}
                    <button 
                      onClick={() => startEdit(cat)} 
                      className="bg-indigo-600/80 hover:bg-indigo-600 text-white p-1.5 rounded-lg transition-colors shadow-sm cursor-pointer" 
                      title="Edit Category Name, Image, & Position"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Category Button */}
                    <button 
                      onClick={() => setDeleteId(cat.id)} 
                      className="bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-lg transition-colors shadow-sm cursor-pointer" 
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Thumbnail */}
                <div className="h-40 w-full mb-3 bg-gray-800/80 rounded-xl overflow-hidden flex items-center justify-center relative mt-1 border border-gray-700/50 pointer-events-none">
                  {/* Corner Number Badge on Thumbnail in Admin */}
                  <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 bg-black/75 backdrop-blur-md rounded-md border border-white/20 text-white font-black text-[11px] tracking-wider shadow">
                    #{String(index + 1).padStart(2, "0")}
                  </div>

                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-500" />
                  )}
                </div>

                {/* Card Title & Position in Admin */}
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
                  <span className="text-gray-400 font-semibold font-mono">
                    Order: {cat.order ?? index + 1}
                  </span>
                </div>
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
