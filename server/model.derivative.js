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

var config = require('./config');

// forge
var ForgeSDK = require('forge-apis');

router.get('/md/viewerFormats', function (req, res) {
  var tokenSession = new token(req.session);
  tokenSession.getTokenPublic(function(tokenPublic){
    var derivative = new ForgeSDK.DerivativesApi();
    derivative.getFormats({}, null, tokenPublic).then(function (response) {
      res.status(200).json(response.body.formats.svf);
    }).catch(function (err) {
      res.status(500).end();
    });
  });
});

module.exports = router;
