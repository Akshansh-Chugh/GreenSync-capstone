document.addEventListener('DOMContentLoaded', async () => {

    // ===== AUTH CHECK =====
    if (sessionStorage.getItem('loggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // ===== GET POT FROM URL =====
    const params = new URLSearchParams(window.location.search);
    const potId = parseInt(params.get('id'));

    const potsData = JSON.parse(sessionStorage.getItem('potsData'));
    const pot = potsData ? potsData.find(p => p.id === potId) : null;

    if (!pot) {
        document.getElementById('potName').textContent = 'Plant not found!';
        return;
    }

    // ===== HEADER =====
    document.getElementById('potName').textContent = pot.name;
    document.getElementById('potIcon').textContent = pot.icon;

    // ===== MULTI-CHANNEL CONFIG =====
    const channels = {
        1: { id: "3326569", key: "FQ88DHPIYPBM0K5G" },   // Plant 1
        2: { id: "3326799", key: "WPE2AR31WEIEXDBP" },   // Plant 2
        3: { id: "3326801", key: "4SV3UULARIGKJWHS" },   // Plant 3
        4: { id: "3326569", key: "FQ88DHPIYPBM0K5G" }    // Plant 4 (reuse)
    };

    const selected = channels[potId];
    const channelId = selected.id;
    const apiKey = selected.key;

    // ===== FETCH LATEST DATA =====
    async function fetchLatestData() {
        const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=1`;

        try {
            const res = await fetch(url);
            const data = await res.json();
            const feed = data.feeds[0];

            return {
                temp: feed.field1 || '--',
                moisture: feed.field2 || '--',
                humidity: feed.field3 || '--',
                nitrogen: feed.field4 || 0,
                phosphorus: feed.field5 || 0,
                potassium: feed.field6 || 0
            };

        } catch (err) {
            console.error("ThingSpeak Error:", err);
            return null;
        }
    }

    // ===== FETCH CHART DATA =====
    async function fetchChartData() {
        const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=7`;

        try {
            const res = await fetch(url);
            const data = await res.json();

            return {
                labels: data.feeds.map(f =>
                    new Date(f.created_at).toLocaleDateString()
                ),
                moisture: data.feeds.map(f => f.field2),
                temp: data.feeds.map(f => f.field1),
                humidity: data.feeds.map(f => f.field3)
            };

        } catch (err) {
            console.error("Chart fetch error:", err);
            return null;
        }
    }

    // ===== UPDATE UI =====
    async function updateUI() {
        const data = await fetchLatestData();
        if (!data) return;

        document.getElementById('temp').textContent = data.temp + '°C';
        document.getElementById('moisture').textContent = data.moisture + '%';
        document.getElementById('humidity').textContent = data.humidity + '%';

        document.getElementById('npkN').textContent = data.nitrogen + '%';
        document.getElementById('npkP').textContent = data.phosphorus + '%';
        document.getElementById('npkK').textContent = data.potassium + '%';

        document.getElementById('npkNBar').style.width = data.nitrogen + '%';
        document.getElementById('npkPBar').style.width = data.phosphorus + '%';
        document.getElementById('npkKBar').style.width = data.potassium + '%';
    }

    // ===== CHART SETUP =====
    let chart;

    async function initChart() {
        const chartData = await fetchChartData();
        if (!chartData) return;

        const ctx = document.getElementById('sensorChart').getContext('2d');

        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: 'Moisture (%)',
                        data: chartData.moisture,
                        borderColor: 'hsl(200, 80%, 50%)',
                        backgroundColor: 'hsla(200, 80%, 50%, 0.1)',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Temperature (°C)',
                        data: chartData.temp,
                        borderColor: 'hsl(15, 90%, 55%)',
                        backgroundColor: 'hsla(15, 90%, 55%, 0.1)',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Humidity (%)',
                        data: chartData.humidity,
                        borderColor: 'hsl(270, 60%, 55%)',
                        backgroundColor: 'hsla(270, 60%, 55%, 0.1)',
                        fill: true,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true
            }
        });
    }

    async function updateChart() {
        const chartData = await fetchChartData();
        if (!chartData || !chart) return;

        chart.data.labels = chartData.labels;
        chart.data.datasets[0].data = chartData.moisture;
        chart.data.datasets[1].data = chartData.temp;
        chart.data.datasets[2].data = chartData.humidity;

        chart.update();
    }

    // ===== AUTO WATER TOGGLE =====
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

    // ===== WATER PUMP BUTTON =====
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

    // ===== INITIAL LOAD =====
    await updateUI();
    await initChart();

    // ===== AUTO REFRESH =====
    setInterval(() => {
        updateUI();
        updateChart();
    }, 5000);

});