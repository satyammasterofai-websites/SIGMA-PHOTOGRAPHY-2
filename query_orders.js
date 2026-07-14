import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query, orderBy } from 'firebase/firestore';

// Note: can't use this directly since no firebase credentials in environment
// Wait, I can't do this easily.
