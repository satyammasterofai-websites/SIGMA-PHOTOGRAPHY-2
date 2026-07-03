import { useEffect, useRef } from 'react';
import { collection, getDocs, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function CleanupDuplicates() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const cleanup = async () => {
      try {
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
        const catDoc = await getDoc(doc(db, 'content', 'categories'));
        if (catDoc.exists() && catDoc.data().items) {
          const categories = catDoc.data().items;
          const seenCategoryNames = new Set<string>();
          const uniqueCategories = [];
          for (const cat of categories) {
            if (cat.name) {
              const name = cat.name.toLowerCase().trim();
              if (!seenCategoryNames.has(name)) {
                seenCategoryNames.add(name);
                uniqueCategories.push(cat);
              } else {
                console.log('Found duplicate category:', name);
              }
            }
          }
          if (uniqueCategories.length < categories.length) {
            await setDoc(doc(db, 'content', 'categories'), { items: uniqueCategories });
            console.log('Cleaned up duplicate categories.');
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
        
      } catch (err) {
        console.error('Error during cleanup:', err);
      }
    };

    cleanup();
  }, []);

  return null;
}
