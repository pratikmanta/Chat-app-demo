/* Configuration file for firebase  */

import * as firebase from 'firebase';
import 'firebase/firestore';

// Create firebase account and provide details to test application
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

export const initializeFirebase = () => {
    if (firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
    }

    return firebase.firestore();
};



