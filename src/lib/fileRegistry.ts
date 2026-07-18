import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function isFileNameDuplicate(fileName: string): Promise<boolean> {
  try {
    const q = query(collection(db, 'uploaded_files'), where('name', '==', (fileName || '').toLowerCase().trim()));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    if (error.code !== 'permission-denied') console.error("Error checking file name:", error);
    return false;
  }
}

export async function registerFileName(fileName: string): Promise<void> {
  try {
    await addDoc(collection(db, 'uploaded_files'), {
      name: (fileName || '').toLowerCase().trim(),
      timestamp: Date.now()
    });
  } catch (error) {
    if (error.code !== 'permission-denied') console.error("Error registering file name:", error);
  }
}
