mapboxgl.accessToken = mapToken;

if (event.geometry && event.geometry.coordinates) {
    const coordinates = event.geometry.coordinates;
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: coordinates,
        zoom: 9,
    });

    new mapboxgl.Marker()
        .setLngLat(coordinates)
        .addTo(map);
} else {
    console.error('Event coordinates are not defined');
}
