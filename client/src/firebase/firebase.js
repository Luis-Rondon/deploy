import app from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';
import { getMessaging, getToken, onMessage } from "firebase";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY_FIREBASE,
  authDomain: process.env.REACT_APP_API_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_API_DATABASE_URL,
  projectId: process.env.REACT_APP_API_PROJECT_ID,
  storageBucket: process.env.REACT_APP_API_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_API_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_API_APP_ID,
  measurementId: process.env.REACT_APP_API_MEASUREMENT_ID,
};

class Firebase {
  constructor() {
    app.initializeApp(firebaseConfig);
    this.db = app.firestore();
    this.firestore = app.firestore;
    this.auth = app.auth();
    this.storage = app.storage();
    this.messaging = app.messaging()
  }

  estaIniciado() {
    return new Promise((resolve) => {
      this.auth.onAuthStateChanged(resolve);
    });
  }

    getToken = (setTokenFound) => {
    return this.messaging.getToken(this.messaging, {vapidKey: 'BIIItkJYblGez-K9nheffystZC9Fe-oQBeO9EAiMqTc8FcLDn-eC0vWF3fNFriejON-PNWGlqr-eIvB9ORR4SeM'}).then((currentToken) => {
      if (currentToken) {
        console.log('current token for client: ', currentToken);
        setTokenFound && setTokenFound(true);
        // Track the token -> client mapping, by sending to backend server
        return currentToken
        // show on the UI that permission is secured
      } else {
        console.log('No registration token available. Request permission to generate one.');
        setTokenFound(false);
        // shows on the UI that permission is required 
      }
    }).catch((err) => {
      console.log('An error occurred while retrieving token. ', err);
      // catch error while creating client token
    });
  }

  onMessageListener = () => {
    let self = this
     return new Promise((resolve) => {
       console.log("oml", onMessage, self.messaging.onMessage)
        self.messaging.onMessage((payload) => {
          resolve(payload);
        });
    });
  }
}

export const newFirebase = new Firebase();

export default Firebase;
