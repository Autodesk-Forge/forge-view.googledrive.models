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

// This script file is based on the tutorial:
// https://developer.autodesk.com/en/docs/viewer/v2/tutorials/basic-application/

var viewer;
var lmvDoc;

function launchViewer(urn) {
  var options = {
    env: 'AutodeskProduction',
    getAccessToken: getForgeToken
  };
  var documentId = 'urn:' + urn;
  if (viewer == null) {
    Autodesk.Viewing.Initializer(options, function onInitialized() {
      // Create Viewer instance and load model.
      var viewerDiv = document.getElementById('forgeViewer');
      viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerDiv);
      var errorCode = viewer.start();

      // Check for initialization errors.
      if (errorCode) {
        console.error('viewer.start() error - errorCode:' + errorCode);
        return;
      }

      Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
    });
  }
  else {
    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
  }
}

/**
 * Autodesk.Viewing.Document.load() success callback.
 * Proceeds with model initialization.
 */
function onDocumentLoadSuccess(doc) {
  // A document contains references to 3D and 2D viewables.
  var viewables = Autodesk.Viewing.Document.getSubItemsWithProperties(doc.getRootItem(), {'type': 'geometry'}, true);
  if (viewables.length === 0) {
    console.error('Document contains no viewables.');
    return;
  }

  var initialViewable = viewables[0];
  var svfUrl = doc.getViewablePath(initialViewable);
  var modelOptions = {
    sharedPropertyDbPath: doc.getPropertyDbPath()
  };
  viewer.loadModel(svfUrl, modelOptions, onLoadModelSuccess, onLoadModelError);
}

/**
 * Autodesk.Viewing.Document.load() failuire callback.
 */
function onDocumentLoadFailure(viewerErrorCode) {}

/**
 * viewer.loadModel() success callback.
 * Invoked after the model's SVF has been initially loaded.
 * It may trigger before any geometry has been downloaded and displayed on-screen.
 */
var models = [];
function onLoadModelSuccess(model) {
  models.push(model);
  if (models.length==2)
    viewer.loadExtension('Autodesk.Forge.Samples.VersionChanges', {'modelA': models[0], 'modelB': models[1]});
}

/**
 * viewer.loadModel() failure callback.
 * Invoked when there's an error fetching the SVF file.
 */
function onLoadModelError(viewerErrorCode) {}