// Harita sınırları
const bounds = [
    [33.08652483357065, 37.72727176671455],
    [36.78107953415562, 39.70060944081837],
];

// Harita oluşturma ve ayarları
const map = new maplibregl.Map({
    container: 'map',
    style: 'https://api.maptiler.com/maps/streets/style.json?key=OOlm4RHY7NZMPhfjSJXE',
    center: [34.717948, 38.623372],
    zoom: 0,
    maxBounds: bounds
});

map.on('load', function () {
    fetch('http://127.0.0.1:5000/api/run', methods = ['GET'])
        .then(response => response.json())
        .then(geojson => {
            map.addSource('Depo_points', {
                type: 'geojson',
                data: geojson,
            });

            // İşaretçi görüntüsünü yükle
            map.loadImage('icon.png', function (error, image) {
                if (error) throw error;
                map.addImage('marker', image);

                // İşaretçi katmanını ekle
                map.addLayer({
                    'id': 'markers',
                    'type': 'symbol',
                    'source': 'Depo_points',
                    'layout': {
                        'icon-image': 'marker',
                        'icon-size': 0.7,
                    },
                });

                // İşaretçi tıklama olayını dinle
                map.on('click', 'markers', (e) => {
                    const properties = e.features[0].properties;
                    const coordinates = e.features[0].geometry.coordinates;
                    // description nesnesine erişim sağla
                    const description = JSON.parse(properties.description);

                    const descriptionHTML = `
                    <div>
                        <p><strong>Sira No:</strong> ${description['siraNo']}</p>
                        <p><strong>Deponun Yeri:</strong> ${description['deponunYeri']}</p>
                        <p><strong>Kapasite:</strong> ${description['kapasite']}</p>
                        <p><strong>Depo Sayisi:</strong> ${description['depoSayisi']}</p>
                        <p><strong>Alani:</strong> ${description['alani']}</p>
                        <p><strong>Depolanan Ürün:</strong> ${description['depolananUrun']}</p>
                        <!-- Ekstra bilgileri burada gösterebilirsiniz -->
                    </div>
                `;

                    new maplibregl.Popup()
                        .setLngLat(coordinates)
                        .setHTML(descriptionHTML)
                        .addTo(map);
                });


            });

            map.addControl(new maplibregl.FullscreenControl());
            map.addControl(new maplibregl.NavigationControl());
            map.dragRotate.disable();
        })
    //  .catch(error => console.error('GeoJSON fetch error:', error));

    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');

    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase();

        fetch('http://127.0.0.1:5000/api/run', methods = ['GET'])
            .then(response => response.json())
            .then(geojson => {
                const filteredFeatures = geojson.features.filter(feature =>
                    feature.properties.description.deponunYeri.toLowerCase().includes(searchTerm)
                );

                if (filteredFeatures.length > 0) {
                    const coordinates = filteredFeatures[0].geometry.coordinates;
                    map.flyTo({ center: coordinates, zoom: 12 });
                } else {
                    alert('Aranan veri bulunamadı.');
                }
            })
            .catch(error => console.error('GeoJSON fetch error:', error));
    });
});