const fixedOTP = '204975'; // Fixed OTP for all users

function openModal() {
    document.getElementById("forgotPasswordModal").style.display = "block";
}

function closeModal() {
    document.getElementById("forgotPasswordModal").style.display = "none";
}

// Close the modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById("forgotPasswordModal");
    if (event.target == modal) {
        closeModal();
    }
}

async function sendOTP() {
    const email = document.getElementById("resetEmail").value;

    // Simulate checking if the email exists in the database
    const response = await fetch('/check-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    });

    const result = await response.json();
    if (response.ok) {
        document.getElementById("message").innerText = 'OTP sent to your email!';
        document.getElementById("otpSection").style.display = "block"; // Show OTP section
        document.getElementById("emailSection").style.display = "none"; // Hide email section
    } else {
        document.getElementById("message").innerText = result.error;
        document.getElementById("message").classList.add('error');
    }
}

function verifyOTP() {
    const otp = document.getElementById("otpInput").value;

    // Check if the OTP is correct
    if (otp === fixedOTP) {
        document.getElementById("message").innerText = 'OTP verified successfully!';
        document.getElementById("passwordSection").style.display = "block"; // Show password section
        document.getElementById("otpSection").style.display = "none"; // Hide OTP section
    } else {
        document.getElementById("message").innerText = 'Invalid OTP!';
        document.getElementById("message").classList.add('error');
    }
}

async function updatePassword() {
    const email = document.getElementById("resetEmail").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Validate new password and confirm password
    if (newPassword !== confirmPassword) {
        document.getElementById("message").innerText = 'Passwords do not match!';
        document.getElementById("message").classList.add('error');
        return;
    }

    if (newPassword.length < 6) {
        document.getElementById("message").innerText = 'Password must be at least 6 characters long!';
        document.getElementById("message").classList.add('error');
        return;
    }

    const response = await fetch('/verify-otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, newPassword })
    });

    const result = await response.json();
    if (response.ok) {
        document.getElementById("message").innerText = result.message;
        // Optionally close the modal after a timeout
        setTimeout(closeModal, 2000);
    } else {
        document.getElementById("message").innerText = result.error;
        document.getElementById("message").classList.add('error');
    }
}
