function showMessage(message, isError = true) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.className = isError ? 'error-message' : 'error-message success';
    errorDiv.style.display = 'block';
    
    // Remove the auto-hide timeout - message will stay until manually hidden
}

function hideMessage() {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.style.display = 'none';
}

document.getElementById("registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    // Hide any existing messages
    hideMessage();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
        // Send a POST request to the server with the form data
        const response = await fetch("auth/register", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data) 
        });

        const result = await response.json();
        
        if (result.success) {
            showMessage("Registration successful! Redirecting...", false);
            setTimeout(() => {
                window.location.href = "/";
            }, 1000);
        } else {
            showMessage(result.message || "Registration failed. Please try again.");
        }
    } catch (error) {
        showMessage("Error submitting form. Please try again.");
        console.error("Error:", error);
    }
});