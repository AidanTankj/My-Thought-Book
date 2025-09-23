import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
apiKey: "AIzaSyDBQ_WmZa1MPgzrObdockTMD6eL4zy12Ww",
authDomain: "my-thought-book.firebaseapp.com",
projectId: "my-thought-book",
storageBucket: "my-thought-book.firebasestorage.app",
messagingSenderId: "352011418068",
appId: "1:352011418068:web:cbbf533b3027d16f37fe41",
measurementId: "G-NPT5D3PG88"
};

// Initialize Firebase and get service references
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


// Get a reference to the form element
const newEntryForm = document.getElementById('new-entry-form');

// Add an event listener to the form's 'submit' event
newEntryForm.addEventListener('submit', (event) => {
    // Prevent the browser from refreshing the page when submit button pressed
    event.preventDefault();

    // Get the values from the form
    const title = document.getElementById('entry-title').value;
    const content = document.getElementById('entry-content').value;

    // Check to ensure non-empty submission
    if (title.trim() === '' && content.trim() === '') {
        console.log('Cannot save an empty entry.');
        return;
    }

    console.log('Form Submitted!');
    console.log('Title:', title);
    console.log('Content:', content);

});