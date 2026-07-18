import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC-y16RyMOBx8v51HOqEjM6V1uEuxbP-6M",
  authDomain: "the-english-institute.firebaseapp.com",
  projectId: "the-english-institute",
  storageBucket: "the-english-institute.firebasestorage.app",
  messagingSenderId: "292163687236",
  appId: "1:292163687236:web:424d89276ab8be9116bd11",
  measurementId: "G-91FC6DEF74"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(collection(db, "content", "template_categories", "items"));
  let idx = 1;
  for (const d of snap.docs) {
    await updateDoc(doc(db, "content", "template_categories", "items", d.id), {
      order: idx++
    });
    console.log(`Updated ${d.id} to order ${idx - 1}`);
  }
  console.log("Done fixing orders");
  process.exit(0);
}
run();
