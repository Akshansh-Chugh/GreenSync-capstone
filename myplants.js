document.addEventListener("DOMContentLoaded", () => {

    const potList = document.getElementById("pot-list");

    // Dummy data (later from backend)
    const plants = [
        { id: 1, name: "Aloe Vera" },
        { id: 2, name: "Tulsi" },
        { id: 3, name: "Money Plant" }
    ];

    plants.forEach(plant => {
        const card = document.createElement("div");
        card.className = "metric-card";
        card.innerHTML = `
            <h3>${plant.name}</h3>
            <button onclick="viewPlant(${plant.id})">View Details</button>
        `;
        potList.appendChild(card);
    });

});

// navigation
function viewPlant(id) {
    window.location.href = `potdetail.html?potId=${id}`;
}