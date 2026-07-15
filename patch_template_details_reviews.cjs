const fs = require('fs');
let code = fs.readFileSync('src/pages/TemplateDetails.tsx', 'utf-8');

const target = `    const fetchReviews = async () => {
      if (!id) return;
      try {
        const q = query(collection(db, 'template_reviews'), where('templateId', '==', id), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error fetching reviews", error);
      }
    };`;

const replacement = `    const fetchReviews = async () => {
      if (!id) return;
      try {
        const q = query(collection(db, 'template_reviews'), where('templateId', '==', id));
        const snap = await getDocs(q);
        const fetchedReviews = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        fetchedReviews.sort((a: any, b: any) => {
          const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
          const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
          return bTime - aTime;
        });
        setReviews(fetchedReviews);
      } catch (error) {
        console.error("Error fetching reviews", error);
      }
    };`;

code = code.replace(target, replacement);

// Remove orderBy from imports if it's not used elsewhere. It is used elsewhere? Let's check later, but removing it from the query fixes the issue.

fs.writeFileSync('src/pages/TemplateDetails.tsx', code);
