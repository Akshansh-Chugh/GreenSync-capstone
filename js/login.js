document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const potsData = [
            {
                id: 1,
                name: 'Living Room Fiddle Leaf',
                icon: '🌳',
                temp: 24,
                moisture: 48,
                humidity: 55,
                nitrogen: 42,
                phosphorus: 35,
                potassium: 50,
                autoWater: true,
                chartLabels: ['Aug 8', 'Aug 9', 'Aug 10', 'Aug 11', 'Aug 12', 'Aug 13', 'Today'],
                chartMoisture: [60, 57, 55, 52, 53, 49, 48],
                chartTemp: [23, 24, 24, 25, 24, 23, 24],
                chartHumidity: [58, 56, 55, 57, 54, 56, 55]
            },
            {
                id: 2,
                name: 'Kitchen Basil',
                icon: '🌿',
                temp: 22,
                moisture: 65,
                humidity: 60,
                nitrogen: 55,
                phosphorus: 48,
                potassium: 42,
                autoWater: false,
                chartLabels: ['Aug 8', 'Aug 9', 'Aug 10', 'Aug 11', 'Aug 12', 'Aug 13', 'Today'],
                chartMoisture: [72, 70, 68, 66, 64, 63, 65],
                chartTemp: [21, 22, 22, 23, 22, 21, 22],
                chartHumidity: [62, 60, 59, 61, 60, 58, 60]
            },
            {
                id: 3,
                name: 'Bedroom Snake Plant',
                icon: '🪴',
                temp: 23,
                moisture: 35,
                humidity: 50,
                nitrogen: 30,
                phosphorus: 28,
                potassium: 38,
                autoWater: true,
                chartLabels: ['Aug 8', 'Aug 9', 'Aug 10', 'Aug 11', 'Aug 12', 'Aug 13', 'Today'],
                chartMoisture: [44, 42, 40, 38, 38, 36, 35],
                chartTemp: [22, 23, 23, 24, 23, 22, 23],
                chartHumidity: [52, 51, 50, 52, 49, 51, 50]
            },
            {
                id: 4,
                name: 'Balcony Tomatoes',
                icon: '🍅',
                temp: 28,
                moisture: 55,
                humidity: 45,
                nitrogen: 60,
                phosphorus: 52,
                potassium: 55,
                autoWater: true,
                chartLabels: ['Aug 8', 'Aug 9', 'Aug 10', 'Aug 11', 'Aug 12', 'Aug 13', 'Today'],
                chartMoisture: [62, 60, 58, 57, 56, 54, 55],
                chartTemp: [27, 28, 29, 28, 27, 28, 28],
                chartHumidity: [48, 46, 45, 47, 44, 46, 45]
            }
        ];

        sessionStorage.setItem('loggedIn', 'true');
        sessionStorage.setItem('potsData', JSON.stringify(potsData));

        window.location.href = 'my-plants.html';
    });
});