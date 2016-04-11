# Hiptees App


## Installation
* run **npm install** inside repo dir
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

See Dockerfile for what is included in the image.

**Build**

`docker build -t hiptees-frontend .`

**Run**

Run the hiptees api docker container before starting the frontend.

`docker run --link API --rm -p 32775:80 hiptees-frontend`
