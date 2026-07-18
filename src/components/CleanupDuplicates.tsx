import { useEffect, useRef } from 'react';
import { collection, getDocs, deleteDoc, doc, getDoc, setDoc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function CleanupDuplicates() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const cleanup = async () => {
      try {
        // 0. Migrate categories if needed
        let legacyItems = [];
        try {
            const catDoc = await getDoc(doc(db, 'content', 'categories'));
            if (catDoc.exists() && catDoc.data().items) {
              legacyItems = catDoc.data().items;
            }
        } catch(e) {}
        
        let rootItems = [];
        try {
            const rootCatSnap = await getDocs(collection(db, 'categories'));
            if (!rootCatSnap.empty) {
                rootCatSnap.forEach(d => rootItems.push({ id: d.id, ...d.data() }));
            }
        } catch(e) {}

        const finalLegacy = rootItems.length > 0 ? rootItems : legacyItems;

        const templateCatsSnap = await getDocs(collection(db, 'content', 'template_categories', 'items'));
        if (templateCatsSnap.empty && finalLegacy.length > 0) {
            console.log('Migrating legacy categories to collection...');
            for (const item of finalLegacy) {
              // Only add if it has a name
              if (item.name) {
                  await addDoc(collection(db, 'content', 'template_categories', 'items'), item);
              }
            }
            console.log('Migration complete.');
            try {
              await deleteDoc(doc(db, 'content', 'categories'));
            } catch(e) {}
            try {
              if (rootItems.length > 0) {
                for(const item of rootItems) {
                  await deleteDoc(doc(db, 'categories', item.id));
                }
              }
            } catch(e) {}
        }

        // 1. Cleanup Duplicate Templates
        const templatesSnap = await getDocs(collection(db, 'templates'));
        const seenTemplateTitles = new Set<string>();
        for (const templateDoc of templatesSnap.docs) {
          const data = templateDoc.data();
          if (data.title) {
            const title = data.title.toLowerCase().trim();
            if (seenTemplateTitles.has(title)) {
              console.log('Deleting duplicate template:', title);
              await deleteDoc(doc(db, 'templates', templateDoc.id));
            } else {
              seenTemplateTitles.add(title);
            }
          }
        }

        // 2. Cleanup Duplicate Categories
        const catSnap = await getDocs(collection(db, 'content', 'template_categories', 'items'));
        const seenCategoryNames = new Set<string>();
        for (const catDoc of catSnap.docs) {
          const data = catDoc.data();
          if (data.name) {
            const name = data.name.toLowerCase().trim();
            if (seenCategoryNames.has(name)) {
              console.log('Deleting duplicate category:', name);
              await deleteDoc(doc(db, 'content', 'template_categories', 'items', catDoc.id));
            } else {
              seenCategoryNames.add(name);
            }
          }
        }

        // 3. Cleanup Duplicate FAQs
        const faqsSnap = await getDocs(collection(db, 'faqs'));
        const seenFaqQuestions = new Set<string>();
        for (const faqDoc of faqsSnap.docs) {
          const data = faqDoc.data();
          if (data.question) {
            const question = data.question.toLowerCase().trim();
            if (seenFaqQuestions.has(question)) {
              console.log('Deleting duplicate FAQ:', question);
              await deleteDoc(doc(db, 'faqs', faqDoc.id));
            } else {
              seenFaqQuestions.add(question);
            }
          }
        }
        
      
        // 4. Assign displayIds to Templates
        const templatesWithDisplayId = new Set();
        const templatesByCategory = {};
        templatesSnap.docs.forEach(doc => {
          const data = doc.data();
          if (!data.title) return;
          
          if (!templatesByCategory[data.category]) {
            templatesByCategory[data.category] = [];
          }
          templatesByCategory[data.category].push({ id: doc.id, ...data });
        });

        for (const cat in templatesByCategory) {
           let maxId = 0;
           // find existing maxId
           templatesByCategory[cat].forEach(t => {
             if (t.displayId) {
               const num = parseInt(t.displayId, 10);
               if (!isNaN(num) && num > maxId) maxId = num;
             }
           });
           
           for (const t of templatesByCategory[cat]) {
             if (!t.displayId) {
               maxId++;
               const nextId = String(maxId).padStart(5, '0');
               await setDoc(doc(db, 'templates', t.id), { ...t, displayId: nextId });
               console.log('Assigned displayId', nextId, 'to template', t.id);
             }
           }
        }

        // 5. Assign displayIds to Orders
        const ordersSnap = await getDocs(collection(db, 'orders'));
        for (const orderDoc of ordersSnap.docs) {
          const data = orderDoc.data();
          if (!data.displayId) {
            const nextId = String(Math.floor(100000 + Math.random() * 900000));
            await setDoc(doc(db, 'orders', orderDoc.id), { ...data, displayId: nextId });
            console.log('Assigned displayId', nextId, 'to order', orderDoc.id);
          }
        }
      } catch (err) {
        console.error('Error during cleanup:', err);
      }
    };

    cleanup();
  }, []);

  return null;
}
