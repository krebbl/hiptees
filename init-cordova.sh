#!/bin/bash

if ! type "cordova" > /dev/null; then
  echo "Install cordova cli"
  sudo npm install -g cordova
fi

if ! type "rappidjs" > /dev/null; then
  echo "Install rappidjs cli"
  sudo npm install -g rAppid.js
fi

echo "Building rappid app"
rappidjs build

rm cordova/www

echo "Linking build dir into cordova dir"
ln -s ../public-build cordova/www

echo "Adding ios platform"
( cd cordova ; cordova platform add ios)

echo "Adding android platform"
( cd cordova ; cordova platform add android)

echo "Adding statusbar plugin"
( cd cordova ; cordova plugin add cordova-plugin-statusbar)

echo "Adding certificate plugin"
( cd cordova ; cordova plugin add cordova-plugin-certificates)

echo "Adding twitter connect plugin"
( cd cordova ; cordova plugin add twitter-connect-plugin --variable FABRIC_KEY=8990562)

echo "Adding open browser link plugin"
(cd cordova ; cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-inappbrowser.git)

echo "Adding native dialogs plugin"
(cd cordova ; cordova plugin add cordova-plugin-dialogs)

echo "Adding facebook plugin"
git clone https://github.com/Wizcorp/phonegap-facebook-plugin.git
( cd cordova ; cordova -d plugin add ./../phonegap-facebook-plugin --variable APP_ID="164321440569168" --variable APP_NAME="Hiptees")
rm -Rf phonegap-facebook-plugin

echo "Adding social share plugin"
(cd cordova ; cordova plugin add cordova-plugin-x-socialsharing)

echo "Installing ios-sim"
npm install ios-sim -g

echo "Cordova init completed"