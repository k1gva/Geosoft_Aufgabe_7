/**  
* @desc   Creates a map in  the HTML document using leaflet
* @author Saskia Geuking, Jan Kruse
* @date   150702
*/

'use strict';

// create logger & register it to consoleAppender
JL("mapLogger").setOptions({"appenders": [consoleAppender]});

// create a new map, setting the view to Muenster
var map = L.map('map').setView([51.96, 7.61], 12);

// define layers
// OpenStreetMap basemap
var osmLayer = new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
     attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});

// OpenCycleMap basemap
var ocmLayer = new L.tileLayer('http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png', {
     attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, Tiles courtesy of <a href="http://www.thunderforest.com/">Andy Allan</a>'
});


/**
*  leaflet routing machine with leaflet control geocoder 
*/
L.Routing.control({
    waypoints: [],
    addWaypoints: true,
    routeWhileDragging: true,
    geocoder: L.Control.Geocoder.nominatim()
}).addTo(map);

/**
 * @desc saves the last route into the database
 */
function saveToDBRoute() {
    var name = prompt('Wie soll die Route heissen?');
    var points = L.Routing.Waypoint.getWaypoints();
    
    console.log(points);
    
};

// Initialise the FeatureGroup to store database layers
var dbFeatures = new L.FeatureGroup();
map.addLayer(dbFeatures);


// layer group for basemaps
var baseMaps = {
     "OpenStreetMap": osmLayer,
     "OpenCycleMap": ocmLayer
}

// layer control switch
var layerControl = new L.control.layers(baseMaps).addTo(map);

// sets the OSM layer as default
osmLayer.addTo(map);

// add a marker at the position of the GEO building.
// marker popup contains the image img/ifgi.jpg
L.marker([51.9694, 7.5957]).addTo(map)
        .bindPopup("<b>IFGI</b><br>Heisenbergstr. 2<br>48149 Münster<br>" +
        "<a href=\"http://ifgi.de/\">" +
        "<img width=\"300\" src=\"img/ifgi.jpg\" alt=\"picture of IFGI\" >" +
        "</a>");
		
