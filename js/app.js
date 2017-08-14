var activeSelect = {
  paintType:"exponential",
  paintProperty:"Polsby-Pop",
  paintStops:[[.15, '#e66101'],[.3, '#fdb863'],[.41, '#f7f7f7'],[.52, '#b2abd2'], [.75, '#5e3c99']],
  geography:"Con",
  year:2012,
  name:"COUNTYNAME"
};

var layersArray = []; // at 0.22.0 you can no longer have undefined layers in array - must push them dynamically

var zoomThreshold = 8;

var markerHeight = 30, markerRadius = 10, linearOffset = 5;
var popupOffsets = {
 'top': [0, 0],
 'top-left': [0,0],
 'top-right': [0,0],
 'bottom': [0, 0],
 'bottom-left': [linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
 'bottom-right': [-linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
 'left': [markerRadius, (markerHeight - markerRadius) * -1],
 'right': [-markerRadius, (markerHeight - markerRadius) * -1]
 };

var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        anchor:'bottom-left',
        offset:popupOffsets
    });

function initialize(){

  if ($( window ).width() < 620){
    $("#map").height('500px');
  } else{
    $("#map").height('800px');
  }
  
  southWest = new mapboxgl.LngLat( -104.7140625, 41.86956);
  northEast = new mapboxgl.LngLat( -84.202832, 50.1487464);
  bounds = new mapboxgl.LngLatBounds(southWest,northEast);

  // mapboxgl.accessToken = 'Your Mapbox access token';
  mapboxgl.accessToken = 'pk.eyJ1IjoibWdnZyIsImEiOiJjajY2cWw0ODUyaHI2MnFwOGl0bmdtMGowIn0.PLDk2t2DUJ87obtje8Ce_g';

  map = new mapboxgl.Map({
    container: 'map', // container id
    // style: 'mapbox://styles/mapbox/dark-v9',
    style: 'mapbox://styles/mggg/cj66qmslq7fh82ss33qbqlxoc',
    center: [-93.6678,46.50],
    maxBounds:bounds,   
    zoom: 6,
    minZoom: 6
  });

  var nav = new mapboxgl.NavigationControl({position: 'top-right'}); // position is optional
  map.addControl(nav);

  map.on('load', function () {
    // add vector source:
    map.addSource('mnleg_cng', {
        type: 'vector',
        url: 'mapbox://mggg.cj689nea60dqo2qryo5m6zsj4-0z2dc'
    });

    var layers = [
        //create layers array to load multiple layers
        //see https://www.mapbox.com/mapbox-gl-js/style-spec/#layers-fill            
        [
          activeSelect.geography,                   //layers[0] = id
          'fill',                                   //layer[1]            
          ['all', ['==', 'Year', 2012], ["==", "FeatType", activeSelect.geography]],  //layers[2] = filter
          { "fill-color": {                          //layers[3] = paint object
              "type":activeSelect.paintType,
              "property": activeSelect.paintProperty,
              "stops": activeSelect.paintStops
              }, 
            "fill-outline-color": "#fff",
            "fill-opacity":0.75
          }],
            //create {layer}-highlighted layer to toggle selected districts in app
        [activeSelect.geography+"-highlighted", 'fill',["in", "District", ""],{"fill-color": '#ff6600',"fill-outline-color": "#fff","fill-opacity":1}]]      

        layers.forEach(addLayer);

        // Create a popup, but don't add it to the map yet.
    
  });//end map on load
} //end initialize

function addLayer(layer) {             
           map.addLayer({
            "id": layer[0] +'-'+ activeSelect.year, //layer names take the form: geography-year, ex: cng-2012
            "type": layer[1],
            "source": "mnleg_cng",
            "source-layer": "final", //layer name in studio
            'filter': layer[2],
            "layout": {},
            "paint": layer[3],
           }, 'waterway-label'); //place above this layer (within mapbox://styles/mggg/cj66qmslq7fh82ss33qbqlxoc basemap style)

           layersArray.push(layer[0] +'-'+ activeSelect.year);           
};

//remove layersArray element per 0.22.0
function spliceArray(a){
  var index = layersArray.indexOf(a);    // <-- Not supported in <IE9
  if (index !== -1) {
      layersArray.splice(index, 1);
  }
}

function mapResults(feature){
  // console.log(feature.layer.id)
  switch (feature.layer.id) {
      case activeSelect.geography+"-"+activeSelect.year:
          map.setFilter(activeSelect.geography+"-"+activeSelect.year, ['all', ['==', 'Year', activeSelect.year], ['==', 'FeatType', activeSelect.geography],["!=", "District",feature.properties.District]]);
          map.setFilter(activeSelect.geography+"-highlighted-"+activeSelect.year, ['all', ['==', 'Year', activeSelect.year], ['==', 'FeatType', activeSelect.geography],["==", "District",feature.properties.District]]);
          break;
      case activeSelect.geography+"-highlighted-"+activeSelect.year:
          break;
    }
}

function showResults(activeSelect, featureProperties){
  // console.log(activeSelect)
  var content = '';
  var header ='';
  var district = '';

  var data = {
    // activeTab:activeSelect.selection,
    geography:activeSelect.geography
  };
  
  header += "<h5>Results</h5>";

  for (attributes in featureProperties){
    if( attributes.match(/MNSENDIST/gi) || attributes.match(/OBJECTID/gi) || attributes.match(/Shape_Area/gi) || attributes.match(/Shape_Leng/gi) || attributes.match(/SENDIST/gi) || attributes.match(/memid/gi) || attributes.match(/name/gi) || attributes.match(/party/gi)){
      content += "";
    }else{
      // console.log(attributes, featureProperties[attributes])
      content += "<tr><th>"+attributes+":</th><td>"+featureProperties[attributes]+"</td></tr>"
    }   
  }

  $("#results").html(content);
}

function removeLayers(c){

  switch (c){
    case'all':
        map.setFilter(activeSelect.geography+"-"+activeSelect.year, ['all', ['==', 'Year', activeSelect.year], ['==', 'FeatType', activeSelect.geography]]);
        map.setFilter(activeSelect.geography+"-highlighted-"+activeSelect.year, ['all', ['==', 'Year', activeSelect.year], ['==', 'FeatType', activeSelect.geography], ["in", "District", ""]])

        $('#results').html("");
        $('#clear').hide(); 
    break;    
  }    
}

function setPopupHtml(feature){
  switch (feature.properties.FeatType){
    case'Con':
        return feature.properties.Year + ' Congressional District: ' + feature.properties.District +"<br><i> Click for details</i>"
    break;
    case'Sen':
        return feature.properties.Year + ' Minnesota Senate District: ' + feature.properties.District
    break;
    case'Hos':
        return feature.properties.Year + ' Minnesota House District: ' + feature.properties.District
    break; 
  }
  
}

