async function updatePricing(event) {
    event.preventDefault();

    const button = event.target.closest('.select-plan');
    if (!button) {
        console.error("Button not found!");
        return;
    }

    const newTier = button.id;

    try {
        const res = await fetch(`/auth/update-pricing`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ newTier }),
        });

        const data = await res.json();
        console.log(res);

        if (res.ok) {
            location.reload();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Error during fetch:", error);
    }
}

document.querySelectorAll('.select-plan').forEach(button => {
    button.addEventListener('click', updatePricing);
});