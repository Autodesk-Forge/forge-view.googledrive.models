/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
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

// config information, such as client ID and secret
var config = require('./config');

// google drive sdk: https://developers.google.com/drive/v3/web/quickstart/nodejs
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(config.google.credentials.client_id, config.google.credentials.client_secret, config.google.callbackURL);

router.get('/google/authenticate', function (req, res) {

  // generate a url that asks permissions for Google+ and Google Calendar scopes
  var scopes = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
    scope: scopes // If you only need one scope you can pass it as string
  });

  res.end(url);
});

// wait for google callback (oAuth callback)
router.get('/api/google/callback/oauth', function (req, res) {
  var code = req.query.code;

  oauth2Client.getToken(code, function (err, tokenInfo) {
    if (err) {
      res.end(JSON.stringify(err));
      return;
    }
    console.log("Google token: " + tokenInfo.access_token);
    var tokenSession = new token(req.session);
    tokenSession.setGoogleToken(tokenInfo.access_token);
    res.redirect('/');
  });
});

// return the public token of the current user
// the public token should have a limited scope (read-only)
router.get('/google/isAuthorized', function (req, res) {
  var tokenSession = new token(req.session);
  res.end(tokenSession.isGoogleAuthorized() ? 'true' : 'false');
});

router.get('/google/getTreeNode', function (req, res) {
  var tokenSession = new token(req.session);
  if (!tokenSession.isGoogleAuthorized()) {
    res.status(401).end('Please Google login first');
    return;
  }

  var folderId = req.query.id;
  
  oauth2Client.setCredentials({
    access_token: tokenSession.getGoogleToken()
  });
  var drive = google.drive({version: 'v2', auth: oauth2Client});

  // as we don't know how many pages we have,
  // we'll do a recursive call on all pages
  // following the root folder from the user
  res.setHeader('Content-Type', 'application/json');
  res.write('[');
  drivePage(res, drive,folderId, null, true);
});

function drivePage(res, drive, folderId, npToken, first){
  drive.files.list({
    maxResults: 1000,
    q: (folderId === '#' ?  '\'root\' in parents' : '\'' + folderId + '\' in parents') + ' and trashed = false',
    fields: 'nextPageToken, items(id,mimeType,title, iconLink)',
    pageToken: npToken
  }, function (err, lst) {
    if (err) console.log(err);
    var items = lst.items;
    
    items.forEach(function(item){
      var treeItem = {
        id: item.id,
        text: item.title,
        type: item.mimeType,
        icon: item.iconLink,
        children: (item.mimeType === 'application/vnd.google-apps.folder')
      };
      res.write((first?'':',') + JSON.stringify(treeItem));
      first = false;
    });

    if (lst.nextPageToken)
      drivePage(res, drive, folderId, lst.nextPageToken, first);
    else
      res.end(']');
  });
}

module.exports = router;
