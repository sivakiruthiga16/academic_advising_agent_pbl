import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDVlv6wIhhOrDM6_Fp4RR8PSFKmbnac__I",
  authDomain: "academic-advising-agent-new.firebaseapp.com",
  projectId: "academic-advising-agent-new",
  storageBucket: "academic-advising-agent-new.firebasestorage.app",
  messagingSenderId: "981184679604",
  appId: "1:981184679604:web:68806a563ddf59ac5a51e1",
  measurementId: "G-QN0C2PLP2V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Auth and Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { app };