import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  Plus,
  Download,
  Upload,
  FileJson,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
  Edit2,
  Trash2,
  ExternalLink,
  Search,
  Sparkles,
  Smartphone,
  Globe,
  ArrowRightLeft,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { defaultECardsData } from "../../components/ECardsSection";
import { isWebsiteOrECardTemplate, isValidWebsiteUrl, isVideoUrl } from "../../lib/templateUtils";

export interface ECardItem {
  id?: string;
  name: string;
  image: string;
  price: number | string;
  discountPrice?: number | string;
  link?: string;
  websiteUrl?: string;
  subCategory?: string;
  category?: string;
  description?: string;
  features?: string[];
  type?: "website" | "ecard" | "video";
  advancePayment?: number | string;
  supportedDevices?: string[];
  showInECards?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function ManageECards() {
  const [ecards, setEcards] = useState<ECardItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Drag and Drop State for Import
  const [isDraggingOverDropzone, setIsDraggingOverDropzone] = useState(false);
  const [isDraggingModalDropzone, setIsDraggingModalDropzone] = useState(false);
  const [isDraggingWindow, setIsDraggingWindow] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // Helper to strictly detect if a template is an e-card or website template
  // Rule: Must have a valid responsive website link. Video templates (even in 9:16) are excluded.
  const isECardOrWebsite = (item: any) => isWebsiteOrECardTemplate(item);

  const isWebsiteCard = (card: any) => isWebsiteOrECardTemplate(card);

  // Unified Template Modal State (Website template & E-card template share the same schema & options)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<ECardItem | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    subCategory: string;
    type: "website" | "ecard";
    image: string;
    websiteUrl: string;
    price: number | string;
    discountPrice: number | string;
    advancePayment: number | string;
    description: string;
    features: string[];
  }>({
    name: "",
    subCategory: "Website Templates",
    type: "website",
    image: "",
    websiteUrl: "",
    price: 2999,
    discountPrice: 2499,
    advancePayment: 500,
    description: "Interactive mobile-first digital wedding invitation website and luxury e-card.",
    features: [
      "Live RSVP Online Form & Guest Management",
      "Google Maps Venue Directions & Live Navigation",
      "Couple Love Story & Event Timeline",
      "Real-Time Wedding Countdown Timer",
      "Photo Gallery & Background Music Player",
      "WhatsApp & Social Media Ready",
    ],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Import / Export State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importedData, setImportedData] = useState<any[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [importMode, setImportMode] = useState<"merge" | "clean">("merge");
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSyncingFromTemplates, setIsSyncingFromTemplates] = useState(false);

  // Fetch e-cards and website templates from the primary templates collection
  const fetchEcards = async () => {
    try {
      const snapshot = await getDocs(collection(db, "templates"));
      const list: ECardItem[] = [];

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (isECardOrWebsite(data)) {
          const isWeb = isWebsiteCard(data);
          list.push({
            id: docSnap.id,
            name: (data.title || data.name || "Wedding Template").trim(),
            image: data.thumbnailBase64 || data.image || "",
            price: Number(data.price) || (isWeb ? 2999 : 1499),
            discountPrice: data.discountPrice ? Number(data.discountPrice) : undefined,
            advancePayment: data.advancePayment ? Number(data.advancePayment) : (isWeb ? 500 : 0),
            subCategory: data.subCategory || (isWeb ? "Website Templates" : "Hindu Templates"),
            category: data.category || "Website Invitation",
            type: (data.type as any) || (isWeb ? "website" : "ecard"),
            description:
              data.description ||
              (isWeb
                ? "Interactive mobile-first digital wedding invitation website with RSVP."
                : "Luxury digital wedding invitation e-card template."),
            features:
              data.features ||
              (data.customFields ? data.customFields.map((f: any) => f.name) : [
                "Live RSVP Online Form & Guest Management",
                "Google Maps Venue Directions & Live Navigation",
                "Couple Love Story & Event Timeline",
                "Real-Time Wedding Countdown Timer",
              ]),
            link: (data.websiteUrl || data.link || "").trim(),
            websiteUrl: (data.websiteUrl || data.link || "").trim(),
            showInECards: true,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        }
      });

      // Sort newest first
      list.sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      setEcards(list);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load e-cards / website templates");
    } finally {
      setLoading(false);
    }
  };

  // Transfer and synchronize e-card & website templates from the general templates collection
  const handleTransferFromTemplatesSection = async () => {
    setIsSyncingFromTemplates(true);
    const toastId = toast.loading("Checking for e-card/website templates to transfer...");
    try {
      const templatesSnap = await getDocs(collection(db, "templates"));
      let transferCount = 0;
      const now = new Date().toISOString();

      for (const tDoc of templatesSnap.docs) {
        const t = tDoc.data();
        if (isECardOrWebsite(t)) {
          const isWeb = isWebsiteCard(t);
          // Ensure marked for official e-card section and proper category/subcategory
          if (t.showInECards !== true || !t.category || t.category === "Video Templates") {
            await updateDoc(doc(db, "templates", tDoc.id), {
              showInECards: true,
              category: "Website Invitation",
              subCategory: t.subCategory || (isWeb ? "Website Templates" : "Hindu Templates"),
              type: isWeb ? "website" : "ecard",
              websiteUrl: (t.websiteUrl || t.link || "").trim(),
              videoUrl: "",
              updatedAt: now,
            });
            transferCount++;
          }
        } else if (t.showInECards === true) {
          // Strictly exclude video templates without website link
          await updateDoc(doc(db, "templates", tDoc.id), {
            showInECards: false,
            updatedAt: now,
          });
        }
      }

      if (transferCount > 0) {
        toast.success(`Successfully transferred and synchronized ${transferCount} template(s) to official E-Cards section!`, { id: toastId });
      } else {
        toast.success("All templates are already synchronized with official E-Cards section!", { id: toastId });
      }
      await fetchEcards();
    } catch (err: any) {
      console.error("Transfer from templates error:", err);
      toast.error(`Transfer failed: ${err.message || "Unknown error"}`, { id: toastId });
    } finally {
      setIsSyncingFromTemplates(false);
    }
  };

  useEffect(() => {
    fetchEcards();

    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (
        e.dataTransfer &&
        e.dataTransfer.types &&
        Array.from(e.dataTransfer.types).includes("Files")
      ) {
        setIsDraggingWindow(true);
      }
    };

    const handleWindowDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (!e.relatedTarget || (e.clientX <= 0 && e.clientY <= 0)) {
        setIsDraggingWindow(false);
      }
    };

    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingWindow(false);
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        processJsonFile(files[0]);
      }
    };

    window.addEventListener("dragover", handleWindowDragOver);
    window.addEventListener("dragleave", handleWindowDragLeave);
    window.addEventListener("drop", handleWindowDrop);

    return () => {
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("dragleave", handleWindowDragLeave);
      window.removeEventListener("drop", handleWindowDrop);
    };
  }, []);

  // Strip undefined values to prevent Firestore rejection
  const sanitizeFirestoreData = (data: any) => {
    const clean: Record<string, any> = {};
    Object.keys(data).forEach((key) => {
      if (key !== "id" && data[key] !== undefined) {
        clean[key] = data[key];
      }
    });
    return clean;
  };

  // Export JSON handler
  const handleExportData = async () => {
    setIsExporting(true);
    const toastId = toast.loading("Preparing templates for export...");
    try {
      if (ecards.length === 0) {
        toast.error("No templates found to export", { id: toastId });
        return;
      }

      const payload = {
        exportedAt: new Date().toISOString(),
        version: "1.0",
        type: "wedding_templates",
        count: ecards.length,
        templates: ecards,
      };

      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(payload, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute(
        "download",
        `wedding-templates-export-${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      toast.success(
        `Successfully exported ${ecards.length} templates!`,
        { id: toastId }
      );
    } catch (err: any) {
      console.error("Export error:", err);
      toast.error(
        "Failed to export: " + (err?.message || "Unknown error"),
        { id: toastId }
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Process JSON File
  const processJsonFile = (file: File) => {
    if (
      !file.name.toLowerCase().endsWith(".json") &&
      file.type !== "application/json"
    ) {
      toast.error("Please drop a valid .json file");
      return;
    }

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = JSON.parse(event.target?.result as string);
        let list: any[] = [];
        if (Array.isArray(raw)) {
          list = raw;
        } else if (raw && Array.isArray(raw.templates)) {
          list = raw.templates;
        } else if (raw && Array.isArray(raw.ecards)) {
          list = raw.ecards;
        } else if (raw && Array.isArray(raw.data)) {
          list = raw.data;
        } else {
          throw new Error(
            "Invalid format. File must contain an array of templates."
          );
        }

        const validList = list.filter(
          (item) =>
            item &&
            typeof item === "object" &&
            (item.name ||
              item.title ||
              item.image ||
              item.thumbnailBase64 ||
              item.link ||
              item.websiteUrl)
        );

        if (validList.length === 0) {
          toast.error("No valid templates found in this JSON file");
          return;
        }

        setImportedData(validList);
        setImportModalOpen(true);
        toast.success(`Loaded ${validList.length} templates from ${file.name}`);
      } catch (err: any) {
        console.error("JSON parse error:", err);
        toast.error(
          "Invalid JSON file: " + (err?.message || "Failed to read file")
        );
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (modalFileInputRef.current) modalFileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  // Drag & Drop Handlers for On-Page Dropzone
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverDropzone(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverDropzone(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverDropzone(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverDropzone(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processJsonFile(files[0]);
    }
  };

  // Drag & Drop Handlers for Modal Dropzone
  const handleModalDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingModalDropzone(true);
  };

  const handleModalDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingModalDropzone(true);
  };

  const handleModalDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingModalDropzone(false);
  };

  const handleModalDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingModalDropzone(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processJsonFile(files[0]);
    }
  };

  // File Picker Change Handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processJsonFile(file);
  };

  // Execute Import directly into the unified templates collection
  const executeImport = async () => {
    if (!importedData.length) return;
    setIsImporting(true);
    const toastId = toast.loading(
      `Importing ${importedData.length} templates...`
    );

    try {
      const now = new Date().toISOString();
      let count = 0;
      for (const item of importedData) {
        const isWeb = isWebsiteCard(item);
        const title = item.title || item.name || "Wedding Template";
        const templateData = {
          title: title.trim(),
          name: title.trim(),
          image: item.image || item.thumbnailBase64 || "",
          thumbnailBase64: item.thumbnailBase64 || item.image || "",
          price: Number(item.price) || (isWeb ? 2999 : 1499),
          discountPrice: item.discountPrice ? Number(item.discountPrice) : undefined,
          advancePayment: item.advancePayment ? Number(item.advancePayment) : (isWeb ? 500 : 0),
          category: "Website Invitation",
          subCategory: item.subCategory || (isWeb ? "Website Templates" : "Hindu Templates"),
          type: item.type || (isWeb ? "website" : "ecard"),
          websiteUrl: (item.websiteUrl || item.link || "").trim(),
          link: (item.websiteUrl || item.link || "").trim(),
          description: item.description || "",
          features: item.features || [],
          showInECards: true,
          updatedAt: now,
        };

        const sanitized = sanitizeFirestoreData(templateData);
        const targetId = item.id && typeof item.id === "string" ? item.id : null;

        if (targetId && importMode === "merge") {
          await setDoc(doc(db, "templates", targetId), sanitized, { merge: true });
        } else {
          await addDoc(collection(db, "templates"), { ...sanitized, createdAt: item.createdAt || now });
        }
        count++;
      }

      toast.success(`Successfully imported ${count} templates!`, { id: toastId });
      setImportModalOpen(false);
      setImportedData([]);
      fetchEcards();
    } catch (err: any) {
      console.error("Import error:", err);
      toast.error(
        "Failed during import: " + (err?.message || "Unknown error"),
        { id: toastId }
      );
    } finally {
      setIsImporting(false);
    }
  };

  // Seed Initial 10 Default Templates into templates collection
  const handleSeedDefaults = async () => {
    setIsSeeding(true);
    const toastId = toast.loading("Seeding 10 luxury default templates...");
    try {
      const allDefaults = [
        ...defaultECardsData.hindu,
        ...defaultECardsData.muslim,
        ...defaultECardsData.english,
      ];

      const now = new Date().toISOString();
      for (const item of allDefaults) {
        const clean = sanitizeFirestoreData({
          title: item.name,
          name: item.name,
          thumbnailBase64: item.image,
          image: item.image,
          price: item.price,
          discountPrice: item.discountPrice,
          advancePayment: 0,
          category: "Website Invitation",
          subCategory: item.subCategory || "Hindu Templates",
          type: "ecard",
          link: item.link || "",
          websiteUrl: item.link || "",
          description: item.description || "",
          features: item.features || [],
          showInECards: true,
          updatedAt: now,
          createdAt: now,
        });
        await setDoc(doc(db, "templates", item.id), clean, { merge: true });
      }

      toast.success("Successfully seeded 10 default templates!", { id: toastId });
      fetchEcards();
    } catch (err: any) {
      console.error("Seed error:", err);
      toast.error("Failed to seed templates: " + err.message, { id: toastId });
    } finally {
      setIsSeeding(false);
    }
  };

  // Unified Open Add Modal
  const openAddModal = () => {
    setEditingCard(null);
    setFormData({
      name: "",
      subCategory: "Website Templates",
      type: "website",
      image: "",
      websiteUrl: "",
      price: 2999,
      discountPrice: 2499,
      advancePayment: 500,
      description: "Interactive mobile-first digital wedding invitation website and luxury e-card.",
      features: [
        "Live RSVP Online Form & Guest Management",
        "Google Maps Venue Directions & Live Navigation",
        "Couple Love Story & Event Timeline",
        "Real-Time Wedding Countdown Timer",
        "Photo Gallery & Background Music Player",
        "WhatsApp & Social Media Ready",
      ],
    });
    setModalOpen(true);
  };

  // Unified Open Edit Modal
  const handleEditCard = (card: ECardItem) => {
    setEditingCard(card);
    const isWeb = isWebsiteCard(card);
    setFormData({
      name: card.name || "",
      subCategory: card.subCategory || (isWeb ? "Website Templates" : "Hindu Templates"),
      type: (card.type as any) || (isWeb ? "website" : "ecard"),
      image: card.image || "",
      websiteUrl: card.websiteUrl || card.link || "",
      price: card.price || (isWeb ? 2999 : 1499),
      discountPrice: card.discountPrice || "",
      advancePayment: card.advancePayment !== undefined ? card.advancePayment : (isWeb ? 500 : 0),
      description: card.description || "",
      features: card.features && card.features.length > 0 ? card.features : [
        "Live RSVP Online Form & Guest Management",
        "Google Maps Venue Directions & Live Navigation",
        "Couple Love Story & Event Timeline",
        "Real-Time Wedding Countdown Timer",
        "Photo Gallery & Background Music Player",
        "WhatsApp & Social Media Ready",
      ],
    });
    setModalOpen(true);
  };

  // Unified Save Template Handler
  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter a template name");
      return;
    }
    if (!formData.image.trim()) {
      toast.error("Please provide a preview image URL");
      return;
    }
    if (!formData.websiteUrl.trim()) {
      toast.error("Please provide the Live Website URL. Templates in this section must have a website link.");
      return;
    }
    if (isVideoUrl(formData.websiteUrl)) {
      toast.error("Video URLs (YouTube, Shorts, mp4) cannot be added to E-Cards & Website templates. Please provide a responsive website URL.");
      return;
    }

    setIsSubmitting(true);
    const now = new Date().toISOString();

    try {
      const isWeb = formData.type === "website" || formData.subCategory === "Website Templates" || !!formData.websiteUrl.trim();

      const payload = {
        title: formData.name.trim(),
        name: formData.name.trim(),
        image: formData.image.trim(),
        thumbnailBase64: formData.image.trim(),
        price: Number(formData.price) || (isWeb ? 2999 : 1499),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
        advancePayment: formData.advancePayment ? Number(formData.advancePayment) : 0,
        subCategory: formData.subCategory,
        category: "Website Invitation",
        type: formData.type,
        websiteUrl: formData.websiteUrl.trim(),
        link: formData.websiteUrl.trim(),
        description: formData.description.trim(),
        features: formData.features,
        showInECards: true,
        updatedAt: now,
      };

      const sanitized = sanitizeFirestoreData(payload);

      if (editingCard?.id) {
        await updateDoc(doc(db, "templates", editingCard.id), sanitized);
        toast.success("Template updated successfully!");
      } else {
        await addDoc(collection(db, "templates"), {
          ...sanitized,
          createdAt: now,
        });
        toast.success("New template added successfully!");
      }

      setModalOpen(false);
      setEditingCard(null);
      fetchEcards();
    } catch (err: any) {
      console.error("Save template error:", err);
      toast.error("Failed to save template: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteCard = async (id: string) => {
    try {
      await deleteDoc(doc(db, "templates", id));
      toast.success("Template deleted successfully");
      setDeleteConfirmId(null);
      fetchEcards();
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error("Failed to delete template: " + err.message);
    }
  };

  // Filtered Cards
  const filteredCards = ecards.filter((card) => {
    const matchesSearch =
      !searchQuery ||
      card.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.subCategory?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const isWeb = isWebsiteCard(card);

    let matchesCategory = true;
    if (activeFilter === "All") {
      matchesCategory = true;
    } else if (activeFilter === "Website") {
      matchesCategory = isWeb;
    } else if (activeFilter === "Hindu") {
      matchesCategory = card.subCategory?.toLowerCase().includes("hindu") || (!isWeb && !card.subCategory?.toLowerCase().includes("muslim") && !card.subCategory?.toLowerCase().includes("english"));
    } else if (activeFilter === "Muslim") {
      matchesCategory = card.subCategory?.toLowerCase().includes("muslim");
    } else if (activeFilter === "English") {
      matchesCategory = card.subCategory?.toLowerCase().includes("english");
    }

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Full-Screen Drag & Drop Overlay */}
      {isDraggingWindow && (
        <div className="fixed inset-0 z-50 bg-brand-purple/20 backdrop-blur-sm border-4 border-dashed border-brand-purple flex flex-col items-center justify-center p-6 pointer-events-none transition-all">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-md ring-4 ring-brand-purple/30">
            <div className="w-20 h-20 rounded-full bg-purple-100 text-brand-purple flex items-center justify-center mb-4 animate-bounce">
              <FileJson className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              Drop Your JSON File Here
            </h2>
            <p className="text-sm text-slate-500">
              Release the file to immediately inspect, merge, or overwrite your wedding templates.
            </p>
          </div>
        </div>
      )}

      {/* Header with Unified Action Buttons */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-purple bg-brand-purple/10 px-3 py-1 rounded-full border border-brand-purple/20">
              E-Cards & Website Templates
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900">
            Manage E-Cards & Website Templates
          </h1>
          <p className="text-slate-500 mt-1">
            Website templates and digital graphic e-cards share the same format and options.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Single Unified Add Button */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-brand-purple hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl transition-all shadow-md shadow-brand-purple/20 font-bold text-sm cursor-pointer"
            title="Add a new wedding e-card or interactive website template"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Template</span>
          </button>

          {/* Sync / Transfer templates added from video or general templates section */}
          <button
            onClick={handleTransferFromTemplatesSection}
            disabled={isSyncingFromTemplates}
            className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 px-3.5 py-2.5 rounded-xl transition-all shadow-xs font-bold text-sm cursor-pointer"
            title="Scan and transfer e-card/website templates added from video template section to official e-card section"
          >
            {isSyncingFromTemplates ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            ) : (
              <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
            )}
            <span>Transfer to E-Cards</span>
          </button>

          <button
            onClick={handleExportData}
            disabled={isExporting}
            className="flex items-center gap-2 bg-white border border-gray-200 text-slate-800 px-3.5 py-2.5 rounded-xl hover:bg-gray-50 transition-all shadow-xs font-medium text-sm cursor-pointer"
            title="Download full JSON backup of templates"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
            ) : (
              <Download className="w-4 h-4 text-purple-600" />
            )}
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => {
              setImportedData([]);
              setImportModalOpen(true);
            }}
            disabled={isImporting}
            className="flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 px-3.5 py-2.5 rounded-xl transition-all shadow-xs font-bold text-sm cursor-pointer"
            title="Import templates from JSON file via Drag & Drop or File Picker"
          >
            <Upload className="w-4 h-4 text-purple-600" />
            <span>Import JSON</span>
          </button>
        </div>
      </div>

      {/* DRAG & DROP IMPORT DROPZONE */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`mb-6 p-6 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isDraggingOverDropzone
            ? "border-brand-purple bg-purple-50/80 scale-[1.01] shadow-lg shadow-brand-purple/10 ring-4 ring-brand-purple/20"
            : "border-purple-200 bg-gradient-to-r from-purple-50/50 via-white to-pink-50/30 hover:border-brand-purple/60 hover:bg-purple-50/30"
        }`}
      >
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform ${
              isDraggingOverDropzone
                ? "bg-brand-purple text-white scale-110 animate-bounce"
                : "bg-purple-100 text-brand-purple"
            }`}
          >
            <FileJson className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-display font-bold text-slate-900 text-sm sm:text-base flex items-center justify-center sm:justify-start gap-2">
              <span>Drag & Drop JSON File Here to Import</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                Drag & Drop Ready
              </span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Drop any <code className="font-mono text-purple-700 bg-purple-100/70 px-1 py-0.5 rounded">.json</code> file here to instantly inspect, merge, or overwrite templates.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="shrink-0 px-4 py-2 bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          Browse Files
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Total Templates
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {ecards.length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-600" /> Website Templates
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {ecards.filter((c) => isWebsiteCard(c)).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Hindu Templates
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {
              ecards.filter(
                (c) =>
                  c.subCategory?.toLowerCase().includes("hindu") &&
                  !isWebsiteCard(c)
              ).length
            }
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Muslim & English
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {
              ecards.filter(
                (c) =>
                  (c.subCategory?.toLowerCase().includes("muslim") ||
                    c.subCategory?.toLowerCase().includes("english")) &&
                  !isWebsiteCard(c)
              ).length
            }
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates by name or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {["All", "Website", "Hindu", "Muslim", "English"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeFilter === cat
                  ? "bg-brand-purple text-white shadow-xs"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
            >
              {cat === "All"
                ? "All Templates"
                : cat === "Website"
                ? "🌐 Website Templates"
                : `${cat} Templates`}
            </button>
          ))}

          {ecards.length === 0 && !loading && (
            <button
              onClick={handleSeedDefaults}
              disabled={isSeeding}
              className="ml-auto text-xs font-bold text-brand-purple bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Seed 10 Defaults</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-purple mb-3" />
          <p className="text-gray-500 text-sm">Loading collection...</p>
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center">
          <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            {ecards.length === 0 ? "No Templates in Database" : "No Matching Templates Found"}
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            {ecards.length === 0
              ? "Start by adding an e-card or interactive website template, or transfer existing ones from the templates section."
              : "Try adjusting your search query or category filter."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={openAddModal}
              className="px-5 py-2.5 bg-brand-purple text-white rounded-xl text-sm font-bold shadow-md hover:bg-purple-700 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Template
            </button>
            <button
              onClick={handleTransferFromTemplatesSection}
              className="px-5 py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-100 cursor-pointer flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-4 h-4" /> Transfer to E-Cards
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 bg-white border border-gray-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-gray-50 cursor-pointer"
            >
              Import JSON
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCards.map((card) => {
            const isWebsite = isWebsiteCard(card);

            return (
              <div
                key={card.id}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                {/* Mockup Frame */}
                <div className="relative aspect-[9/14] bg-gray-950 overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Category Pill */}
                  <div
                    className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-xs flex items-center gap-1 ${
                      isWebsite
                        ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/30"
                        : "bg-black/60 text-white border-white/20"
                    }`}
                  >
                    {isWebsite && <Globe className="w-3 h-3 text-emerald-400" />}
                    <span>{card.subCategory || (isWebsite ? "Website" : "E-Card")}</span>
                  </div>

                  {/* Live URL Link */}
                  {(card.websiteUrl || card.link) && (
                    <a
                      href={card.websiteUrl || card.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-xs text-white flex items-center justify-center hover:bg-brand-purple transition-colors border border-white/20"
                      title="Open Live Preview"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-display font-bold text-slate-900 text-base mb-1 line-clamp-1">
                      {card.name}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                      {card.description ||
                        (isWebsite
                          ? "Interactive mobile-first digital wedding website with RSVP."
                          : "Luxury digital wedding invitation e-card template.")}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-lg font-extrabold text-brand-purple">
                        ₹{card.discountPrice || card.price}
                      </span>
                      {card.discountPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{card.price}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleEditCard(card)}
                        className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(card.id || null)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* UNIFIED TEMPLATE MODAL (Website and E-Card share identical options)       */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50 via-pink-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-purple text-white flex items-center justify-center shadow-md shadow-brand-purple/20">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {editingCard ? "Edit Template" : "Add E-Card / Website Template"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Unified setup for digital graphic e-cards and interactive website templates
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveTemplate}
              className="p-6 overflow-y-auto space-y-5"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Template Title / Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Royal Marwar Palace Invitation or Beautiful Warm Red Envelope"
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 font-medium"
                />
              </div>

              {/* CATEGORY & TYPE IN ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Category / Style *
                  </label>
                  <select
                    value={formData.subCategory}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({
                        ...formData,
                        subCategory: val,
                        type: val === "Website Templates" ? "website" : formData.type,
                      });
                    }}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
                  >
                    <option value="Website Templates">Website Templates (Interactive)</option>
                    <option value="Hindu Templates">Hindu Templates</option>
                    <option value="Muslim Templates">Muslim Templates</option>
                    <option value="English Templates">English Templates</option>
                    <option value="Save The Date">Save The Date</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Anniversary">Anniversary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Template Format
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "website" | "ecard",
                      })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
                  >
                    <option value="website">Website (Interactive Live Demo)</option>
                    <option value="ecard">Graphic E-Card (WhatsApp / Social)</option>
                  </select>
                </div>
              </div>

              {/* LIVE DEMO / WEBSITE URL */}
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-purple-600" />
                    Live Demo / Website URL
                  </label>
                  {formData.websiteUrl && (
                    <a
                      href={formData.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
                    >
                      <span>Test Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      websiteUrl: e.target.value,
                    })
                  }
                  placeholder="https://premium-wedding-website-demo1.vercel.app/"
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-purple-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple font-mono text-purple-900"
                />
                <p className="text-[11px] text-purple-800/80 mt-1.5">
                  Enter link for live responsive demo or preview iframe.
                </p>
              </div>

              {/* MOCKUP IMAGE (9:16) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Preview Mockup Image URL (9:16 Aspect Ratio) *
                </label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/... or hosted screenshot"
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
                />
              </div>

              {/* PRICING */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Original Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="2999"
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Discount Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountPrice: e.target.value,
                      })
                    }
                    placeholder="2499"
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Advance Booking (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.advancePayment}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        advancePayment: e.target.value,
                      })
                    }
                    placeholder="500"
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
                  />
                </div>
              </div>

              {/* FEATURES CHECKLIST */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Included Features
                </label>
                <div className="space-y-2 bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
                  {[
                    "Live RSVP Online Form & Guest Management",
                    "Google Maps Venue Directions & Live Navigation",
                    "Couple Love Story & Event Timeline",
                    "Real-Time Wedding Countdown Timer",
                    "Photo Gallery & Background Music Player",
                    "WhatsApp & Social Media Ready",
                    "High-Resolution 300 DPI Format",
                    "24-Hour Express Turnaround",
                  ].map((feat) => {
                    const isChecked = formData.features.includes(feat);
                    return (
                      <label
                        key={feat}
                        className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                features: [...formData.features, feat],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                features: formData.features.filter(
                                  (f) => f !== feat
                                ),
                              });
                            }
                          }}
                          className="w-4 h-4 text-brand-purple rounded border-gray-300 focus:ring-brand-purple"
                        />
                        <span>{feat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Highlights of the wedding template..."
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-slate-600 hover:bg-gray-100 font-medium text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-brand-purple hover:bg-purple-700 text-white rounded-xl font-bold text-sm shadow-md shadow-brand-purple/20 cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingCard ? "Update Template" : "Save Template"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION & PREVIEW MODAL FOR JSON IMPORT */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                  <FileJson className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {importedData.length > 0
                      ? "Import Templates Preview"
                      : "Import Templates"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {importedData.length > 0 ? (
                      <>
                        Found{" "}
                        <span className="font-semibold text-purple-600">
                          {importedData.length}
                        </span>{" "}
                        templates in{" "}
                        <span className="font-semibold">{importFileName}</span>
                      </>
                    ) : (
                      "Drag & drop your JSON backup or exported template file to import"
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setImportModalOpen(false);
                  setImportedData([]);
                }}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {importedData.length === 0 ? (
              <div className="p-6 md:p-8 flex flex-col items-center justify-center">
                <input
                  type="file"
                  ref={modalFileInputRef}
                  accept=".json,application/json"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div
                  onDragOver={handleModalDragOver}
                  onDragEnter={handleModalDragEnter}
                  onDragLeave={handleModalDragLeave}
                  onDrop={handleModalDrop}
                  onClick={() => modalFileInputRef.current?.click()}
                  className={`w-full p-8 md:p-12 rounded-3xl border-3 border-dashed transition-all cursor-pointer flex flex-col items-center text-center ${
                    isDraggingModalDropzone
                      ? "border-brand-purple bg-purple-50 ring-4 ring-brand-purple/20 scale-[1.01]"
                      : "border-purple-200 bg-purple-50/30 hover:border-brand-purple hover:bg-purple-50/60"
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform ${
                      isDraggingModalDropzone
                        ? "bg-brand-purple text-white scale-110 animate-bounce"
                        : "bg-purple-100 text-brand-purple"
                    }`}
                  >
                    <Upload className="w-8 h-8" />
                  </div>

                  <h4 className="text-lg font-display font-bold text-slate-900 mb-1">
                    Drag & Drop your JSON file here
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mb-6">
                    Drop your exported wedding e-cards or template backup file (.json) to inspect and merge templates.
                  </p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      modalFileInputRef.current?.click();
                    }}
                    className="px-6 py-2.5 bg-brand-purple hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-brand-purple/20 cursor-pointer transition-all flex items-center gap-2"
                  >
                    <FileJson className="w-4 h-4" />
                    <span>Browse JSON File</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    Templates to Import ({importedData.length}):
                  </label>
                  <div className="border border-gray-200 rounded-2xl max-h-56 overflow-y-auto divide-y divide-gray-100 bg-gray-50/50">
                    {importedData.map((card, idx) => {
                      const isWeb = isWebsiteCard(card);
                      return (
                        <div
                          key={card.id || idx}
                          className="p-3 flex items-center justify-between gap-3 bg-white hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {card.image || card.thumbnailBase64 ? (
                              <img
                                src={card.image || card.thumbnailBase64}
                                alt={card.name || card.title || "Template"}
                                className="w-10 h-14 object-cover rounded-lg border border-gray-200 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs shrink-0">
                                No Img
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">
                                {card.name || card.title || "Untitled Template"}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span
                                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                                    isWeb
                                      ? "bg-emerald-50 text-emerald-800"
                                      : "bg-purple-50 text-purple-700"
                                  }`}
                                >
                                  {isWeb && <Globe className="w-3 h-3 text-emerald-600" />}
                                  {isWeb
                                    ? "Website Template"
                                    : card.subCategory || "E-Card"}
                                </span>
                                {(card.discountPrice || card.price) && (
                                  <span className="text-xs text-gray-500 font-semibold">
                                    ₹{card.discountPrice || card.price}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setImportModalOpen(false);
                  setImportedData([]);
                }}
                disabled={isImporting}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-slate-600 hover:bg-gray-100 transition-colors font-medium text-sm cursor-pointer"
              >
                Cancel
              </button>
              {importedData.length > 0 && (
                <button
                  type="button"
                  onClick={executeImport}
                  disabled={isImporting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-sm bg-purple-600 hover:bg-purple-700 cursor-pointer"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Confirm & Import ({importedData.length})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Delete Template?
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Are you sure you want to delete this template? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCard(deleteConfirmId)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-bold text-white shadow-sm cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
