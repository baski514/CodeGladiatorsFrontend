import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FBASE_API_KEY,
    authDomain: process.env.REACT_APP_FBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FBASE_PROJECTID,
    storageBucket: process.env.REACT_APP_FBASE_ST_BUCKET,
    messagingSenderId: process.env.REACT_APP_FBASE_MESSAGE_SENDER_ID,
    appId: process.env.REACT_APP_FBASE_APPID,
    measurementId: process.env.REACT_APP_FBASE_MEASUREMENTID,
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.firestore().settings({ timestampsInSnapshots: true });
//firebase.analytics();
const storage = firebase.storage();
export { storage, firebase };