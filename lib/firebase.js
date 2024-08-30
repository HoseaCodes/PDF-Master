import { getApp, getApps, initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, GithubAuthProvider, EmailAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Analytics, getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const GoogleProvider = new GoogleAuthProvider();
export const GithubProvider = new GithubAuthProvider();
export const EmailProvider = new EmailAuthProvider();
export const storage = getStorage(app);

let analytics;

if (typeof window != undefined) {
    analytics = isSupported().then((yes) =>
        yes ? getAnalytics(app) : null
    );
}

export const initFirebase = () => {
    return app;
};

export { analytics, ref as storageRef, uploadBytes, getDownloadURL };

export const uploadPDF2Firebase = async (uploadPDF2Firebase) => {
    pdfFiles.forEach((pdfFile) => {
        try {
            if (pdfFile) {
                setLoading(true);
                const pdfRef = ref(storage, `pdfs/${pdfFile.name}`);
                uploadBytes(pdfRef, pdfFile)
                    .then((snapshot) => {
                        console.log("Uploaded a blob or file!");
                        console.log({ snapshot });
                    })
                    .then(() => {
                        getDownloadURL(pdfRef)
                            .then(async (url) => {
                                console.log({ url });
                                setLoading(false);
                                setUploadedFile(true);
                            })
                            .catch((error) => {
                                console.log("Error getting download URL", error);
                                switch (error.code) {
                                    case "storage/object-not-found":
                                        break;
                                    case "storage/unauthorized":
                                        break;
                                    case "storage/canceled":
                                        break;
                                    case "storage/unknown":
                                        break;
                                }
                            });
                    });
            } else {
                console.log("No PDF file selected");
            }
        } catch (error) {
            console.error("Error uploading PDF file", error);
        }
    });
}