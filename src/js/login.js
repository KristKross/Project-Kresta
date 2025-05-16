document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
        // Send a POST request to the server with the form data
        const response = await fetch("auth/login", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data) 
        });

        const result = await response.json();

        if (result.success) {
            window.location.href = "/";

        } else {
            alert(result.message);
        }

    } catch (error) {
        alert("Error submitting form. Please try again.");
        console.error("Error:", error);
    }
});