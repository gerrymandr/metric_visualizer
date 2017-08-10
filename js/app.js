var activeSelect = {
  paintType:"exponential",
  paintProperty:"H18_POP",
  paintStops:[[0, '#ffffcc'],[100, '#a1dab4'],[5000, '#41b6c4'],[15000, '#2c7fb8'], [40000, '#253494']],
  selection:"USREP",
  geography:"cty",
  name:"COUNTYNAME"
};

var layersArray = []; // at 0.22.0 you can no longer have undefined layers in array - must push them dynamically

var zoomThreshold = 8;


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
    mapboxgl.accessToken = 'pk.eyJ1IjoiY2NhbnRleSIsImEiOiJjaWVsdDNubmEwMGU3czNtNDRyNjRpdTVqIn0.yFaW4Ty6VE3GHkrDvdbW6g';

  map = new mapboxgl.Map({
    container: 'map', // container id
    // style: 'mapbox://styles/mapbox/dark-v9',
    style: 'mapbox://styles/ccantey/ciqxtkg700003bqnleojbxy8t',
    center: [-93.6678,46.50],
    maxBounds:bounds,   
    zoom: 6,
    minZoom: 6
  });

    var nav = new mapboxgl.NavigationControl({position: 'top-right'}); // position is optional
    map.addControl(nav);

    // geocoder = new google.maps.Geocoder; //ccantey.dgxr9hbq
    // geocoder = new MapboxGeocoder({
    //     accessToken: mapboxgl.accessToken
    // });
    // window.geocoder = geocoder;

    //map.addControl(geocoder);
	 map.on('load', function () {
      // add vector source:
      map.addSource('TempCNG', {
          type: 'vector',
          url: 'mapbox://mggg.cj66quep22g7q2wq72d9wgku6-6olxj'
      });

   // var paintType = 'categorical';
  //    var paintProperty = 'party';//we'll pull that from dropdown
  //    var paintStops = [['DFL', '#6582ac'],['R', '#cc7575']];

     var layers = [
            //name, minzoom, maxzoom, filter, paint fill-color, stops, paint fill-opacity, stops
            
          [
            'TempCNG',                  //layers[0] = id
            'fill',                          //layer[1]
            ['has','DATA'],             //layers[2] = filter
          {"fill-color": {        //layers[3] = paint object
            "type":activeSelect.paintType,
            "property": activeSelect.paintProperty,
            "stops": activeSelect.paintStops
            }, 
            "fill-outline-color": "#fff",
                  "fill-opacity":0.75
              } /*layers[2] = paint object*/                             
          ]

          , 
            ["TempCNG-highlighted", 'fill',["in", "DATA", ""],{"fill-color": 'brown',"fill-outline-color": "#fff","fill-opacity":1}]
          //   ["TempCNG-stroke", 'line',['has','DATA'],{"line-color": '#fff',"line-width": {"stops":[[3,0.5],[10,1]]}}]           
      ];      

        layers.forEach(addLayer);
  });//end map on load
} //end initialize

function addMarker(e){
   removeLayers('pushpin');

   map.once('zoomend', function(){
       //project latlong to screen pixels for qRF()
       var center = map.project([e.coordinates[0],e.coordinates[1]])      
       var features = map.queryRenderedFeatures(center,{ layers: ["2016results-vtd"] }); //queryRenderedFeatures returns an array
       var feature = (features.length) ? features[0] : '';
       showResults(activeSelect, feature.properties);
       mapResults(feature);
   });

    //add marker
  map.addSource("pointclick", {
      "type": "geojson",
      "data": {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": e.coordinates
        },
        "properties": {
            "title": "mouseclick",
            "marker-symbol": "myMarker-Blue-Shadow"
        }
      }
  });

    map.addLayer({
        "id": "pointclick",
        type: 'symbol',
        source: 'pointclick',
        "layout": {
          "icon-image": "{marker-symbol}",
          "icon-size":1,
          "icon-offset": [0, -13]
        },
        "paint": {}
    });
}

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
      case "TempCNG":
          map.setFilter("TempCNG", ["!=", "DATA",feature.properties.DATA]);
          map.setFilter("TempCNG-highlighted", ["==", "DATA",feature.properties.DATA]);
          break;
      case "TempCNG-highlighted":
          break;
      default:
          map.setFilter("2016results-"+activeTab.geography, ['all', ['==', 'UNIT', activeTab.geography], ["!=", activeTab.name, feature.properties[activeTab.name]]]);
            map.setFilter("2016results-"+activeTab.geography+"-hover", ['all', ['==', 'UNIT', activeTab.geography], ["==", activeTab.name, feature.properties[activeTab.name]]]);
    }
}

function showResults(activeSelect, featureProperties){
  console.log(activeSelect)
  var content = '';
  var header ='';
  var district = '';

  var data = {
    activeTab:activeSelect.selection,
    geography:activeSelect.geography
  };
  
  var attributeMap = {'AsianDisab':"Asian Disabled", "BlackDisab":"Black Disabled","LatinoDisa":"Latino Disabled", 'Native_A_1':"Native American Disabled","WhiteDisab":"White Disabled",
            'FemHHPov':"Female Head Household Poverty",
                        'AsianEmplo':"Asian Employed",'BlackEmplo':"Black Empolyed","LatinoEmpl":"Latino Employed","Native_Ame":"Native American Employed",'WhiteEmplo':"White Emplyed",
                      'MNTaxes':"MN Taxes",'TotalIncom':"Total Income"}
  header += "<h5>Results</h5>";
  content += "<tr><th>Senate District:</th><td>"+featureProperties['DATA']+"</td></tr>"
  content += "<tr><th>Senator:</th><td>"+featureProperties['name']+"</td></tr>"
  // for (attributes in featureProperties){
  //   if( attributes.match(/MNSENDIST/gi) || attributes.match(/OBJECTID/gi) || attributes.match(/Shape_Area/gi) || attributes.match(/Shape_Leng/gi) || attributes.match(/district/gi) || attributes.match(/SENDIST/gi) || attributes.match(/memid/gi) || attributes.match(/name/gi) || attributes.match(/party/gi)){
  //     content += "";
  //   }else{
  //     console.log(attributes, featureProperties[attributes])
  //     content += "<tr><th>"+attributes+":</th><td>"+featureProperties[attributes]+"</td></tr>"
  //   }   
  // }

switch (activeSelect.selection) {
    case "USREP":
          for (attributes in featureProperties){
              if( attributes.match(/MNSENDIST/gi) || attributes.match(/OBJECTID/gi) || attributes.match(/Shape_Area/gi) || attributes.match(/Shape_Leng/gi) || attributes.match(/district/gi) || attributes.match(/SENDIST/gi) || attributes.match(/memid/gi) || attributes.match(/name/gi) || attributes.match(/party/gi)){
                content += "";
              }else{
                console.log(attributes, featureProperties[attributes])
                content += "<tr><th>"+attributes+":</th><td>"+featureProperties[attributes]+"</td></tr>"
              }   
            }
            break;

    // case "MNSEN":
        
    //     data['district'] = feature.MNSENDIST;
    //     content += "<tr>"+geography+"</tr>";
    //     content += "<tr><th>"+unit+" Winner: </th><td class='winner-"+winner+"'>"+winner+" </td></tr>";
    //     content += "<tr><th>Percentage: </th><td class='winner-"+winner+"'>"+percentage.toFixed(1)+"% </td></tr>";
    // for (var i=0;i<partyArray.length;i++){
    //     if(feature[activeTab.selection+partyArray[i]] > 0){
    //       content +="<tr><th>"+partyObject[partyArray[i]]+': </th><td>'+feature[activeTab.selection+partyArray[i]].toLocaleString()+"</td></tr>";
    //     }     
    //   }
    //     content += "<tr><th>Total Votes: </th><td>"+feature[activeTab.selection+'TOTAL'].toLocaleString()+"</td></tr>";
    //     break;
    // case "MNLEG":
    //     $('.td-image').hide();
    //     // $('#thirdwheel').hide();
    //     data['district'] = feature.MNLEGDIST;

    //     if(feature[activeTab.selection+'DIST'] =='32B'){
    //       content += "<tr><td>The Minnesota Supreme Court has determined that a vacancy in nomination exists for Legislative District 32B under Minnesota Statutes 204B.13 due to a candidate being ineligible to hold the office. The Governor has issued a Writ of Special Election which schedules the election for February 14, 2017.</td><tr>";
    //     } else {
    //       content += "<tr>"+geography+"</tr>";
    //       content += "<tr><th>"+unit+" Winner: </th><td class='winner-"+winner+"'>"+winner+" </td></tr>";
    //       content += "<tr><th>Percentage: </th><td class='winner-"+winner+"'>"+percentage.toFixed(1)+"% </td></tr>";
    //   for (var i=0;i<partyArray.length;i++){
    //       if(feature[activeTab.selection+partyArray[i]] > 0){
    //         content +="<tr><th>"+partyObject[partyArray[i]]+': </th><td>'+feature[activeTab.selection+partyArray[i]].toLocaleString()+"</td></tr>";
    //       }     
    //     }
    //       content += "<tr><th>Total Votes: </th><td>"+feature[activeTab.selection+'TOTAL'].toLocaleString()+"</td></tr>";
    //     }
    //     break;
    }

  $("#results").html(content);
  // district += feature.properties.SENDIST
  // content += "<tr><th>Total Votes: </th><td>"+feature[activeSelect.selection+'TOTAL'].toLocaleString()+"</td></tr>";

}

function addLayer(layer) {
             
           map.addLayer({
            "id": layer[0],
            "type": layer[1],
            "source": "TempCNG",
            "source-layer": "MNGD2016", //layer name in studio
            // "minzoom":layer[1],
            // 'maxzoom': layer[2],
            'filter': layer[2],
            "layout": {},
            "paint": layer[3],
           }, 'waterway-label');
           layersArray.push(layer[0])
}; 
