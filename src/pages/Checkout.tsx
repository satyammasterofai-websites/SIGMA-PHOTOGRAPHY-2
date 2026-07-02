import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/useAuthStore";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Upload,
  X,
  File,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  CreditCard,
  Play,
  ChevronRight,
  ChevronLeft,
  Calendar,
  User,
  Music,
  HelpCircle,
  MapPin,
  Plus,
  Trash2,
  Languages,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import VideoModal from "../components/VideoModal";
import TemplateReviewsModal from "../components/TemplateReviewsModal";

const t = {
  details: { en: "Details", hi: "विवरण" },
  family: { en: "Family", hi: "परिवार" },
  events: { en: "Events", hi: "कार्यक्रम" },
  additionalInfo: { en: "Additional Info", hi: "अतिरिक्त जानकारी" },
  uploads: { en: "Uploads", hi: "अपलोड" },
  reviewOrder: { en: "Review & Order", hi: "समीक्षा और ऑर्डर" },

  yourDetails: { en: "Your Details", hi: "आपका विवरण" },
  yourDetailsDesc: {
    en: "We need this to contact you regarding the order.",
    hi: "ऑर्डर के संबंध में आपसे संपर्क करने के लिए हमें इसकी आवश्यकता है।",
  },
  fullName: { en: "Full Name", hi: "पूरा नाम" },
  whatsappNumber: { en: "WhatsApp Number", hi: "व्हाट्सएप नंबर" },

  groomDetails: { en: "Groom Details", hi: "वर का विवरण" },
  brideDetails: { en: "Bride Details", hi: "वधू का विवरण" },

  eventDetails: { en: "Event Details", hi: "कार्यक्रम का विवरण" },
  addEvent: { en: "Add Event", hi: "कार्यक्रम जोड़ें" },
  eventType: { en: "Event Type", hi: "कार्यक्रम का प्रकार" },
  eventDate: { en: "Event Date", hi: "कार्यक्रम की तिथि" },
  eventTime: { en: "Event Time", hi: "कार्यक्रम का समय" },
  eventVenue: { en: "Event Venue Name", hi: "कार्यक्रम स्थल का नाम" },
  fullAddress: { en: "Full Address", hi: "पूरा पता" },
  noEventsAdded: {
    en: 'No events added yet. Click "Add Event" to proceed.',
    hi: 'अभी तक कोई कार्यक्रम नहीं जोड़ा गया है। आगे बढ़ने के लिए "कार्यक्रम जोड़ें" पर क्लिक करें।',
  },

  uploadVaultInfo: {
    en: "Upload beautiful memories, photos, custom music, or specific text notes to be included in your invitation.",
    hi: "अपने निमंत्रण में शामिल करने के लिए खूबसूरत यादें, तस्वीरें, कस्टम संगीत या विशिष्ट टेक्स्ट नोट्स अपलोड करें।",
  },
  secureArtifactVault: {
    en: "Secure Artifact Vault",
    hi: "सुरक्षित अपलोड वॉल्ट",
  },
  uploadPhotos: { en: "Upload Photos", hi: "तस्वीरें अपलोड करें" },
  coupleBrideGroom: { en: "Couple, Bride, Groom", hi: "युगल, वधू, वर" },
  uploadCustomMusic: {
    en: "Upload Custom Music",
    hi: "कस्टम संगीत अपलोड करें",
  },
  mp3wav: { en: "MP3, WAV files", hi: "MP3, WAV फ़ाइलें" },
  uploadedAssets: { en: "Uploaded Assets", hi: "अपलोड किए गए एसेट्स" },
  filesTooHeavy: {
    en: "Are your files too heavy? Or you prefer sending them on WhatsApp safely?",
    hi: "क्या आपकी फ़ाइलें बहुत भारी हैं? या आप उन्हें व्हाट्सएप पर सुरक्षित रूप से भेजना पसंद करते हैं?",
  },
  sendFilesLater: {
    en: "Send Files Later on WhatsApp",
    hi: "व्हाट्सएप पर बाद में फ़ाइलें भेजें",
  },

  finalReview: { en: "Final Review", hi: "अंतिम समीक्षा" },
  contactInfo: { en: "Contact Info", hi: "संपर्क जानकारी" },
  gotCoupon: { en: "Got a Coupon Code?", hi: "क्या आपके पास कूपन कोड है?" },
  apply: { en: "Apply", hi: "लागू करें" },
  basePrice: { en: "Base Price", hi: "मूल मूल्य" },
  discount: { en: "Discount", hi: "छूट" },
  total: { en: "Total", hi: "कुल योग" },
  orderViaWhatsapp: {
    en: "Order via WhatsApp",
    hi: "व्हाट्सएप के माध्यम से ऑर्डर करें",
  },
  payOnline: { en: "Pay Online", hi: "ऑनलाइन भुगतान करें" },

  back: { en: "Back", hi: "पीछे" },
  nextStep: { en: "Next Step", hi: "अगला कदम" },

  selectEventType: { en: "Select Event Type", hi: "कार्यक्रम का प्रकार चुनें" },
  other: { en: "Other", hi: "अन्य" },
};

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const stateTemplate = location.state?.template;

  const [template, setTemplate] = useState<any>(stateTemplate || null);
  const [settings, setSettings] = useState<any>(null);
  const [formConfig, setFormConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [reviewsTemplateId, setReviewsTemplateId] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const { user } = useAuthStore();
  const [onlineUsersCount, setOnlineUsersCount] = useState(50);

  useEffect(() => {
    const baseNum = settings?.baseOnlineUsers ?? 50;
    const base = baseNum + (user ? 1 : 0);
    const fluctuation = () => Math.floor(Math.random() * 4);
    setOnlineUsersCount(base + fluctuation());

    const interval = setInterval(() => {
      setOnlineUsersCount(base + fluctuation());
    }, 15000);
    return () => clearInterval(interval);
  }, [user, settings?.baseOnlineUsers]);

  useEffect(() => {
    if (!user && !loading) {
      toast.error("Please login first to access the checkout page.");
      navigate("/login", { state: { redirectTo: `/checkout/${id}` } });
    }
  }, [user, loading, navigate, id]);

  // Custom Fields State
  const [formData, setFormData] = useState<Record<string, any>>({
    bride: {},
    groom: {},
    events: [],
    additional: {},
  });

  const [legacyFormData, setLegacyFormData] = useState<Record<string, string>>(
    {},
  );

  // File Uploads
  const [files, setFiles] = useState<
    Array<{
      name: string;
      base64: string;
      type: "photo" | "music" | "instruction" | "other";
    }>
  >([]);
  const [fileProgress, setFileProgress] = useState(0);

  // Pricing State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(
    location.state?.appliedCoupon || null,
  );

  // Additional Details State
  const [customerName, setCustomerName] = useState(user?.displayName || "");
  const [customerPhone, setCustomerPhone] = useState("");

  // Payment Options Popups
  const [paymentSuccessPopup, setPaymentSuccessPopup] = useState<{
    show: boolean;
    msg: string;
  }>({ show: false, msg: "" });

  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;

        try {
          const settingsSnap = await getDoc(doc(db, "settings", "config"));
          if (settingsSnap.exists()) {
            setSettings(settingsSnap.data());
          }
        } catch (err) {}

        let currentTemplate = template;
        if (!currentTemplate) {
          const tmplSnap = await getDoc(doc(db, "templates", id));
          if (tmplSnap.exists()) {
            currentTemplate = { id: tmplSnap.id, ...tmplSnap.data() };
            setTemplate(currentTemplate);
          } else {
            toast.error("Template not found");
            return;
          }
        }

        if (currentTemplate?.formId) {
          const formSnap = await getDoc(
            doc(db, "settings", "data", "custom_forms", currentTemplate.formId),
          );
          if (formSnap.exists()) {
            setFormConfig(formSnap.data());
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, template]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "photo" | "music" | "instruction" | "other",
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      let uploaded = [...files];
      setFileProgress(0);
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onload = (ev) => {
            uploaded.push({
              name: file.name,
              base64: ev.target?.result as string,
              type,
            });
            setFileProgress(
              Math.round(((i + 1) / e.target.files!.length) * 100),
            );
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
      setFiles(uploaded);
      toast.success("Files successfully uploaded");
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const applyCoupon = () => {
    if (!couponCode.trim()) return;

    if (couponCode.trim().toUpperCase() === "SIGMA20") {
      setAppliedCoupon({ code: "SIGMA20", percentage: "20" });
      toast.success(`Coupon Applied! 20% OFF`);
      return;
    }

    if (!settings?.coupons || settings.coupons.length === 0) {
      toast.error("Invalid coupon code");
      return;
    }

    const matched = settings.coupons.find(
      (c: any) =>
        c.code.replace(/\s+/g, "").toUpperCase() === couponCode.replace(/\s+/g, "").toUpperCase(),
    );
    if (matched) {
      if (matched.expiryDate) {
        const today = new Date().toISOString().split("T")[0];
        if (today > matched.expiryDate) {
          toast.error("This coupon has expired");
          return;
        }
      }
      setAppliedCoupon(matched);
      toast.success(`Coupon Applied! ${matched.percentage}% OFF`);
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const basePrice = Number(template?.price) || 0;
  const initialPrice = template?.discountPrice
    ? Number(template.discountPrice)
    : basePrice;
  const discountAmount = appliedCoupon
    ? initialPrice * (Number(appliedCoupon.percentage) / 100)
    : 0;
  const finalPrice = Math.round(initialPrice - discountAmount);

  const [waUrlToOpen, setWaUrlToOpen] = useState("");

  const createOrderRecord = async (
    paymentStatus: string,
    viaMethod: string,
  ) => {
    try {
      const cleanData = JSON.parse(
        JSON.stringify({
          createdAt: new Date().toISOString(),
          templateId: template?.id || "",
          templateName: template?.title || template?.name || "Template",
          thumbnailBase64: template?.thumbnailBase64 || "",
          userId: user ? user.uid : null,
          customerName: customerName || "",
          customerPhone: customerPhone || "",
          price: finalPrice || 0,
          advancePayment: Number(template?.advancePayment) || 0,
          advancePaymentStatus: "Pending",
          paymentStatus: paymentStatus || "Pending",
          status: "Pending",
          customData: formConfig ? formData : legacyFormData,
          filesCount: files.length || 0,
          viaMethod: viaMethod || "Direct",
          couponApplied: appliedCoupon ? appliedCoupon.code : null,
        }),
      );
      const orderRef = await addDoc(collection(db, "orders"), cleanData);

      if (files.length > 0) {
        try {
          // In case base64 string is large but also contains invalid nested arrays or object properties
          const cleanFiles = JSON.parse(JSON.stringify(files));
          await addDoc(collection(db, "order_files"), {
            orderId: orderRef.id,
            userId: user ? user.uid : null,
            files: cleanFiles,
          });
        } catch (err) {
          console.error("Files too large:", err);
        }
      }

      if (template?.id) {
        try {
          await updateDoc(doc(db, "templates", template.id), {
            ordersCount: increment(1),
          });
        } catch (e) {
          console.error("Failed to increment order count", e);
        }
      }

      return orderRef.id;
    } catch (e) {
      console.error(e);
      return "ORDER_ERR";
    }
  };

  const getWaUrl = (orderId: string) => {
    const number = settings?.whatsapp?.number || "9162478070";
    const displayOrderId =
      orderId === "ORDER_ERR"
        ? `REQ-${Math.floor(Math.random() * 100000)}`
        : orderId;

    let customFieldsText = "";
    if (formConfig) {
      customFieldsText += `*DETAILS*\n`;
      Object.entries(formData.bride).forEach(
        ([k, v]) => (customFieldsText += `*${k.toUpperCase()}*: ${v}\n`),
      );
      Object.entries(formData.groom).forEach(
        ([k, v]) => (customFieldsText += `*${k.toUpperCase()}*: ${v}\n`),
      );

      if (formData.events.length > 0) {
        customFieldsText += `\n*EVENTS*\n`;
        formData.events.forEach((ev: any, idx: number) => {
          customFieldsText += `*EVENT ${idx + 1}*: ${ev.type} - ${ev.date} ${ev.time} @ ${ev.venue}\n`;
        });
      }

      customFieldsText += `\n*ADDITIONAL DETAILS*\n`;
      Object.entries(formData.additional).forEach(
        ([k, v]) => (customFieldsText += `*${k.toUpperCase()}*: ${v}\n`),
      );
    } else {
      if (template?.customFields && template.customFields.length > 0) {
        customFieldsText += `*CUSTOMIZATION DETAILS*`;
        for (const f of template.customFields) {
          customFieldsText += `\n*${f.name.toUpperCase()}*: ${legacyFormData[f.id] || "Not provided"}`;
        }
        customFieldsText += "\n\n";
      }
    }

    let pricingText = `\n*PRICING SUMMARY*\n*BASE PRICE*: ₹${basePrice}`;
    if (basePrice > initialPrice) {
      pricingText += `\n*DISCOUNTED PRICE*: ₹${initialPrice}`;
    }
    if (appliedCoupon) {
      pricingText += `\n*COUPON APPLIED*: ${appliedCoupon.code} (-${appliedCoupon.percentage}%)`;
    }
    pricingText += `\n*FINAL PRICE*: ₹${finalPrice}`;
    if (template?.advancePayment) {
      pricingText += `\n*ADVANCE PAYMENT REQUIRED*: ₹${template.advancePayment}`;
    }

    const allDetails = customFieldsText + pricingText;

    let details = "";
    if (
      settings?.whatsapp?.messageFormat &&
      settings.whatsapp.enabled !== false
    ) {
      details = settings.whatsapp.messageFormat
        .replace("{template}", template?.title || "Unknown")
        .replace("{templateId}", template?.id || "Unknown")
        .replace("{orderId}", displayOrderId)
        .replace("{name}", customerName || "N/A")
        .replace("{phone}", customerPhone || "N/A")
        .replace("{details}", allDetails);
    } else {
      details = `*BOOKING REQUEST*\n\n*TEMPLATE*: ${template?.title || "Unknown"}\n*TEMPLATE ID*: ${template?.id}\n*ORDER ID*: ${displayOrderId}\n\n*CUSTOMER DETAILS*\n*NAME*: ${customerName}\n*PHONE*: ${customerPhone}\n\n${allDetails}`;
    }

    const encodedMsg = encodeURIComponent(details);
    return `https://wa.me/${number.replace(/[^0-9]/g, "")}?text=${encodedMsg}`;
  };

  const proceedToWhatsApp = async (viaMethod: string) => {
    setPaymentSuccessPopup({ show: true, msg: "Saving order details..." });
    const orderId = await createOrderRecord("Pending", viaMethod);
    const url = getWaUrl(orderId);
    setWaUrlToOpen(url);
    const advanceMsg = template?.advancePayment
      ? ` Note: An advance payment of ₹${template.advancePayment} is required.`
      : "";
    setPaymentSuccessPopup({
      show: true,
      msg: `Order saved! Please click below to send us your details on WhatsApp.${advanceMsg}`,
    });
  };

  const initiatePayment = async () => {
    // Mock Online payment
    setPaymentSuccessPopup({
      show: true,
      msg: "Initializing secure payment gateway...",
    });
    setTimeout(async () => {
      const orderId = await createOrderRecord("Paid Online", "Online Payment");
      const advanceMsg = template?.advancePayment
        ? ` Note: An advance payment of ₹${template.advancePayment} is required.`
        : "";
      setPaymentSuccessPopup({
        show: true,
        msg: `Payment successful! Redirecting to WhatsApp to send assets.${advanceMsg}`,
      });
      const url = getWaUrl(orderId);
      setWaUrlToOpen(url);
    }, 2000);
  };

  // --- Dynamic Form Steps Logic ---
  const dynamicSteps = React.useMemo(() => {
    const s = [];

    if (!formConfig) {
      // Legacy Form Workflow
      s.push({
        id: "legacy_details",
        label: t.details[lang],
      });
      s.push({ id: "uploads", label: t.uploads[lang] });
    } else {
      // Custom form workflow
      // Always ask for Customer Contact Info as Step 1
      s.push({
        id: "contact_and_details",
        label: t.yourDetails[lang],
      });

      if (formConfig.familySettings?.brideEnabled) {
        s.push({ id: "bride", label: t.brideDetails[lang] });
      }
      if (formConfig.familySettings?.groomEnabled) {
        s.push({ id: "groom", label: t.groomDetails[lang] });
      }
      if (formConfig.eventSettings?.enabled) {
        s.push({ id: "events", label: t.eventDetails[lang] });
      }
      if (formConfig.additionalFields?.length > 0) {
        s.push({ id: "additional", label: t.additionalInfo[lang] });
      }
      const ups = formConfig.uploadSettings || {};
      if (
        ups.photoUploadEnabled ||
        ups.musicUploadEnabled ||
        ups.instructionUploadEnabled
      ) {
        s.push({ id: "uploads", label: t.uploads[lang] });
      }
    }

    s.push({ id: "review", label: t.reviewOrder[lang] });
    s.push({ id: "payment", label: "WhatsApp / Payment" });

    return s;
  }, [formConfig, lang]);

  const steps = dynamicSteps.map((st) => st.label);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF0F5] via-[#FFE4E1] to-[#FFC0CB] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF0F5] via-[#FFE4E1] to-[#FFC0CB] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Template Not Found</h2>
        <button
          onClick={() => navigate("/gallery")}
          className="px-6 py-2 bg-brand-purple text-white rounded-xl"
        >
          Back to Gallery
        </button>
      </div>
    );
  }

  const handleNext = () => {
    const currentStepId = dynamicSteps[currentStep - 1]?.id;

    if (
      currentStepId === "contact_and_details" ||
      currentStepId === "contact"
    ) {
      if (!customerName || !customerPhone) {
        toast.error("Please provide your Contact Details");
        return;
      }
      if (!/^\d{10}$/.test(customerPhone.trim())) {
        toast.error("Contact number must be exactly 10 digits");
        return;
      }
    }

    const validateFields = (fields: any[], dataSection: string) => {
      for (const f of fields || []) {
        const val =
          (dataSection === "legacy"
            ? legacyFormData[f.id]
            : formData[dataSection]?.[f.id]) || "";
        if (f.required && !val.toString().trim()) {
          toast.error(`Please fill out: ${f.name}`);
          return false;
        }
        if (val.toString().trim()) {
          const strVal = val.toString().trim();
          if (f.type === "phone") {
            if (!/^\d+$/.test(strVal)) {
              toast.error(`${f.name} must contain only numbers`);
              return false;
            }
            if (f.minLength && strVal.length < parseInt(f.minLength)) {
              toast.error(`${f.name} must be at least ${f.minLength} digits`);
              return false;
            }
            if (f.maxLength && strVal.length > parseInt(f.maxLength)) {
              toast.error(`${f.name} must be at most ${f.maxLength} digits`);
              return false;
            }
            if (!f.minLength && !f.maxLength && strVal.length !== 10) {
              toast.error(`${f.name} must be exactly 10 digits`);
              return false;
            }
          } else if (f.type === "number") {
            if (isNaN(Number(strVal))) {
              toast.error(`${f.name} must be a number`);
              return false;
            }
          }
          if (f.type !== "phone" && f.type !== "number") {
            if (f.minLength && strVal.length < parseInt(f.minLength)) {
              toast.error(
                `${f.name} must be at least ${f.minLength} characters`,
              );
              return false;
            }
            if (f.maxLength && strVal.length > parseInt(f.maxLength)) {
              toast.error(
                `${f.name} must be at most ${f.maxLength} characters`,
              );
              return false;
            }
          }
        }
      }
      return true;
    };

    if (currentStepId === "legacy_details") {
      if (!validateFields(template?.customFields, "legacy")) return;
    } else if (currentStepId === "bride") {
      if (!validateFields(formConfig?.familySettings?.brideFields, "bride"))
        return;
    } else if (currentStepId === "groom") {
      if (!validateFields(formConfig?.familySettings?.groomFields, "groom"))
        return;
    } else if (currentStepId === "additional") {
      if (!validateFields(formConfig?.additionalFields, "additional")) return;
    }

    if (currentStepId === "events") {
      for (let i = 0; i < formData.events.length; i++) {
        const ev = formData.events[i];
        if (!ev.type || !ev.date || !ev.time || !ev.venue) {
          toast.error(`Please fill all required details for Event ${i + 1}`);
          return;
        }
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentStep((prev) => prev - 1);
  };

  const renderField = (field: any, section: string) => {
    let val = "";
    if (section === "legacy") val = legacyFormData[field.id] || "";
    else val = formData[section]?.[field.id] || "";

    const onChange = (e: any) => {
      let updateVal = e.target.value;
      if (
        field.type === "phone" ||
        field.name.toLowerCase().includes("phone") ||
        field.name.toLowerCase().includes("number")
      ) {
        if (field.type === "phone") {
          updateVal = updateVal.replace(/\D/g, "");
        }
      }

      if (section === "legacy") {
        setLegacyFormData({ ...legacyFormData, [field.id]: updateVal });
      } else {
        setFormData({
          ...formData,
          [section]: { ...formData[section], [field.id]: updateVal },
        });
      }
    };

    const commonClasses =
      "w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all";

    const dynamicTranslations: Record<string, string> = {
      "father name": "पिता का नाम (Father Name)",
      "mother name": "माता का नाम (Mother Name)",
      "grandfather name": "दादा का नाम (Grandfather Name)",
      "grandmother name": "दादी का नाम (Grandmother Name)",
      "brother name": "भाई का नाम (Brother Name)",
      "sister name": "बहन का नाम (Sister Name)",
      name: "नाम (Name)",
      address: "पता (Address)",
      "contact number": "संपर्क नंबर (Contact Number)",
      phone: "फ़ोन (Phone)",
      email: "ईमेल (Email)",
      "groom name": "वर का नाम (Groom Name)",
      "bride name": "वधू का नाम (Bride Name)",
      "bride father name": "वधू के पिता का नाम (Bride's Father Name)",
      "bride mother name": "वधू की माता का नाम (Bride's Mother Name)",
      "groom father name": "वर के पिता का नाम (Groom's Father Name)",
      "groom mother name": "वर की माता का नाम (Groom's Mother Name)",
      "bride grandfather name": "वधू के दादा का नाम (Bride's Grandfather Name)",
      "bride grandmother name": "वधू की दादी का नाम (Bride's Grandmother Name)",
      "groom grandfather name": "वर के दादा का नाम (Groom's Grandfather Name)",
      "groom grandmother name": "वर की दादी का नाम (Groom's Grandmother Name)",
      date: "तिथि (Date)",
      time: "समय (Time)",
      venue: "स्थल (Venue)",
      "venue name": "स्थल का नाम (Venue Name)",
      subtitle: "उपशीर्षक (Subtitle)",
      title: "शीर्षक (Title)",
      message: "संदेश (Message)",
      note: "नोट (Note)",
      "family details": "परिवार का विवरण (Family Details)",
      "function name": "समारोह का नाम (Function Name)",
    };

    const lowered = field.name.toLowerCase().trim();
    let translatedMatch = dynamicTranslations[lowered];
    if (!translatedMatch) {
      // Fallback keyword matching
      if (lowered.includes("father name"))
        translatedMatch = "पिता का नाम (Father Name)";
      else if (lowered.includes("mother name"))
        translatedMatch = "माता का नाम (Mother Name)";
      else if (lowered.includes("grandfather name"))
        translatedMatch = "दादा का नाम (Grandfather Name)";
      else if (lowered.includes("grandmother name"))
        translatedMatch = "दादी का नाम (Grandmother Name)";
      else if (lowered.includes("brother name"))
        translatedMatch = "भाई का नाम (Brother Name)";
      else if (lowered.includes("sister name"))
        translatedMatch = "बहन का नाम (Sister Name)";
    }

    const translatedLabel =
      lang === "hi" ? translatedMatch || field.name : field.name;

    return (
      <div key={field.id} className="md:col-span-1">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {translatedLabel}{" "}
          {field.required && <span className="text-red-500">*</span>}
        </label>
        {field.type === "textarea" ? (
          <textarea
            value={val}
            onChange={onChange}
            className={commonClasses}
            rows={3}
            placeholder={translatedLabel}
            maxLength={field.maxLength ? parseInt(field.maxLength) : undefined}
          />
        ) : (
          <input
            type={field.type === "phone" ? "tel" : field.type || "text"}
            value={val}
            onChange={onChange}
            className={commonClasses}
            placeholder={translatedLabel}
            maxLength={
              field.maxLength
                ? parseInt(field.maxLength)
                : field.type === "phone"
                  ? 10
                  : undefined
            }
          />
        )}
      </div>
    );
  };

  // Step: Contact Info
  const renderContactBlock = () => (
    <div className="space-y-8 animate-fade-in-up">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-brand-purple/10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-gradient-premium text-white rounded-full flex items-center justify-center mb-4 shadow-xl">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-display font-medium text-brand-navy">
            {t.yourDetails[lang]}
          </h2>
          <p className="text-gray-500 mt-2">{t.yourDetailsDesc[lang]}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.fullName[lang]} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.whatsappNumber[lang]} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              maxLength={10}
              value={customerPhone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setCustomerPhone(val);
              }}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3"
              placeholder="9876543210"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderBrideDetails = () => (
    <div className="space-y-8 animate-fade-in-up">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-brand-purple/10">
        <h3 className="text-2xl font-display text-brand-navy mb-6">
          👰 {t.brideDetails[lang] || "Bride's Details"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {formConfig?.familySettings?.brideFields?.map((f: any) =>
            renderField(f, "bride"),
          ) || (
            <>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bride's Full Name
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3"
                  placeholder="Her Name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Father's Name
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3"
                  placeholder="Father's Name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mother's Name
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3"
                  placeholder="Mother's Name"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderGroomDetails = () => (
    <div className="space-y-8 animate-fade-in-up">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-brand-purple/10">
        <div className="flex flex-col items-center text-center mb-8">
          <h2 className="text-3xl font-display font-medium text-brand-navy">
            👨 Groom's Details
          </h2>
          <p className="text-brand-slate mt-2">
            Enter the groom's family details
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {formConfig?.familySettings?.groomFields?.map((f: any) =>
            renderField(f, "groom"),
          ) || (
            <>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Groom's Full Name
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3"
                  placeholder="His Name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Father's Name
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3"
                  placeholder="Father's Name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mother's Name
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3"
                  placeholder="Mother's Name"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Step 2: Events
  const addEvent = () => {
    setFormData({
      ...formData,
      events: [
        ...formData.events,
        { type: "", date: "", time: "", venue: "", address: "" },
      ],
    });
  };
  const updateEvent = (idx: number, k: string, v: string) => {
    const newEvents = [...formData.events];
    newEvents[idx][k] = v;
    setFormData({ ...formData, events: newEvents });
  };
  const removeEvent = (idx: number) => {
    const newEvents = [...formData.events];
    newEvents.splice(idx, 1);
    setFormData({ ...formData, events: newEvents });
  };

  const renderStepEvents = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-brand-purple/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display font-semibold text-gray-900 flex items-center gap-2">
            📅 {t.eventDetails[lang]}
          </h2>
          <button
            onClick={addEvent}
            className="text-brand-purple bg-brand-purple/10 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1 hover:bg-brand-purple/20 transition-colors"
          >
            <Plus className="w-4 h-4" /> {t.addEvent[lang]}
          </button>
        </div>

        <div className="space-y-8">
          {formData.events.map((ev: any, idx: number) => (
            <div
              key={idx}
              className="relative p-6 bg-gray-50 border border-gray-200 rounded-2xl"
            >
              <button
                onClick={() => removeEvent(idx)}
                className="absolute top-4 right-4 text-red-500 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <h3 className="font-bold text-gray-800 mb-4">
                {t.events[lang]} {idx + 1}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.eventType[lang]}
                  </label>
                  <select
                    value={ev.type}
                    onChange={(e) => updateEvent(idx, "type", e.target.value)}
                    className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3"
                  >
                    <option value="">{t.selectEventType[lang]}</option>
                    {formConfig?.eventSettings?.eventTypes?.map(
                      (tType: string) => (
                        <option key={tType} value={tType}>
                          {tType}
                        </option>
                      ),
                    )}
                    <option value="Other">{t.other[lang]}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.eventDate[lang]}
                  </label>
                  <input
                    type="date"
                    value={ev.date}
                    onChange={(e) => updateEvent(idx, "date", e.target.value)}
                    className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.eventTime[lang]}
                  </label>
                  <input
                    type="time"
                    value={ev.time}
                    onChange={(e) => updateEvent(idx, "time", e.target.value)}
                    className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.eventVenue[lang]}
                  </label>
                  <input
                    type="text"
                    value={ev.venue}
                    onChange={(e) => updateEvent(idx, "venue", e.target.value)}
                    placeholder="Hotel Grand"
                    className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.fullAddress[lang]}
                  </label>
                  <textarea
                    value={ev.address}
                    onChange={(e) =>
                      updateEvent(idx, "address", e.target.value)
                    }
                    rows={2}
                    placeholder="Full address"
                    className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
          {formData.events.length === 0 && (
            <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-2xl">
              {t.noEventsAdded[lang]}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Step 3: Additional
  const renderStepAdditional = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-brand-purple/10">
        <h2 className="text-2xl font-display font-semibold text-gray-900 mb-6 flex items-center gap-2">
          📝 {t.additionalInfo[lang]}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {formConfig.additionalFields.map((f: any) =>
            renderField(f, "additional"),
          )}
        </div>
      </div>
    </div>
  );

  // Step 4: Uploads
  const renderStepUploads = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-brand-purple/10">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="w-8 h-8 text-green-500" />
          <h2 className="text-2xl font-bold text-gray-900">
            {t.secureArtifactVault[lang]}
          </h2>
        </div>
        <p className="text-gray-500 mb-8">{t.uploadVaultInfo[lang]}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {formConfig?.uploadSettings?.photoUploadEnabled && (
            <div className="relative border border-dashed border-brand-purple/40 bg-purple-50/50 rounded-2xl p-6 text-center hover:bg-purple-50 transition cursor-pointer">
              <Upload className="w-8 h-8 text-brand-purple mx-auto mb-3" />
              <p className="font-semibold text-gray-900">
                {t.uploadPhotos[lang]}
              </p>
              <p className="text-xs text-gray-500">
                {t.coupleBrideGroom[lang]}
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "photo")}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          )}
          {formConfig?.uploadSettings?.musicUploadEnabled && (
            <div className="relative border border-dashed border-blue-400/40 bg-blue-50/50 rounded-2xl p-6 text-center hover:bg-blue-50 transition cursor-pointer">
              <Music className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <p className="font-semibold text-gray-900">
                {t.uploadCustomMusic[lang]}
              </p>
              <p className="text-xs text-gray-500">{t.mp3wav[lang]}</p>
              <input
                type="file"
                multiple
                accept="audio/*"
                onChange={(e) => handleFileUpload(e, "music")}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          )}
        </div>

        {fileProgress > 0 && fileProgress < 100 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div
              className="bg-brand-purple h-2.5 rounded-full transition-all"
              style={{ width: `${fileProgress}%` }}
            ></div>
          </div>
        )}

        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-900 mb-4">
              {t.uploadedAssets[lang]}
            </h4>
            {files.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-white border border-gray-100 shadow-sm rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  {file.type === "music" ? (
                    <Music className="w-5 h-5 text-blue-500" />
                  ) : (
                    <File className="w-5 h-5 text-brand-purple" />
                  )}
                  <span className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-400 uppercase">
                    ({file.type})
                  </span>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500 mb-4">{t.filesTooHeavy[lang]}</p>
          <button
            onClick={() => proceedToWhatsApp("File Upload Fallback")}
            className="mx-auto px-6 py-3 bg-[#25D366]/10 text-[#25D366] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#25D366]/20 transition-colors"
          >
            <MessageSquare className="w-5 h-5" /> {t.sendFilesLater[lang]}
          </button>
        </div>
      </div>
    </div>
  );

  // Legacy Step (If no formConfig assigned)
  const renderLegacyDetails = () => (
    <div className="space-y-8 animate-fade-in-up">
      {/* Contact Block */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-brand-purple/10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {t.contactInfo[lang]}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.fullName[lang]}
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-brand-purple"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.whatsappNumber[lang]}
            </label>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-brand-purple"
              placeholder="+91 9876543210"
            />
          </div>
        </div>
      </div>

      {/* Custom Fields Block */}
      {template?.customFields && template.customFields.length > 0 && (
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-brand-purple/10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {lang === "hi" ? "अनुकूलन विवरण" : "Customization Details"}
          </h2>
          <p className="text-gray-500 mb-6 whitespace-pre-wrap text-sm leading-relaxed">
            {settings?.checkoutFormNote ||
              "📝 Important Instructions / महत्वपूर्ण निर्देश\nEnglish:\nFill Carefully: Please enter the details of your events exactly as you want them to appear on your invitation card."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {template.customFields.map((field: any) =>
              renderField(field, "legacy"),
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Step 5: Review
  const renderStepReview = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
          <CheckCircle2 className="w-8 h-8 text-brand-purple" />
          <h2 className="text-3xl font-display font-bold text-gray-900">
            {t.finalReview[lang]}
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-100 sm:items-center">
          <div
            className="w-full sm:w-48 rounded-xl bg-white overflow-hidden flex-shrink-0 relative cursor-pointer shadow border border-gray-100"
            onClick={() => template?.videoUrl && setShowVideo(true)}
          >
            {template?.thumbnailBase64 && (
              <img
                src={template.thumbnailBase64}
                alt="Thumb"
                className="w-full h-auto object-contain"
              />
            )}
            {template?.videoUrl && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                <Play className="w-8 h-8 text-white fill-white drop-shadow-md" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-xl sm:text-2xl text-gray-900 leading-tight">
              {template?.title}
            </h4>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
              <span className="text-sm font-medium text-brand-purple px-3 py-1 bg-brand-purple/10 rounded-full inline-block">
                {template?.category}
              </span>
              <span className="text-xs font-semibold text-gray-500 flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {(template?.baseOrdersCount ?? 100) +
                  (template?.ordersCount || 0)}{" "}
                Orders
              </span>
              <button
                onClick={() => setReviewsTemplateId(template?.id)}
                className="text-xs font-bold text-yellow-600 bg-yellow-50 hover:bg-yellow-100 px-3 py-1 flex items-center gap-1 rounded-full border border-yellow-200 transition"
              >
                <Star className="w-3.5 h-3.5 fill-current" /> Reviews
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-10">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-purple" />{" "}
            {t.contactInfo[lang]}
          </h3>
          <p className="text-sm text-gray-700">
            <strong>Name:</strong> {customerName}
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>WhatsApp:</strong> {customerPhone}
          </p>
        </div>

        <hr className="border-gray-200 mb-8" />

        <div className="max-w-md ml-auto">
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder={t.gotCoupon[lang]}
              className="flex-1 bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3"
            />
            <button
              onClick={applyCoupon}
              className="px-6 py-3 bg-gray-900 hover:bg-black transition-colors text-white font-medium rounded-xl text-sm"
            >
              {t.apply[lang]}
            </button>
          </div>

          <div className="space-y-4 mb-6 text-sm">
            <div className="flex justify-between text-gray-600 font-medium">
              <span>{t.basePrice[lang]}</span>
              <span>₹{basePrice}</span>
            </div>
            {basePrice > initialPrice && (
              <div className="flex justify-between text-gray-600">
                <span>{t.discount[lang]}</span>
                <span className="text-green-600">
                  - ₹{(basePrice - initialPrice).toFixed(0)}
                </span>
              </div>
            )}

            {appliedCoupon && (
              <div className="flex justify-between items-center text-green-600 font-semibold p-3 bg-green-50 rounded-xl">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {appliedCoupon.code}
                </span>
                <span>- ₹{discountAmount.toFixed(0)}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <div>
              <span className="text-xl font-bold text-gray-900 block">
                {t.total[lang]}
              </span>
              {template?.advancePayment && (
                <span className="text-sm font-medium text-orange-600">
                  Advance Required: ₹{template.advancePayment}
                </span>
              )}
              <div className="flex items-center gap-1.5 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-semibold text-green-600">
                  {onlineUsersCount}+ people are online
                </span>
              </div>
            </div>
            <span className="text-4xl font-display font-bold text-brand-purple">
              ₹{finalPrice}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF0F5] via-[#FFE4E1] to-[#FFC0CB] flex flex-col">
      {showVideo && template?.videoUrl && (
        <VideoModal
          url={template.videoUrl}
          onClose={() => setShowVideo(false)}
        />
      )}
      {reviewsTemplateId && (
        <TemplateReviewsModal 
          templateId={reviewsTemplateId} 
          isOpen={true} 
          onClose={() => setReviewsTemplateId(null)} 
        />
      )}
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Language Res */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setLang((l) => (l === "en" ? "hi" : "en"))}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-brand-purple/20 transition-all font-semibold shadow-sm"
            >
              <Languages className="w-5 h-5" />
              {lang === "en" ? "Convert to Hindi" : "Convert to English"}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-10">
            <div className="flex items-center justify-between relative z-10 w-full overflow-hidden px-4 md:px-0">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-2 flex-1 relative min-w-[60px]"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm transition-colors z-10 ${currentStep > idx + 1 ? "bg-green-500 text-white" : currentStep === idx + 1 ? "bg-brand-purple text-white ring-4 ring-brand-purple/20" : "bg-white text-gray-400 border border-gray-200"}`}
                  >
                    {currentStep > idx + 1 ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold text-center hidden md:block ${currentStep >= idx + 1 ? "text-gray-900" : "text-gray-400"}`}
                  >
                    {step}
                  </span>
                </div>
              ))}
              <div className="absolute top-5 left-[10%] right-[10%] md:left-8 md:right-8 h-1 bg-gray-200 -z-0 rounded-full">
                <div
                  className="h-full bg-brand-purple rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentStep - 1) / Math.max(1, steps.length - 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative">
            {dynamicSteps[currentStep - 1]?.id === "contact_and_details" &&
              renderContactBlock()}
            {dynamicSteps[currentStep - 1]?.id === "bride" &&
              renderBrideDetails()}
            {dynamicSteps[currentStep - 1]?.id === "groom" &&
              renderGroomDetails()}
            {dynamicSteps[currentStep - 1]?.id === "events" &&
              renderStepEvents()}
            {dynamicSteps[currentStep - 1]?.id === "additional" &&
              renderStepAdditional()}
            {dynamicSteps[currentStep - 1]?.id === "legacy_details" &&
              renderLegacyDetails()}
            {dynamicSteps[currentStep - 1]?.id === "uploads" &&
              renderStepUploads()}
            {dynamicSteps[currentStep - 1]?.id === "review" &&
              renderStepReview()}
            {dynamicSteps[currentStep - 1]?.id === "payment" && (
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mt-12 text-center">
                <h3 className="text-2xl font-bold mb-8">Complete Your Order</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => proceedToWhatsApp("WhatsApp Direct")}
                    className="w-full py-4 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold rounded-2xl shadow-xl shadow-[#25D366]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-6 h-6" />{" "}
                    {t.orderViaWhatsapp[lang]}
                  </button>
                  <button
                    onClick={initiatePayment}
                    className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-6 h-6" /> {t.payOnline[lang]} ₹
                    {finalPrice}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          {currentStep < steps.length && (
            <div className="mt-8 flex justify-between items-center border-t border-gray-200 pt-6">
              {currentStep > 1 ? (
                <button
                  onClick={handlePrev}
                  className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 flex items-center gap-2 transition shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" /> {t.back[lang]}
                </button>
              ) : (
                <div></div>
              )}

              <button
                onClick={handleNext}
                className="px-8 py-3 bg-brand-purple text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-500/30 flex items-center gap-2 transition ml-auto"
              >
                {t.nextStep[lang]} <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Popups */}
      {paymentSuccessPopup.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-purple-50 mx-auto flex items-center justify-center text-brand-purple mb-6 animate-pulse">
              {waUrlToOpen ? (
                <MessageSquare className="w-10 h-10" />
              ) : (
                <CreditCard className="w-10 h-10" />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {waUrlToOpen ? "Ready to send" : "Processing..."}
            </h3>
            <p className="text-gray-600 mb-8">{paymentSuccessPopup.msg}</p>

            {waUrlToOpen ? (
              <a
                href={waUrlToOpen}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setPaymentSuccessPopup({ show: false, msg: "" });
                  navigate(user ? "/dashboard" : "/");
                }}
                className="w-full py-3 bg-brand-purple text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-purple-700 transition shadow-lg"
              >
                <MessageSquare className="w-5 h-5" /> Send on WhatsApp
              </a>
            ) : (
              <div className="w-full py-3 bg-gray-200 text-gray-500 font-bold rounded-xl flex items-center justify-center cursor-not-allowed">
                Please wait...
              </div>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
