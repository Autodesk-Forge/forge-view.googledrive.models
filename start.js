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

const path = require('path');
const express = require('express');
const session = require('cookie-session');

if (process.env.FORGE_CLIENT_ID == null || process.env.FORGE_CLIENT_SECRET == null) {
  console.warn('*****************\nWARNING: Forge Client ID & Client Secret not defined as environment variables.\n*****************');
  return;
}

if (process.env.GOOGLE_CLIENT_ID == null || process.env.GOOGLE_CLIENT_SECRET == null || process.env.GOOGLE_CALLBACK_URL == null) {
  console.warn('*****************\nWARNING: Google Client ID & Client Secret or Callback URL not defined as environment variables.\n*****************');
  return;
}

let app = express();
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  name: 'forge_session',
  keys: ['forge_secure_key'],
  maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days, same as refresh token
}));
app.use(express.json({ limit: '50mb' }));
app.use('/', require('./routes/oauth')); // redirect oauth API calls
app.use('/', require('./routes/model.derivative.js')); // redirect Model Derivative API calls
app.use('/', require('./routes/google.drive.tree.js')); // redirect Google Drive API calls
app.use('/', require('./routes/model.derivative.google.drive.integration.js')); // redirect integration API calls

app.listen(app.get('port'), function () {
  console.log('Server listening on port ' + app.get('port'));
});
