import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAP_mvIGNAYEyDKbh-QcUofx3T5ry4wANA",
  authDomain: "paphayom-db.firebaseapp.com",
  databaseURL: "https://paphayom-db-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "paphayom-db",
  storageBucket: "paphayom-db.firebasestorage.app",
  messagingSenderId: "232923484186",
  appId: "1:232923484186:web:131932be1b065016eac1a3",
  measurementId: "G-CE1H014XJ9"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
