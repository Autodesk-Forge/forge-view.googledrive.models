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

async function getForgeToken(callback) {
  const resp = await fetch('/oauth/token');
  if (!resp.ok) {
    const msg = await resp.text();
    console.error('Could not obtain access token', msg);
    return;
  }
  const credentials = await resp.json();
  callback(credentials.access_token, credentials.expires_in)
}

function launchViewer(urn) {
  const options = {
    env: 'AutodeskProduction',
    getAccessToken: getForgeToken
  };
  Autodesk.Viewing.Initializer(options, function () {
    viewer = new Autodesk.Viewing.Private.GuiViewer3D(document.getElementById('forgeViewer'), {});
    viewer.start();
    loadDocument('urn:' + urn);
  });
}

function loadDocument(documentId) {
  Autodesk.Viewing.Document.load(
    documentId,
    function onSuccess(doc) {
      const defaultGeom = doc.getRoot().getDefaultGeometry();
      viewer.loadDocumentNode(doc, defaultGeom);
    },
    function onError(err) {
      console.error(err);
    }
  );
}
