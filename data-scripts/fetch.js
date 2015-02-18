#!/usr/bin/node

// nodejs script to download RVA crime data from the city website

var querystring = require('querystring');
var http = require('http');
var fs = require('fs');

// date to start on, month is zero based
// earlier than 2004 the files are too large, they will need
// to be downloaded in parts
var startDate = new Date(2004,0,1);
// date to end on
// it will download the last full month before this date
var finishDate = new Date();

downloadData(startDate);

function formatDate(d) {
	return padZero(d.getMonth()+1) + "/" + padZero(d.getDate()) + "/" + d.getFullYear();
}

function filename(d) {
	return "crimedata-" + d.getFullYear() + "-" + padZero(d.getMonth()+1) + ".txt";
}

function padZero(n) {
	return ("0" + n).slice(-2);
}

function downloadData(startDate) {
	var endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
	console.log("Downloading " + formatDate(startDate) + " to " + formatDate(endDate));

	var postData = querystring.stringify({
		// form data captured from the submission
		// some keys have been removed as they seem to have no effect
		"hdnPage2BLaunched": "CrimeIncidentInformation_TextDownload.asp",
		"hdnNavigationI": "CII20030303",
		"hdnBeginDate": formatDate(startDate),
		"hdnEndDate": formatDate(endDate),
		"hdnCrimeType": "ALL",
        "hdnCrimeDescription": "ALL+CRIME+TYPES",
        "hdnAreaSelected": "ALL",
        "hdnAreaName": "ALL",
        "hdnDownloadType": "TEXT",
        "hdnDrillDownAreaCode": "ALL",
	});

	var file = fs.createWriteStream(filename(startDate));
	var req = http.request({
		host: "eservices.ci.richmond.va.us",
		port: 80,
		path: "/applications/crimeinfo/CrimeIncidentInformation_TextDownload.asp",
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': postData.length
		}
	}, function (res) {
		res.on('end', function() {
			var nextStartDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
			if (nextStartDate.getFullYear() <= finishDate.getFullYear() && nextStartDate.getMonth() < finishDate.getMonth())
			{
				downloadData(nextStartDate);
			}
		});
		res.pipe(file);
	});

	req.write(postData);
	req.end();
}
