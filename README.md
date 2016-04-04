# Hiptees App


## Installation
* run **npm install** inside repo dir
* Clone https://github.com/rappid/rAppid.js in some directory
* Link **js** dir into public dir via `ln -s`
* Clone https://github.com/rappid/rappidjs-text in some directory
* Link **text** dir into public dir via `ln -s`
* Run `sudo npm install -g rAppid.js` (later used to build project)

## Fonts
* Download fonts into **fonts** dir
* Install imagemagick (for example with homebrew)
* Install ttf2woff : `npm install -g ttf2woff`
* Run `node convert-font-dir.js`

## Web-Server

Start web server via gulp

`gulp webserver`

Or to run the build version

`gulp build-webserver`

https://www.npmjs.com/package/gulp-webserver

## SASS

use the gulp task to watch the directory

`gulp sass:watch`


## Docker

**Build**

`docker build -t hiptees-frontend .

**Run**

`docker run --link API --rm -p 32775:8000 hiptees-frontend
