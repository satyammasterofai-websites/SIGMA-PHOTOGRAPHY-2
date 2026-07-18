import { create } from 'zustand';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SiteContentState {
  logoBase64: string;
  navbar: any;
  hero: any;
  contact: any;
  about: any;
  features: any[];
  categories: any[];
  templates: any[];
  testimonials: any[];
  faqs: any[];
  banners: any[];
  settings: any;
  loading: boolean;
  initialized: boolean;
  init: () => void;
}

export const useSiteStore = create<SiteContentState>((set, get) => ({
  logoBase64: '',
  navbar: null,
  hero: null,
  contact: null,
  about: null,
  features: [],
  categories: [],
  templates: [],
  testimonials: [],
  faqs: [],
  banners: [],
  settings: null,
  loading: true,
  initialized: false,
  init: () => {
    if (get().initialized) return;
    set({ initialized: true });

    let loadedCount = 0;
    const TOTAL_SUBSCRIPTIONS = 12;
    let initialLoadComplete = false;

    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount >= TOTAL_SUBSCRIPTIONS && !initialLoadComplete) {
        initialLoadComplete = true;
        set({ loading: false });
      }
    };

    onSnapshot(doc(db, "content", "logo"), (doc) => {
      if (doc.exists()) set({ logoBase64: doc.data().image || "" });
      checkLoaded();
    }, () => checkLoaded());

    onSnapshot(doc(db, "content", "navbar"), (doc) => {
      if (doc.exists()) set({ navbar: doc.data() });
      checkLoaded();
    }, () => checkLoaded());

    onSnapshot(doc(db, "content", "hero"), (doc) => {
      if (doc.exists()) set({ hero: doc.data() });
      checkLoaded();
    }, () => checkLoaded());

    onSnapshot(doc(db, "content", "contact"), (doc) => {
      if (doc.exists()) set({ contact: doc.data() });
      checkLoaded();
    }, () => checkLoaded());

    onSnapshot(doc(db, "content", "about"), (doc) => {
      if (doc.exists()) set({ about: doc.data() });
      checkLoaded();
    }, () => checkLoaded());

    onSnapshot(doc(db, "content", "features"), (doc) => {
      if (doc.exists()) set({ features: doc.data().items || [] });
      checkLoaded();
    }, () => checkLoaded());

    onSnapshot(collection(db, 'content', 'template_categories', 'items'), (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      set({ categories: list });
      checkLoaded();
    }, () => checkLoaded());

    onSnapshot(collection(db, "templates"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      set({ templates: list });
      checkLoaded();
    }, () => checkLoaded());

    onSnapshot(collection(db, "testimonials"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      set({ testimonials: list });
      checkLoaded();
    }, () => checkLoaded());

    onSnapshot(collection(db, "faqs"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      set({ faqs: list });
      checkLoaded();
    }, () => checkLoaded());

    onSnapshot(collection(db, "banners"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      set({ banners: list });
      checkLoaded();
    }, () => checkLoaded());

    onSnapshot(doc(db, "settings", "config"), (doc) => {
      if (doc.exists()) set({ settings: doc.data() });
      checkLoaded();
    }, () => checkLoaded());

    setTimeout(() => {
      if (!initialLoadComplete) {
        initialLoadComplete = true;
        set({ loading: false });
      }
    }, 15000);
  }
}));
