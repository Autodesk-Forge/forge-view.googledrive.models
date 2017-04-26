/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by ForgeSDK Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

'use strict'; // http://www.w3schools.com/js/js_strict.asp

// token handling in session
var token = require('./token');

// web framework
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

// config information, such as client ID and secret
var config = require('./config');

// google drive sdk: https://developers.google.com/drive/v3/web/quickstart/nodejs
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(config.google.credentials.client_id, config.google.credentials.client_secret, config.google.callbackURL);

// forge
var ForgeSDK = require('forge-apis');

var fs = require('fs');
var request = require('request');

router.post('/integration/sendToTranslation', jsonParser, function (req, res) {
  var googleFileId = req.body.googlefile;
  var tokenSession = new token(req.session);
  tokenSession.getTokenInternal(function (tokenInternal) {

    oauth2Client.setCredentials({
      access_token: tokenSession.getGoogleToken()
    });
    var drive = google.drive({version: 'v2', auth: oauth2Client});


    var plus = google.plus('v1');
    plus.people.get({userId: 'me', auth: oauth2Client}, function (err, user) {
      if (err || user == null) {
        console.log('model.derivative.google.drive.integration:sentToTranslation:google.user.get => ' + err);
        res.status(500).json({error: 'Cannot get Google user information, please try again.'});
        return;
      }

      // ForgeSDK OSS Bucket Name: username + userId (no spaces, lower case)
      // that way we have one bucket for each Google account using this application
      var ossBucketKey = (user.displayName.replace(/\W+/g, '') + user.id).toLowerCase();

      var buckets = new ForgeSDK.BucketsApi();
      var objects = new ForgeSDK.ObjectsApi();
      var postBuckets = new ForgeSDK.PostBucketsPayload();
      postBuckets.bucketKey = ossBucketKey;
      postBuckets.policyKey = "transient"; // expires in 24h

      buckets.createBucket(postBuckets, {}, null, tokenInternal).catch(function (err) {console.log(err);}).then(function () {
        // need the Google file information to get the name...
        drive.files.get({
          fileId: googleFileId
        }, function (err, fileInfo) {
          var fileName = fileInfo.title;
          var ossObjectName = googleFileId + '.' + re.exec(fileName)[1]; // googleId + fileExtension (required)

          // at this point the bucket exists (either created or already there)
          objects.getObjects(ossBucketKey, {'limit': 100}, null, tokenInternal).then(function (response) {
            var alreadyTranslated = false;
            var objectsInBucket = response.body.items;
            objectsInBucket.forEach(function (item) {
              if (item.objectKey === ossObjectName) {
                res.status(200).json({
                  readyToShow: true,
                  status: 'File already translated.',
                  objectId: item.objectId,
                  urn: item.objectId.toBase64()
                });
                alreadyTranslated = true;
              }
            });

            if (!alreadyTranslated) {
              // prepare to download from Google

              /*
               // Not sure why, but the drive.files.get call is not
               // working, so for now using the request equivalent
               // https://developers.google.com/drive/v3/web/manage-downloads
               drive.files.get({
               fileId: googleFileId,
               alt: 'media'
               }
               */

              request({
                url: 'https://www.googleapis.com/drive/v2/files/' + googleFileId + '?alt=media',
                method: "GET",
                headers: {
                  'Authorization': 'Bearer ' + tokenSession.getGoogleToken(),
                },
                encoding: null
              }, function (error, response, filestream) {

                objects.uploadObject(ossBucketKey, ossObjectName, filestream.length, filestream, {}, null, tokenInternal).then(function (response) {
                  var ossUrn = response.body.objectId.toBase64();
                  var derivative = new ForgeSDK.DerivativesApi();
                  derivative.translate(translateData(ossUrn), {}, null, tokenInternal).then(function (data) {
                    res.status(200).json({
                      readyToShow: false,
                      status: 'Translation in progress, please wait...',
                      urn: ossUrn
                    });
                  }).catch(function (e) { res.status(500).json({error: e.statusMessage}) }); // translate

                }).catch(function (err) { console.log(err); }); //uploadObject

              });
            }
          }).catch(function (e) { res.status(500).json({error: e.statusMessage}); }); //getObjects
        });
      });
    });
  });
});

router.post('/integration/isReadyToShow', jsonParser, function (req, res) {
  var ossUrn = req.body.urn;

  var tokenSession = new token(req.session);
  tokenSession.getTokenInternal(function (tokenInternal) {
    var derivative = new ForgeSDK.DerivativesApi();
    derivative.getManifest(ossUrn, {}, null, tokenInternal).then(function (response) {
      var manifest = response.body;
      if (manifest.status === 'success') {
        res.status(200).json({
          readyToShow: true,
          status: 'Translation completed.',
          urn: ossUrn
        });
      }
      else {
        res.status(200).json({
          readyToShow: false,
          status: 'Translation ' + manifest.status + ': ' + manifest.progress,
          urn: ossUrn
        });
      }
    }).catch(function (e) { res.status(500).json({error: e.error.body}); });
  });
});

String.prototype.toBase64 = function () {
  return new Buffer(this).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

function translateData(ossUrn) {
  var postJob =
    {
      input: {
        urn: ossUrn
      },
      output: {
        formats: [
          {
            type: "svf",
            views: ["2d", "3d"]
          }
        ]
      }
    };
  return postJob;
}

var re = /(?:\.([^.]+))?$/; // regex to extract file extension

function getMineType(fileName) {
  var extension = re.exec(fileName)[1];
  var types = {
    'png': 'application/image',
    'jpg': 'application/image',
    'txt': 'application/txt',
    'ipt': 'application/vnd.autodesk.inventor.part',
    'iam': 'application/vnd.autodesk.inventor.assembly',
    'dwf': 'application/vnd.autodesk.autocad.dwf',
    'dwg': 'application/vnd.autodesk.autocad.dwg',
    'f3d': 'application/vnd.autodesk.fusion360',
    'f2d': 'application/vnd.autodesk.fusiondoc',
    'rvt': 'application/vnd.autodesk.revit'
  };
  return (types[extension] != null ? types[extension] : 'application/' + extension);
}

module.exports = router;