$( document ).ready(function() {
	//kickoff map logic
    initialize();

    // $('.mapboxgl-ctrl-top-right').affix({
    //   offset: {
    //     top: 210
    //   }
    // });


    $('.election-navigation-a').on('click', function(e){
    	e.preventDefault();
      //remove previous selections map methods give an example of how one would toggle layers
      document.getElementById('features').innerHTML = "";
      // map.removeLayer("2012results-"+ activeTab.geography);
      // map.removeLayer("2012results-"+ activeTab.geography+"-hover");
      // map.setLayoutProperty(activeTab.geography + '-symbols', 'visibility', 'none');
      // map.setLayoutProperty(activeTab.geography + '-lines', 'visibility', 'none');
    	$('.election-navigation-a').removeClass('active');
      
      //add new selections
    	$(this).addClass('active');
    	activeSelect.selection = $(this).data('district');
      activeSelect.geography = $(this).data('geography');
      activeSelect.name = $(this).data('name');
    	console.log(activeSelect);
    })

    $('#dropyear').on('change', function(e){
      e.preventDefault();
      //remove previous selections map methods give an example of how one would toggle layers
      document.getElementById('features').innerHTML = "";
      map.removeLayer(activeSelect.geography+"-"+activeSelect.year);
      map.removeLayer(activeSelect.geography+"-highlighted-"+activeSelect.year);
      spliceArray(activeSelect.geography+"-"+activeSelect.year);
      spliceArray(activeSelect.geography+"-highlighted-"+activeSelect.year);

      activeSelect.year = parseInt($(this).val());
      // ['all', ["in", "DISTRICT", ""], ['==','Year',activeSelect.year]]

        var layer = [
  [activeSelect.geography,'fill', ['==','Year',activeSelect.year],{"fill-color": {"type":activeSelect.paintType,"property": activeSelect.paintProperty,"stops": activeSelect.paintStops}, "fill-outline-color": "#fff","fill-opacity":0.75}],
  [activeSelect.geography+"-highlighted", 'fill',['all', ["in", "DISTRICT", ""], ['==','Year',activeSelect.year]],{"fill-color": 'brown',"fill-outline-color": "#fff","fill-opacity":1}]
    ];

  layer.forEach(addLayer)

    });

    $('#dropcompactness').on('change', function(e){
      e.preventDefault();
      activeSelect.paintProperty = $(this).val();
      if(activeSelect.paintProperty == 'measure1'){
        activeSelect.paintStops = [[0, '#ffffcc'],[1, '#a1dab4']];
      } else {
        activeSelect.paintStops = [[0, '#ffffcc'],[.25, '#a1dab4'],[.50, '#41b6c4'],[.75, '#2c7fb8'], [1, '#253494']];
      }
      
      map.setPaintProperty(activeSelect.geography+"-"+activeSelect.year, 
                          "fill-color", {"type":activeSelect.paintType,
                                            "property": activeSelect.paintProperty,
                                            "stops": activeSelect.paintStops})//ults', filter: ['has','COUNTYNAME']})

      //remove previous selections map methods give an example of how one would toggle layers
      // document.getElementById('features').innerHTML = "";
      // map.removeLayer(activeSelect.geography+"-"+activeSelect.year);
      // map.removeLayer(activeSelect.geography+"-highlighted-"+activeSelect.year);
      // spliceArray(activeSelect.geography+"-"+activeSelect.year);
      // spliceArray(activeSelect.geography+"-highlighted-"+activeSelect.year);

      // activeSelect.paintProperty = $(this).val();

  //       var layer = [
  // [activeSelect.geography,'fill', ['==','Year',activeSelect.year],{"fill-color": {"type":activeSelect.paintType,"property": activeSelect.paintProperty,"stops": activeSelect.paintStops}, "fill-outline-color": "#fff","fill-opacity":0.75}],
  // [activeSelect.geography+"-highlighted", 'fill',["in", "DISTRICT", ""],{"fill-color": 'brown',"fill-outline-color": "#fff","fill-opacity":1}]
  //   ];

  // layer.forEach(addLayer)

    })

  //mousemove is too slow
  map.on('click', function (e) {
    // console.log(e.point)
    var features = map.queryRenderedFeatures(e.point,{ layers: layersArray }); //queryRenderedFeatures returns an array
    // var feature = features[0];
    var feature = (features.length) ? features[0] : '';
    // console.log(feature.properties);
    // removeLayers('pushpin');
    mapResults(feature);
    showResults(activeSelect, feature.properties);
       
  });

    //show pointer cursor
  map.on('mousemove', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: layersArray });
    map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

    // var feature = (features.length) ? features[0] : '';
    // removeLayers('pushpin');
    // showResults(activeTab, feature.properties);
    // mapResults(feature); 
  });

   //show grab cursor
  map.on('dragstart', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: layersArray });
    map.getCanvas().style.cursor = (features.length) ? 'grab' : '';
  });



    $('.election-navigation-a').on('click', function(e){
      e.preventDefault();
      //remove previous layers
      $('#clear').hide();
      // document.getElementById('precinct-header').innerHTML = "";
      // document.getElementById('precinct-results').innerHTML = "";
      map.removeLayer("2016results-"+ activeTab.geography);
      map.removeLayer("2016results-"+ activeTab.geography+"-hover");
      spliceArray("2016results-"+ activeTab.geography);
      spliceArray("2016results-"+ activeTab.geography+"-hover");
      map.setLayoutProperty(activeTab.geography + '-symbols', 'visibility', 'none');
      map.setLayoutProperty(activeTab.geography + '-lines', 'visibility', 'none');
      //remove any vtd selection
      map.setFilter("2016results-vtd", ['all', ['==', 'UNIT', 'vtd'], ["!=", "VTD",'any']]);
      map.setFilter("2016results-vtd-hover", ['all', ['==', 'UNIT', 'vtd'], ["==", "VTD",'all']]);

      $('.election-navigation-a').removeClass('active');
        
      //add new selections
      $(this).addClass('active');
      activeTab.selection = $(this).data('district');
      activeTab.geography = $(this).data('geography');
      activeTab.name = $(this).data('name');
      changeData(activeTab);
    });

 }); //end ready