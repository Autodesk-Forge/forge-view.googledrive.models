# View Google Drive files

[![Node.js](https://img.shields.io/badge/Node.js-4.4.3-blue.svg)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-2.15.1-blue.svg)](https://www.npmjs.com/)
![Platforms](https://img.shields.io/badge/platform-windows%20%7C%20osx%20%7C%20linux-lightgray.svg)
[![License](http://img.shields.io/:license-mit-blue.svg)](http://opensource.org/licenses/MIT)

[![oAuth2](https://img.shields.io/badge/oAuth2-v1-green.svg)](http://developer.autodesk.com/)
[![OSS](https://img.shields.io/badge/OSS-v2-green.svg)](http://developer.autodesk.com/)
[![Model-Derivative](https://img.shields.io/badge/Model%20Derivative-v2-green.svg)](http://developer.autodesk.com/)
[![Viewer](https://img.shields.io/badge/Viewer-v7-green.svg)](http://developer.autodesk.com/)

# Description

This sample use [Model Derivative API](https://developer.autodesk.com/en/docs/model-derivative/v2/overview/) to translate [Google Drive](https://drive.google.com) files into [Viewer](https://developer.autodesk.com/en/docs/viewer/v2/overview/). The front-end will look like:

![thumbnail](/thumbnail.png)

## Technologies overview
   1. <b>Languages</b>: JavaScript,
   2. <b>Forge</b>: Viewer, Buckets-Api, Objects-Api, model-derivative
   3. <b>Technologies/frameworks</b>: Express.js, jQuery, jstree.js, request.js, moment.js, nodemon
   4. <b>Other APIs</b>: oAuth2, googleapis

## Live version

See it live at [forgegoogledriveviewer.herokuapp.com](http://forgegoogledriveviewer.herokuapp.com/).

## Industry background

As the data can be anywhere, and a very common scenario is to use generic data storage, like Google Drive, to store personal or business files, share between employees and manage versions. With Forge you can view these files implementing a transparent viewing approach, as demonstrated in this sample. On specific cases, the Box connection can be replaced with other or with a company local storage.

### Prerequisites

Working on this application touch both server and client sides.  
For <b>Basic</b> use for presentation purposes, you will need knowledge about: <b>Node.js</b>, <b>REST Api</b>, on back-end and <b>HTML</b>, <b>jQuery</b>, <b>Ajax</b> on front-end.  
For develop more <b>complex</b> application you certainly need knowledge about: <b>Forge-SDK</b> (<b>Forsge-Api</b>), <b>Forge Derivatives-Api</b>, <b>JS Promises</b>, <b>Oauth Authentication</b>, <b>Google-API</b>

# Setup

For using this sample, you need an Autodesk developer credentials. Visit the [Forge Developer Portal](https://developer.autodesk.com), sign up for an account, then [create an app](https://developer.autodesk.com/myapps/create). For this new app, use <b>http://localhost:3000/api/forge/callback/oauth</b> as Callback URL. Finally take note of the <b>Client ID</b> and <b>Client Secret</b>.

You also need a Google Developer credentials:
1. Visit the [Google APIs Console](https://console.developers.google.com)
2. Log in or Sign up
3. Choose OAuth client ID in Create Credentials menu
4. Select 'Web application' (default option)
5. Apply <b>http://localhost:3000/api/google/callback/oauth</b> to <b>Authorised redirect URIs</b> field (development option)
6. Make sure you activate **Google Drive** & **Google People** APIs, this sample uses both scopes. Finally, take note of the    <b>client_id</b> and <b>client_secret</b>.

### Run locally

Install [NodeJS](https://nodejs.org).

Clone this project or download it. It's recommended to install [GitHub desktop](https://desktop.github.com/). To clone it via command line, use the following (<b>Terminal</b> on MacOSX/Linux, <b>Git Shell</b> on Windows):

    git clone https://github.com/autodesk-forge/model.derivative-nodejs-google.drive.viewer

#### Enviroment variables
To run it, after installation of required packages, you sould set the enviroment variables with your client ID & secret and finally start it. Via command line, navigate to the folder where this repository was cloned and use the following:

Mac OSX/Linux (Terminal)

    npm install
    export FORGE_CLIENT_ID=<<YOUR CLIENT ID FROM FORGE DEVELOPER PORTAL>>
    export FORGE_CLIENT_SECRET=<<YOUR FORGE CLIENT SECRET>>
    export GOOGLE_CLIENT_ID=<<YOUR CLIENT ID FROM GOOGLE DEVELOPER>>
    export GOOGLE_CLIENT_SECRET=<<YOUR GOOGLE CLIENT SECRET>>
    export GOOGLE_CALLBACK_URL=<<YOUR GOOGLE CALLBACK URL>>
    npm run dev

Windows (use <b>Node.js command line</b> from Start menu)

    npm install
    set FORGE_CLIENT_ID=<<YOUR CLIENT ID FROM FORGE DEVELOPER PORTAL>>
    set FORGE_CLIENT_SECRET=<<YOUR FORGE CLIENT SECRET>>
    set GOOGLE_CLIENT_ID=<<YOUR CLIENT ID FROM GOOGLE DEVELOPER>>
    set GOOGLE_CLIENT_SECRET=<<YOUR GOOGLE CLIENT SECRET>>
    set GOOGLE_CALLBACK_URL=<<YOUR GOOGLE CALLBACK URL>>
    npm run dev

Open the browser: [http://localhost:3000](http://localhost:3000).

<b>Important:</b> do not use <b>npm start</b> locally, this is intended for PRODUCTION only with HTTPS (SSL) secure cookies.

### Deploy on Heroku

To deploy this application to Heroku, the <b>Callback URL</b> & <b>redirect_uri</b> must use your .herokuapp.com address. After clicking on the button below, at the Heroku Create New App page, set your Client ID & Secret and the correct callback URL.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

Watch [this video](https://www.youtube.com/watch?v=Oqa9O20Gj0c) on how deploy this sample to Heroku.

## Packages used

All Autodesk Forge NPM packages are included by default, see complete list of what's available at [NPM website](https://www.npmjs.com/browse/keyword/autodesk). OAuth, Model Derivative and OSS are used. [Google Drive](https://developers.google.com/drive/v3/web/quickstart/nodejs) for NodeJS is [googleapis](https://www.npmjs.com/package/googleapis). Some other non-Autodesk packaged are used, including [express](https://www.npmjs.com/package/express) and its session/cookie middlewares ([express-session](https://www.npmjs.com/package/express-session) and [cookie-parser](https://www.npmjs.com/package/cookie-parser)) for user session handling. The front-end uses [bootsrap](https://www.npmjs.com/package/bootstrap) and [jquery](https://www.npmjs.com/package/jquery).

# Tips & tricks

For local development/testing, consider use [nodemon](https://www.npmjs.com/package/nodemon) package, which auto restart your node application after any modification on your code. To install it, use:

    sudo npm install -g nodemon

Then, instead of <b>npm run dev</b>, use the following:

    npm run nodemon

Which executes <b>nodemon server.js --ignore www/</b>, where the <b>--ignore</b> parameter indicates that the app should not restart if files under <b>www</b> folder are modified.

## Troubleshooting

After installing Github desktop for Windows, on the Git Shell, if you see a <b>*error setting certificate verify locations*</b> error, use the following:

    git config --global http.sslverify "false"

# License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT).
Please see the [LICENSE](LICENSE) file for full details.

## Written by

Augusto Goncalves, Vadym Kuzin  (Forge Partner Development)<br />
http://forge.autodesk.com<br />
