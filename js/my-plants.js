document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('loggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    const potsData = JSON.parse(sessionStorage.getItem('potsData'));
    const container = document.getElementById('potList');

    if (!potsData || !container) {
        if (container) container.innerHTML = '<p>Could not load plant data.</p>';
        return;
    }

    function getMoistureStatus(m) {
        if (m < 30) return { label: 'Dry', cls: 'badge-dry' };
        if (m < 50) return { label: 'Low', cls: 'badge-low' };
        return { label: 'Good', cls: 'badge-good' };
    }

    potsData.forEach((pot, index) => {
        const status = getMoistureStatus(pot.moisture);
        const link = document.createElement('a');
        link.href = `pot-detail.html?id=${pot.id}`;
        link.className = 'plant-card';

        link.innerHTML = `
            <div class="card card-hover fade-in fade-in-${Math.min(index + 1, 4)}">
                <div class="card-body">
                    <div class="plant-icon">${pot.icon}</div>
                    <h3>${pot.name}</h3>
                    <span class="badge ${status.cls}">${status.label}</span>
                    <div class="mini-stats">
                        <div class="mini-stat">
                            <div class="mini-stat-icon">🌡️</div>
                            <div class="mini-stat-val">${pot.temp}°C</div>
                        </div>
                        <div class="mini-stat">
                            <div class="mini-stat-icon">💧</div>
                            <div class="mini-stat-val">${pot.moisture}%</div>
                        </div>
                        <div class="mini-stat">
                            <div class="mini-stat-icon">💨</div>
                            <div class="mini-stat-val">${pot.humidity}%</div>
                        </div>
                    </div>
                    ${pot.autoWater ? '<div class="auto-badge"><span class="badge badge-outline">🤖 Auto-Water ON</span></div>' : ''}
                </div>
            </div>
        `;
        container.appendChild(link);
    });
});
