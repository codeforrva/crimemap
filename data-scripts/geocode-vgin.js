#!/usr/bin/node

// nodejs script to geocode and update the incidents in elasticsearch

// this uses the VGIN ESRI geocoding server hosted by VITA

// elasticsearch seems to get a little overwhelmed reindexing all these documents
// after a while - it might be good to interrupt the script while it is fetching
// or geocoding (not bulk updating) to give ES a break
// it will pick up where it left off

var request = require('request');

// 1000 is the batch size recommended by the geocoder
var BATCH_SIZE = 1000;

getNextBatch(BATCH_SIZE);

function getNextBatch(batchSize) {
  console.log("Fetching batch of", BATCH_SIZE);

  // first retrieve a batch of records from elasticsearch
  // we want to exclude ones that have already been geocoded
  // and ones where the CSV could not be parsed
  var queryObject = {
      "query": {
          "bool": {
              "must_not": {
                  "terms": {
                      "tags": [
                          "geocodefailure",
                          "geocoded",
                          "_csvparsefailure"
                      ]
                  }
              }
          }
      },
      "from": 0,
      "size": batchSize
  };

  request({
    url: "http://localhost:9200/_all/logs/_search",
    method: 'POST',
    json: true,
    body: queryObject
  }, function (error1, response1, body1) {
    if (!error1 && response1.statusCode == 200) {

      // check whether we're finished
      if (body1.hits.hits.length == 0) {
        console.log("Finished.");
        return;
      }

      console.log("Geocoding batch of", body1.hits.hits.length);

      // now we pass the batch to the geocoder
      // project to the structure that the ESRI API expects
      var addressObject = {
        "records": body1.hits.hits.map(function(item, index) {
            return {
              "attributes": {
                "OBJECTID": index, // unfortunately must be numeric, otherwise item._id would be nifty
                "STREET": formatStreet(item._source),
                "CITY": "Richmond",
                "STATE": "VA"
              }
            };
          })
      };

      request({
        url: 'http://gismaps.vita.virginia.gov/arcgis/rest/services/Geocoding/VGIN_Composite_Locator/GeocodeServer/geocodeAddresses',
        method: 'POST',
        form: {
          "f": "json",
          "outSR": "4326",
          "addresses": JSON.stringify(addressObject)
        }
      }, function(error2, response2, body2) {
        if (!error2 && response2.statusCode == 200) {

          console.log("Processing geocoder results");

          // results are not necessarily sorted, we need to sort them by ResultID
          var geo = JSON.parse(body2);
          geo.locations.sort(function(a,b) {
            return a.attributes.ResultID - b.attributes.ResultID;
          });

          // now merge the geodata back into the documents
          // also add tags indicating geocode result
          var success = 0;
          var failed = 0;
          var updates = body1.hits.hits.map(function(item, index) {
            var geocodeResult = geo.locations[index];
            if (geocodeResult.score > 80) {
              // success
              item._source.geoip = {
                "location": {
                  "lat": geocodeResult.location.y,
                  "lon": geocodeResult.location.x
                }
              }
              item._source.tags = item._source.tags ? item._source.tags.push("geocoded") : ["geocoded"];
              success++;
            } else {
              // failure
              item._source.tags = item._source.tags ? item._source.tags.push("geocodefailure") : ["geocodefailure"];
              failed++;
            }
            return item;
          });

          // build a string for the elasticsearch bulk update API
          var bulkData = updates.reduce(function(prev, curr) {
            return prev + JSON.stringify({
              "index": { "_index": curr._index, "_type": curr._type, "_id": curr._id }
            }) + "\n" + JSON.stringify(curr._source) + "\n";
          }, '');

          console.log("Bulk updating batch of", updates.length, "Success:", success, "Failed:", failed);

          // call the elasticsearch bulk update
          request({
            url: 'http://localhost:9200/_bulk',
            method: 'POST',
            body: bulkData
          }, function(error3, response3, body3) {
            if (!error3 && response3.statusCode == 200) {

              // OK, proceed to next batch
              getNextBatch(BATCH_SIZE);

            } else {
              console.log(response3 ? response3.statusCode : "Error", error3)
            }
          });

        } else {
          console.log(response2 ? response2.statusCode : "Error", error2);
        }
      });

    } else {
      console.log(response1 ? response1.statusCode : "Error", error1);
    }
  });
}

function formatStreet(source) {
  // data has e.g. 5XX as the street number
  return source.incidentBuildingNumber.replace(/X/g, "0") + " " + source.incidentStreetName;
}