/**  
* @desc   functions that provide layer input and output for the map
* @author Jan Kruse, Saskia Geuking
* @date   150702
*/

"use strict";

// consoleAppender pushes logs to console
var consoleAppender = JL.createConsoleAppender('consoleAppender');

// create logger & register it to consoleAppender
JL("ajaxLogger").setOptions({"appenders": [consoleAppender]});

/**
 * saves the last drawn feature into the database
 */
function saveToDB() {
     var name = prompt('wie solls denn heißen wenns fertig is?');
     var contentString = $('#drawnItemJSONText').val();
     
     if ( typeof data.waypoints !== undefined && waypoints != null ) {

          var content = JSON.parse( contentString );
          var url = $('#db-url').val() + '/addFeature?name=' + name;

          // perform post ajax
          $.ajax({
            type: 'POST',
            data: content,
            url: url,
            timeout: 5000,
            success: function(data, textStatus ){
               JL('ajaxLogger').info("feature was succesfully added to the database on " + url);
            },
            error: function(xhr, textStatus, errorThrown){
               JL('ajaxLogger').error('unable to save to database (' + errorThrown + ')');
            }
          });

          //refresh table
          loadFromDB();
     } else {
          JL('ajaxLogger').error('unable to save to database: no JSON or name provided');
     }
};


/**
 * loads the contents from the in #db-url specified database server
 * and inserts the loaded features into the map
 */
function loadFromDB() {
     var url = $('#db-url').val() + '/getFeatures';

     // perform ajax on the url and add the loaded GeoJSON
     $.ajax({
       type: 'GET',
       dataType: 'json',
       url: url,
       timeout: 5000,
       success: function(content, textStatus ){

          JL('ajaxLogger').info('database content was retrieved from ' + url
                              + ' (' + content.length + ' items)');

          // remove existing items
          $('#tableDBContents').empty();
          dbFeatures.eachLayer(function(layer) {
	           layerControl.removeLayer(layer);
	      });

          dbFeatures.clearLayers();

          for (var i = 0; i < content.length; i++) {
               // insert each received layer into the table in the html
               $('#tableDBContents').append('<tr><td>'
                    + (i+1) + '</td><td>' 
                    + content[i].name + '</td><td>' 
                    + content[i].data.geometry.type + '</td><td>' 
                    + content[i].dateInserted + '</td></tr>');
               // insert into the map
               addLayerToGroup(L.geoJson(content[i].data), content[i].name + ' (database ' + (i+1) + ')', dbFeatures)
          }
          $('#tableDB').removeClass('hidden');
       },
       error: function(xhr, textStatus, errorThrown){
          JL('ajaxLogger').error("unable to get database content (" + errorThrown + ")");
       }
     });
};

/**
 * @desc saves the last route into the database
 */
function saveToDBRoute() {
    var name = prompt('Wie soll die Route heissen?');
    
    var content = JSON.parse(JSON.stringify(
        { waypoints : routeControl.getWaypoints() }
    ));
        
    if ( name != undefined && content != '' ) {
        
        console.log(content);
        
        var url = $('#db-url').val() + '/addFeature?name=' + name;

        // perform post ajax
          $.ajax({
            type: 'POST',
            data: content,
            url: url,
            timeout: 5000,
            success: function(data, textStatus ){
               JL('ajaxLogger').info("feature was succesfully added to the database on " + url);
            },
            error: function(xhr, textStatus, errorThrown){
               JL('ajaxLogger').error('unable to save to database (' + errorThrown + ')');
            }
          });

          //refresh table
          loadFromDBRoute();
     } else {
          JL('ajaxLogger').error('unable to save to database: no JSON or name provided');
     }
};

/**
 * loads the contents from the in #db-url specified database server
 * and inserts the loaded routes into the map
 */
function loadFromDBRoute() {
     var url = $('#db-url').val() + '/getFeatures';

     // perform ajax on the url and add the loaded GeoJSON
     $.ajax({
       type: 'GET',
       dataType: 'json',
       url: url,
       timeout: 5000,
       success: function(content, textStatus ){

          JL('ajaxLogger').info('database content was retrieved from ' + url
                              + ' (' + content.length + ' items)');

          // remove existing items
          $('#tableDBContentsRoute').empty();
          dbFeatures.eachLayer(function(layer) {
	           layerControl.removeLayer(layer);
	      });

          dbFeatures.clearLayers();

          for (var i = 0; i < content.length; i++) {
               // insert each received layer into the table in the html
               $('#tableDBContentsRoute').append('<tr><td>'
                    + (i+1) + '</td><td>' 
                    + content[i].name + '</td><td>' 
                    + content[i].data + '</td><td>' 
                    + content[i].dateInserted + '</td></tr>');
               // insert into the map
               addLayerToGroup(L.geoJson(content[i].data), content[i].name + ' (database ' + (i+1) + ')', dbFeatures)
          }
          $('#tableDBRoute').removeClass('hidden');
       },
       error: function(xhr, textStatus, errorThrown){
          JL('ajaxLogger').error("unable to get database content (" + errorThrown + ")");
       }
     });
};

/**  
* @desc   loads a GeoJSON file from a given url in the textfield "urlTextfield"
*         and adds the resulting layer to the map
*/
var ajaxGJSON = function() {
     // get the url from the textfield
     var url = $('#urlTextfield').val();
     
     // perform ajax on the url and add the loaded GeoJSON
     $.ajax({
       type: 'GET',
       dataType: 'json',
       url: url,
       timeout: 5000,
       success: function(content, textStatus ){
         addGjsonLayer(content, "from URL");
         JL('ajaxLogger').info("file was retrieved from " + url);
       },
       error: function(xhr, textStatus, errorThrown){
         JL('ajaxLogger').error("unable to get the file (" + errorThrown + ")");
       }
     });
};


/**  
* @desc   initializes the parsing on loading the file
*         also adds the resulting layer to the map
*/
var loadFile = function(event) {
     // Init
     var input = event.target;
     var reader = new FileReader();

     // Read the file
     reader.readAsText(input.files[0]);

     // Invoked when file is loading. 
     reader.onload = function(){
          JL('parseLogger').info("File was loaded");
          
          // parse file to JSON object
          var jsonObject = parseTxtToGeoJson(reader.result);
          
          // add it to the map
          addGjsonLayer(jsonObject, "Lines from Textfile");
     };
};