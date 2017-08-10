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

 }); //end ready