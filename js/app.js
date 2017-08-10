var activeTab = {
  selection:"USPRS",
  geography:"cty",
  name:"COUNTYNAME"
};

function initialize(){
	$("#map").height('800px');
	southWest = new mapboxgl.LngLat( -104.7140625, 41.86956);
    northEast = new mapboxgl.LngLat( -84.202832, 50.1487464);
    //bounds = new mapboxgl.LngLatBounds(southWest, northEast);
    bounds = new mapboxgl.LngLatBounds(southWest,northEast);

    // mapboxgl.accessToken = 'Your Mapbox access token';
    mapboxgl.accessToken = 'pk.eyJ1IjoiY2NhbnRleSIsImEiOiJjaWVsdDNubmEwMGU3czNtNDRyNjRpdTVqIn0.yFaW4Ty6VE3GHkrDvdbW6g';

	map = new mapboxgl.Map({
		container: 'map', // container id
		style: 'mapbox://styles/mapbox/light-v9',
		center: [-93.6678,46.50],
		maxBounds:bounds,		
		zoom: 6
	});

    var nav = new mapboxgl.NavigationControl({position: 'top-right'}); // position is optional
    map.addControl(nav);
    // geocoder = new google.maps.Geocoder;
}