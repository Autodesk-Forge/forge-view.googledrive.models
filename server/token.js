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

var config = require('./config');

function Token(session) {
  this._session = session;
}

Token.prototype.getTokenInternal = function (callback) {
  var ForgeOauth2 = require('forge-apis');
  var apiInstance = new ForgeOauth2.AuthClientTwoLegged(
    config.credentials.client_id, config.credentials.client_secret,
    config.scopeInternal, false);
  apiInstance.authenticate().then(function (oauth) {
    callback(oauth);
  });
};

Token.prototype.getTokenPublic = function (callback) {
  var s = this._session;
  if (this._session.tokenpublic == null) {
    var ForgeOauth2 = require('forge-apis');
    var apiInstance = new ForgeOauth2.AuthClientTwoLegged(
      config.credentials.client_id, config.credentials.client_secret,
      config.scopePublic, false);
    apiInstance.authenticate().then(function (oauth) {
      s.tokenpublic = oauth;
      callback(s.tokenpublic);
    });
  }
  else {
    callback(this._session.tokenpublic);
  }
};

// google token handling

Token.prototype.getGoogleToken = function () {
  return this._session.googletoken;
};

Token.prototype.setGoogleToken = function (token) {
  this._session.googletoken = token;
};

Token.prototype.isGoogleAuthorized = function () {
  return (this._session != null && this._session.googletoken != null);
};

module.exports = Token;
