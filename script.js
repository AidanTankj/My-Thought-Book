import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
apiKey: "AIzaSyDBQ_WmZa1MPgzrObdockTMD6eL4zy12Ww",
authDomain: "my-thought-book.firebaseapp.com",
databaseURL: "https://my-thought-book-default-rtdb.asia-southeast1.firebasedatabase.app",
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
const logEntriesList = document.getElementById('log-entries-list');
let currentUserId = null;

const fullEntryModal = document.getElementById('full-entry-modal');
const editableModalTitle = document.getElementById('editable-modal-title');
const editableModalContent = document.getElementById('editable-modal-content');
const modalCloseBtn = document.getElementById('modal-close-btn');
const containerCard = document.getElementById('container-card');
const contentInput = document.getElementById('entry-content'); 
const formButtons = document.getElementById('form-buttons');
const modalContentContainer = document.getElementById('modal-content-container');

// Listen for authentication state changes.
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in. 
        currentUserId = user.uid;
        console.log("Authentication state changed. User ID:", currentUserId);
        
        // Listens for existing log entries
        const q = query(collection(db, `users/${currentUserId}/log_entries`), orderBy("timestamp", "desc"));
        
        onSnapshot(q, async (snapshot) => {
            const entries = [];
            await snapshot.forEach((doc) => {
                entries.push({ id: doc.id, ...doc.data() });
            });
            console.log("Retrieved new data:", entries);
            renderEntries(entries);
            setTimeout(1000);
            renderLoading();
            
            if (snapshot.empty) {
                console.log("No entries found.");
                logEntriesList.innerHTML = `
                    <p class="text-center text-gray-400">Your mind is empty. Create a thought above.</p>
                `;
            } 
        });

    } else {
        // User is signed out. Anonymous sign-in.
        signInAnonymously(auth).then(() => {
            console.log("Signed in anonymously.");
        }).catch((error) => {
            console.error("Anonymous sign-in failed:", error);
        });
    }
});

$(document).ready(function() {
    $('#editable-modal-content').summernote({
        placeholder: 'Start editing your thought...',
        tabsize: 2,
        height: 250,
        toolbar: [
            ['style', ['style', 'bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
            ['lists', ['ul']],
            ['insert', ['picture']],
            ['fontname', ['fontname']],
            ['fontsize', ['fontsize']],
            ['color', ['color']],

        ],
        keyMap: {
            pc: {
                'ENTER': 'insertLineBreak' 
            },
            mac: {
                'ENTER': 'insertLineBreak'
            }
        },
        callbacks: {
            onChange: function(contents, $editable) {
                // Manually trigger the autosave logic for the content field
                const docId = editableModalTitle.dataset.id;
                
                // save only if the modal is currently open and we have an ID
                if (docId && !fullEntryModal.classList.contains('hidden')) {
                     autoSaveEntry(docId, 'content', contents);
                }
            }
        }
    });
});



// Function to handle loading screen and reveal content
const renderLoading = async () => {
    const userContent = document.getElementById('user-content');
    const loadingContainer = document.getElementById('loading-container');

    loadingContainer.style.opacity = 0;
    await new Promise(resolve => setTimeout(resolve, 600)); // Wait for the fade-out transition
    loadingContainer.classList.add('hidden');
    userContent.classList.remove('hidden');

}

const renderEntries = (entries) => {
    logEntriesList.innerHTML = '';
    entries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.dataset.id = entry.id;
        entryDiv.dataset.title = entry.title; 
        entryDiv.dataset.content = entry.content;
        entryDiv.className = 'entry-card shadow-sm space-y-2';

        const docContent = entry.content || ''; 
        const plainTextPreview = docContent.replace(/<[^>]*>/g, '').substring(0, 50) + (docContent.length > 50 ? '...' : '');

        entryDiv.innerHTML = `
            <h3 class="text-lg font-semibold text-gray-800">${entry.title}</h3>
            <p class="text-sm text-gray-600 truncate max-h-[22px]">${plainTextPreview}</p>
            <span class="text-xs text-gray-400 block">${new Date(entry.timestamp.seconds * 1000).toLocaleString()}</span>
        `;
        logEntriesList.appendChild(entryDiv);
    });
};

newEntryForm.addEventListener('click', async (event) => {

    containerCard.classList.remove('max-h-38', 'overflow-hidden');
    containerCard.classList.add('max-h-full', 'is-expanded');
    contentInput.classList.remove('hidden');
    formButtons.classList.remove('hidden');

});

const autoSaveEntry = async (docId, field, value) => {
    if (!currentUserId || !docId) return;

    // Use computed property names to set the field dynamically: 
    // { title: 'new value' } or { content: 'new value' }
    const updateData = {
        [field]: value
    };

    try {
        // Create a reference to the specific document
        const docRef = doc(db, `users/${currentUserId}/log_entries`, docId);
        
        // Update the document in Firestore
        await updateDoc(docRef, updateData);
        console.log(`Autosaved field ${field} for entry ${docId}`);
    } catch (error) {
        console.error("Error during autosave:", error);
    }
};

logEntriesList.addEventListener('click', async (event) => {
    const entryCard = event.target.closest('.entry-card');
    if (entryCard) {
        editableModalTitle.value = entryCard.dataset.title;
        if ($('#editable-modal-content').data('summernote')) {
            $('#editable-modal-content').summernote('code', entryCard.dataset.content);
        } else {
            // Fallback for the initial load if Summernote isn't ready
            editableModalContent.value = entryCard.dataset.content;
        }
        editableModalTitle.dataset.id = entryCard.dataset.id; // Store the document ID for autosave
        fullEntryModal.classList.remove('hidden');
        fullEntryModal.style.opacity = 100;
    }
});

editableModalTitle.addEventListener('input', (event) => {
    const docId = editableModalTitle.dataset.id;
    console.log('Document ID for title autosave:', docId);
    autoSaveEntry(docId, 'title', event.target.value);
});


// Function to handle saving the entry to Firestore
const saveEntry = async (entryData) => {
    if (!currentUserId) {
        console.error("Cannot save entry: No authenticated user.");
        return;
    }

    try {
        // 'log_entries' as the collection name. 
        const collectionRef = collection(db, `users/${currentUserId}/log_entries`);
        await addDoc(collectionRef, entryData);
        console.log("Entry saved successfully.");
        
    } catch (error) {
        console.error("Error saving entry:", error);
    }
};


// Add an event listener to the form's 'submit' event
// (async, await) Requires both to make code wait
newEntryForm.addEventListener('submit', async (event) => {
    // Prevent the browser from refreshing the page when submit button pressed
    event.preventDefault();

    // Get values from the form
    const title = document.getElementById('entry-title').value;
    const content = document.getElementById('entry-content').value;

    // Check to ensure non-empty submission
    if (title.trim() === '' && content.trim() === '') {
        console.log('Cannot save an empty entry.');
        return;
    }

    const entryData = {
        title: title,
        content: content,
        timestamp: new Date()
    };

    await saveEntry(entryData);
    newEntryForm.reset();

    console.log('Form Submitted!');
    console.log('Title:', title);
    console.log('Content:', content);

});

modalCloseBtn.addEventListener('click', () => {
    fullEntryModal.classList.add('hidden');
    console.log('Modal closed.');
});

// Listener for clicks outside the entry card to collapse it
document.addEventListener('click', (event) => {
    if (containerCard.classList.contains('is-expanded')) {
        const isClickInsideCard = event.target.closest('#container-card');

        if (!isClickInsideCard) {
            contentInput.classList.add('hidden');
            formButtons.classList.add('hidden');
            containerCard.classList.add('max-h-38', 'overflow-hidden');
            containerCard.classList.remove('max-w-full', 'is-expanded');
        }
    } 
});

fullEntryModal.addEventListener('click', async (event) => {
    if (!fullEntryModal.classList.contains('hidden')) {
        const isClickInsideModal = event.target.closest('#modal-content-container');
        if (!isClickInsideModal) {
            fullEntryModal.style.opacity = 0;
            await new Promise(resolve => setTimeout(resolve, 200));
            fullEntryModal.classList.add('hidden');
        }
    }
});