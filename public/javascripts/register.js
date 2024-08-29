
document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    // Show the spinner while the request is being processed
    document.getElementById('spinner').style.display = 'block';
    document.getElementById('error-message').style.display = 'none'; // Hide error message if any

    // Collect form data
    const formData = new FormData(this);

    // Send data to the server using Fetch API
    fetch('/register', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Hide the spinner after getting a response
        document.getElementById('spinner').style.display = 'none';

        if (data.error) {
            // Display the error message
            document.getElementById('error-message').innerText = data.error;
            document.getElementById('error-message').style.display = 'block';
        } else if (data.success) {
            // Handle success, e.g., redirect to another page
            alert('Registration successful!');
            window.location.href = '/success'; // Redirect to a success page
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('spinner').style.display = 'none';
        document.getElementById('error-message').innerText = 'An unexpected error occurred. Please try again.';
        document.getElementById('error-message').style.display = 'block';
    });
});

