"use strict";

var express    = require('express');
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var permalinks = require('permalinks');

var app = express();
app.use(bodyParser.urlencoded({extended: true})); // to enable processing of the received post content


var config = {
    httpPort: 8080,
    mongoPort: 27017
}

/* database schema */
var featureSchema = mongoose.Schema({
    name: String,
    dateInserted: Date,
    data: {}
});
var Feature = mongoose.model('Feature', featureSchema);

/* database connection */
mongoose.connect('mongodb://localhost:' + config.mongoPort + '/ex07DB');
var database = mongoose.connection;

database.on('error', console.error.bind(console, 'connection error:'));
database.once('open', function (callback) {
  console.log('connection to database established on port ' + config.mongoPort);
});

// to allow serving static files 
app.use(express.static('webapp'));

/* http routing */
// code which is executed on every request
app.use(function(req, res, next) {
    console.log(req.method + ' ' + req.url + ' was requested by ' + req.connection.remoteAddress);
    res.header('Access-Control-Allow-Origin', '*');    // allow CORS
    //res.header('Access-Control-Allow-Methods', 'GET,POST');
    next();
});


// returns json of all stored features
app.get('/getFeatures', function(req, res) {
    Feature.find(function(error, features) {
        if (error) return console.error(error);
        res.send(features);
    });
});

// takes a json document via POST, which will be added to the database
// name is passed via URL
// url format: /addFeature?name=
app.post('/addFeature*', function(req, res) {
	console.log(JSON.stringify(req.body));

    var feature = new Feature({
    	name: req.url.substring(17, req.url.length), // extract name from url
    	dateInserted: new Date(),
    	data: req.body
    });
    feature.save(function(error){
        var message = error ? 'failed to save feature: ' + error 
                            : 'feature saved: ' + feature.name;
        console.log(message + ' from ' + req.connection.remoteAddress);
        res.send(message);
    });
});

// launch server
app.listen(config.httpPort, function(){
    console.log('http server now running on port ' + config.httpPort);
});