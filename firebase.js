import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAezv9V3COAhPYm6fbqoaDK7Q8FjcWMhL0",
    authDomain: "loginauth222.firebaseapp.com",
    projectId: "loginauth222",
    storageBucket: "loginauth222.appspot.com",
    messagingSenderId: "499199839720",
    appId: "1:499199839720:web:26d3c252705e23ec92285d"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
