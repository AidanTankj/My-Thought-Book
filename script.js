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