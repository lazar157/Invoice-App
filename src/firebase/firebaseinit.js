// Import the individual Firebase services
import { initializeApp } from 'firebase/app';
import { collection, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDdmCjzWcBkl_3FKLJvws76_2RDxQ_3CHE",
    authDomain: "invoice-30c6c.firebaseapp.com",
    projectId: "invoice-30c6c",
    storageBucket: "invoice-30c6c.appspot.com",
    messagingSenderId: "700422462289",
    appId: "1:700422462289:web:79dd4b365f4a426cbb9170"
};

// Initialize Firebase app
const firebaseApp = initializeApp(firebaseConfig);

// Get a Firestore instance
const db = getFirestore(firebaseApp);


export default db;

