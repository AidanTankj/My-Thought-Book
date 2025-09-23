const newEntryForm = document.getElementById('new-entry-form');

newEntryForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const title = document.getElementById('entry-title').value;
    const content = document.getElementById('entry-content').value;

    if (title.trim() === '' && content.trim() === '') {
        console.log('Cannot save an empty entry.');
        return;
    }

    console.log('Form Submitted!');
    console.log('Title:', title);
    console.log('Content:', content);

});