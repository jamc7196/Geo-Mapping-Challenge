//student: Jorge Alberto Muñozcano Castro
// Leafleft-Challenge
//1) define variable with the usgs url
var EQUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
//2) Used d3 and extract the json data from the url
d3.json(EQUrl, function(data) {
  createFeatures(data.features);
  console.log(data.features)
});
// Used a feature function where you give proper format to the data extract from json url
function createFeatures(EQData) {
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }
//4) Extract the radious size of the format multply for 20000 for format
  function radiusSize(magn) {
    return magn * 20000;
  }

//5) Depending on their magnituted give them different colors
  function circleColor(magn) {
    if (magn < 1) {
      return "purple"
    }
    else if (magn < 2) {
      return "blue"
    }
    else if (magn < 3) {
      return "green"
    }
    else if (magn < 4) {
      return "#ebff33"
    }
    else if (magn < 5) {
      return "#ebff33"
    }
    else {
      return "red"
    }
  }

//5) Estblished an earthque variable where you store the data and the latitude and longitude of the variables extract from the USG
  var earthquakesdata = L.geoJSON(EQData, {
    pointToLayer: function(EQData, latlng) {
      return L.circle(latlng, {
        radius: radiusSize(EQData.properties.mag),
        color: circleColor(EQData.properties.mag),
        fillOpacity: 1
      });
    },
    onEachFeature: onEachFeature
  });

  createMap(earthquakesdata);
}

function createMap(earthquakesdata) {
  var map1 = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    maxZoom: 18,
    id: "mapbox/outdoors-v11",
    accessToken: API_KEY
  });

  var map2 = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    maxZoom: 18,
    id: "mapbox/satellite-streets-v11",
    accessToken: API_KEY
  });

  var map3 = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    maxZoom: 18,
    id:"mapbox/light-v10",
    accessToken: API_KEY
  });

  // Create the faultline layer
  var faultline = new L.LayerGroup();
  
  // Define a baseMaps object to hold our base layers
  var EQMaps = {
    "Outdoor Map": map1,
    "Greyscale Map": map3,
    "Satellite Map": map2
  };

  // Create overlay object to hold our overlay layer
  var overlayEQ = {
    Earthquakes: earthquakesdata,
    FaultLines: faultline
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [map1, earthquakesdata, faultline]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(EQMaps, overlayEQ, {
    collapsed: false
  }).addTo(myMap);

  // Query to retrieve the faultline data
  var EQfaultline = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

  // Create the faultlines and add them to the faultline layer
  d3.json(EQfaultline, function(data) {
    L.geoJSON(data, {
      style: function() {
        return {color: "black", fillOpacity: 0}
      }
    }).addTo(faultline)
  })

  // color function to be used when creating the legend
  function getColor(d) {
    return d > 5 ? '#ff3333' : //red zone
           d > 4  ? '#ff9933' : //gold high risk
           d > 3  ? '#ffcc33' : // yellow medium risk
           d > 2  ? '#33ff66' : // green  moderate risk
           d > 1  ? '#ccff33' : // blue low risk
                    '#ff33ff'; // purple safe zone
  }
// Add legend to the map
  var maplegend = L.control({position: 'bottomright'}); 
  maplegend.onAdd = function (map) {
      var divlegend = L.DomUtil.create('div', 'info legend'),
          mags = [0, 1, 2, 3, 4, 5],
          labels = [];
      for (var i = 0; i < mags.length; i++) {
          divlegend.innerHTML +=
              '<i style="background:' + getColor(mags[i] + 1) + '"></i> ' +
              mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
      }
  
      return divlegend;
  };
  
  maplegend.addTo(myMap);
}