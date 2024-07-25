import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use: https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: window.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: window.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: window.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: window.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: window.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: window.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
//
// window.recaptchaVerifier = new RecaptchaVerifier(auth, 'sign-in-button', {
//     'size': 'invisible',
//     'callback': (response) => {
//         // reCAPTCHA solved, allow signInWithPhoneNumber.
//         // onSignInSubmit();
//         console.log("successful login")
//     }
// });

export { auth }