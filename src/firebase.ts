import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with actual config provided by user
const firebaseConfig = {
    apiKey: "AIzaSyB65v2075ZIz3hOy8KL5AZ-C-PDg7RbUBg",
    authDomain: "lionel-tools.firebaseapp.com",
    projectId: "lionel-tools",
    storageBucket: "lionel-tools.firebasestorage.app",
    messagingSenderId: "160361172425",
    appId: "1:160361172425:web:63173b4b8712a599ecac18",
    measurementId: "G-QBT2GRZ3DC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
