document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('loggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const potId = parseInt(params.get('id'));
    const potsData = JSON.parse(sessionStorage.getItem('potsData'));
    const pot = potsData ? potsData.find(p => p.id === potId) : null;

    if (!pot) {
        document.getElementById('potName').textContent = 'Plant not found!';
        return;
    }

    // Populate header
    document.getElementById('potName').textContent = pot.name;
    document.getElementById('potIcon').textContent = pot.icon;

    // Populate metrics
    document.getElementById('temp').textContent = pot.temp + '°C';
    document.getElementById('moisture').textContent = pot.moisture + '%';
    document.getElementById('humidity').textContent = pot.humidity + '%';

    // Populate NPK bars
    document.getElementById('npkN').textContent = pot.nitrogen + '%';
    document.getElementById('npkP').textContent = pot.phosphorus + '%';
    document.getElementById('npkK').textContent = pot.potassium + '%';
    setTimeout(() => {
        document.getElementById('npkNBar').style.width = pot.nitrogen + '%';
        document.getElementById('npkPBar').style.width = pot.phosphorus + '%';
        document.getElementById('npkKBar').style.width = pot.potassium + '%';
    }, 100);

    // Auto-water toggle
    const toggle = document.getElementById('autoWaterToggle');
    const statusText = document.getElementById('autoWaterStatus');
    const badge = document.getElementById('autoWaterBadge');

    toggle.checked = pot.autoWater;
    updateAutoWaterUI();

    toggle.addEventListener('change', updateAutoWaterUI);

    function updateAutoWaterUI() {
        if (toggle.checked) {
            statusText.textContent = 'AI will water automatically based on sensor data';
            badge.style.display = 'inline-flex';
        } else {
            statusText.textContent = 'Manual control only';
            badge.style.display = 'none';
        }
    }

    // Water pump button
    const pumpBtn = document.getElementById('waterPumpBtn');
    pumpBtn.addEventListener('click', () => {
        pumpBtn.disabled = true;
        pumpBtn.textContent = '💧 Pumping...';
        showToast(`Water pump for '${pot.name}' activated!`);
        setTimeout(() => {
            pumpBtn.disabled = false;
            pumpBtn.textContent = '💧 Activate Water Pump';
        }, 3000);
    });

    // Chart
    const ctx = document.getElementById('sensorChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: pot.chartLabels,
            datasets: [
                {
                    label: 'Moisture (%)',
                    data: pot.chartMoisture,
                    borderColor: 'hsl(200, 80%, 50%)',
                    backgroundColor: 'hsla(200, 80%, 50%, 0.1)',
                    fill: true,
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 3
                },
                {
                    label: 'Temperature (°C)',
                    data: pot.chartTemp,
                    borderColor: 'hsl(15, 90%, 55%)',
                    backgroundColor: 'hsla(15, 90%, 55%, 0.1)',
                    fill: true,
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 3
                },
                {
                    label: 'Humidity (%)',
                    data: pot.chartHumidity,
                    borderColor: 'hsl(270, 60%, 55%)',
                    backgroundColor: 'hsla(270, 60%, 55%, 0.1)',
                    fill: true,
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 3
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { font: { family: "'DM Sans', sans-serif", size: 12 } }
                }
            },
            scales: {
                x: { grid: { color: 'hsl(140, 15%, 92%)' }, ticks: { font: { size: 11 } } },
                y: { grid: { color: 'hsl(140, 15%, 92%)' }, ticks: { font: { size: 11 } } }
            }
        }
    });
});
