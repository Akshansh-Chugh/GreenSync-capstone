document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // GET POT ID FROM URL
    // =========================
    const params = new URLSearchParams(window.location.search);
    const potId = params.get("potId");

    const potName = document.getElementById("pot-detail-name");
    const tempEl = document.getElementById("temp");
    const moistureEl = document.getElementById("moisture");
    const humidityEl = document.getElementById("humidity");

    if (!potId) {
        potName.innerText = "No Plant Selected";
        return;
    }

    // =========================
    // DUMMY DATA (replace with API later)
    // =========================
    const plantData = {
        1: { name: "Aloe Vera", temp: 26, moisture: 45, humidity: 52 },
        2: { name: "Tulsi", temp: 28, moisture: 50, humidity: 55 },
        3: { name: "Money Plant", temp: 27, moisture: 48, humidity: 54 }
    };

    const data = plantData[potId];

    if (!data) {
        potName.innerText = "Plant not found";
        return;
    }

    // =========================
    // UPDATE UI
    // =========================
    potName.innerText = data.name;
    tempEl.innerText = data.temp + " °C";
    moistureEl.innerText = data.moisture + " %";
    humidityEl.innerText = data.humidity + " %";

    // =========================
    // UPDATE CHART
    // =========================
    const ctx = document.getElementById("sensorChart");

    if (ctx && window.Chart) {
        new Chart(ctx, {
            type: "line",
            data: {
                labels: ["12:00", "12:05", "12:10", "12:15"],
                datasets: [
                    {
                        label: "Temperature",
                        data: [data.temp - 2, data.temp - 1, data.temp, data.temp + 1],
                        borderColor: "#43ea7f"
                    },
                    {
                        label: "Moisture",
                        data: [data.moisture - 2, data.moisture, data.moisture - 1, data.moisture + 2],
                        borderColor: "#2e7d32"
                    },
                    {
                        label: "Humidity",
                        data: [data.humidity - 1, data.humidity, data.humidity + 1, data.humidity + 2],
                        borderColor: "#8bc34a"
                    }
                ]
            },
            options: {
                responsive: true
            }
        });
    }

    // =========================
    // PUMP BUTTON (dummy action)
    // =========================
    const pumpBtn = document.getElementById("water-pump-btn");

    if (pumpBtn) {
        pumpBtn.addEventListener("click", () => {
            alert(`Water pump activated for ${data.name} 💧`);
        });
    }

});