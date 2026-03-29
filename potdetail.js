document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);
    const potId = params.get("potId");

    const potName = document.getElementById("pot-detail-name");
    const tempEl = document.getElementById("temp");
    const moistureEl = document.getElementById("moisture");
    const humidityEl = document.getElementById("humidity");

    const plantData = {
        1: { name: "Aloe Vera", temp: 26, moisture: 45, humidity: 52 },
        2: { name: "Tulsi", temp: 28, moisture: 50, humidity: 55 },
        3: { name: "Money Plant", temp: 27, moisture: 48, humidity: 54 }
    };

    const data = plantData[potId];

    if (!data) return;

    potName.innerText = data.name;
    tempEl.innerText = data.temp + " °C";
    moistureEl.innerText = data.moisture + " %";
    humidityEl.innerText = data.humidity + " %";

    const ctx = document.getElementById("sensorChart");

    if (ctx && window.Chart) {
        new Chart(ctx, {
            type: "line",
            data: {
                labels: ["12:00", "12:05", "12:10", "12:15"],
                datasets: [
                    {
                        label: "Temperature",
                        data: [24, 25, 26, 27],
                        borderColor: "#43ea7f"
                    },
                    {
                        label: "Moisture",
                        data: [43, 45, 44, 46],
                        borderColor: "#2e7d32"
                    },
                    {
                        label: "Humidity",
                        data: [50, 52, 53, 54],
                        borderColor: "#8bc34a"
                    }
                ]
            },
            options: {
                responsive: true
            }
        });
    }

    const pumpBtn = document.getElementById("water-pump-btn");

    if (pumpBtn) {
        pumpBtn.addEventListener("click", () => {
            alert("Water Pump Activated 💧");
        });
    }

});