import { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useSiteContent() {
  const [logoBase64, setLogoBase64] = useState('');
  const [hero, setHero] = useState<any>(null);
  const [contact, setContact] = useState<any>(null);
  const [about, setAbout] = useState<any>(null);
  const [features, setFeatures] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubLogo = onSnapshot(doc(db, 'content', 'logo'), (doc) => {
      if (doc.exists()) setLogoBase64(doc.data().image || '');
    }, () => {});

    const unsubHero = onSnapshot(doc(db, 'content', 'hero'), (doc) => {
      if (doc.exists()) setHero(doc.data());
    }, () => {});

    const unsubContact = onSnapshot(doc(db, 'content', 'contact'), (doc) => {
      if (doc.exists()) setContact(doc.data());
    }, () => {});

    const unsubAbout = onSnapshot(doc(db, 'content', 'about'), (doc) => {
      if (doc.exists()) setAbout(doc.data());
    }, () => {});

    const unsubFeatures = onSnapshot(doc(db, 'content', 'features'), (doc) => {
      if (doc.exists()) setFeatures(doc.data().items || []);
    }, () => {});

    const unsubTemplates = onSnapshot(collection(db, 'templates'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setTemplates(list);
    }, () => {});

    const unsubTestimonials = onSnapshot(collection(db, 'testimonials'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setTestimonials(list);
    }, () => {});

    const unsubFaqs = onSnapshot(collection(db, 'faqs'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setFaqs(list);
    }, () => {});

    const unsubBanners = onSnapshot(collection(db, 'banners'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setBanners(list);
    }, () => {});

    // To prevent infinite loading
    setLoading(false);

    return () => {
      unsubLogo();
      unsubHero();
      unsubContact();
      unsubAbout();
      unsubFeatures();
      unsubTemplates();
      unsubTestimonials();
      unsubFaqs();
      unsubBanners();
    };
  }, []);

  return { logoBase64, hero, contact, about, features, templates, testimonials, faqs, banners, loading };
}
