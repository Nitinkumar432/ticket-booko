// Scroll up the form
function scrollUp() {
    document.querySelector('.form-container').scrollBy(0, -50);
}

// Scroll down the form
function scrollDown() {
    document.querySelector('.form-container').scrollBy(0, 50);
}

// Function to close the success popup
function closePopup() {
    document.getElementById('successPopup').classList.add('hidden');
}

// Show success popup when movie is saved
function showSuccessPopup() {
    document.getElementById('successPopup').classList.remove('hidden');
}
