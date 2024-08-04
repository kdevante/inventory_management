// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB9ifPpnOjg2kWqkxAPvAs4xXZBX4Vode0",
    authDomain: "inventory-management-afdb1.firebaseapp.com",
    projectId: "inventory-management-afdb1",
    storageBucket: "inventory-management-afdb1.appspot.com",
    messagingSenderId: "1090664194478",
    appId: "1:1090664194478:web:9a1014965a55fb6d7da83f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

const signUpWithEmail = async (email, password, name) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store additional user information in Firestore
        await setDoc(doc(firestore, "users", user.uid), {
            name: name,
            email: email
        });
    } catch (error) {
        console.error("Error signing up:", error);
    }
};

const signInWithEmail = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("Error signing in:", error);
    }
};

const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user already exists in Firestore
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (!userDoc.exists()) {
            // If not, create a new document
            await setDoc(doc(firestore, "users", user.uid), {
                name: user.displayName,
                email: user.email
            });
        }
    } catch (error) {
        console.error("Error signing in with Google:", error);
    }
};

const signOutUser = async () => {
    try {
        await signOut(auth);
        router.push('./auth');
    } catch (error) {
        console.error("Error signing out:", error);
    }
};

export { firestore, auth, signUpWithEmail, signInWithEmail, signInWithGoogle, signOutUser };
